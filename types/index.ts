import { User, Business, BankAccount, Suggestion, City, Stock } from "@prisma/client"

export interface UserWithAccounts extends User {
  bankAccounts: BankAccount[]
  location: UserLocationWithCity | null
  business: BusinessWithStock | null
}

export interface UserLocationWithCity {
  id: string
  lat: number
  lng: number
  address: string | null
  cityId: string | null
  city: City | null
}

export interface BusinessWithStock extends Business {
  stock: Stock | null
}

export interface SuggestionWithUser extends Suggestion {
  user: {
    id: string
    name: string | null
    identifier: string
  }
  votesList: { id: string; userId: string }[]
}

export interface StockWithBusiness extends Stock {
  business: Business
}
