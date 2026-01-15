import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import '../styles/UserDashboard.css';

function UserDashboard() {
    const { user, logout } = useAuth();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (!user || !user.userId) {
            setLoading(false);
            return;
        }
        fetchBookings();
    }, [user]);

    const fetchBookings = async () => {
        try {
            const res = await api.get(`/bookings/user/${user.userId}`);
            setBookings(res.data);
        } catch (err) {
            console.error('Failed to fetch bookings', err);
            // Don't show critical error for 404 (just means no bookings usually)
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = async (bookingId) => {
        if (!window.confirm("Are you sure you want to cancel this booking?")) return;

        try {
            await api.delete(`/bookings/${bookingId}`);
            setMessage('Booking cancelled successfully.');
            fetchBookings(); // Refresh list
        } catch (err) {
            console.error(err);
            setMessage('Failed to cancel booking.');
        }
    };

    if (loading) return <div className="flex-center" style={{ height: '100vh' }}>Loading...</div>;

    return (
        <div className="dashboard-container">
            <div className="dashboard-content">
                <div className="dashboard-header">
                    <h2>My Dashboard</h2>
                </div>

                {message && <div className="alert alert-success" style={{ marginBottom: '1rem', padding: '1rem', background: '#d1fae5', color: '#065f46', borderRadius: '4px' }}>{message}</div>}

                <div className="bookings-card">
                    <h3>My Bookings</h3>
                    {bookings.length === 0 ? (
                        <p style={{ color: 'var(--text-secondary)', marginTop: '1rem' }}>No bookings found.</p>
                    ) : (
                        <table className="bookings-table">
                            <thead>
                                <tr>
                                    <th>Train</th>
                                    <th>Route</th>
                                    <th>Date</th>
                                    <th>Status</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {bookings.map(booking => (
                                    <tr key={booking.bookingId}>
                                        <td>
                                            <div style={{ fontWeight: 600 }}>{booking.trainName}</div>
                                            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{booking.trainNumber}</div>
                                        </td>
                                        <td>
                                            {booking.source} ➝ {booking.dest}
                                        </td>
                                        <td>{booking.date}</td>
                                        <td>
                                            <span className={`status-badge ${booking.status === 'CONFIRMED' ? 'status-confirmed' : 'status-cancelled'}`}>
                                                {booking.status}
                                            </span>
                                        </td>
                                        <td>
                                            <button
                                                onClick={() => handleCancel(booking.bookingId)}
                                                className="btn btn-secondary btn-sm"
                                                style={{ border: '1px solid var(--danger-color)', color: 'var(--danger-color)' }}
                                            >
                                                Cancel
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}

export default UserDashboard;
