import { SuggestionStatus, AccountOwnerType } from '@prisma/client'

export interface User {
  id: string
  email: string
  username: string
  displayName?: string | null
  displayNameChanged: boolean
  firstName?: string | null
  lastName?: string | null
  avatarUrl?: string | null
  createdAt: Date
}

export interface GameProfile {
  id: string
  userId: string
  homeLocationId: string
  totalBalance: bigint
  createdAt: Date
  homeLocation?: MapLocation
}

export interface BankAccount {
  id: string
  ownerId: string
  ownerType: AccountOwnerType
  companyId?: string | null
  balance: bigint
  accountNumber: string
  createdAt: Date
  company?: Company
}

export interface Transaction {
  id: string
  fromAccountId: string
  toAccountId: string
  amount: bigint
  label?: string | null
  createdAt: Date
  fromAccount?: BankAccount
  toAccount?: BankAccount
}

export interface Company {
  id: string
  ownerId: string
  name: string
  objective: string
  description: string
  locationId: string
  capitalAccountId: string
  createdAt: Date
  location?: MapLocation
  capitalAccount?: BankAccount
}

export interface MapLocation {
  id: string
  name: string
  lat: number
  lng: number
  unlocked: boolean
  requiredUsersToUnlock: number
}

export interface Suggestion {
  id: string
  authorId: string
  title: string
  description: string
  status: SuggestionStatus
  upvotes: number
  createdAt: Date
  author?: User
  hasVoted?: boolean
}

export interface SuggestionVote {
  id: string
  userId: string
  suggestionId: string
  createdAt: Date
}

// Form data types
export interface RegisterUserData {
  email: string
  password: string
  username: string
}

export interface CompleteProfileData {
  firstName: string
  lastName: string
}

export interface CreateCompanyData {
  name: string
  objective: string
  description: string
  capital: number // in centimes
}

export interface SubmitSuggestionData {
  title: string
  description: string
}

export interface TransferFundsData {
  fromAccountId: string
  toAccountNumber: string
  amount: number // in centimes
  label?: string
}
