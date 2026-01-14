import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import { useAuth } from '../context/AuthContext';
import '../styles/SeatSelection.css';

function SeatSelection() {
    const { trainId } = useParams();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { state } = useLocation();
    const { user } = useAuth();

    // Data from navigation/URL
    const date = searchParams.get('date');
    const trainData = state?.train;

    const [seatRows, setSeatRows] = useState([]);
    const [selectedSeats, setSelectedSeats] = useState([]);
    const [coachType, setCoachType] = useState('S1'); // Default coach
    const [bookingLoading, setBookingLoading] = useState(false);

    useEffect(() => {
        if (!date || !trainId) return;

        // Fetch seat layout with real availability
        axios.get(`${API_BASE_URL}/api/seats`, {
            params: {
                trainId: trainId,
                date: date,
                coach: coachType,
                // If we don't have start/end seq, backend might default to full route or error.
                // Assuming backend handles missing seq gracefully or we'd need to fetch stations.
                startSeq: 1,
                endSeq: 10
            },
            headers: user ? { Authorization: `Bearer ${user.token}` } : {}
        })
            .then(res => setSeatRows(res.data))
            .catch(err => console.error("Failed to load seats", err));
    }, [coachType, trainId, date]);

    const toggleSeat = (seatNumber) => {
        if (selectedSeats.includes(seatNumber)) {
            setSelectedSeats(selectedSeats.filter(s => s !== seatNumber));
        } else {
            setSelectedSeats([...selectedSeats, seatNumber]);
        }
    };

    const handleBook = async () => {
        if (!user) {
            alert("Please login to book tickets");
            navigate('/login');
            return;
        }

        if (!trainData) {
            alert("Booking context missing (train details). Please search again.");
            navigate('/');
            return;
        }

        setBookingLoading(true);
        try {
            await axios.post(`${API_BASE_URL}/api/bookings`, {
                userId: user.userId,
                trainId: trainId,
                journeyDate: date,
                sourceStationId: trainData.sourceStationId || 1, // Fallback if missing, but should be there
                destStationId: trainData.destStationId || 3,     // Fallback
                coachType: coachType,
                selectedSeats: selectedSeats
            }, {
                headers: { Authorization: `Bearer ${user.token}` }
            });

            alert(`Booking Successful for ${selectedSeats.join(', ')}!`);
            navigate('/dashboard');
        } catch (err) {
            console.error(err);
            alert("Booking Failed: " + (err.response?.data?.message || err.message));
        } finally {
            setBookingLoading(false);
        }
    };

    return (
        <div className="container" style={{ padding: '2rem 0' }}>
            <div className="card seat-selection-card">
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2rem' }}>
                    <button onClick={() => navigate(-1)} className="btn btn-secondary btn-sm" style={{ marginRight: '1rem' }}>
                        ← Back
                    </button>
                    <h2>Select Seats for Train {trainData?.trainName || trainId}</h2>
                </div>

                <div className="seat-tabs">
                    {['A1', 'S1', 'E1'].map(type => (
                        <button
                            key={type}
                            className={`tab-btn ${coachType === type ? 'active' : ''}`}
                            onClick={() => setCoachType(type)}
                        >
                            {type}
                        </button>
                    ))}
                </div>

                <div className="coach-layout">
                    {seatRows.map(row => (
                        <div key={row.rowNumber} className="seat-row">
                            {/* Seat A */}
                            <Seat
                                seat={row.seats[0]}
                                isSelected={selectedSeats.includes(row.seats[0].number)}
                                onToggle={() => toggleSeat(row.seats[0].number)}
                            />
                            {/* Walkway */}
                            <div className="walkway"></div>
                            {/* Seats B, C, D */}
                            <Seat
                                seat={row.seats[1]}
                                isSelected={selectedSeats.includes(row.seats[1].number)}
                                onToggle={() => toggleSeat(row.seats[1].number)}
                            />
                            <Seat
                                seat={row.seats[2]}
                                isSelected={selectedSeats.includes(row.seats[2].number)}
                                onToggle={() => toggleSeat(row.seats[2].number)}
                            />
                            <Seat
                                seat={row.seats[3]}
                                isSelected={selectedSeats.includes(row.seats[3].number)}
                                onToggle={() => toggleSeat(row.seats[3].number)}
                            />
                        </div>
                    ))}
                </div>

                <div className="booking-footer">
                    <div className="selected-info">
                        Selected: {selectedSeats.length > 0 ? selectedSeats.join(', ') : 'None'}
                    </div>
                    <button
                        className="btn btn-primary"
                        disabled={selectedSeats.length === 0 || bookingLoading}
                        onClick={handleBook}
                    >
                        {bookingLoading ? 'Booking...' : 'Confirm Booking'}
                    </button>
                </div>
            </div>
        </div>
    );
}

function Seat({ seat, isSelected, onToggle }) {
    if (seat.isBooked) {
        return (
            <div className="seat booked" title="Booked">
                {seat.number}
            </div>
        );
    }
    return (
        <div
            className={`seat ${isSelected ? 'selected' : ''}`}
            onClick={onToggle}
            title="Available"
        >
            {seat.number}
        </div>
    );
}

export default SeatSelection;
