/**
 * Utilitaires de formatage pour l'affichage des données
 */

/**
 * Formate un rating en nombre sûr pour l'affichage
 */
export const formatRating = (rating: any): number => {
  const num = Number(rating)
  return isNaN(num) ? 0 : num
}

/**
 * Formate un prix en euro avec 2 décimales
 */
export const formatPrice = (price: any): string => {
  const num = Number(price)
  return isNaN(num) ? '0.00' : num.toFixed(2)
}

/**
 * Formate une distance en km avec 1 décimale
 */
export const formatDistance = (distance: any): string => {
  const num = Number(distance)
  return isNaN(num) ? '0.0' : num.toFixed(1)
}

/**
 * Formate un rating pour l'affichage (avec 1 décimale)
 */
export const formatRatingDisplay = (rating: any): string => {
  return formatRating(rating).toFixed(1)
}