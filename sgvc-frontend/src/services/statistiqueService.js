import api from './api'

export const statistiqueService = {
  dashboard: () => api.get('/statistiques/dashboard'),
  ventesParMois: (annee) => api.get(`/statistiques/ventes-par-mois?annee=${annee}`),
  meilleursVendeurs: (limite = 5) => api.get(`/statistiques/meilleurs-vendeurs?limite=${limite}`),
  derniersBons: (limite = 6) => api.get(`/statistiques/derniers-bons?limite=${limite}`),
  ventesParRayon: (annee) => api.get(`/statistiques/ventes-par-rayon?annee=${annee}`),
  repartitionBons: () => api.get('/statistiques/repartition-bons'),
  commissionsParVendeur: () => api.get('/statistiques/commissions-par-vendeur'),
}
