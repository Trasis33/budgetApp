/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.table('categories', (table) => {
        table.string('spending_role').notNullable().defaultTo('need');
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.table('categories', function(table) {
        table.dropColumn('spending_role');
    });
};


