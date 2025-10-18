const express = require('express');
const router = express.Router();
const db = require('../db/database');
const authMiddleware = require('../middleware/auth');
const { resolveScopeContext } = require('../utils/scopeUtils');

// Apply authentication to all savings routes
router.use(authMiddleware);

// Get all savings goals for user
router.get('/goals', async (req, res) => {
  try {
    const scopeContext = await resolveScopeContext(db, req.user.id, req.query.scope);
    const { scope, requestedScope, currentUser, partner, hasPartner } = scopeContext;

    let targetUserIds;
    let viewerId = currentUser.id;
    let counterpartId = partner?.id ?? null;

    if (scope === 'partner') {
      if (!hasPartner) {
        return res.json({
          scope,
          requestedScope,
          goals: [],
          scopes: {
            [scope]: { goals: [] }
          }
        });
      }
      targetUserIds = [partner.id];
      viewerId = partner.id;
      counterpartId = currentUser.id;
    } else if (scope === 'ours' && hasPartner) {
      targetUserIds = [currentUser.id, partner.id];
    } else {
      targetUserIds = [currentUser.id];
    }

    const goals = await db('savings_goals')
      .whereIn('user_id', targetUserIds)
      .orderBy([{ column: 'is_pinned', order: 'desc' }, { column: 'created_at', order: 'desc' }]);

    const goalIds = goals.map((goal) => goal.id);

    let contributions = [];
    if (goalIds.length > 0) {
      contributions = await db('savings_contributions')
        .whereIn('goal_id', goalIds)
        .select('goal_id', 'user_id')
        .sum({ total_amount: 'amount' })
        .groupBy('goal_id', 'user_id');
    }

    const contributionMap = contributions.reduce((acc, row) => {
      if (!acc[row.goal_id]) {
        acc[row.goal_id] = {};
      }
      acc[row.goal_id][row.user_id] = Number(row.total_amount || 0);
      return acc;
    }, {});

    const mapGoal = (goal) => {
      const totals = contributionMap[goal.id] || {};
      const viewerContribution = Number(totals[viewerId] || 0);
      const partnerContribution = counterpartId ? Number(totals[counterpartId] || 0) : 0;
      return {
        ...goal,
        my_contribution: viewerContribution,
        partner_contribution: partnerContribution,
        owner_id: goal.user_id,
        viewer_id: viewerId,
        partner_id: counterpartId
      };
    };

    const scopedGoals = goals.map(mapGoal);

    const payload = {
      goals: scopedGoals
    };

    res.json({
      scope,
      requestedScope,
      ...payload,
      scopes: {
        [scope]: { ...payload }
      }
    });
  } catch (error) {
    console.error('Error fetching savings goals:', error);
    res.status(500).json({ error: 'Failed to fetch savings goals' });
  }
});

// Create new savings goal
router.post('/goals', async (req, res) => {
  try {
    const userId = req.user.id;
    const { goal_name, target_amount, target_date, category } = req.body;
    const [goalId] = await db('savings_goals').insert({
      user_id: userId,
      goal_name,
      target_amount,
      target_date,
      category
    });
    const goal = await db('savings_goals').where({ id: goalId }).first();
    res.status(201).json(goal);
  } catch (error) {
    console.error('Error creating savings goal:', error);
    res.status(500).json({ error: 'Failed to create savings goal' });
  }
});

// Update savings goal
router.put('/goals/:id', async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const updates = req.body;
    const trx = await db.transaction();
    try {
      const mutableUpdates = { ...updates };
      if (Object.prototype.hasOwnProperty.call(mutableUpdates, 'is_pinned')) {
        const rawValue = mutableUpdates.is_pinned;
        const isPinned =
          rawValue === true ||
          rawValue === 1 ||
          rawValue === '1' ||
          (typeof rawValue === 'string' && rawValue.toLowerCase() === 'true');
        mutableUpdates.is_pinned = isPinned;

        if (isPinned) {
          await trx('savings_goals')
            .where({ user_id: userId })
            .update({ is_pinned: false });
        }
      }

      let [goal] = await trx('savings_goals')
        .where({ id, user_id: userId })
        .update(mutableUpdates)
        .returning('*');

      await trx.commit();
      if (!goal) {
        goal = await db('savings_goals').where({ id, user_id: userId }).first();
      }
      res.json(goal);
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  } catch (error) {
    console.error('Error updating savings goal:', error);
    res.status(500).json({ error: 'Failed to update savings goal' });
  }
});

// Delete savings goal
router.delete('/goals/:id', async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    await db('savings_goals').where({ id, user_id: userId }).del();
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting savings goal:', error);
    res.status(500).json({ error: 'Failed to delete savings goal' });
  }
});

// List contributions for a goal
router.get('/goals/:id/contributions', async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    // Ensure goal belongs to user
    const goal = await db('savings_goals').where({ id, user_id: userId }).first();
    if (!goal) return res.status(404).json({ error: 'Goal not found' });

    const contributions = await db('savings_contributions')
      .where({ goal_id: id, user_id: userId })
      .orderBy('date', 'desc')
      .orderBy('id', 'desc');

    res.json(contributions);
  } catch (error) {
    console.error('Error fetching savings contributions:', error);
    res.status(500).json({ error: 'Failed to fetch contributions' });
  }
});

