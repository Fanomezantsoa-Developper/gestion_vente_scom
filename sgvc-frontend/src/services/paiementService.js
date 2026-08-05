import api from './api'

export const paiementService = {
  getAll: () => api.get('/paiements'),
  getById: (id) => api.get(`/paiements/${id}`),
  create: (data) => api.post('/paiements', data),
  annuler: (id) => api.put(`/paiements/${id}/annuler`),
  delete: (id) => api.delete(`/paiements/${id}`),
}
