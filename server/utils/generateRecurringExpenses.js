const db = require('../db/database');

const generateRecurringExpenses = async (year, month) => {
  const activeRecurringExpenses = await db('recurring_expenses').where('is_active', true);
  const targetDate = `${year}-${String(month).padStart(2, '0')}-01`;

  for (const recurring of activeRecurringExpenses) {
    console.log(`Processing recurring expense ID: ${recurring.id} for ${targetDate}`);

    const existingExpense = await db('expenses')
      .where({ recurring_expense_id: recurring.id })
      .where(db.raw('DATE(date) = DATE(?)', [targetDate]))
      .first();

    // Convert recurring.updated_at to a comparable format (e.g., ISO string)
    const recurringUpdatedAt = new Date(recurring.updated_at).toISOString();

    if (!existingExpense) {
      console.log(`No existing expense found for recurring ID ${recurring.id} on ${targetDate}. Inserting new.`);
      // Insert new expense if none exists. Use onConflict to gracefully handle race conditions
      try {
        await db('expenses')
          .insert({
            date: targetDate,
            amount: recurring.default_amount,
            category_id: recurring.category_id,
            paid_by_user_id: recurring.paid_by_user_id,
            split_type: recurring.split_type,
            split_ratio_user1: recurring.split_ratio_user1,
            split_ratio_user2: recurring.split_ratio_user2,
            description: recurring.description,
            recurring_expense_id: recurring.id,
            recurring_template_updated_at: recurringUpdatedAt,
          })
          // SQLite (>= 3.24) supports ON CONFLICT DO NOTHING. This prevents duplicate insertions
          .onConflict(["recurring_expense_id", "date"]).ignore();
      } catch (insertErr) {
        // Fallback for older SQLite versions without onConflict
        if (insertErr.code === 'SQLITE_CONSTRAINT') {
          console.warn(
            `Duplicate expense entry detected for recurring ID ${recurring.id} on ${targetDate}. Skipping.`
          );
        } else {
          throw insertErr;
        }
      }
    } else {
      console.log(`Existing expense found for recurring ID ${recurring.id} on ${targetDate}.`);
      console.log(`Existing template updated at: ${existingExpense.recurring_template_updated_at}`);
      console.log(`Recurring template updated at: ${recurringUpdatedAt}`);

      // If an expense exists, check if the recurring template has been updated
      const existingTemplateUpdatedAt = new Date(existingExpense.recurring_template_updated_at).toISOString();

      if (existingTemplateUpdatedAt !== recurringUpdatedAt) {
        console.log(`Template updated for recurring ID ${recurring.id}. Deleting old and inserting new.`);
        // Template has been updated, delete old expense and insert new one
        await db('expenses').where({ id: existingExpense.id }).del();
        await db('expenses').insert({
          date: targetDate,
          amount: recurring.default_amount,
          category_id: recurring.category_id,
          paid_by_user_id: recurring.paid_by_user_id,
          split_type: recurring.split_type,
          split_ratio_user1: recurring.split_ratio_user1,
          split_ratio_user2: recurring.split_ratio_user2,
          description: recurring.description,
          recurring_expense_id: recurring.id,
          recurring_template_updated_at: recurringUpdatedAt,
        });
      } else {
        console.log(`Template not updated for recurring ID ${recurring.id}. Keeping existing expense.`);
      }
    }
  }
};

module.exports = generateRecurringExpenses;
