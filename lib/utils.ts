// ============================================
// lib/utils.ts
// Utilitaires de classe Tailwind
// ============================================

import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Fusionne les classes Tailwind en évitant les conflits
 * Combine clsx (conditions) + tailwind-merge (résolution conflits)
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
