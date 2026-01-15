export interface Station {
  stationId: number;
  stationName: string;
  stationCode: string;
  city: string;
  latitude: number;
  longitude: number;
}

export interface Train {
  trainId: number;
  trainNumber: string;
  trainName: string;
  totalSeatsPerCoach: number;
}

export interface TrainSchedule {
  scheduleId: number;
  trainId: number;
  stationId: number;
  stopSequence: number;
  arrivalTime: string;
  departureTime: string;
  distanceFromStartKm: number;
  station?: Station;
}

export interface SearchResult {
  train: Train;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  price: number;
  sourceStation: Station;
  destStation: Station;
  route: TrainSchedule[];
  isDirect: boolean;
}

export interface Seat {
  seatNumber: number;
  status: 'available' | 'booked' | 'selected' | 'blocked';
}

export interface Booking {
  bookingId: number;
  userId: number;
  trainId: number;
  journeyDate: string;
  sourceStationId: number;
  destStationId: number;
  bookingStatus: 'CONFIRMED' | 'CANCELLED' | 'PENDING';
  train?: Train;
  sourceStation?: Station;
  destStation?: Station;
  seats?: BookedSeat[];
  totalPrice?: number;
  pnr?: string;
}

export interface BookedSeat {
  seatId: number;
  seatNumber: number;
  coachType: string;
  bookingId: number;
}

export interface AdminStats {
  totalRevenue: number;
  activeTrains: number;
  totalBookings: number;
  occupancyPercentage: number;
}
