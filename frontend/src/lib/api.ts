import axios from 'axios';

// Create axios instance with base URL
// The vite proxy will handle requests to /api -> http://localhost:8080/api
const api = axios.create({
    baseURL: '/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor to attach the auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('authToken');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Auth API endpoints
export const authApi = {
    login: (username, password) => api.post('/auth/login', { username, password }),
    register: (data) => api.post('/auth/register', data),
    logout: () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
    }
};

// Station API endpoints
export const stationApi = {
    getAll: () => api.get('/stations'),
    search: (query) => api.get(`/stations/search?query=${query}`)
};

// Train API endpoints
export const trainApi = {
    search: (from, to, date) => api.get('/search', { params: { from, to, date } }),
    getDetails: (id) => api.get(`/trains/${id}`)
};

// Seat API endpoints
export const seatApi = {
    getLayout: (trainId, date, coach) => api.get('/seats', { params: { trainId, date, coach } })
};

// Booking API endpoints
export const bookingApi = {
    create: (data) => api.post('/bookings', data),
    getMyBookings: () => api.get('/bookings/my'),
    cancel: (id) => api.put(`/bookings/${id}/cancel`)
};

// Export the base axios instance as default
export default api;
