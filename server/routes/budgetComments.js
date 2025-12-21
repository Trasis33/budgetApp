const express = require('express');
const router = express.Router();
const db = require('../db/database');
const auth = require('../middleware/auth');

// @route   GET api/budget-comments/:budgetId
// @desc    Get all comments for a budget
// @access  Private
router.get('/:budgetId', auth, async (req, res) => {
  try {
    const { budgetId } = req.params;

    const comments = await db('budget_comments')
      .join('users', 'budget_comments.user_id', 'users.id')
      .select(
        'budget_comments.id',
        'budget_comments.budget_id',
        'budget_comments.user_id',
        'budget_comments.text',
        'budget_comments.created_at',
        'users.name as user_name',
        'users.color as user_color'
      )
      .where('budget_comments.budget_id', budgetId)
      .orderBy('budget_comments.created_at', 'asc');

    res.json(comments);
  } catch (err) {
    console.error('Error fetching budget comments:', err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   POST api/budget-comments
// @desc    Add a comment to a budget
// @access  Private
router.post('/', auth, async (req, res) => {
  const { budget_id, text } = req.body;

  if (!budget_id || !text || !text.trim()) {
    return res.status(400).json({ message: 'Budget ID and comment text are required' });
  }

  try {
    // Verify budget exists
    const budget = await db('budgets').where('id', budget_id).first();
    if (!budget) {
      return res.status(404).json({ message: 'Budget not found' });
    }

    const [id] = await db('budget_comments').insert({
      budget_id,
      user_id: req.user.id,
      text: text.trim()
    });

    // Fetch the created comment with user info
    const comment = await db('budget_comments')
      .join('users', 'budget_comments.user_id', 'users.id')
      .select(
        'budget_comments.id',
        'budget_comments.budget_id',
        'budget_comments.user_id',
        'budget_comments.text',
        'budget_comments.created_at',
        'users.name as user_name',
        'users.color as user_color'
      )
      .where('budget_comments.id', id)
      .first();

    res.status(201).json(comment);
  } catch (err) {
    console.error('Error adding budget comment:', err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   DELETE api/budget-comments/:id
// @desc    Delete a comment (only by author)
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const comment = await db('budget_comments')
      .where('id', req.params.id)
      .first();

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Only allow author to delete their own comment
    if (comment.user_id !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this comment' });
    }

    await db('budget_comments').where('id', req.params.id).del();

    res.json({ message: 'Comment deleted successfully' });
  } catch (err) {
    console.error('Error deleting budget comment:', err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
