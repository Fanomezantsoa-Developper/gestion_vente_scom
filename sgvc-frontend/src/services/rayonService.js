import api from './api'

export const rayonService = {
  getAll: () => api.get('/rayons'),
  getById: (id) => api.get(`/rayons/${id}`),
  create: (data) => api.post('/rayons', data),
  update: (id, data) => api.put(`/rayons/${id}`, data),
  delete: (id) => api.delete(`/rayons/${id}`),
}