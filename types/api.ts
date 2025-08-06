// Fichier : types/api.ts
// Types TypeScript stricts pour les APIs

// === TYPES BOOKING === //

export interface BookingWithRelations {
  id: string
  userId: string
  roomId: string
  startDate: Date
  endDate: Date | null
  status: string
  monthlyRent: number
  securityDeposit: number
  totalAmount: number
  contractSigned: boolean
  inventorySigned: boolean
  keysGiven: boolean
  notes: string | null
  createdAt: Date
  updatedAt: Date
  user: {
    id: string
    firstName: string
    lastName: string
    email: string
    phone: string | null
    profession: string | null
    school: string | null
  }
  room: {
    id: string
    name: string
    number: number  // Correction: number au lieu de string
    price: number
    surface: number
    status: string
  }
  payments: PaymentSummary[]
  _count: {
    payments: number
  }
}

export interface PaymentSummary {
  id: string
  amount: number
  dueDate: Date
  paidDate: Date | null
  status: string
  paymentType: string
  isLate: boolean
}

export interface BookingStats {
  totalPaid: number
  totalDue: number
  balance: number
  overduePayments: number
  completionRate: number
}

export interface BookingWithStats extends BookingWithRelations {
  stats: BookingStats
}

// === TYPES DASHBOARD === //

export interface RoomWithBookings {
  id: string
  name: string
  number: number  // Correction: number au lieu de string
  bookings: Array<{
    payments: Array<{
      amount: number
    }>
  }>
}

export interface RoomRevenue {
  id: string
  name: string
  number: number  // Correction: number au lieu de string
  revenue: number
}

export interface GroupByResult {
  role?: string
  status?: string
  type?: string
  _count: {
    role?: number
    status?: number
    type?: number
  }
}

export interface PaymentWithDetails {
  id: string
  amount: number
  dueDate: Date
  user: {
    firstName: string
    lastName: string
    email: string
  }
  booking: {
    room: {
      name: string
      number: number  // Correction: number au lieu de string
    }
  }
}

export interface UpcomingPayment {
  id: string
  amount: number
  dueDate: Date
  tenant: string
  room: string
  isOverdue: boolean
}

export interface ContactSummary {
  id: string
  firstName: string
  lastName: string
  email: string
  subject: string
  type: string
  createdAt: Date
}

export interface NewContact {
  id: string
  name: string
  email: string
  subject: string
  type: string
  createdAt: Date
}