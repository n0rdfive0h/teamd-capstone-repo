export type CustomerStatus = 'PROSPECT' | 'ACTIVE' | 'CLOSED'

export interface Customer {
  customerId: string
  fullName: string
  email: string
  status: CustomerStatus
}

export interface CustomerDraft {
  fullName: string
  email: string
}