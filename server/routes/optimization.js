const express = require('express');
const router = express.Router();
const BudgetOptimizer = require('../utils/budgetOptimizer');
const db = require('../db/database');

// Get spending analysis and recommendations
router.get('/analyze', async (req, res) => {
  try {
    const optimizer = new BudgetOptimizer(req.user.id);
    const analysis = await optimizer.analyzeSpendingPatterns();
    
    // Store recommendations in database
    await storeRecommendations(req.user.id, analysis.recommendations);
    
    res.json(analysis);
  } catch (error) {
    console.error('Error in /analyze:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get active optimization tips
router.get('/tips', async (req, res) => {
  try {
    const query = `
      SELECT * FROM budget_optimization_tips 
      WHERE user_id = ? 
        AND is_dismissed = 0 
        AND (expires_at IS NULL OR expires_at > datetime('now'))
      ORDER BY confidence_score DESC, created_at DESC
    `;
    
    db.all(query, [req.user.id], (err, rows) => {
      if (err) {
        console.error('Error fetching tips:', err);
        return res.status(500).json({ error: 'Failed to fetch optimization tips' });
      }
      res.json(rows || []);
    });
  } catch (error) {
    console.error('Error in /tips:', error);
    res.status(500).json({ error: error.message });
  }
});

// Dismiss a tip
router.post('/tips/:id/dismiss', async (req, res) => {
  try {
    const tipId = req.params.id;
    const query = `
      UPDATE budget_optimization_tips 
      SET is_dismissed = 1 
      WHERE id = ? AND user_id = ?
    `;
    
    db.run(query, [tipId, req.user.id], function(err) {
      if (err) {
        console.error('Error dismissing tip:', err);
        return res.status(500).json({ error: 'Failed to dismiss tip' });
      }
      
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Tip not found' });
      }
      
      res.json({ message: 'Tip dismissed successfully' });
    });
  } catch (error) {
    console.error('Error in /tips/:id/dismiss:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update tip status
router.put('/tips/:id', async (req, res) => {
  try {
    const tipId = req.params.id;
    const { is_dismissed } = req.body;
    
    const query = `
      UPDATE budget_optimization_tips 
      SET is_dismissed = ? 
      WHERE id = ? AND user_id = ?
    `;
    
    db.run(query, [is_dismissed, tipId, req.user.id], function(err) {
      if (err) {
        console.error('Error updating tip:', err);
        return res.status(500).json({ error: 'Failed to update tip' });
      }
      
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Tip not found' });
      }
      
      res.json({ message: 'Tip updated successfully' });
    });
  } catch (error) {
    console.error('Error in /tips/:id:', error);
    res.status(500).json({ error: error.message });
  }
});

// Helper function to store recommendations
async function storeRecommendations(userId, recommendations) {
  return new Promise((resolve, reject) => {
    // First, clear existing non-dismissed tips
    const clearQuery = `
      DELETE FROM budget_optimization_tips 
      WHERE user_id = ? AND is_dismissed = 0
    `;
    
    db.run(clearQuery, [userId], function(err) {
      if (err) {
        console.error('Error clearing old tips:', err);
        return reject(err);
      }
      
      // Insert new recommendations
      const insertPromises = recommendations.map(tip => {
        return new Promise((resolveInsert, rejectInsert) => {
          const insertQuery = `
            INSERT INTO budget_optimization_tips 
            (user_id, tip_type, category, title, description, impact_amount, confidence_score, expires_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now', '+30 days'))
          `;
          
          db.run(insertQuery, [
            userId,
            tip.type,
            tip.category || null,
            tip.title,
            tip.description,
            tip.impact_amount || null,
            tip.confidence_score || 0.5
          ], function(err) {
            if (err) {
              console.error('Error inserting tip:', err);
              rejectInsert(err);
            } else {
              resolveInsert(this.lastID);
            }
          });
        });
      });
      
      Promise.all(insertPromises)
        .then(() => resolve())
        .catch(reject);
    });
  });
}

module.exports = router;
