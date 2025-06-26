const knex = require('knex');
const path = require('path');
const bcrypt = require('bcryptjs');
const fs = require('fs');

// Ensure the directory exists
const dbDirectory = path.join(__dirname);
if (!fs.existsSync(dbDirectory)) {
  fs.mkdirSync(dbDirectory, { recursive: true });
}

const db = knex({
  client: 'sqlite3',
  connection: {
    filename: path.join(__dirname, 'expense_tracker.sqlite')
  },
  useNullAsDefault: true
});

const setupDatabase = async () => {
  try {
    // Force re-creation of the demo user
    console.log('Starting database setup...');
    
    // Check if users table exists
    const hasUsersTable = await db.schema.hasTable('users');
    
    if (!hasUsersTable) {
      console.log('Creating database tables...');
      
      // Create users table
      await db.schema.createTable('users', (table) => {
        table.increments('id').primary();
        table.string('name').notNullable();
        table.string('email').unique().notNullable();
        table.string('password').notNullable();
        table.timestamps(true, true);
      });

      // Create categories table
      await db.schema.createTable('categories', (table) => {
        table.increments('id').primary();
        table.string('name').notNullable();
        table.string('icon').nullable();
        table.timestamps(true, true);
      });

      // Create expenses table
      await db.schema.createTable('expenses', (table) => {
        table.increments('id').primary();
        table.date('date').notNullable();
        table.decimal('amount', 10, 2).notNullable();
        table.integer('category_id').references('id').inTable('categories');
        table.integer('paid_by_user_id').references('id').inTable('users');
        table.string('split_ratio').defaultTo('50/50');
        table.string('description').notNullable();
        table.string('notes').nullable();
        table.timestamps(true, true);
      });

      // Create monthly_statements table
      await db.schema.createTable('monthly_statements', (table) => {
        table.increments('id').primary();
        table.integer('month').notNullable();
        table.integer('year').notNullable();
        table.decimal('total_expenses', 10, 2).defaultTo(0);
        table.decimal('user1_owes_user2', 10, 2).defaultTo(0);
        table.decimal('remaining_budget_user1', 10, 2).nullable();
        table.decimal('remaining_budget_user2', 10, 2).nullable();
        table.timestamps(true, true);
        table.unique(['month', 'year']);
      });

      console.log('Database tables created successfully');
      
      // Seed categories
      const categories = [
        { name: 'Groceries', icon: 'shopping-cart' },
        { name: 'Kids Clothes', icon: 'tshirt' },
        { name: 'Mortgage', icon: 'home' },
        { name: 'Utilities', icon: 'bolt' },
        { name: 'Transportation', icon: 'car' },
        { name: 'Dining Out', icon: 'utensils' },
        { name: 'Entertainment', icon: 'film' },
        { name: 'Healthcare', icon: 'heart' },
        { name: 'Household Items', icon: 'box' },
        { name: 'Miscellaneous', icon: 'box' }
      ];

      await db('categories').insert(categories);
      console.log('Categories seeded successfully');
    }
    
    // Always recreate the demo user for testing
    try {
      // Delete the demo user if it exists (to ensure fresh password)
      await db('users').where('email', 'user1@example.com').delete();
      console.log('Removed old demo user if it existed');
      
      // Create new demo user
      const salt = await bcrypt.genSalt(10);
      // Use a simpler string for the password to avoid any encoding issues
      const plainPassword = 'password123';
      console.log('Creating demo user with password:', plainPassword);
      
      const hashedPassword = await bcrypt.hash(plainPassword, salt);
      console.log('Hashed password length:', hashedPassword.length);
      
      const userId = await db('users').insert({
        name: 'Demo User',
        email: 'user1@example.com',
        password: hashedPassword
      });
      
      console.log('Demo user created successfully with ID:', userId);
      
      // Verify the user was created
      const createdUser = await db('users').where('email', 'user1@example.com').first();
      if (createdUser) {
        console.log('Verified demo user exists in database');
        
        // Test password matching
        const passwordTest = await bcrypt.compare(plainPassword, createdUser.password);
        console.log('Password verification test:', passwordTest ? 'SUCCESS' : 'FAILED');
      } else {
        console.log('ERROR: Demo user not found after creation!');
      }
    } catch (userErr) {
      console.error('Error creating demo user:', userErr);
    }
    
  } catch (err) {
    console.error('Database setup error:', err);
  }
};

module.exports = { db, setupDatabase };
