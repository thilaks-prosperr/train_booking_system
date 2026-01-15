import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Seat } from '@/types';
import { generateMockSeats } from '@/data/mockData';
import { cn } from '@/lib/utils';

interface SeatSelectorProps {
  trainId: number;
  coach: string;
  date: string;
  selectedSeats: number[];
  onSeatToggle: (seatNumber: number) => void;
}

const SeatSelector = ({ trainId, coach, date, selectedSeats, onSeatToggle }: SeatSelectorProps) => {
  const [seats, setSeats] = useState<Seat[]>([]);

  useEffect(() => {
    // Mock booked and blocked seats for demo
    const bookedSeats = [3, 7, 12, 15, 18, 23, 27, 31, 35, 38];
    const blockedSeats = [5, 10, 20, 25];
    setSeats(generateMockSeats(bookedSeats, blockedSeats));
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

  // Create 2x2 grid layout
  const rows = [];
  for (let i = 0; i < seats.length; i += 4) {
    rows.push(seats.slice(i, i + 4));
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
