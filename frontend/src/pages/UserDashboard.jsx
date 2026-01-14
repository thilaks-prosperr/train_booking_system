import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config';
import Navbar from '../components/Navbar';
import '../styles/UserDashboard.css';

function UserDashboard() {
    const { user, logout } = useAuth();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (user && user.userId) {
            fetchBookings();
        } else {
            setLoading(false);
        }
    }, [user]);

    const fetchBookings = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/api/bookings/user/${user.userId}`, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            setBookings(res.data);
        } catch (err) {
            console.error('Failed to fetch bookings', err);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = async (bookingId) => {
        if (!window.confirm("Are you sure you want to cancel this booking?")) return;

        try {
            await axios.delete(`${API_BASE_URL}/api/bookings/${bookingId}`, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
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
            <Navbar />

            <div className="dashboard-content">
                <div className="dashboard-header">
                    <h2>My Dashboard</h2>
                    <button onClick={logout} className="btn btn-danger btn-sm">
                        Logout
                    </button>
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
