import api from './api'

export const produitService = {
  getAll: () => api.get('/produits'),
  getById: (id) => api.get(`/produits/${id}`),
  getByRayon: (rayonId) => api.get(`/produits/rayon/${rayonId}`),
  stockFaible: (seuil = 10) => api.get(`/produits/stock-faible?seuil=${seuil}`),
  rechercher: (q) => api.get(`/produits/recherche?q=${encodeURIComponent(q)}`),
  create: (data) => api.post('/produits', data),
  update: (id, data) => api.put(`/produits/${id}`, data),
  delete: (id) => api.delete(`/produits/${id}`),
}
