const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Path to your SQLite database
const dbPath = path.join(__dirname, '../server/db/expense_tracker.sqlite');

// Create database connection
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
    process.exit(1);
  }
  console.log('Connected to SQLite database');
});

// Delete the recurring expense with ids of params
const deleteRecurringExpense = () => {
  const params = [1, 2, 3, 4, 5, 6, 7, 8];
  const placeholders = params.map(() => '?').join(', ');
  const sql = `DELETE FROM recurring_expenses WHERE id IN (${placeholders})`;

  db.run(sql, params, function(err) {
    if (err) {
      console.error('Error deleting recurring expense:', err.message);
      process.exit(1);
    }

    if (this.changes === 0) {
      console.log(`No recurring expense found with id ${params}`);
    } else {
      console.log(`Successfully deleted recurring expense with id ${params}. ${this.changes} row(s) affected.`);
    }

    // Close the database connection
    db.close((err) => {
      if (err) {
        console.error('Error closing database:', err.message);
        process.exit(1);
      }
      console.log('Database connection closed');
      process.exit(0);
    });
  });
};

// Execute the deletion
deleteRecurringExpense();
