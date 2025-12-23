/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function up(knex) {
  return knex.schema.table('recurring_expenses', (table) => {
    table.text('notes').nullable();
    table.string('recurring_type').defaultTo('bill'); // 'bill', 'subscription'
    table.boolean('is_shared').defaultTo(true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function down(knex) {
  return knex.schema.table('recurring_expenses', (table) => {
    table.dropColumn('notes');
    table.dropColumn('recurring_type');
    table.dropColumn('is_shared');
  });
};
