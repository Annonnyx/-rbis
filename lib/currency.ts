// ============================================
// lib/currency.ts
// Utilitaires de formatage pour la monnaie Ørbis (◎)
// Tous les montants en DB sont stockés en centimes (BigInt)
// ============================================

/**
 * Formatte un montant en centimes vers la représentation affichable
 * @param centimes - Montant en centimes (ex: 100000n)
 * @returns String formaté (ex: "◎ 1 000,00")
 */
export function formatOrbe(centimes: bigint): string {
  const orbe = Number(centimes) / 100
  
  // Format français avec espace comme séparateur de milliers
  const formatted = new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(orbe)
  
  return `◎ ${formatted}`
}

/**
 * Convertit des centimes en valeur décimale Orbe
 * @param centimes - Montant en centimes
 * @returns Nombre décimal (ex: 1000.00)
 */
export function toOrbe(centimes: bigint): number {
  return Number(centimes) / 100
}

/**
 * Convertit une valeur Orbe décimale en centimes
 * @param orbe - Montant en Orbe (ex: 1000.00)
 * @returns BigInt en centimes (ex: 100000n)
 */
export function toCentimes(orbe: number): bigint {
  return BigInt(Math.round(orbe * 100))
}

/**
 * Formatte un montant brut sans le symbole
 * Utile pour les inputs ou calculs
 */
export function formatOrbeRaw(centimes: bigint): string {
  const orbe = Number(centimes) / 100
  return new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(orbe)
}
