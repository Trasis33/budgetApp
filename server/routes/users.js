const express = require('express');
const router = express.Router();
const db = require('../db/database');
const auth = require('../middleware/auth');

// @route   GET api/users
// @desc    Get connected users (self and partner)
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    // Get current user's partner_id
    const currentUser = await db('users').select('partner_id').where('id', req.user.id).first();
    
    const userIds = [req.user.id];
    if (currentUser && currentUser.partner_id) {
      userIds.push(currentUser.partner_id);
    }

    const users = await db.select('id', 'name', 'email')
      .from('users')
      .whereIn('id', userIds);
      
    res.json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
