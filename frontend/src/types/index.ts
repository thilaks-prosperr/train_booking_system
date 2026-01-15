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
  trainId: number;
  trainName: string;
  trainNumber: string;
  sourceTime: string;
  destTime: string;
  duration: string;
  price: number;
  direct: boolean;

  // Station Details
  sourceStationId: number;
  destStationId: number;
  sourceStationName: string;
  sourceStationCode: string;
  destStationName: string;
  destStationCode: string;

  // Extra info
  segments?: Segment[];
  path?: any[];     // Simplified for now
  route?: any[];    // To keep compatibility if needed, but backend calls it 'path' or 'segments'
}

export interface Segment {
  trainName: string;
  trainNumber: string;
  sourceStation: string;
  destStation: string;
  departureTime: string;
  arrivalTime: string;
  waitTimeAtDest: string;
  trainId: number;
  sourceStationId: number;
  destStationId: number;
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
  totalFare?: number;
  pnr?: string;
  userName?: string;
  userEmail?: string;
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
