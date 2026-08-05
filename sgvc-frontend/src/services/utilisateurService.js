import api from './api'

export const utilisateurService = {
  getAll: () => api.get('/utilisateurs'),
  getById: (id) => api.get(`/utilisateurs/${id}`),
  rechercher: (q) => api.get(`/utilisateurs/recherche?q=${encodeURIComponent(q)}`),
  create: (data) => api.post('/utilisateurs', data),
  update: (id, data) => api.put(`/utilisateurs/${id}`, data),
  delete: (id) => api.delete(`/utilisateurs/${id}`),
}

export const roleService = {
  getAll: () => api.get('/roles'),
}
