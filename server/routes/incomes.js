const express = require('express');
const router = express.Router();
const db = require('../db/database');
const auth = require('../middleware/auth');

// @route   GET api/incomes
// @desc    Get all incomes for a specific month and year
// @access  Private
router.get('/', auth, async (req, res) => {
  const { month, year } = req.query;
  const userId = req.user.id;

  if (!month || !year) {
    return res.status(400).json({ message: 'Month and year are required' });
  }

  try {
    const incomes = await db('incomes')
      .where({ user_id: userId })
      .whereRaw('strftime("%m", date) = ?', [month.padStart(2, '0')])
      .whereRaw('strftime("%Y", date) = ?', [year]);

    res.json(incomes);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/incomes
// @desc    Create a new income entry
// @access  Private
router.post('/', auth, async (req, res) => {
  const { source, amount, date } = req.body;
  const userId = req.user.id;

  if (!source || !amount || !date) {
    return res.status(400).json({ message: 'Source, amount, and date are required' });
  }

  try {
    const [id] = await db('incomes').insert({
      user_id: userId,
      source,
      amount,
      date,
    });

    const newIncome = await db('incomes').where({ id }).first();
    res.json(newIncome);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/incomes/:id
// @desc    Delete an income entry
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const income = await db('incomes').where({ id, user_id: userId }).first();

    if (!income) {
      return res.status(404).json({ message: 'Income entry not found' });
    }

    await db('incomes').where({ id }).del();

    res.json({ message: 'Income entry removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
