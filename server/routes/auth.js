const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { check, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const db = require('../db/database');

// @route   POST api/auth/register
// @desc    Register a user
// @access  Public
router.post(
  '/register',
  [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password must be at least 6 characters').isLength({ min: 6 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password } = req.body;

    try {
      let user = await db('users').where('email', email).first();

      if (user) {
        return res.status(400).json({ message: 'User already exists' });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const [userId] = await db('users').insert({
        name,
        email,
        password: hashedPassword,
      }).returning('id');

      const payload = {
        user: {
          id: userId,
        },
      };

      jwt.sign(
        payload,
        process.env.JWT_SECRET || 'defaultsecret',
        { expiresIn: '24h' },
        (err, token) => {
          if (err) throw err;
          res.json({ token, user: { id: userId, name, email } });
        }
      );
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

// @route   POST api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post(
  '/login',
  [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      // Check if user exists
      const user = await db('users').where('email', email).first();
      
      if (!user) {
        console.log('User not found:', email);
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      // Compare password
      const isMatch = await bcrypt.compare(password, user.password);
      
      if (!isMatch) {
        console.log('Password mismatch for user:', email);
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      // Create and return JWT token
      const payload = {
        user: {
          id: user.id,
        },
      };

      jwt.sign(
        payload,
        process.env.JWT_SECRET || 'defaultsecret',
        { expiresIn: '24h' },
        (err, token) => {
          if (err) throw err;
          res.json({ 
            token, 
            user: { 
              id: user.id, 
              name: user.name, 
              email: user.email 
            } 
          });
        }
      );
    } catch (err) {
      console.error('Login error:', err.message);
      res.status(500).send('Server Error');
    }
  }
);

// @route   GET api/auth/user
// @desc    Get logged in user
// @access  Private
router.get('/user', auth, async (req, res) => {
  try {
    const user = await db('users')
      .select('id', 'name', 'email', 'partner_id')
      .where('id', req.user.id)
      .first();
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/auth/users
// @desc    Get current user and their partner (for expense splitting)
// @access  Private
router.get('/users', auth, async (req, res) => {
  try {
    const currentUserId = req.user.id;
    
    // Get current user
    const currentUser = await db('users')
      .select('id', 'name', 'email')
      .where('id', currentUserId)
      .first();
    
    // Get user's partner
    const partner = await db('users')
      .select('id', 'name', 'email')
      .where('partner_id', currentUserId)
      .first();
    
    // If user has a partner, return both
    if (partner) {
      res.json([currentUser, partner]);
    } else {
      // If no partner, only return current user with a flag
      res.json([{
        ...currentUser,
        hasPartner: false,
        partnerStatus: 'no_partner'
      }]);
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/auth/invite-partner
// @desc    Invite a partner by email
// @access  Private
router.post('/invite-partner', auth, async (req, res) => {
  const { email } = req.body;
  
  try {
    const currentUser = await db('users').where('id', req.user.id).first();
    
    // Check if user already has a partner
    if (currentUser.partner_id) {
      return res.status(400).json({ message: 'You already have a partner connected' });
    }
    
    // Check if the email exists
    const partner = await db('users').where('email', email).first();
    
    if (!partner) {
      // In a real app, you'd send an email invitation here
      return res.status(404).json({ 
        message: 'No account found with that email. They need to create an account first.',
        needsToRegister: true,
        email: email
      });
    }
    
    // Check if the potential partner already has a partner
    if (partner.partner_id) {
      return res.status(400).json({ message: 'That person already has a partner connected' });
    }
    
    // Create the partnership (bidirectional)
    await db('users').where('id', req.user.id).update({ partner_id: partner.id });
    await db('users').where('id', partner.id).update({ partner_id: req.user.id });
    
    res.json({ 
      message: `Successfully connected with ${partner.name}!`,
      partner: {
        id: partner.id,
        name: partner.name,
        email: partner.email
      }
    });
    
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/auth/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', auth, async (req, res) => {
  const { name, email, currentPassword, newPassword } = req.body;

  try {
    // Get user from database
    const user = await db('users').where('id', req.user.id).first();

    // Check if email already exists for another user
    if (email !== user.email) {
      const emailExists = await db('users')
        .where('email', email)
        .whereNot('id', req.user.id)
        .first();

      if (emailExists) {
        return res.status(400).json({ message: 'Email already in use' });
      }
    }

    // Update data object
    const updateData = {
      name,
      email
    };

    // If changing password, verify current password and hash new password
    if (currentPassword && newPassword) {
      const isMatch = await bcrypt.compare(currentPassword, user.password);

      if (!isMatch) {
        return res.status(400).json({ message: 'Current password is incorrect' });
      }

      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(newPassword, salt);
    }

    // Update user in database
    await db('users').where('id', req.user.id).update(updateData);

    // Return updated user data (without password)
    const updatedUser = await db('users')
      .select('id', 'name', 'email')
      .where('id', req.user.id)
      .first();

    res.json(updatedUser);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
