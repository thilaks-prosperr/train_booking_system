import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../config';

function SeatSelection() {
    const { trainId } = useParams();
    const navigate = useNavigate();
    const [seatRows, setSeatRows] = useState([]);
    const [selectedSeats, setSelectedSeats] = useState([]);
    const [coachType, setCoachType] = useState('S1'); // Default coach
    // Hardcode date/seq for demo or pass via state location
    // Ideally these should come from the booking flow (search params)
    const date = "2024-12-01"; // TODO: Pass from search
    // For availability check, we need start/end sequence. 
    // Simplified: passing specific sequences or relying on backend defaults (1-10)
    // In a real app, these are passed from the previous screen.

    useEffect(() => {
        // Fetch seat layout with real availability
        // Assuming user is travelling full route (seq 1 to 10) for demo availability check
        axios.get(`${API_BASE_URL}/api/seats`, {
            params: {
                trainId: 1, // Using ID 1 for demo as trainId param might be trainNumber string
                date: date,
                coach: coachType,
                startSeq: 1,
                endSeq: 10
            }
        })
            .then(res => setSeatRows(res.data))
            .catch(err => console.error("Failed to load seats", err));
    }, [coachType, trainId]);

    const toggleSeat = (seatNumber) => {
        if (selectedSeats.includes(seatNumber)) {
            setSelectedSeats(selectedSeats.filter(s => s !== seatNumber));
        } else {
            setSelectedSeats([...selectedSeats, seatNumber]);
        }
    };

    const handleBook = () => {
        alert(`Booked Seats: ${selectedSeats.join(', ')} for Train ${trainId}`);
        // Here we would call POST /api/bookings
        navigate('/');
    };

    return (
        <div className="container">
            <button onClick={() => navigate(-1)} className="btn btn-secondary" style={{ marginBottom: '1rem' }}>
                ← Back
            </button>
            <h2>Select Seats for Train {trainId}</h2>

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
                    disabled={selectedSeats.length === 0}
                    onClick={handleBook}
                >
                    Confirm Booking
                </button>
            </div>

            <style>{`
                .seat-tabs { display: flex; gap: 1rem; margin-bottom: 2rem; border-bottom: 2px solid #ddd; }
                .tab-btn { background: none; border: none; padding: 1rem; font-weight: bold; cursor: pointer; border-bottom: 3px solid transparent; }
                .tab-btn.active { border-bottom-color: var(--primary-color); color: var(--primary-color); }
                
                .coach-layout { display: flex; flex-direction: column; gap: 1rem; max-width: 400px; margin: 0 auto; background: #fff; padding: 2rem; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
                .seat-row { display: flex; gap: 10px; justify-content: center; align-items: center; }
                .walkway { width: 30px; }
                
                .seat { width: 40px; height: 40px; border-radius: 4px; display: flex; align-items: center; justify-content: center; font-size: 0.8rem; cursor: pointer; border: 1px solid #ccc; background: white; }
                .seat.booked { background-color: #e9ecef; color: #adb5bd; cursor: not-allowed; border-color: transparent; }
                .seat.selected { background-color: #28a745; color: white; border-color: #28a745; }
                .seat:hover:not(.booked):not(.selected) { border-color: var(--primary-color); }

                .booking-footer { margin-top: 2rem; display: flex; justify-content: space-between; align-items: center; background: white; padding: 1rem; border-radius: 8px; box-shadow: 0 -2px 10px rgba(0,0,0,0.05); position: sticky; bottom: 0; }
                .selected-info { font-weight: bold; }
            `}</style>
        </div>
    );
}

function Seat({ seat, isSelected, onToggle }) {
    if (seat.isBooked) {
        return (
            <div
                className="seat booked"
                title="Booked"
            >
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
