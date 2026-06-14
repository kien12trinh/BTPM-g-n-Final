import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
})

// ── Transactions ─────────────────────────────────────────────────
export const transactionApi = {
  getAll: (params) => api.get('/transactions', { params }),
  getById: (id) => api.get(`/transactions/${id}`),
  create: (data) => api.post('/transactions', data),
  update: (id, data) => api.put(`/transactions/${id}`, data),
  delete: (id) => api.delete(`/transactions/${id}`),
  uploadReceipt: (formData) =>
    api.post('/transactions/ocr', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
}

// ── Categories ───────────────────────────────────────────────────
export const categoryApi = {
  getAll: () => api.get('/categories'),
  create: (data) => api.post('/categories', data),
  update: (id, data) => api.put(`/categories/${id}`, data),
  delete: (id) => api.delete(`/categories/${id}`),
}

// ── Dashboard / Summary ──────────────────────────────────────────
export const dashboardApi = {
  getSummary: (params) => api.get('/dashboard/summary', { params }),
  getRecentTransactions: (limit = 5) =>
    api.get('/dashboard/recent', { params: { limit } }),
  getSpendingTrend: (params) => api.get('/dashboard/trend', { params }),
  getBudgets: () => api.get('/dashboard/budgets'),
}

// ── Analytics ────────────────────────────────────────────────────
export const analyticsApi = {
  getReport: (params) => api.get('/analytics/report', { params }),
  exportExcel: (params) =>
    api.get('/analytics/export/excel', { params, responseType: 'blob' }),
  exportPdf: (params) =>
    api.get('/analytics/export/pdf', { params, responseType: 'blob' }),
}

// ── Savings Goals ────────────────────────────────────────────────
export const savingsApi = {
  // Goals
  getAll:  ()           => api.get('/savings'),
  getById: (id)         => api.get(`/savings/${id}`),
  create:  (data)       => api.post('/savings', data),
  update:  (id, data)   => api.patch(`/savings/${id}`, data),
  delete:  (id)         => api.delete(`/savings/${id}`),
  // Deposits
  getDeposits:   (goalId)              => api.get(`/savings/${goalId}/deposits`),
  addDeposit:    (goalId, data)        => api.post(`/savings/${goalId}/deposits`, data),
  deleteDeposit: (goalId, depositId)   => api.delete(`/savings/${goalId}/deposits/${depositId}`),
}

// ── Budgets ───────────────────────────────────────────────────
export const budgetApi = {
  getByMonth: (monthYear) => api.get('/budgets', { params: { month_year: monthYear } }),
  setBudget: (data) => api.post('/budgets', data),
}

export default api