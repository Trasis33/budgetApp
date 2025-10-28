exports.up = function(knex) {
  return knex.schema.hasColumn('budget_optimization_tips', 'scope').then((exists) => {
    if (exists) {
      return null;
    }
    return knex.schema.alterTable('budget_optimization_tips', (table) => {
      table.string('scope').defaultTo('ours');
    });
  });
};

exports.down = function(knex) {
  return knex.schema.hasColumn('budget_optimization_tips', 'scope').then((exists) => {
    if (!exists) {
      return null;
    }
    return knex.schema.alterTable('budget_optimization_tips', (table) => {
      table.dropColumn('scope');
    });
  });
};
