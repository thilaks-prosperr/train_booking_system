import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Seat } from '@/types';
// import { generateMockSeats } from '@/data/mockData';
import { cn } from '@/lib/utils';
import { seatApi } from '@/lib/api';

interface SeatSelectorProps {
  trainId: number;
  coach: string;
  date: string;
  selectedSeats: number[];
  onSeatToggle: (seatNumber: number) => void;
}

const SeatSelector = ({ trainId, coach, date, selectedSeats, onSeatToggle }: SeatSelectorProps) => {
  const [seats, setSeats] = useState<Seat[]>([]);



  // ...

  useEffect(() => {
    const fetchLayout = async () => {
      try {
        const response = await seatApi.getLayout(trainId, date, coach);
        const rows = response.data;
        // Flatten rows to seat list
        const allSeats: Seat[] = [];
        rows.forEach((row: any) => {
          row.seats.forEach((s: any) => {
            allSeats.push({
              seatNumber: parseInt(s.number),
              status: s.isBooked ? 'booked' : 'available'
            });
          });
        });
        setSeats(allSeats);
      } catch (err) {
        console.error("Failed to fetch seat layout", err);
      }
    };
    fetchLayout();
  }, [trainId, coach, date]);

  const getSeatClass = (seat: Seat) => {
    if (selectedSeats.includes(seat.seatNumber)) return 'seat-selected';
    switch (seat.status) {
      case 'booked':
        return 'seat-booked';
      case 'blocked':
        return 'seat-blocked';
      default:
        return 'seat-available';
    }
  };

  const handleSeatClick = (seat: Seat) => {
    if (seat.status === 'booked' || seat.status === 'blocked') return;
    onSeatToggle(seat.seatNumber);
  };

  // Ensure 2x2 grid layout is respected - backend sends rows, we can prefer that or force grid
  // Original logic was using rows. Let's reconstruct or use what we have in 'seats'
  // If we flattened 'seats' above, we can re-chunk them for display if needed
  // For now, let's keep the chunking logic consistent with 'seats' array

  const rows = [];
  // Sort by seat number to be safe
  const sortedSeats = [...seats].sort((a, b) => a.seatNumber - b.seatNumber);

  for (let i = 0; i < sortedSeats.length; i += 4) {
    rows.push(sortedSeats.slice(i, i + 4));
  }

  return (
    <div className="space-y-4">
      {/* Legend */}
      <div className="flex flex-wrap gap-4 justify-center mb-6">
        <div className="flex items-center gap-2">
          <div className="seat seat-available w-6 h-6" />
          <span className="text-sm">Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="seat seat-selected w-6 h-6" />
          <span className="text-sm">Selected</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="seat seat-booked w-6 h-6" />
          <span className="text-sm">Booked</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="seat seat-blocked w-6 h-6" />
          <span className="text-sm">Blocked</span>
        </div>
      </div>

      {/* Seat Grid */}
      <div className="glass-card p-6">
        <div className="flex flex-col items-center gap-3">
          {rows.map((row, rowIndex) => (
            <motion.div
              key={rowIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: rowIndex * 0.05 }}
              className="flex items-center gap-2"
            >
              {/* Left seats */}
              <div className="flex gap-2">
                {row.slice(0, 2).map((seat) => (
                  <motion.button
                    key={seat.seatNumber}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleSeatClick(seat)}
                    className={cn('seat', getSeatClass(seat))}
                    disabled={seat.status === 'booked' || seat.status === 'blocked'}
                  >
                    {seat.seatNumber}
                  </motion.button>
                ))}
              </div>

              {/* Aisle */}
              <div className="w-8 text-center text-xs text-muted-foreground">
                {rowIndex + 1}
              </div>

              {/* Right seats */}
              <div className="flex gap-2">
                {row.slice(2, 4).map((seat) => (
                  <motion.button
                    key={seat.seatNumber}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleSeatClick(seat)}
                    className={cn('seat', getSeatClass(seat))}
                    disabled={seat.status === 'booked' || seat.status === 'blocked'}
                  >
                    {seat.seatNumber}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SeatSelector;
