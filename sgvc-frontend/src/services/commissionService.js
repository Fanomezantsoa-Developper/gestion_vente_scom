import api from './api'

export const commissionService = {
  getAll: () => api.get('/commissions'),
  getById: (id) => api.get(`/commissions/${id}`),
  getByVendeur: (vendeurId) => api.get(`/commissions/vendeur/${vendeurId}`),
  calculer: (vendeurId, mois, annee) =>
    api.post(`/commissions/calculer?vendeurId=${vendeurId}&mois=${mois}&annee=${annee}`),
}
