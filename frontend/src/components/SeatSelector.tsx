/*
 * Copyright (c) 2026 Thilaks. All Rights Reserved.
 *
 * This source code is licensed under the proprietary license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { seatApi } from '@/lib/api';
import { Seat } from '@/types';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface SeatSelectorProps {
    trainId: number;
    coach: string;
    date: string;
    selectedSeats: number[];
    onSeatToggle: (seatNumber: number) => void;
}

interface SeatRow {
    rowNumber: number;
    seats: Seat[];
}

const SeatSelector = ({ trainId, coach, date, selectedSeats, onSeatToggle }: SeatSelectorProps) => {
    // Store rows instead of flat seats for better layout control
    const [rows, setRows] = useState<SeatRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchSeats = async () => {
            setLoading(true);
            setError('');
            try {
                const response = await seatApi.getLayout(trainId, date, coach);
                if (response.data) {
                    // Backend returns List<SeatRowDTO>
                    // Structure: [{ rowNumber: 1, seats: [{ id: 1, number: "1", isBooked: false }, ...] }, ...]
                    const rawRows: any[] = response.data;

                    const parsedRows: SeatRow[] = rawRows.map(row => ({
                        rowNumber: row.rowNumber,
                        seats: row.seats.map((s: any) => ({
                            seatNumber: parseInt(s.number),
                            status: s.isBooked ? 'booked' : 'available' as const,
                            // Helper to attach original ID or other props if needed
                            seatId: s.id
                        })).sort((a: Seat, b: Seat) => a.seatNumber - b.seatNumber) // Ensure order
                    })).sort((a, b) => a.rowNumber - b.rowNumber);

                    setRows(parsedRows);
                }
            } catch (err) {
                console.error("Failed to fetch seat layout", err);
                setError('Failed to load seats. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        if (trainId && coach && date) {
            fetchSeats();
        }
    }, [trainId, coach, date]);

    if (loading) {
        return (
            <div className="flex items-center justify-center p-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center p-8 text-destructive">
                {error}
                <Button variant="link" onClick={() => window.location.reload()}>Retry</Button>
            </div>
        );
    }

    const getStatus = (seat: Seat) => {
        if (selectedSeats.includes(seat.seatNumber)) return 'selected';
        return seat.status;
    };

    // Helper to determine seat type based on index in a 4-seat row
    // 0: Window, 1: Aisle, (GAP), 2: Aisle, 3: Window
    const getSeatType = (index: number, totalInRow: number) => {
        if (totalInRow !== 4) return ''; // Fallback for specific layouts
        if (index === 0 || index === 3) return 'W';
        return 'A';
    };

    return (
        <div className="p-6">
            <div className="flex flex-col items-center gap-6">
                {/* Screen Indicator */}
                <div className="w-48 h-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent rounded-full mb-2" />

                {/* Rows Container */}
                <div className="flex flex-col gap-4 w-full max-w-lg mx-auto p-6 bg-secondary/5 rounded-3xl border border-secondary/20">
                    {rows.map((row) => (
                        <div key={row.rowNumber} className="flex items-center justify-center gap-4 sm:gap-6">

                            {/* Left Side (Seats 1, 2) */}
                            <div className="flex gap-3">
                                {row.seats.slice(0, 2).map((seat, idx) => (
                                    <SeatButton
                                        key={seat.seatNumber}
                                        seat={seat}
                                        type={getSeatType(idx, 4)}
                                        status={getStatus(seat)}
                                        onToggle={onSeatToggle}
                                    />
                                ))}
                            </div>

                            {/* Row Number (Middle) */}
                            <div className="w-8 flex items-center justify-center font-mono text-muted-foreground/50 text-sm font-bold select-none">
                                {row.rowNumber}
                            </div>

                            {/* Right Side (Seats 3, 4) */}
                            <div className="flex gap-3">
                                {row.seats.slice(2, 4).map((seat, idx) => (
                                    <SeatButton
                                        key={seat.seatNumber}
                                        seat={seat}
                                        type={getSeatType(idx + 2, 4)}
                                        status={getStatus(seat)}
                                        onToggle={onSeatToggle}
                                    />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Legend */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-8 text-sm font-medium pt-6 border-t border-border/40">
                <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-md bg-background border border-primary/20" />
                    <span className="text-muted-foreground">Available</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-md bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.4)]" />
                    <span>Selected</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-md bg-background border border-red-500/60 opacity-70" />
                    <span className="text-muted-foreground">Booked</span>
                </div>
                <div className="flex items-center gap-2 ml-4 text-xs text-muted-foreground">
                    <span>(W) Window</span>
                    <span>(A) Aisle</span>
                </div>
            </div>
        </div>
    );
};

// Sub-component for individual seat to keep main clear
const SeatButton = ({ seat, type, status, onToggle }: { seat: Seat, type: string, status: string, onToggle: (n: number) => void }) => {
    const isBooked = status === 'booked' || status === 'blocked';
    const isSelected = status === 'selected';

    return (
        <div className="relative flex flex-col items-center gap-1">
            <span className="text-[10px] text-muted-foreground/40 font-bold uppercase tracking-tighter">{type}</span>
            <motion.button
                whileHover={!isBooked ? { scale: 1.1 } : {}}
                whileTap={!isBooked ? { scale: 0.95 } : {}}
                onClick={() => !isBooked && onToggle(seat.seatNumber)}
                disabled={isBooked}
                className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold transition-all duration-300 relative border",
                    // Available
                    status === 'available' && "bg-background border-primary/20 text-foreground hover:border-primary hover:shadow-[0_0_10px_rgba(var(--primary),0.3)]",
                    // Booked
                    isBooked && "bg-background border-red-500/60 text-muted-foreground/40 cursor-not-allowed opacity-70",
                    // Selected
                    isSelected && "bg-green-500 border-green-600 text-white shadow-[0_0_15px_rgba(34,197,94,0.4)] scale-105 z-10 border-none"
                )}
                title={`Seat ${seat.seatNumber} (${type}) - ${status}`}
            >
                {seat.seatNumber}
            </motion.button>
        </div>
    );
};

export default SeatSelector;
