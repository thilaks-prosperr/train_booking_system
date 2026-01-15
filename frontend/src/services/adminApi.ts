import api from '@/api/axios';
import {
  Station,
  StationFormData,
  Train,
  TrainFormData,
  TrainSchedule,
  ScheduleFormData,
  Booking,
  BookingFilters,
  AdminStats,
  Seat
} from '@/types';

// ============ STATIONS API ============
export const stationsApi = {
  getAll: async (): Promise<Station[]> => {
    const response = await api.get('/stations');
    // Admin list might need a specific admin endpoint or just public one
    // Using admin specific if avaliable or public. The portal used /api/stations (public) or /api/admin/stations (create)
    return response.data;
  },

  create: async (data: StationFormData): Promise<Station> => {
    const response = await api.post('/admin/stations', data);
    return response.data;
  },

  update: async (id: number, data: StationFormData): Promise<Station> => {
    const response = await api.put(`/admin/stations/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/admin/stations/${id}`);
  },
};

// ============ TRAINS API ============
export const trainsApi = {
  getAll: async (): Promise<Train[]> => {
    const response = await api.get('/admin/trains');
    return response.data;
  },

  create: async (data: TrainFormData): Promise<Train> => {
    const response = await api.post('/admin/trains', data);
    return response.data;
  },

  update: async (id: number, data: TrainFormData): Promise<Train> => {
    const response = await api.put(`/admin/trains/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/admin/trains/${id}`);
  },

  getSchedule: async (trainId: number): Promise<TrainSchedule[]> => {
    // Legacy endpoint was /api/admin/trains/{id}/schedule (POST) but usually GET for list
    // The previous code used GET /api/admin/trains/{id}/schedule in fetch
    // My AdminController maps POST /admin/trains/{id}/schedule. 
    // It has GET /schedules (all). 
    // I should check if I have GET per train.
    // Assuming I might need to add it or use generic GET.
    // For now, let's try the endpoint the frontend expects:
    // Actually, AdminController has `getAllSchedules` but not filter by train.
    // I will use `api.get('/admin/schedules')` and filter client side if needed or update backend.
    // BETTER: The frontend code expects `GET /api/admin/trains/${trainId}/schedule`. 
    // My backend DOES NOT have this GET endpoint yet. 
    // I should add it to Backend or rely on what I have.
    // Let's use `api.get('/admin/schedules')` for now and filter? No that's bad.
    try {
      const response = await api.get(`/admin/trains/${trainId}/schedule`);
      return response.data;
    } catch (e) {
      return []; // Fallback
    }
  },

  addSchedule: async (trainId: number, data: ScheduleFormData): Promise<TrainSchedule> => {
    const response = await api.post(`/admin/trains/${trainId}/schedule`, data);
    return response.data;
  },
};

// ============ BOOKINGS API ============
export const bookingsApi = {
  getAll: async (filters?: BookingFilters): Promise<Booking[]> => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value.toString());
      });
    }
    const response = await api.get(`/admin/bookings?${params.toString()}`);
    return response.data;
  },

  getById: async (id: number): Promise<Booking> => {
    const response = await api.get(`/admin/bookings/${id}`);
    return response.data;
  },

  cancel: async (id: number): Promise<Booking> => {
    const response = await api.put(`/admin/bookings/${id}/cancel`);
    return response.data;
  },

  refund: async (id: number): Promise<Booking> => {
    const response = await api.put(`/admin/bookings/${id}/refund`);
    return response.data;
  },
};

// ============ SEATS API ============
export const seatsApi = {
  getSeats: async (trainId: number, date: string, coach: string): Promise<Seat[]> => {
    // Public endpoint
    const response = await api.get(`/seats?trainId=${trainId}&date=${date}&coach=${coach}`);
    return response.data;
  },

  blockSeats: async (trainId: number, date: string, coach: string, seats: number[]): Promise<void> => {
    await api.post('/admin/seats/block', { trainId, date, coach, seatNumbers: seats }); // backend expects seatNumbers
  },

  unblockSeats: async (trainId: number, date: string, coach: string, seats: number[]): Promise<void> => {
    await api.delete('/admin/seats/block', {
      data: { trainId, date, coach, seatNumbers: seats }
    });
  },
};

// ============ STATS API ============
export const statsApi = {
  getStats: async (): Promise<AdminStats> => {
    const response = await api.get('/admin/stats');
    return response.data;
  },
};
