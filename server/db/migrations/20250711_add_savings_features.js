exports.up = function(knex) {
  return knex.schema
    .createTable('savings_goals', function(table) {
      table.increments('id').primary();
      table.integer('user_id').unsigned().notNullable();
      table.string('goal_name').notNullable();
      table.decimal('target_amount', 10, 2).notNullable();
      table.decimal('current_amount', 10, 2).defaultTo(0);
      table.date('target_date');
      table.string('category').defaultTo('general');
      table.timestamps(true, true);
      
      table.foreign('user_id').references('users.id').onDelete('CASCADE');
    })
    .createTable('savings_milestones', function(table) {
      table.increments('id').primary();
      table.integer('goal_id').unsigned().notNullable();
      table.integer('milestone_percentage').notNullable();
      table.date('achieved_date');
      table.decimal('milestone_amount', 10, 2).notNullable();
      table.timestamp('created_at').defaultTo(knex.fn.now());
      
      table.foreign('goal_id').references('savings_goals.id').onDelete('CASCADE');
    })
    .createTable('budget_optimization_tips', function(table) {
      table.increments('id').primary();
      table.integer('user_id').unsigned().notNullable();
      table.string('tip_type').notNullable();
      table.string('category');
      table.string('title').notNullable();
      table.text('description').notNullable();
      table.decimal('impact_amount', 10, 2);
      table.decimal('confidence_score', 3, 2);
      table.boolean('is_dismissed').defaultTo(false);
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.timestamp('expires_at');
      
      table.foreign('user_id').references('users.id').onDelete('CASCADE');
    });
};

exports.down = function(knex) {
  return knex.schema
    .dropTable('budget_optimization_tips')
    .dropTable('savings_milestones')
    .dropTable('savings_goals');
};
