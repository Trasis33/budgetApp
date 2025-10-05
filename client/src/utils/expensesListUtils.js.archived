// expensesListUtils (T022)
// Insert a new expense into a list sorted by date DESC (YYYY-MM-DD) with stable ordering by created_at fallback.

export function insertExpense(list, expense) {
  const newList = [...list];
  const targetDate = expense.date;
  let inserted = false;
  for (let i = 0; i < newList.length; i++) {
    const d = newList[i].date;
    if (targetDate > d) { // later date first
      newList.splice(i, 0, expense);
      inserted = true;
      break;
    }
  }
  if (!inserted) newList.push(expense);
  return newList;
}

export default insertExpense;
