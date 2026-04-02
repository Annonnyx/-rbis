// ============================================
// lib/date.ts
// Utilitaires de formatage de dates
// ============================================

import { formatDistanceToNow as dateFnsFormatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'

/**
 * Formate une date en "il y a X minutes/heures/jours"
 */
export function formatDistanceToNow(date: Date | string | number): string {
  return dateFnsFormatDistanceToNow(new Date(date), { 
    addSuffix: true,
    locale: fr 
  })
}

/**
 * Formate une date en format français
 */
export function formatDate(date: Date | string | number): string {
  return new Date(date).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

/**
 * Formate une heure en format français
 */
export function formatTime(date: Date | string | number): string {
  return new Date(date).toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit'
  })
}
