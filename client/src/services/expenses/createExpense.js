// createExpense API client (T018)
// Responsible for POSTing an expense and returning normalized object per contract.

const ENDPOINT = '/api/expenses';

export async function createExpense(payload) {
  const start = performance.now();
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const errText = await safeJson(res);
    const error = new Error('Failed to create expense');
    error.status = res.status;
    error.details = errText;
    throw error;
  }
  const data = await res.json();
  // Normalize numeric fields if needed (amount already string from server schema, keep as-is)
  const latency = performance.now() - start;
  return { ...data, _latencyMs: latency };
}

async function safeJson(res) {
  try { return await res.json(); } catch { return null; }
}

export default createExpense;
