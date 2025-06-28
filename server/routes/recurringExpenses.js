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

module.exports = router;