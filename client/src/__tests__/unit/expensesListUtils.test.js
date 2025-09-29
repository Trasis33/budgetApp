import { insertExpense } from '../../utils/expensesListUtils';

test('insert newer date at front (T032)', () => {
  const list = [{id:1,date:'2025-09-10'},{id:2,date:'2025-09-05'}];
  const result = insertExpense(list, {id:3,date:'2025-09-15'});
  expect(result.map(e=>e.id)).toEqual([3,1,2]);
});

test('append older date (T032)', () => {
  const list = [{id:1,date:'2025-09-10'},{id:2,date:'2025-09-05'}];
  const result = insertExpense(list, {id:4,date:'2025-09-01'});
  expect(result.map(e=>e.id)).toEqual([1,2,4]);
});
