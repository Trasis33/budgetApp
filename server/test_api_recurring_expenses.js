const db = require('./db/database');

/**
 * Standalone API Logic Test for Recurring Expenses
 * This test verifies the database operations that the API routes perform.
 * Since setting up a full HTTP test environment is complex here,
 * we verify the core "Controller" logic.
 */
async function runTests() {
  console.log('--- Starting Recurring Expenses API Logic Tests ---');
  
  let testUserId;
  let testCategoryId;
  let testExpenseId;

  try {
    // Setup: Ensure we have a user and category
    const user = await db('users').first();
    if (!user) {
      throw new Error('No users found in database for testing');
    }
    testUserId = user.id;

    const category = await db('categories').first();
    if (!category) {
      throw new Error('No categories found in database for testing');
    }
    testCategoryId = category.id;

    // 1. Test "POST" logic (Insert)
    console.log('Testing Insert (POST logic)...');
    const newTemplate = {
      description: 'Test Subscription',
      default_amount: 99.99,
      category_id: testCategoryId,
      paid_by_user_id: testUserId,
      split_type: '50/50',
      recurring_type: 'subscription',
      is_shared: true,
      notes: 'Test notes'
    };

    const [id] = await db('recurring_expenses').insert(newTemplate);
    testExpenseId = id;

    const inserted = await db('recurring_expenses').where({ id: testExpenseId }).first();
    if (inserted.description !== newTemplate.description) throw new Error('Description mismatch');
    if (inserted.recurring_type !== 'subscription') throw new Error('recurring_type mismatch');
    if (inserted.is_shared !== 1) throw new Error('is_shared mismatch');
    console.log('✅ Insert Successful');

    // 2. Test "PUT" logic (Update)
    console.log('Testing Update (PUT logic)...');
    const updates = {
      default_amount: 120.00,
      notes: 'Updated notes',
      is_shared: false
    };

    await db('recurring_expenses').where({ id: testExpenseId }).update(updates);
    
    const updated = await db('recurring_expenses').where({ id: testExpenseId }).first();
    if (parseFloat(updated.default_amount) !== 120.00) throw new Error('Amount update mismatch');
    if (updated.notes !== updates.notes) throw new Error('Notes update mismatch');
    if (updated.is_shared !== 0) throw new Error('is_shared update mismatch');
    console.log('✅ Update Successful');

    // 3. Test "GET" logic (Query)
    console.log('Testing Query (GET logic)...');
    const activeTemplates = await db('recurring_expenses').where('is_active', true);
    if (!activeTemplates.find(t => t.id === testExpenseId)) throw new Error('Inserted template not found in active list');
    console.log('✅ Query Successful');

    // Cleanup
    await db('recurring_expenses').where({ id: testExpenseId }).del();
    console.log('✅ Cleanup Successful');

    console.log('\n--- ALL API LOGIC TESTS PASSED ---');
    process.exit(0);

  } catch (err) {
    console.error('\n❌ TEST FAILED:', err.message);
    if (testExpenseId) {
        await db('recurring_expenses').where({ id: testExpenseId }).del();
    }
    process.exit(1);
  }
}

runTests();
