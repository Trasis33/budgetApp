exports.up = function(knex) {
  return knex.schema.alterTable('categories', (table) => {
    // Weight from 0.0 to 1.0, default 0.5 (medium priority)
    // Decimal(3,2) allows 0.00 to 9.99, which covers our range of 0.0-1.0
    table.decimal('budget_weight', 3, 2).defaultTo(0.50).after('spending_role');
    
    // Optional: min percentage constraint (e.g., 0.10 = 10% floor)
    table.decimal('budget_min_pct', 5, 2).nullable().after('budget_weight');
    
    // Optional: max percentage constraint (e.g., 0.25 = 25% cap)
    table.decimal('budget_max_pct', 5, 2).nullable().after('budget_min_pct');
  });
};

exports.down = function(knex) {
  return knex.schema.alterTable('categories', (table) => {
    table.dropColumn('budget_weight');
    table.dropColumn('budget_min_pct');
    table.dropColumn('budget_max_pct');
  });
};
