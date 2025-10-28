exports.up = function(knex) {
  return knex.schema
    .createTable('savings_contributions', function(table) {
      table.increments('id').primary();
      table.integer('goal_id').unsigned().notNullable();
      table.integer('user_id').unsigned().notNullable();
      table.decimal('amount', 10, 2).notNullable();
      table.date('date').notNullable();
      table.text('note');
      table.timestamp('created_at').defaultTo(knex.fn.now());

      table.foreign('goal_id').references('savings_goals.id').onDelete('CASCADE');
      table.foreign('user_id').references('users.id').onDelete('CASCADE');
    });
};

exports.down = function(knex) {
  return knex.schema.dropTable('savings_contributions');
};

