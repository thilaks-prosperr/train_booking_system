import { User, Station, Train, TrainSchedule, Booking, BookedSeat, AdminStats } from '@/types';

// Mock Users
export const mockUsers: User[] = [
  { user_id: 1, username: 'admin', email: 'admin@railbook.com', full_name: 'Admin User', role: 'admin' },
  { user_id: 2, username: 'john_doe', email: 'john@example.com', full_name: 'John Doe', role: 'user' },
  { user_id: 3, username: 'jane_smith', email: 'jane@example.com', full_name: 'Jane Smith', role: 'user' },
  { user_id: 4, username: 'bob_wilson', email: 'bob@example.com', full_name: 'Bob Wilson', role: 'user' },
  { user_id: 5, username: 'alice_brown', email: 'alice@example.com', full_name: 'Alice Brown', role: 'user' },
];

// Mock Stations
export const mockStations: Station[] = [
  { station_id: 1, station_code: 'CEN', station_name: 'Central Station', city: 'Mumbai', latitude: 18.9402, longitude: 72.8351 },
  { station_id: 2, station_code: 'NDLS', station_name: 'New Delhi', city: 'Delhi', latitude: 28.6424, longitude: 77.2207 },
  { station_id: 3, station_code: 'HWH', station_name: 'Howrah Junction', city: 'Kolkata', latitude: 22.5847, longitude: 88.3426 },
  { station_id: 4, station_code: 'MAS', station_name: 'Chennai Central', city: 'Chennai', latitude: 13.0827, longitude: 80.2707 },
  { station_id: 5, station_code: 'SBC', station_name: 'Bangalore City', city: 'Bangalore', latitude: 12.9767, longitude: 77.5713 },
  { station_id: 6, station_code: 'ADI', station_name: 'Ahmedabad Junction', city: 'Ahmedabad', latitude: 23.0225, longitude: 72.5714 },
  { station_id: 7, station_code: 'PUNE', station_name: 'Pune Junction', city: 'Pune', latitude: 18.5286, longitude: 73.8739 },
  { station_id: 8, station_code: 'JP', station_name: 'Jaipur Junction', city: 'Jaipur', latitude: 26.9197, longitude: 75.7878 },
];

// Mock Trains
export const mockTrains: Train[] = [
  { train_id: 1, train_number: '12951', train_name: 'Mumbai Rajdhani', total_seats_per_coach: 72 },
  { train_id: 2, train_number: '12301', train_name: 'Howrah Rajdhani', total_seats_per_coach: 72 },
  { train_id: 3, train_number: '12627', train_name: 'Karnataka Express', total_seats_per_coach: 72 },
  { train_id: 4, train_number: '12839', train_name: 'Chennai Mail', total_seats_per_coach: 72 },
  { train_id: 5, train_number: '12009', train_name: 'Shatabdi Express', total_seats_per_coach: 78 },
  { train_id: 6, train_number: '12431', train_name: 'Trivandrum Rajdhani', total_seats_per_coach: 72 },
];

// Mock Train Schedules
export const mockSchedules: TrainSchedule[] = [
  // Mumbai Rajdhani (12951)
  { schedule_id: 1, train_id: 1, station_id: 1, arrival_time: '00:00', departure_time: '16:35', stop_sequence: 1, distance_from_start_km: 0 },
  { schedule_id: 2, train_id: 1, station_id: 6, arrival_time: '23:05', departure_time: '23:15', stop_sequence: 2, distance_from_start_km: 492 },
  { schedule_id: 3, train_id: 1, station_id: 8, arrival_time: '04:30', departure_time: '04:35', stop_sequence: 3, distance_from_start_km: 869 },
  { schedule_id: 4, train_id: 1, station_id: 2, arrival_time: '08:35', departure_time: '08:35', stop_sequence: 4, distance_from_start_km: 1384 },
  
  // Howrah Rajdhani (12301)
  { schedule_id: 5, train_id: 2, station_id: 2, arrival_time: '00:00', departure_time: '16:55', stop_sequence: 1, distance_from_start_km: 0 },
  { schedule_id: 6, train_id: 2, station_id: 3, arrival_time: '10:05', departure_time: '10:05', stop_sequence: 2, distance_from_start_km: 1451 },
  
  // Karnataka Express (12627)
  { schedule_id: 7, train_id: 3, station_id: 2, arrival_time: '00:00', departure_time: '21:40', stop_sequence: 1, distance_from_start_km: 0 },
  { schedule_id: 8, train_id: 3, station_id: 5, arrival_time: '06:40', departure_time: '06:40', stop_sequence: 2, distance_from_start_km: 2444 },
];

