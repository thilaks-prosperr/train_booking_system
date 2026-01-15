import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import '../styles/SeatSelection.css';

function SeatSelection() {
    const { trainId } = useParams();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { state } = useLocation();
    const { user } = useAuth();

    const date = searchParams.get('date');
    const trainData = state?.train;

    const [coachData, setCoachData] = useState({}); // { 'A1': [rows], 'S1': [rows] }
    const [selectedSeats, setSelectedSeats] = useState([]); // Stores Integer IDs
    const [selectedCoach, setSelectedCoach] = useState(null); // Track which coach is currently being selected from
    const [loading, setLoading] = useState(true);
    const [bookingLoading, setBookingLoading] = useState(false);

    const COACHES = ['A1', 'S1', 'E1']; // Order of coaches

    useEffect(() => {
        if (!date || !trainId) return;

        const fetchAllCoaches = async () => {
            setLoading(true);
            try {
                const promises = COACHES.map(coach =>
                    api.get('/seats', {
                        params: { trainId, date, coach, startSeq: 1, endSeq: 10 }
                    }).then(res => ({ coach, data: res.data }))
                );

                const results = await Promise.all(promises);
                const newData = {};
                results.forEach(item => {
                    newData[item.coach] = item.data;
                });
                setCoachData(newData);
            } catch (err) {
                console.error("Failed to load coaches", err);
            } finally {
                setLoading(false);
            }
        };

        fetchAllCoaches();
    }, [trainId, date]);

    const getSeatLabel = (colIndex, rowIndex) => {
        // Logic: 1(W), 2(A), 3(M), 4(W) based on col index 0-3
        // Row is 1-based, Col is 0-based from the map loop
        const seatNumInRow = colIndex + 1;

        let type = '';
        if (colIndex === 0 || colIndex === 3) type = 'W'; // Window
        else if (colIndex === 1) type = 'A'; // Aisle
        else if (colIndex === 2) type = 'M'; // Middle

        // Calculate actual seat number: (row-1)*4 + col+1
        const actualNumber = (rowIndex - 1) * 4 + seatNumInRow;

        return `${actualNumber}(${type})`;
    };

    const toggleSeat = (seatId, coachType) => {
        // Enforce Single Coach Rule
        if (selectedCoach && selectedCoach !== coachType && selectedSeats.length > 0) {
            if (!window.confirm(`You can only book seats in one coach at a time. Switch to ${coachType} and clear selection?`)) {
                return;
            }
            setSelectedSeats([]); // Clear old selection
        }

        setSelectedCoach(coachType);

        if (selectedSeats.includes(seatId)) {
            const newSelection = selectedSeats.filter(id => id !== seatId);
            setSelectedSeats(newSelection);
            if (newSelection.length === 0) setSelectedCoach(null); // Reset coach if empty
        } else {
            setSelectedSeats([...selectedSeats, seatId]);
        }
    };

    const handleBook = async () => {
        if (!user) { navigate('/login'); return; }
        if (selectedSeats.length === 0) return;

        setBookingLoading(true);
        try {
            await api.post('/bookings', {
                userId: user.userId,
                trainId,
                journeyDate: date,
                sourceStationId: trainData?.sourceStationId,
                destStationId: trainData?.destStationId,
                coachType: selectedCoach, // Use tracked coach
                selectedSeats
            });
            alert("Booking Successful!");
            navigate('/booking-success');
        } catch (err) {
            alert("Booking Failed: " + (err.response?.data?.message || err.message));
        } finally {
            setBookingLoading(false);
        }
    };

    return (
        <div className="seat-selection-container">
            <div className="train-layout-container">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}>← Back</button>
                    <h2 style={{ margin: 0 }}>{trainData?.trainName} ({trainData?.trainNumber})</h2>
                </div>

                <div className="legend-container">
                    <div className="legend-item"><div className="legend-box available"></div> Available</div>
                    <div className="legend-item"><div className="legend-box booked"></div> Booked</div>
                    <div className="legend-item"><div className="legend-box selected"></div> Selected</div>
                </div>

                {loading ? <p style={{ textAlign: 'center' }}>Loading Train Configuration...</p> : (
                    <div className="train-scroll-view">
                        {COACHES.map(coach => (
                            <div key={coach} className="coach-section">
                                <span className="coach-label">{coach} Class</span>
                                <div className="seat-grid">
                                    {coachData[coach]?.map(row => (
                                        <div key={row.rowNumber} className="seat-row">
                                            {/* Left Side: A, B */}
                                            <SeatItem
                                                seat={row.seats[0]}
                                                label={getSeatLabel(0, row.rowNumber)}
                                                isSelected={selectedSeats.includes(row.seats[0].id)}
                                                onToggle={() => toggleSeat(row.seats[0].id, coach)}
                                            />
                                            <SeatItem
                                                seat={row.seats[1]}
                                                label={getSeatLabel(1, row.rowNumber)}
                                                isSelected={selectedSeats.includes(row.seats[1].id)}
                                                onToggle={() => toggleSeat(row.seats[1].id, coach)}
                                            />

                                            <div className="aisle"> {row.rowNumber} </div>

                                            {/* Right Side: C, D (Assuming 2+2 layout for simplicty base on Backend Svc) */}
                                            <SeatItem
                                                seat={row.seats[2]}
                                                label={getSeatLabel(2, row.rowNumber)}
                                                isSelected={selectedSeats.includes(row.seats[2].id)}
                                                onToggle={() => toggleSeat(row.seats[2].id, coach)}
                                            />
                                            <SeatItem
                                                seat={row.seats[3]}
                                                label={getSeatLabel(3, row.rowNumber)}
                                                isSelected={selectedSeats.includes(row.seats[3].id)}
                                                onToggle={() => toggleSeat(row.seats[3].id, coach)}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="booking-action-bar">
                <div className="price-tag">
                    {selectedSeats.length} Seats | {selectedCoach || '-'}
                </div>
                <button
                    className="btn-book"
                    disabled={selectedSeats.length === 0 || bookingLoading}
                    onClick={handleBook}
                >
                    {bookingLoading ? 'Processing...' : 'Book Tickets'}
                </button>
            </div>
        </div>
    );
}

function SeatItem({ seat, label, isSelected, onToggle }) {
    if (seat.isBooked) {
        return <div className="seat-item booked">{label}</div>;
    }
    return (
        <div
            className={`seat-item ${isSelected ? 'selected' : ''}`}
            onClick={onToggle}
        >
            {label}
        </div>
    );
}

export default SeatSelection;
