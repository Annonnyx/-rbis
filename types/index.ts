// ============================================
// types/index.ts
// Types TypeScript globaux pour Ørbis
// Basés sur les modèles Prisma + extensions UI
// ============================================

import type { 
  User, 
  BankAccount, 
  Transaction, 
  Company, 
  MapLocation, 
  Suggestion, 
  SuggestionVote,
  CompanyShare,
  ShareTransaction,
  SharePortfolio,
  MarketListing,
  PriceHistory,
  SkillCategory,
  UserSkill,
  JobPosting,
  Employment,
  SalaryPayment,
  AccountOwnerType,
  SuggestionStatus,
  MarketListingStatus,
  JobStatus,
  EmploymentStatus
} from '@prisma/client'

// ============================================
// EXPORTS PRISMA
// ============================================

export type { 
  User, 
  BankAccount, 
  Transaction, 
  Company, 
  MapLocation, 
  Suggestion, 
  SuggestionVote,
  CompanyShare,
  ShareTransaction,
  SharePortfolio,
  MarketListing,
  PriceHistory,
  SkillCategory,
  UserSkill,
  JobPosting,
  Employment,
  SalaryPayment
}
export { AccountOwnerType, SuggestionStatus, MarketListingStatus, JobStatus, EmploymentStatus }

// ============================================
// TYPES ÉTENDUS POUR L'UI
// ============================================

/**
 * Compte bancaire avec ses transactions
 */
export type BankAccountWithTransactions = BankAccount & {
  sentTransactions: Transaction[]
  receivedTransactions: Transaction[]
}

/**
 * Entreprise avec son compte capital
 */
export type CompanyWithAccount = Company & {
  capitalAccount: BankAccount
}

/**
 * Utilisateur complet avec toutes ses relations
 */
export type UserWithProfile = User & {
  gameProfile: {
    homeLocation: MapLocation
  } | null
}

/**
 * Suggestion avec son auteur et les votes
 */
export type SuggestionWithAuthor = Suggestion & {
  author: Pick<User, 'id' | 'username' | 'displayName'>
  votes: SuggestionVote[]
  _count?: {
    votes: number
  }
}

// ============================================
// TYPES UI / FORMULAIRES
// ============================================

/**
 * Données pour la création d'une entreprise
 */
export interface CompanyFormData {
  name: string
  objective: string
  description: string
  locationId: string
}

/**
 * Données pour la création d'une suggestion
 */
export interface SuggestionFormData {
  title: string
  description: string
}

/**
 * Données pour un transfert bancaire
 */
export interface TransferFormData {
  fromAccountId: string
  toAccountNumber: string
  amount: number // en Orbe (décimal)
  label?: string
}

/**
 * Données pour créer une offre d'emploi
 */
export interface JobFormData {
  title: string
  description: string
  skillCategoryId: string
  minSkillLevel: number
  salaryPerDay: number
  maxEmployees?: number
}

// ============================================
// TYPES AUTH
// ============================================

/**
 * Résultat d'une action serveur
 */
export interface ActionResult<T = unknown> {
  success?: boolean
  error?: string
  data?: T
}

/**
 * Étape d'onboarding pour les nouveaux utilisateurs
 */
export enum OnboardingStep {
  ACCOUNT = 1,
  PROFILE = 2,
  RESIDENCE = 3,
  COMPLETE = 0,
}

/**
 * Statut d'onboarding
 */
export interface OnboardingStatus {
  step: OnboardingStep
  complete: boolean
}
