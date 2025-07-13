/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('spending_patterns', table => {
    table.increments('id').primary();
    table.integer('user_id').unsigned().notNullable();
    table.string('category').notNullable();
    table.string('month', 7).notNullable(); // e.g. '2025-07'
    table.decimal('average_amount', 10, 2).notNullable();
    table.decimal('variance', 5, 2).notNullable();
    table.string('trend_direction'); // 'increasing', 'decreasing', 'stable'
    table.decimal('seasonal_factor', 5, 2).defaultTo(1.0);
    table.timestamp('created_at').defaultTo(knex.fn.now());
    
    table.foreign('user_id').references('id').inTable('users');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('spending_patterns');
};
