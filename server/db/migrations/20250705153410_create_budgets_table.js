exports.up = function(knex) {
  return knex.schema.createTable('budgets', table => {
    table.increments('id').primary();
    table.integer('category_id').unsigned().references('id').inTable('categories').onDelete('CASCADE');
    table.decimal('amount', 10, 2).notNullable();
    table.integer('month').notNullable();
    table.integer('year').notNullable();
    table.unique(['category_id', 'month', 'year']);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('budgets');
};