/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.table('categories', (table) => {
    table.string('color', 50).nullable().defaultTo('#6366f1');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.table('categories', (table) => {
    table.dropColumn('color');
  });
};
