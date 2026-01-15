import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, Ticket } from 'lucide-react';

function BookingSuccess() {
    return (
        <div className="container max-w-lg mx-auto py-16 px-4 flex flex-col items-center justify-center min-h-[60vh]">
            <div className="bg-card text-card-foreground p-8 rounded-xl shadow-lg border border-border text-center w-full">
                <div className="mb-6 flex justify-center">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                        <CheckCircle2 className="w-10 h-10 text-green-600" />
                    </div>
                </div>

                <h2 className="text-3xl font-bold text-green-600 mb-2">Booking Successful!</h2>

                <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
                    Your ticket has been booked successfully. <br />
                    You can view your upcoming trips in your dashboard.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link to="/dashboard" className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-6 py-2">
                        <Ticket className="w-4 h-4 mr-2" />
                        View My Bookings
                    </Link>
                    <Link to="/" className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-6 py-2">
                        Book Another Ticket
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default BookingSuccess;
