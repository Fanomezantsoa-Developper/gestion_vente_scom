import api from './api'

export const vendeurService = {
  getAll: () => api.get('/vendeurs'),
  getById: (id) => api.get(`/vendeurs/${id}`),
  getByRayon: (rayonId) => api.get(`/vendeurs/rayon/${rayonId}`),
  rechercher: (q) => api.get(`/vendeurs/recherche?q=${encodeURIComponent(q)}`),
  create: (data) => api.post('/vendeurs', data),
  update: (id, data) => api.put(`/vendeurs/${id}`, data),
  delete: (id) => api.delete(`/vendeurs/${id}`),
}
