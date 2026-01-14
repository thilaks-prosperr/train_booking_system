import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config';
import Navbar from '../components/Navbar';

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

    if (loading) return <div>Loading...</div>;

    return (
        <div style={{ background: 'var(--color-bg-light)', minHeight: '100vh' }}>
            {/* Reusing Navbar, but we need to ensure it's visible on light bg if it's transparent. 
                For dashboard, maybe we want a colored navbar or just use the same one.
                The current navbar is absolute. We might need a spacer. */}
            <Navbar />

            {/* Spacer for fixed/absolute navbar */}
            <div style={{ height: '80px', backgroundColor: '#333' }}></div>

            <div style={{ padding: '2rem 4rem', maxWidth: '1200px', margin: '0 auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <h2>My Dashboard</h2>
                    <button onClick={logout} style={{ padding: '0.5rem 1rem', background: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                        Logout
                    </button>
                </div>

                {message && <div style={{ padding: '1rem', background: '#d4edda', color: '#155724', marginBottom: '1rem', borderRadius: '4px' }}>{message}</div>}

                <div style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: 'var(--shadow-card)' }}>
                    <h3>My Bookings</h3>
                    {bookings.length === 0 ? (
                        <p style={{ color: 'var(--color-text-secondary)', marginTop: '1rem' }}>No bookings found.</p>
                    ) : (
                        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid #eee', textAlign: 'left' }}>
                                    <th style={{ padding: '1rem' }}>Train</th>
                                    <th style={{ padding: '1rem' }}>Route</th>
                                    <th style={{ padding: '1rem' }}>Date</th>
                                    <th style={{ padding: '1rem' }}>Status</th>
                                    <th style={{ padding: '1rem' }}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {bookings.map(booking => (
                                    <tr key={booking.bookingId} style={{ borderBottom: '1px solid #eee' }}>
                                        <td style={{ padding: '1rem' }}>
                                            <div style={{ fontWeight: 'bold' }}>{booking.trainName}</div>
                                            <div style={{ fontSize: '0.85rem', color: '#666' }}>{booking.trainNumber}</div>
                                        </td>
                                        <td style={{ padding: '1rem' }}>
                                            {booking.source} ➝ {booking.dest}
                                        </td>
                                        <td style={{ padding: '1rem' }}>{booking.date}</td>
                                        <td style={{ padding: '1rem' }}>
                                            <span style={{
                                                padding: '0.25rem 0.5rem',
                                                borderRadius: '4px',
                                                fontSize: '0.85rem',
                                                background: booking.status === 'CONFIRMED' ? '#d4edda' : '#f8d7da',
                                                color: booking.status === 'CONFIRMED' ? '#155724' : '#721c24'
                                            }}>
                                                {booking.status}
                                            </span>
                                        </td>
                                        <td style={{ padding: '1rem' }}>
                                            <button
                                                onClick={() => handleCancel(booking.bookingId)}
                                                style={{ padding: '0.4rem 0.8rem', background: 'transparent', border: '1px solid #dc3545', color: '#dc3545', borderRadius: '4px', cursor: 'pointer', fontSize: '0.9rem' }}
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
