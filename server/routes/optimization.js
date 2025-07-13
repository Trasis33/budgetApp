const express = require('express');
const router = express.Router();
const BudgetOptimizer = require('../utils/budgetOptimizer');
const knex = require('../db/database');

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
    const tips = await knex('budget_optimization_tips')
      .where('user_id', req.user.id)
      .where('is_dismissed', 0)
      .where(function() {
        this.whereNull('expires_at')
          .orWhere('expires_at', '>', knex.fn.now())
      })
      .orderBy('confidence_score', 'desc')
      .orderBy('created_at', 'desc');
    
    res.json(tips || []);
  } catch (error) {
    console.error('Error in /tips:', error);
    res.status(500).json({ error: error.message });
  }
});

// Dismiss a tip
router.post('/tips/:id/dismiss', async (req, res) => {
  try {
    const tipId = req.params.id;
    
    const updatedCount = await knex('budget_optimization_tips')
      .where('id', tipId)
      .where('user_id', req.user.id)
      .update({ is_dismissed: 1 });
    
    if (updatedCount === 0) {
      return res.status(404).json({ error: 'Tip not found' });
    }
    
    res.json({ message: 'Tip dismissed successfully' });
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
    
    const updatedCount = await knex('budget_optimization_tips')
      .where('id', tipId)
      .where('user_id', req.user.id)
      .update({ is_dismissed });
    
    if (updatedCount === 0) {
      return res.status(404).json({ error: 'Tip not found' });
    }
    
    res.json({ message: 'Tip updated successfully' });
  } catch (error) {
    console.error('Error in /tips/:id:', error);
    res.status(500).json({ error: error.message });
  }
});

// Helper function to store recommendations
async function storeRecommendations(userId, recommendations) {
  try {
    // First, clear existing non-dismissed tips
    await knex('budget_optimization_tips')
      .where('user_id', userId)
      .where('is_dismissed', 0)
      .del();
    
    // Insert new recommendations
    if (recommendations && recommendations.length > 0) {
      const tipsToInsert = recommendations.map(tip => ({
        user_id: userId,
        tip_type: tip.type,
        category: tip.category || null,
        title: tip.title,
        description: tip.description,
        impact_amount: tip.impact_amount || null,
        confidence_score: tip.confidence_score || 0.5,
        expires_at: knex.raw("datetime('now', '+30 days')")
      }));
      
      await knex('budget_optimization_tips').insert(tipsToInsert);
    }
  } catch (error) {
    console.error('Error storing recommendations:', error);
    throw error;
  }
}

module.exports = router;
