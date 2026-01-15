import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { ChevronLeft, Check, Ticket, User } from 'lucide-react';
import { cn } from '@/lib/utils'; // Assuming cn utility is available or I will inline logic. 
// Since I don't know if lib/utils exists (it usually does in shadcn), I will use inline conditionals or template literals.

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
        <div className="min-h-screen bg-muted/30 py-8 px-4">
            <div className="max-w-3xl mx-auto bg-card rounded-xl shadow-lg overflow-hidden border border-border">
                <div className="p-6 border-b border-border flex justify-between items-center bg-muted/10">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center text-muted-foreground hover:text-foreground transition-colors text-sm font-medium"
                    >
                        <ChevronLeft className="w-4 h-4 mr-1" /> Back
                    </button>
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        {trainData?.trainName} <span className="text-muted-foreground font-normal text-base">({trainData?.trainNumber})</span>
                    </h2>
                </div>

                <div className="p-6">
                    <div className="flex justify-center gap-6 mb-8 bg-muted/50 p-3 rounded-lg w-fit mx-auto">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <div className="w-5 h-5 rounded border border-input bg-background" />
                            Available
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <div className="w-5 h-5 rounded border border-destructive bg-destructive/10" />
                            Booked
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <div className="w-5 h-5 rounded bg-primary text-primary-foreground" />
                            Selected
                        </div>
                    </div>

                    {loading ? (
                        <div className="text-center py-12 text-muted-foreground">Loading Train Configuration...</div>
                    ) : (
                        <div className="space-y-8 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                            {COACHES.map(coach => (
                                <div key={coach} className="border border-border rounded-lg p-4 relative pt-6 bg-card/50">
                                    <span className="absolute -top-3 left-4 bg-background px-2 py-0.5 text-xs font-bold text-muted-foreground uppercase border border-border rounded shadow-sm">
                                        {coach} Class
                                    </span>
                                    <div className="flex flex-col gap-3 items-center">
                                        {coachData[coach]?.map(row => (
                                            <div key={row.rowNumber} className="flex gap-4 items-center">
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

                                                <div className="w-8 flex justify-center text-xs font-medium text-muted-foreground/50">
                                                    {row.rowNumber}
                                                </div>

                                                {/* Right Side: C, D */}
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

                <div className="p-4 border-t border-border bg-muted/10 sticky bottom-0 z-10 flex justify-between items-center">
                    <div className="font-semibold text-lg flex items-center gap-2">
                        <User className="w-5 h-5 text-muted-foreground" />
                        {selectedSeats.length > 0 ? (
                            <span>{selectedSeats.length} Seats <span className="text-muted-foreground font-normal text-sm">| {selectedCoach}</span></span>
                        ) : (
                            <span className="text-muted-foreground font-normal text-sm">No seats selected</span>
                        )}
                    </div>
                    <button
                        className={`btn btn-primary px-8 py-2.5 rounded-lg font-semibold flex items-center gap-2 transition-all ${selectedSeats.length === 0 || bookingLoading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-[1.02]'
                            }`}
                        disabled={selectedSeats.length === 0 || bookingLoading}
                        onClick={handleBook}
                    >
                        {bookingLoading ? 'Processing...' : (
                            <>
                                Book Tickets <Ticket className="w-4 h-4" />
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}

function SeatItem({ seat, label, isSelected, onToggle }) {
    if (seat.isBooked) {
        return (
            <div className="w-11 h-11 rounded-md flex items-center justify-center text-xs font-bold border border-destructive/50 bg-destructive/10 text-destructive cursor-not-allowed opacity-80" aria-label={`Seat ${label} Booked`}>
                {label}
            </div>
        );
    }

    return (
        <div
            className={`w-11 h-11 rounded-md flex items-center justify-center text-xs font-bold cursor-pointer transition-all border shadow-sm
                ${isSelected
                    ? 'bg-primary text-primary-foreground border-primary scale-105 shadow-md ring-2 ring-primary/20'
                    : 'bg-card text-foreground border-input hover:border-primary hover:text-primary hover:bg-primary/5 hover:-translate-y-0.5'
                }`}
            onClick={onToggle}
            aria-label={`Seat ${label} Available`}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    onToggle();
                }
            }}
        >
            {label}
        </div>
    );
}

export default SeatSelection;
