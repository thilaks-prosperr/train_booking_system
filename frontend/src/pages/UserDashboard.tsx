import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { Loader2, Ticket, Calendar, MapPin, AlertCircle, Trash2 } from 'lucide-react';

function UserDashboard() {
    const { user } = useAuth();
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

    if (loading) return (
        <div className="flex justify-center items-center h-screen bg-background">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
    );

    return (
        <div className="min-h-screen bg-muted/30 py-8">
            <div className="container max-w-5xl mx-auto px-4">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-3xl font-bold gradient-text">My Dashboard</h2>
                </div>

                {message && (
                    <div className="mb-6 p-4 bg-green-50 text-green-700 border border-green-200 rounded-lg flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500" />
                        {message}
                    </div>
                )}

                <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-border">
                        <div className="flex items-center gap-2">
                            <Ticket className="w-5 h-5 text-primary" />
                            <h3 className="text-lg font-semibold">My Bookings</h3>
                        </div>
                    </div>

                    {bookings.length === 0 ? (
                        <div className="p-12 text-center text-muted-foreground flex flex-col items-center">
                            <Ticket className="w-12 h-12 mb-4 opacity-50" />
                            <p className="text-lg font-medium">No bookings found</p>
                            <p className="text-sm">Your booked tickets will appear here</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-muted/50">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-muted-foreground uppercase tracking-wider">Train</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-muted-foreground uppercase tracking-wider">Route</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-muted-foreground uppercase tracking-wider">Date</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-4 text-right text-sm font-semibold text-muted-foreground uppercase tracking-wider">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {bookings.map(booking => (
                                        <tr key={booking.bookingId} className="hover:bg-muted/30 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="font-semibold text-foreground">{booking.trainName}</span>
                                                    <span className="text-xs text-muted-foreground">#{booking.trainNumber}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2 text-sm">
                                                    <span className="font-medium">{booking.source}</span>
                                                    <span className="text-muted-foreground">→</span>
                                                    <span className="font-medium">{booking.dest}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2 text-sm text-foreground">
                                                    <Calendar className="w-4 h-4 text-muted-foreground" />
                                                    {booking.date}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${booking.status === 'CONFIRMED'
                                                        ? 'bg-green-50 text-green-700 border-green-200'
                                                        : 'bg-red-50 text-red-700 border-red-200'
                                                    }`}>
                                                    {booking.status === 'CONFIRMED' && <div className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5" />}
                                                    {booking.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => handleCancel(booking.bookingId)}
                                                    className="inline-flex items-center px-3 py-1.5 border border-destructive/20 text-destructive text-sm font-medium rounded-md hover:bg-destructive/10 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-destructive"
                                                    disabled={booking.status !== 'CONFIRMED'}
                                                    title="Cancel Booking"
                                                >
                                                    <Trash2 className="w-4 h-4 mr-1.5" />
                                                    Cancel
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default UserDashboard;
