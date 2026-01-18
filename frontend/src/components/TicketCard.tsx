/*
 * Copyright (c) 2026 Thilaks. All Rights Reserved.
 *
 * This source code is licensed under the proprietary license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { motion } from 'framer-motion';
import { Train, Calendar, MapPin, QrCode, Clock } from 'lucide-react';
import { Booking } from '@/types';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

import { Button } from '@/components/ui/button';

interface TicketCardProps {
  booking: Booking;
  onCancel?: (id: number) => void;
}

const TicketCard = ({ booking, onCancel }: TicketCardProps) => {
  const statusColors = {
    CONFIRMED: 'bg-success/20 text-success border-success/30',
    CANCELLED: 'bg-destructive/20 text-destructive border-destructive/30',
    PENDING: 'bg-warning/20 text-warning border-warning/30',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card overflow-hidden"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-secondary p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Train className="w-6 h-6 text-white" />
            <div>
              <p className="font-bold text-white">{booking.train?.trainName}</p>
              <p className="text-sm text-white/80">#{booking.train?.trainNumber}</p>
            </div>
          </div>
          <Badge className={cn('border', statusColors[booking.bookingStatus])}>
            {booking.bookingStatus}
          </Badge>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Journey Details */}
        <div className="flex items-center justify-between mb-6">
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-1">From</p>
            <p className="font-bold text-lg">{booking.sourceStation?.stationCode}</p>
            <p className="text-sm text-muted-foreground">{booking.sourceStation?.stationName}</p>
          </div>
          <div className="flex-1 px-4">
            <div className="h-0.5 bg-gradient-to-r from-primary to-secondary" />
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-1">To</p>
            <p className="font-bold text-lg">{booking.destStation?.stationCode}</p>
            <p className="text-sm text-muted-foreground">{booking.destStation?.stationName}</p>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">Journey Date</p>
              <p className="font-medium">{booking.journeyDate}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">Seats</p>
              <p className="font-medium">
                {booking.seats?.map(s => `${s.coachType}-${s.seatNumber}`).join(', ') || 'N/A'}
              </p>
            </div>
          </div>
        </div>

        {/* PNR & QR */}
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div>
            <p className="text-xs text-muted-foreground">PNR Number</p>
            <p className="font-display font-bold text-lg gradient-text">{booking.pnr || 'Generating...'}</p>
          </div>

          <div className="flex items-center gap-4">
            {booking.bookingStatus === 'CONFIRMED' && onCancel && (
              <Button variant="destructive" size="sm" onClick={() => onCancel(booking.bookingId)}>
                Cancel Ticket
              </Button>
            )}
            <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center">
              <QrCode className="w-12 h-12 text-background" />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default TicketCard;
