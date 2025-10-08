exports.up = async function up(knex) {
  const hasColumn = await knex.schema.hasColumn('users', 'partner_id');
  if (!hasColumn) {
    await knex.schema.alterTable('users', (table) => {
      table
        .integer('partner_id')
        .unsigned()
        .nullable()
        .references('id')
        .inTable('users')
        .onDelete('SET NULL')
        .unique();
    });
  }
};

exports.down = async function down(knex) {
  const hasColumn = await knex.schema.hasColumn('users', 'partner_id');
  if (hasColumn) {
    await knex.schema.alterTable('users', (table) => {
      table.dropColumn('partner_id');
    });
  }
};
