# Bug Fix: Budgets API Endpoint

## Issue
**Error**: `GET http://localhost:5001/api/budgets?month=11&year=2025 404 (Not Found)`

## Root Cause
The budgets route (`server/routes/budgets.js`) only had a **POST** endpoint for creating/updating budgets, but was missing a **GET** endpoint to fetch budgets.

## Solution
Added GET endpoint to `server/routes/budgets.js`:

```javascript
// @route   GET api/budgets
// @desc    Get budgets for a specific month and year
// @access  Private
router.get('/', auth, async (req, res) => {
  const { month, year } = req.query;

  if (!month || !year) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    const budgets = await db('budgets')
      .join('categories', 'budgets.category_id', 'categories.id')
      .select(
        'budgets.id',
        'budgets.category_id',
        'budgets.month',
        'budgets.year',
        'budgets.amount',
        'categories.name as category_name'
      )
      .where('budgets.month', month)
      .andWhere('budgets.year', year);

    res.json(budgets);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});
```

## What's Fixed
✅ Budgets endpoint now supports GET requests
✅ Returns budgets with category names (joined from categories table)
✅ Queries by month and year parameters
✅ Properly authenticated with JWT middleware

## How to Test
1. **Restart the backend server** (required for changes to take effect):
   ```bash
   cd /Users/fredriklanga/Documents/projects2024/budgetApp/server
   npm run dev:server  # or npm start
   ```

2. **Start client-v2**:
   ```bash
   cd /Users/fredriklanga/Documents/projects2024/budgetApp/client-v2
   npm run dev
   ```

3. **Test the flow**:
   - Register/login at http://localhost:3001
   - Dashboard should now load without 404 errors
   - Budgets section will show (may be empty if no budgets created yet)

## Files Modified
- ✅ `server/routes/budgets.js` - Added GET endpoint

## Status
🔧 **FIXED** - Backend endpoint added, awaiting server restart
