// ============================================
// lib/validations/auth.ts
// Schémas Zod pour la validation des formulaires d'auth
// ============================================

import { z } from 'zod'

/**
 * Validation du username
 * - min 3 caractères
 * - max 20 caractères  
 * - alphanumérique + tirets/underscores uniquement
 * - immuable (pas de modif après création)
 */
export const usernameSchema = z
  .string()
  .min(3, 'Minimum 3 caractères')
  .max(20, 'Maximum 20 caractères')
  .regex(/^[a-z0-9_-]+$/, 'Lettres minuscules, chiffres, tirets et underscores uniquement')

/**
 * Validation du mot de passe
 * - min 8 caractères
 * - au moins 1 majuscule
 * - au moins 1 chiffre
 */
export const passwordSchema = z
  .string()
  .min(8, 'Minimum 8 caractères')
  .regex(/[A-Z]/, 'Au moins une majuscule')
  .regex(/[0-9]/, 'Au moins un chiffre')

/**
 * Étape 1 de l'onboarding : identifiants
 */
export const step1Schema = z.object({
  email: z.string().email('Email invalide'),
  username: usernameSchema,
  password: passwordSchema,
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmPassword'],
})

/**
 * Étape 2 de l'onboarding : identité
 */
export const step2Schema = z.object({
  firstName: z.string().min(1, 'Prénom requis').max(50, 'Maximum 50 caractères'),
  lastName: z.string().min(1, 'Nom requis').max(50, 'Maximum 50 caractères'),
})

/**
 * Étape 3 de l'onboarding : résidence
 */
export const step3Schema = z.object({
  locationId: z.string().uuid('Veuillez sélectionner une ville'),
})

/**
 * Login
 */
export const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(1, 'Mot de passe requis'),
})

// Types exportés
export type Step1Data = z.infer<typeof step1Schema>
export type Step2Data = z.infer<typeof step2Schema>
export type Step3Data = z.infer<typeof step3Schema>
export type LoginData = z.infer<typeof loginSchema>
