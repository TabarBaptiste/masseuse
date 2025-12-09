export enum UserRole {
  USER = 'USER',
  PRO = 'PRO',
  ADMIN = 'ADMIN',
}

export enum BookingStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  NO_SHOW = 'NO_SHOW',
}

export enum DayOfWeek {
  MONDAY = 'MONDAY',
  TUESDAY = 'TUESDAY',
  WEDNESDAY = 'WEDNESDAY',
  THURSDAY = 'THURSDAY',
  FRIDAY = 'FRIDAY',
  SATURDAY = 'SATURDAY',
  SUNDAY = 'SUNDAY',
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: UserRole;
  isActive: boolean;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  duration: number;
  price: number;
  isActive: boolean;
  displayOrder: number;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WeeklyAvailability {
  id: string;
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BlockedSlot {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  reason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Booking {
  id: string;
  userId: string;
  serviceId: string;
  date: string;
  startTime: string;
  endTime: string;
  status: BookingStatus;
  notes?: string;
  proNotes?: string;
  priceAtBooking: number;
  cancelledAt?: string;
  cancelReason?: string;
  reminderSentAt?: string;
  createdAt: string;
  updatedAt: string;
  service?: Service;
  user?: User;
}

export interface Review {
  id: string;
  userId: string;
  bookingId: string;
  rating: number;
  comment?: string;
  isApproved: boolean;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  user?: User;
  booking?: Booking;
}

export interface SiteSettings {
  id: string;
  salonName: string;
  salonDescription: string;
  salonAddress?: string;
  salonPhone?: string;
  salonEmail?: string;
  logoUrl?: string;
  heroImageUrl?: string;
  defaultOpenTime: string;
  defaultCloseTime: string;
  bookingAdvanceMinDays: number;
  bookingAdvanceMaxDays: number;
  cancellationDeadlineHours: number;
  emailNotificationsEnabled: boolean;
  reminderDaysBefore: number;
  facebookUrl?: string;
  instagramUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: User;
  access_token: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

export interface Conflict {
  id: string;
  type: 'OVERLAPPING_BOOKINGS' | 'BOOKING_BLOCKED_SLOT' | 'BOOKING_NO_AVAILABILITY' | 'DOUBLE_BOOKING';
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  date: string;
  startTime: string;
  endTime: string;
  description: string;
  affectedBookings?: Booking[];
  blockedSlot?: BlockedSlot;
  details?: Record<string, unknown>;
}
