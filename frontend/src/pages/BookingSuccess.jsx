import React from 'react';
import { Link } from 'react-router-dom';

function BookingSuccess() {
    return (
        <div className="container" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
            <div className="card" style={{ maxWidth: '600px', margin: '0 auto', padding: '2rem' }}>
                <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎉</div>
                <h2 style={{ color: 'var(--success-color)', marginBottom: '1rem' }}>Booking Successful!</h2>
                <p style={{ marginBottom: '2rem', fontSize: '1.1rem', color: 'var(--text-secondary)' }}>
                    Your ticket has been booked successfully. You can view your upcoming trips in your dashboard.
                </p>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
                    <Link to="/dashboard" className="btn btn-primary">
                        View My Bookings
                    </Link>
                    <Link to="/" className="btn btn-secondary">
                        Book Another Ticket
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default BookingSuccess;
