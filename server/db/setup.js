const bcrypt = require('bcryptjs');
const db = require('./database');

const setupDatabase = async () => {
  try {
    console.log('Starting database setup...');

    // Create users table if it doesn't exist
    if (!(await db.schema.hasTable('users'))) {
      console.log('Creating users table...');
      await db.schema.createTable('users', (table) => {
        table.increments('id').primary();
        table.string('name').notNullable();
        table.string('email').unique().notNullable();
        table.string('password').notNullable();
        table.timestamps(true, true);
      });
    }

    // Create categories table if it doesn't exist
    if (!(await db.schema.hasTable('categories'))) {
      console.log('Creating categories table...');
      await db.schema.createTable('categories', (table) => {
        table.increments('id').primary();
        table.string('name').notNullable();
        table.string('icon').nullable();
        table.timestamps(true, true);
      });

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

    // Create recurring_expenses table if it doesn't exist
    if (!(await db.schema.hasTable('recurring_expenses'))) {
        console.log('Creating recurring_expenses table...');
        await db.schema.createTable('recurring_expenses', (table) => {
            table.increments('id').primary();
            table.string('description').notNullable();
            table.decimal('default_amount', 10, 2).notNullable();
            table.integer('category_id').references('id').inTable('categories');
            table.integer('paid_by_user_id').references('id').inTable('users');
            table.string('split_type').defaultTo('50/50');
            table.decimal('split_ratio_user1', 5, 2).nullable();
            table.decimal('split_ratio_user2', 5, 2).nullable();
            table.boolean('is_active').defaultTo(true);
            table.timestamps(true, true);
        });
    }

    // Create expenses table if it doesn't exist
    if (!(await db.schema.hasTable('expenses'))) {
      console.log('Creating expenses table...');
      await db.schema.createTable('expenses', (table) => {
        table.increments('id').primary();
        table.date('date').notNullable();
        table.decimal('amount', 10, 2).notNullable();
        table.integer('category_id').references('id').inTable('categories');
        table.integer('paid_by_user_id').references('id').inTable('users');
        table.string('split_type').defaultTo('50/50');
        table.decimal('split_ratio_user1', 5, 2).nullable();
        table.decimal('split_ratio_user2', 5, 2).nullable();
        table.string('description').notNullable();
        table.string('notes').nullable();
        table.integer('recurring_expense_id').references('id').inTable('recurring_expenses').onDelete('SET NULL');
        table.timestamp('recurring_template_updated_at').nullable();
        table.timestamps(true, true);
        table.unique(['recurring_expense_id', 'date']);
      });
    }

    // Create monthly_statements table if it doesn't exist
    if (!(await db.schema.hasTable('monthly_statements'))) {
      console.log('Creating monthly_statements table...');
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
    }

    // Seed demo users only if they don't exist
    try {
      const user1 = await db('users').where('email', 'user1@example.com').first();
      if (!user1) {
        const salt_1 = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('password123', salt_1);
        await db('users').insert({
          name: 'Demo User',
          email: 'user1@example.com',
          password: hashedPassword
        });
        console.log('Demo user 1 created successfully');
      }

      const user2 = await db('users').where('email', 'user2@example.com').first();
      if (!user2) {
        const salt_2 = await bcrypt.genSalt(10);
        const hashedPassword_2 = await bcrypt.hash('password123', salt_2);
        await db('users').insert({
          name: 'Demo User 2',
          email: 'user2@example.com',
          password: hashedPassword_2
        });
        console.log('Demo user 2 created successfully');
      }
    } catch (userErr) {
      console.error('Error creating demo user:', userErr);
    }

  } catch (err) {
    console.error('Database setup error:', err);
  }
};

module.exports = { setupDatabase };