// Mock Bookings
export const mockBookings: Booking[] = [
  {
    booking_id: 1001,
    user_id: 2,
    user: mockUsers[1],
    train_id: 1,
    train: mockTrains[0],
    journey_date: '2026-01-20',
    source_station_id: 1,
    source_station: mockStations[0],
    dest_station_id: 2,
    dest_station: mockStations[1],
    booking_status: 'CONFIRMED',
    created_at: '2026-01-15T10:30:00',
    total_fare: 2450,
    seats: [
      { seat_id: 1, booking_id: 1001, seat_number: 1, coach_type: 'S1', from_seq: 1, to_seq: 4 },
      { seat_id: 2, booking_id: 1001, seat_number: 2, coach_type: 'S1', from_seq: 1, to_seq: 4 },
    ],
  },
  {
    booking_id: 1002,
    user_id: 3,
    user: mockUsers[2],
    train_id: 2,
    train: mockTrains[1],
    journey_date: '2026-01-21',
    source_station_id: 2,
    source_station: mockStations[1],
    dest_station_id: 3,
    dest_station: mockStations[2],
    booking_status: 'CONFIRMED',
    created_at: '2026-01-14T14:20:00',
    total_fare: 1850,
    seats: [
      { seat_id: 3, booking_id: 1002, seat_number: 15, coach_type: 'A1', from_seq: 1, to_seq: 2 },
    ],
  },
  {
    booking_id: 1003,
    user_id: 4,
    user: mockUsers[3],
    train_id: 3,
    train: mockTrains[2],
    journey_date: '2026-01-22',
    source_station_id: 2,
    source_station: mockStations[1],
    dest_station_id: 5,
    dest_station: mockStations[4],
    booking_status: 'PENDING',
    created_at: '2026-01-15T09:15:00',
    total_fare: 1200,
    seats: [
      { seat_id: 4, booking_id: 1003, seat_number: 32, coach_type: 'S2', from_seq: 1, to_seq: 2 },
      { seat_id: 5, booking_id: 1003, seat_number: 33, coach_type: 'S2', from_seq: 1, to_seq: 2 },
      { seat_id: 6, booking_id: 1003, seat_number: 34, coach_type: 'S2', from_seq: 1, to_seq: 2 },
    ],
  },
  {
    booking_id: 1004,
    user_id: 5,
    user: mockUsers[4],
    train_id: 4,
    train: mockTrains[3],
    journey_date: '2026-01-19',
    source_station_id: 1,
    source_station: mockStations[0],
    dest_station_id: 4,
    dest_station: mockStations[3],
    booking_status: 'CANCELLED',
    created_at: '2026-01-13T16:45:00',
    total_fare: 980,
    seats: [
      { seat_id: 7, booking_id: 1004, seat_number: 45, coach_type: 'S3', from_seq: 1, to_seq: 2 },
    ],
  },
  {
    booking_id: 1005,
    user_id: 2,
    user: mockUsers[1],
    train_id: 5,
    train: mockTrains[4],
    journey_date: '2026-01-25',
    source_station_id: 2,
    source_station: mockStations[1],
    dest_station_id: 6,
    dest_station: mockStations[5],
    booking_status: 'CONFIRMED',
    created_at: '2026-01-15T11:00:00',
    total_fare: 1560,
    seats: [
      { seat_id: 8, booking_id: 1005, seat_number: 12, coach_type: 'C1', from_seq: 1, to_seq: 2 },
      { seat_id: 9, booking_id: 1005, seat_number: 13, coach_type: 'C1', from_seq: 1, to_seq: 2 },
    ],
  },
  {
    booking_id: 1006,
    user_id: 3,
    user: mockUsers[2],
    train_id: 1,
    train: mockTrains[0],
    journey_date: '2026-01-18',
    source_station_id: 1,
    source_station: mockStations[0],
    dest_station_id: 8,
    dest_station: mockStations[7],
    booking_status: 'REFUNDED',
    created_at: '2026-01-10T08:30:00',
    total_fare: 1890,
    seats: [
      { seat_id: 10, booking_id: 1006, seat_number: 55, coach_type: 'B1', from_seq: 1, to_seq: 3 },
    ],
  },
];

// Mock Admin Stats
export const mockAdminStats: AdminStats = {
  totalBookings: 156,
  totalRevenue: 245680,
  totalTrains: 6,
  totalStations: 8,
  totalUsers: 45,
  bookingsToday: 12,
  recentBookings: mockBookings.slice(0, 5),
};

// Helper function to generate seat availability
export function generateSeats(totalSeats: number, bookedSeats: number[], blockedSeats: number[] = []) {
  const seats = [];
  for (let i = 1; i <= totalSeats; i++) {
    let status: 'available' | 'booked' | 'blocked' = 'available';
    if (bookedSeats.includes(i)) status = 'booked';
    else if (blockedSeats.includes(i)) status = 'blocked';
    seats.push({ seat_number: i, status });
  }
  return seats;
}