// Add a contribution to a goal and increment current_amount
router.post('/goals/:id/contributions', async (req, res) => {
  const trx = await db.transaction();
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { amount, date, note } = req.body;

    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      await trx.rollback();
      return res.status(400).json({ error: 'Amount must be a positive number' });
    }

    // Ensure goal belongs to user
    const goal = await trx('savings_goals').where({ id, user_id: userId }).first();
    if (!goal) {
      await trx.rollback();
      return res.status(404).json({ error: 'Goal not found' });
    }

    // Optional date validation (not in the DB layer)
    const now = new Date();
    const contributionDate = date || now.toISOString().split('T')[0];
    const chosen = new Date(contributionDate);
    if (isNaN(chosen.getTime()) || chosen > now) {
      await trx.rollback();
      return res.status(400).json({ error: 'Date must be today or earlier' });
    }

    // Enforce cap so current_amount never exceeds target_amount
    const current = parseFloat(goal.current_amount || 0);
    const target = parseFloat(goal.target_amount || 0);
    const remaining = Math.max(0, target - current);
    const addAmount = Math.min(parseFloat(amount), remaining);
    const wasCapped = addAmount < parseFloat(amount);

    const [contributionId] = await trx('savings_contributions').insert({
      goal_id: id,
      user_id: userId,
      amount: addAmount,
      date: contributionDate,
      note: note || null
    });

    // Increment goal current_amount
    await trx('savings_goals')
      .where({ id })
      .update({ current_amount: db.raw('COALESCE(current_amount, 0) + ?', [addAmount]) });

    const updatedGoal = await trx('savings_goals').where({ id }).first();
    const contribution = await trx('savings_contributions').where({ id: contributionId }).first();

    await trx.commit();
    res.status(201).json({ goal: updatedGoal, contribution, capped: wasCapped, remainingBefore: remaining });
  } catch (error) {
    console.error('Error adding savings contribution:', error);
    try { await trx.rollback(); } catch (e) {}
    res.status(500).json({ error: 'Failed to add contribution' });
  }
});

// Delete a contribution and decrement current_amount
router.delete('/contributions/:contributionId', async (req, res) => {
  const trx = await db.transaction();
  try {
    const userId = req.user.id;
    const { contributionId } = req.params;

    const contribution = await trx('savings_contributions')
      .where({ id: contributionId, user_id: userId })
      .first();
    if (!contribution) {
      await trx.rollback();
      return res.status(404).json({ error: 'Contribution not found' });
    }

    await trx('savings_contributions').where({ id: contributionId }).del();
    await trx('savings_goals')
      .where({ id: contribution.goal_id, user_id: userId })
      .update({ current_amount: db.raw('COALESCE(current_amount, 0) - ?', [parseFloat(contribution.amount)]) });

    const updatedGoal = await trx('savings_goals').where({ id: contribution.goal_id }).first();
    await trx.commit();
    res.status(200).json({ goal: updatedGoal });
  } catch (error) {
    console.error('Error deleting savings contribution:', error);
    try { await trx.rollback(); } catch (e) {}
    res.status(500).json({ error: 'Failed to delete contribution' });
  }
});

// Get savings rate over time
router.get('/rate/:startDate/:endDate', async (req, res) => {
  try {
    const { startDate, endDate } = req.params;
    const userId = req.user.id;

    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(startDate) || !dateRegex.test(endDate)) {
      return res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD' });
    }

    // Query total income and expenses
    const incomeData = await db.raw(`
      SELECT 
        strftime('%Y-%m', i.date) as month,
        SUM(i.amount) as total_income
      FROM incomes i
      WHERE i.date BETWEEN ? AND ?
        AND i.user_id = ?
      GROUP BY month
      ORDER BY month ASC
    `, [startDate, endDate, userId]);

    const expenseData = await db.raw(`
      SELECT 
        strftime('%Y-%m', e.date) as month,
        SUM(e.amount) as total_expenses
      FROM expenses e
      WHERE e.date BETWEEN ? AND ?
        AND e.paid_by_user_id = ?
      GROUP BY month
      ORDER BY month ASC
    `, [startDate, endDate, userId]);

    // Calculate savings rate per month
    const savingsRateData = incomeData.map(income => {
      const expenses = expenseData.find(e => e.month === income.month);
      const totalExpenses = expenses ? expenses.total_expenses : 0;
      const savingsRate = income.total_income > 0 
        ? ((income.total_income - totalExpenses) / income.total_income) * 100
        : 0;
      return {
        month: income.month,
        savingsRate
      };
    });

    res.json({ savingsRateData });

  } catch (error) {
    console.error('Error calculating savings rate:', error);
    res.status(500).json({ error: 'Failed to calculate savings rate' });
  }
});

module.exports = router;
