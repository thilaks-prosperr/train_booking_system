// User & Auth Types
export interface User {
  user_id: number;
  username: string;
  email: string;
  full_name: string;
  role: 'admin' | 'user';
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

// Station Types
export interface Station {
  station_id: number;
  station_code: string;
  station_name: string;
  city: string;
  latitude?: number;
  longitude?: number;
}

export interface StationFormData {
  station_code: string;
  station_name: string;
  city: string;
  latitude?: number;
  longitude?: number;
}

// Train Types
export interface Train {
  train_id: number;
  train_number: string;
  train_name: string;
  total_seats_per_coach: number;
}

export interface TrainFormData {
  train_number: string;
  train_name: string;
  total_seats_per_coach: number;
}

// Schedule Types
export interface TrainSchedule {
  schedule_id: number;
  train_id: number;
  station_id: number;
  station?: Station;
  arrival_time: string;
  departure_time: string;
  stop_sequence: number;
  distance_from_start_km: number;
}

export interface ScheduleFormData {
  station_id: number;
  arrival_time: string;
  departure_time: string;
  stop_sequence: number;
  distance_from_start_km: number;
}

// Booking Types
export type BookingStatus = 'CONFIRMED' | 'CANCELLED' | 'REFUNDED' | 'PENDING';

export interface Booking {
  booking_id: number;
  user_id: number;
  user?: User;
  train_id: number;
  train?: Train;
  journey_date: string;
  source_station_id: number;
  source_station?: Station;
  dest_station_id: number;
  dest_station?: Station;
  booking_status: BookingStatus;
  created_at?: string;
  total_fare?: number;
  seats?: BookedSeat[];
}

export interface BookedSeat {
  seat_id: number;
  booking_id: number;
  seat_number: number;
  coach_type: string;
  from_seq: number;
  to_seq: number;
}

// Seat Types
export interface Seat {
  seat_number: number;
  coach_type: string;
  status: 'available' | 'booked' | 'blocked';
  booking_id?: number;
}

// Stats Types
export interface AdminStats {
  totalBookings: number;
  totalRevenue: number;
  totalTrains: number;
  totalStations: number;
  totalUsers: number;
  bookingsToday: number;
  recentBookings: Booking[];
}

// Filter Types
export interface BookingFilters {
  trainNumber?: string;
  bookingId?: string;
  passengerName?: string;
  status?: BookingStatus | '';
  dateFrom?: string;
  dateTo?: string;
  sourceStation?: number;
  destStation?: number;
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
