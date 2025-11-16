const express = require('express');
const router = express.Router();
const db = require('../db/database');
const auth = require('../middleware/auth');

// @route   GET api/categories
// @desc    Get all categories
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const categories = await db('categories').select('*');
    res.json(categories);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/categories
// @desc    Create a new category
// @access  Private
router.post('/', auth, async (req, res) => {
  const { name, icon, color } = req.body;

  try {
    if (!name) {
      return res.status(400).json({ message: 'Please provide a category name' });
    }

    // Check if category already exists
    const existingCategory = await db('categories').where('name', name).first();
    if (existingCategory) {
      return res.status(400).json({ message: 'Category already exists' });
    }

    const [id] = await db('categories').insert({
      name,
      icon: icon || null,
      color: color || '#6366f1'
    });

    const category = await db('categories').where('id', id).first();
    res.json(category);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/categories/:id
// @desc    Update a category
// @access  Private
router.put('/:id', auth, async (req, res) => {
  const { name, icon, color } = req.body;

  try {
    const categoryExists = await db('categories').where('id', req.params.id).first();
    
    if (!categoryExists) {
      return res.status(404).json({ message: 'Category not found' });
    }

    await db('categories')
      .where('id', req.params.id)
      .update({
        name: name || categoryExists.name,
        icon: icon !== undefined ? icon : categoryExists.icon,
        color: color !== undefined ? color : categoryExists.color
      });

    const category = await db('categories').where('id', req.params.id).first();
    res.json(category);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/categories/:id
// @desc    Delete a category
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    // Check if category exists
    const categoryExists = await db('categories').where('id', req.params.id).first();
    
    if (!categoryExists) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    // Check if category is being used by expenses
    const expenseUsingCategory = await db('expenses').where('category_id', req.params.id).first();
    
    if (expenseUsingCategory) {
      return res.status(400).json({ message: 'Cannot delete a category that is being used by expenses' });
    }

    await db('categories').where('id', req.params.id).del();

    res.json({ message: 'Category removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
