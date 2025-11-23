const express = require('express');
const router = express.Router();
const db = require('../db/database');
const auth = require('../middleware/auth');

// Get all recurring expenses for the authenticated user
router.get('/', auth, async (req, res) => {
  try {
    const expenses = await db('recurring_expenses').where('is_active', true);
    res.json(expenses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get a single recurring expense by ID
router.get('/:id', auth, async (req, res) => {
    try {
        const { id } = req.params;
        const expense = await db('recurring_expenses')
            .where({ id })
            .first();

        if (!expense) {
            return res.status(404).json({ message: 'Recurring expense not found' });
        }
        res.json(expense);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Add a new recurring expense
router.post('/', auth, async (req, res) => {
  try {
    const { description, default_amount, category_id, paid_by_user_id, split_type, split_ratio_user1, split_ratio_user2 } = req.body;
    
    const [id] = await db('recurring_expenses').insert({
        description,
        default_amount,
        category_id,
        paid_by_user_id,
        split_type,
        split_ratio_user1,
        split_ratio_user2
    });
    const newExpense = await db('recurring_expenses').where({ id }).first();
    res.status(201).json(newExpense);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update a recurring expense
router.put('/:id', auth, async (req, res) => {
    try {
        const { id } = req.params;
        const { description, default_amount, category_id, paid_by_user_id, split_type, split_ratio_user1, split_ratio_user2 } = req.body;

        const expense = await db('recurring_expenses').where({ id }).first();

        if (!expense) {
            return res.status(404).json({ message: 'Recurring expense not found' });
        }

        await db('recurring_expenses').where({ id }).update({
            description,
            default_amount,
            category_id,
            paid_by_user_id,
            split_type,
            split_ratio_user1,
            split_ratio_user2
        });

        const updatedExpense = await db('recurring_expenses').where({ id }).first();
        res.json(updatedExpense);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Delete a recurring expense (deactivate)
router.delete('/:id', auth, async (req, res) => {
    try {
        const { id } = req.params;

        const expense = await db('recurring_expenses').where({ id }).first();

        if (!expense) {
            return res.status(404).json({ message: 'Recurring expense not found' });
        }

        await db('recurring_expenses').where({ id }).update({ is_active: false });
        res.status(204).send();
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

/**
 * Generate recurring expenses for a specific month.
 * Creates one concrete expense per active template for the given {year, month} if not already created.
 * Idempotent: calling multiple times for the same month doesn't create duplicates.
 * 
 * Body: { year: number, month: number } (month is 1-12)
 * Response: { generatedCount, generatedAmount, year, month }
 */
router.post('/generate', auth, async (req, res) => {
    try {
        const { year, month } = req.body;

        if (!year || !month || month < 1 || month > 12) {
            return res.status(400).json({ message: 'Invalid year or month (month must be 1-12)' });
        }

        // Get all active templates
        const templates = await db('recurring_expenses').where('is_active', true);

        if (templates.length === 0) {
            return res.json({ generatedCount: 0, generatedAmount: 0, year, month });
        }

        // Generate the first day of the month for consistency
        const dateStr = `${year}-${String(month).padStart(2, '0')}-01`;

        let generatedCount = 0;
        let generatedAmount = 0;

        // For each template, try to insert a new expense if one doesn't already exist for this month
        for (const template of templates) {
            try {
                // Use onConflict().ignore() for idempotence
                const result = await db('expenses')
                    .insert({
                        date: dateStr,
                        amount: template.default_amount,
                        category_id: template.category_id,
                        paid_by_user_id: template.paid_by_user_id,
                        split_type: template.split_type,
                        split_ratio_user1: template.split_ratio_user1,
                        split_ratio_user2: template.split_ratio_user2,
                        description: template.description,
                        recurring_expense_id: template.id,
                        created_at: new Date(),
                        updated_at: new Date()
                    })
                    .onConflict(['recurring_expense_id', 'date'])
                    .ignore();

                // Only count if insert was successful (result > 0 means rows affected)
                if (result > 0) {
                    generatedCount++;
                    generatedAmount += template.default_amount;
                }
            } catch (templateErr) {
                // Log but continue with other templates
                console.error(`Failed to generate expense for template ${template.id}:`, templateErr.message);
            }
        }

        res.json({ generatedCount, generatedAmount, year, month });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;