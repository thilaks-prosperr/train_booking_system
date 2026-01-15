import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  login: (username: string, password: string) =>
    api.post('/auth/login', { username, password }),
  register: (data: {
    username: string;
    password: string;
    email: string;
    fullName: string;
  }) => api.post('/auth/register', data),
};

// Stations API
export const stationsApi = {
  getAll: () => api.get('/stations'),
  create: (data: {
    stationName: string;
    stationCode: string;
    city: string;
    latitude: number;
    longitude: number;
  }) => api.post('/stations', data),
  update: (id: number, data: any) => api.put(`/stations/${id}`, data),
  delete: (id: number) => api.delete(`/stations/${id}`),
};

// Search API
export const searchApi = {
  searchTrains: (from: string, to: string, date: string) =>
    api.get('/search', { params: { from, to, date } }),
};

// Seats API
export const seatsApi = {
  getSeats: (trainId: number, date: string, coach: string) =>
    api.get('/seats', { params: { trainId, date, coach } }),
};

// Booking API
export const bookingApi = {
  create: (data: {
    userId: number;
    trainId: number;
    journeyDate: string;
    sourceStationId: number;
    destStationId: number;
    coachType: string;
    selectedSeats: number[];
  }) => api.post('/bookings', data),
  getUserBookings: (userId: number) => api.get(`/bookings/user/${userId}`),
  getBookingDetails: (bookingId: number) => api.get(`/bookings/${bookingId}`),
  cancel: (bookingId: number) => api.put(`/bookings/${bookingId}/cancel`),
};

// Admin API
export const adminApi = {
  getStats: () => api.get('/admin/stats'),
  getAllBookings: (params?: { trainNumber?: string; date?: string; status?: string }) =>
    api.get('/admin/bookings', { params }),
  cancelBooking: (bookingId: number) => api.put(`/admin/bookings/${bookingId}/cancel`),
  blockSeats: (trainId: number, coach: string, seats: number[]) =>
    api.post('/admin/block-seats', { trainId, coach, seats }),
};

// Trains API
export const trainsApi = {
  getAll: () => api.get('/trains'),
  create: (data: {
    trainNumber: string;
    trainName: string;
    totalSeatsPerCoach: number;
    route: { stationId: number; stopSequence: number; arrivalTime: string; departureTime: string }[];
  }) => api.post('/trains', data),
  update: (id: number, data: any) => api.put(`/trains/${id}`, data),
  delete: (id: number) => api.delete(`/trains/${id}`),
};

export default api;
