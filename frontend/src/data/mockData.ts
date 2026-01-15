import { Station, Train, SearchResult, Seat, Booking, AdminStats } from '@/types';

export const mockStations: Station[] = [
  { stationId: 1, stationName: 'Central Station', stationCode: 'CEN', city: 'Metro City', latitude: 28.6139, longitude: 77.2090 },
  { stationId: 2, stationName: 'North Junction', stationCode: 'NJN', city: 'North Town', latitude: 28.7041, longitude: 77.1025 },
  { stationId: 3, stationName: 'East Terminal', stationCode: 'ETM', city: 'East Village', latitude: 28.6359, longitude: 77.2810 },
  { stationId: 4, stationName: 'West Hub', stationCode: 'WHB', city: 'West End', latitude: 28.5355, longitude: 77.1820 },
  { stationId: 5, stationName: 'New Delhi', stationCode: 'NDLS', city: 'Delhi', latitude: 28.6448, longitude: 77.2167 },
  { stationId: 6, stationName: 'South Express', stationCode: 'SEX', city: 'South Bay', latitude: 28.4595, longitude: 77.0266 },
];

export const mockTrains: Train[] = [
  { trainId: 1, trainNumber: '12301', trainName: 'RailBook Express', totalSeatsPerCoach: 40 },
  { trainId: 2, trainNumber: '12302', trainName: 'SuperFast Mail', totalSeatsPerCoach: 40 },
  { trainId: 3, trainNumber: '12303', trainName: 'Night Queen', totalSeatsPerCoach: 40 },
  { trainId: 4, trainNumber: '12304', trainName: 'Morning Star', totalSeatsPerCoach: 40 },
];

export const mockSearchResults: SearchResult[] = [
  {
    train: mockTrains[0],
    departureTime: '06:00',
    arrivalTime: '10:30',
    duration: '4h 30m',
    price: 850,
    sourceStation: mockStations[0],
    destStation: mockStations[4],
    route: [],
    isDirect: true,
  },
  {
    train: mockTrains[1],
    departureTime: '08:15',
    arrivalTime: '13:45',
    duration: '5h 30m',
    price: 720,
    sourceStation: mockStations[0],
    destStation: mockStations[4],
    route: [],
    isDirect: false,
  },
  {
    train: mockTrains[2],
    departureTime: '22:30',
    arrivalTime: '05:15',
    duration: '6h 45m',
    price: 1200,
    sourceStation: mockStations[0],
    destStation: mockStations[4],
    route: [],
    isDirect: true,
  },
  {
    train: mockTrains[3],
    departureTime: '05:00',
    arrivalTime: '09:00',
    duration: '4h 00m',
    price: 950,
    sourceStation: mockStations[0],
    destStation: mockStations[4],
    route: [],
    isDirect: true,
  },
];

export const generateMockSeats = (bookedSeats: number[] = [], blockedSeats: number[] = []): Seat[] => {
  const seats: Seat[] = [];
  for (let i = 1; i <= 40; i++) {
    let status: Seat['status'] = 'available';
    if (bookedSeats.includes(i)) status = 'booked';
    else if (blockedSeats.includes(i)) status = 'blocked';
    seats.push({ seatNumber: i, status });
  }
  return seats;
};

export const mockBookings: Booking[] = [
  {
    bookingId: 1001,
    userId: 1,
    trainId: 1,
    journeyDate: '2026-01-20',
    sourceStationId: 1,
    destStationId: 5,
    bookingStatus: 'CONFIRMED',
    train: mockTrains[0],
    sourceStation: mockStations[0],
    destStation: mockStations[4],
    seats: [
      { seatId: 1, seatNumber: 15, coachType: 'S1', bookingId: 1001 },
      { seatId: 2, seatNumber: 16, coachType: 'S1', bookingId: 1001 },
    ],
    totalPrice: 1700,
    pnr: 'RB2026012001',
  },
  {
    bookingId: 1002,
    userId: 1,
    trainId: 2,
    journeyDate: '2026-01-25',
    sourceStationId: 1,
    destStationId: 5,
    bookingStatus: 'CONFIRMED',
    train: mockTrains[1],
    sourceStation: mockStations[0],
    destStation: mockStations[4],
    seats: [
      { seatId: 3, seatNumber: 22, coachType: 'S2', bookingId: 1002 },
    ],
    totalPrice: 720,
    pnr: 'RB2026012502',
  },
];

export const mockAdminStats: AdminStats = {
  totalRevenue: 2450000,
  activeTrains: 45,
  totalBookings: 12847,
  occupancyPercentage: 78.5,
};

export const mockAdminBookings: Booking[] = [
  ...mockBookings,
  {
    bookingId: 1003,
    userId: 2,
    trainId: 1,
    journeyDate: '2026-01-20',
    sourceStationId: 2,
    destStationId: 5,
    bookingStatus: 'CONFIRMED',
    train: mockTrains[0],
    sourceStation: mockStations[1],
    destStation: mockStations[4],
    seats: [
      { seatId: 4, seatNumber: 5, coachType: 'S1', bookingId: 1003 },
    ],
    totalPrice: 850,
    pnr: 'RB2026012003',
  },
  {
    bookingId: 1004,
    userId: 3,
    trainId: 3,
    journeyDate: '2026-01-22',
    sourceStationId: 1,
    destStationId: 6,
    bookingStatus: 'CANCELLED',
    train: mockTrains[2],
    sourceStation: mockStations[0],
    destStation: mockStations[5],
    seats: [],
    totalPrice: 0,
    pnr: 'RB2026012204',
  },
];
