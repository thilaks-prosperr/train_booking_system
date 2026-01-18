/*
 * Copyright (c) 2026 Thilaks. All Rights Reserved.
 *
 * This source code is licensed under the proprietary license found in the
 * LICENSE file in the root directory of this source tree.
 */

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

// Admin API endpoints
export const adminApi = {
    getStats: () => api.get('/admin/stats'),
    getBookings: () => api.get('/admin/bookings'),
    getTrains: () => api.get('/admin/trains'),
    createStation: (data) => api.post('/admin/stations', data),
    updateStation: (id, data) => api.put(`/admin/stations/${id}`, data),
    deleteStation: (id) => api.delete(`/admin/stations/${id}`),
    createTrain: (data) => api.post('/admin/trains', data),
    updateTrain: (id, data) => api.put(`/admin/trains/${id}`, data),
    deleteTrain: (id) => api.delete(`/admin/trains/${id}`),
    addSchedule: (trainId, data) => api.post(`/admin/trains/${trainId}/schedule`, data)
};

// Booking API endpoints
export const bookingApi = {
    create: (data) => api.post('/bookings', data),
    createComposite: (data) => api.post('/bookings/composite', data),
    getMyBookings: () => Promise.resolve({ data: [] }), // Deprecated
    getUserBookings: (userId) => api.get(`/bookings/user/${userId}`),
    cancel: (id) => api.delete(`/bookings/${id}`)
};

// Export the base axios instance as default
export default api;
