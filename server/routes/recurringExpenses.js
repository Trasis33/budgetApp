const express = require('express');
const router = express.Router();
const { db } = require('../db/setup');
const auth = require('../middleware/auth');

// Get all recurring expenses for the authenticated user
router.get('/', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const expenses = await db('recurring_expenses')
      .where({ user1_id: userId })
      .orWhere({ user2_id: userId });
    res.json(expenses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get a single recurring expense by ID
router.get('/:id', auth, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const expense = await db('recurring_expenses')
            .where({ id })
            .andWhere(function() {
                this.where({ user1_id: userId }).orWhere({ user2_id: userId })
            })
            .first();

        if (!expense) {
            return res.status(404).json({ message: 'Recurring expense not found or not authorized' });
        }
        res.json(expense);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Add a new recurring expense
router.post('/', auth, async (req, res) => {
  try {
    const { description, amount, category_id, paid_by_user_id, split_type, user1_id, user2_id, user1_ratio, user2_ratio } = req.body;
    const userId = req.user.id;

    // Ensure the logged-in user is part of the expense
    if (user1_id !== userId && user2_id !== userId) {
        return res.status(403).json({ message: 'User not authorized to add this expense' });
    }
    
    const [id] = await db('recurring_expenses').insert({
        description,
        amount,
        category_id,
        paid_by_user_id,
        split_type,
        user1_id,
        user2_id,
        user1_ratio,
        user2_ratio
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
        const userId = req.user.id;
        const { description, amount, category_id, paid_by_user_id, split_type, user1_id, user2_id, user1_ratio, user2_ratio } = req.body;

        const expense = await db('recurring_expenses').where({ id }).first();

        if (!expense) {
            return res.status(404).json({ message: 'Recurring expense not found' });
        }

        if (expense.user1_id !== userId && expense.user2_id !== userId) {
            return res.status(403).json({ message: 'User not authorized to update this expense' });
        }

        await db('recurring_expenses').where({ id }).update({
            description,
            amount,
            category_id,
            paid_by_user_id,
            split_type,
            user1_id,
            user2_id,
            user1_ratio,
            user2_ratio
        });

        const updatedExpense = await db('recurring_expenses').where({ id }).first();
        res.json(updatedExpense);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Delete a recurring expense
router.delete('/:id', auth, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const expense = await db('recurring_expenses').where({ id }).first();

        if (!expense) {
            return res.status(404).json({ message: 'Recurring expense not found' });
        }

        if (expense.user1_id !== userId && expense.user2_id !== userId) {
            return res.status(403).json({ message: 'User not authorized to delete this expense' });
        }

        await db('recurring_expenses').where({ id }).del();
        res.status(204).send();
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
