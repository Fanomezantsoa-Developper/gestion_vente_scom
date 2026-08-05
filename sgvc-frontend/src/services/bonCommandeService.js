import api from './api'

export const bonCommandeService = {
  getAll: () => api.get('/bons-commande'),
  getById: (id) => api.get(`/bons-commande/${id}`),
  getByStatut: (statut) => api.get(`/bons-commande/statut/${statut}`),
  getByVendeur: (vendeurId) => api.get(`/bons-commande/vendeur/${vendeurId}`),
  rechercher: (q) => api.get(`/bons-commande/recherche?q=${encodeURIComponent(q)}`),
  create: (data) => api.post('/bons-commande', data),
  valider: (id) => api.put(`/bons-commande/${id}/valider`),
  annuler: (id) => api.put(`/bons-commande/${id}/annuler`),
  delete: (id) => api.delete(`/bons-commande/${id}`),
}
