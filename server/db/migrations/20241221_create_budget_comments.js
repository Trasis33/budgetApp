/**
 * Migration: Create budget_comments table
 * Enables couples to discuss budget categories
 */

exports.up = function(knex) {
  return knex.schema.createTable('budget_comments', (table) => {
    table.increments('id').primary();
    table.integer('budget_id').unsigned().notNullable()
      .references('id').inTable('budgets').onDelete('CASCADE');
    table.integer('user_id').unsigned().notNullable()
      .references('id').inTable('users').onDelete('CASCADE');
    table.text('text').notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('budget_comments');
};
