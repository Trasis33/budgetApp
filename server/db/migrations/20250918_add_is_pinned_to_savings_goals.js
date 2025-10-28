exports.up = function (knex) {
  return knex.schema.alterTable('savings_goals', function (table) {
    table.boolean('is_pinned').notNullable().defaultTo(false);
  });
};

exports.down = function (knex) {
  return knex.schema.alterTable('savings_goals', function (table) {
    table.dropColumn('is_pinned');
  });
};
