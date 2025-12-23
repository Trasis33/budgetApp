const express = require('express');
const router = express.Router();
const db = require('../db/database');
const auth = require('../middleware/auth');

// Get all recurring expenses for the authenticated user
// Query param: includeInactive=true to also return deactivated templates
router.get('/', auth, async (req, res) => {
  try {
    const includeInactive = req.query.includeInactive === 'true';
    let query = db('recurring_expenses');
    if (!includeInactive) {
      query = query.where('is_active', true);
    }
    const expenses = await query;
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
    const {
      description,
      default_amount,
      category_id,
      paid_by_user_id,
      split_type,
      split_ratio_user1,
      split_ratio_user2,
      bill_managed,
      day_of_month,
      notes,
      recurring_type,
      is_shared
    } = req.body;
    
    const [id] = await db('recurring_expenses').insert({
      description,
      default_amount,
      category_id,
      paid_by_user_id,
      split_type,
      split_ratio_user1,
      split_ratio_user2,
      bill_managed: bill_managed ?? false,
      day_of_month: day_of_month ?? 1, // Default to 1st of month
      notes,
      recurring_type: recurring_type ?? 'bill',
      is_shared: is_shared ?? true
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
        const {
          description,
          default_amount,
          category_id,
          paid_by_user_id,
          split_type,
          split_ratio_user1,
          split_ratio_user2,
          bill_managed,
          day_of_month,
          notes,
          recurring_type,
          is_shared
        } = req.body;

        const expense = await db('recurring_expenses').where({ id }).first();

        if (!expense) {
            return res.status(404).json({ message: 'Recurring expense not found' });
        }

        await db('recurring_expenses').where({ id }).update({
          description: description ?? expense.description,
          default_amount: default_amount ?? expense.default_amount,
          category_id: category_id ?? expense.category_id,
          paid_by_user_id: paid_by_user_id ?? expense.paid_by_user_id,
          split_type: split_type ?? expense.split_type,
          split_ratio_user1:
            split_ratio_user1 !== undefined
              ? split_ratio_user1
              : expense.split_ratio_user1,
          split_ratio_user2:
            split_ratio_user2 !== undefined
              ? split_ratio_user2
              : expense.split_ratio_user2,
          bill_managed:
            bill_managed !== undefined ? bill_managed : expense.bill_managed,
          day_of_month:
            day_of_month !== undefined ? day_of_month : expense.day_of_month,
          notes: notes !== undefined ? notes : expense.notes,
          recurring_type: recurring_type !== undefined ? recurring_type : expense.recurring_type,
          is_shared: is_shared !== undefined ? is_shared : expense.is_shared
        });

        const updatedExpense = await db('recurring_expenses').where({ id }).first();
        res.json(updatedExpense);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Deactivate a recurring expense (soft delete)
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

// Reactivate a deactivated recurring expense
router.post('/:id/reactivate', auth, async (req, res) => {
    try {
        const { id } = req.params;

        const expense = await db('recurring_expenses').where({ id }).first();

        if (!expense) {
            return res.status(404).json({ message: 'Recurring expense not found' });
        }

        await db('recurring_expenses').where({ id }).update({ is_active: true });
        const updatedExpense = await db('recurring_expenses').where({ id }).first();
        res.json(updatedExpense);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Permanently delete a recurring expense template
// Query param: deleteExpenses=true to also delete all linked expenses
router.delete('/:id/permanent', auth, async (req, res) => {
    try {
        const { id } = req.params;
        const deleteExpenses = req.query.deleteExpenses === 'true';

        const expense = await db('recurring_expenses').where({ id }).first();

        if (!expense) {
            return res.status(404).json({ message: 'Recurring expense not found' });
        }

        // Count linked expenses for response
        const linkedExpenseCount = await db('expenses')
            .where({ recurring_expense_id: id })
            .count('id as count')
            .first();

        if (deleteExpenses) {
            // Delete all linked expenses first
            await db('expenses').where({ recurring_expense_id: id }).del();
        } else {
            // Unlink expenses from this template (set recurring_expense_id to null)
            await db('expenses').where({ recurring_expense_id: id }).update({ recurring_expense_id: null });
        }

        // Permanently delete the template
        await db('recurring_expenses').where({ id }).del();

        res.json({ 
            deleted: true, 
            linkedExpensesDeleted: deleteExpenses,
            linkedExpenseCount: linkedExpenseCount?.count || 0
        });
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

        let generatedCount = 0;
        let generatedAmount = 0;

        // For each template, try to insert a new expense if one doesn't already exist for this month
        for (const template of templates) {
            try {
                // Use template's day_of_month (default to 1 if not set)
                // Clamp to 28 to avoid issues with short months
                const day = Math.min(template.day_of_month || 1, 28);
                const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

                // Check if an expense already exists for this template in this month
                // (regardless of exact day, to prevent duplicates)
                const existingExpense = await db('expenses')
                    .where({ recurring_expense_id: template.id })
                    .whereRaw('strftime("%Y-%m", date) = ?', [`${year}-${String(month).padStart(2, '0')}`])
                    .first();

                if (existingExpense) {
                    // Already exists for this month, skip
                    continue;
                }

                // Insert new expense
                await db('expenses').insert({
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
                });

                generatedCount++;
                generatedAmount += template.default_amount;
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