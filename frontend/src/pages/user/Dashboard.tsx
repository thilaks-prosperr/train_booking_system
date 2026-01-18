/*
 * Copyright (c) 2026 Thilak S. All Rights Reserved.
 *
 * This source code, inclusive of the logic, design, and intellectual property,
 * is the sole property of Thilak S.
 *
 * Created by Thilak S.
 *
 * This source code is licensed under the proprietary license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, Clock, Search } from 'lucide-react';
import Navbar from '@/components/Navbar';
import TicketCard from '@/components/TicketCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useState, useEffect } from 'react';
import { bookingApi } from '@/lib/api';
import { Booking } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';

const UserDashboard = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  const { user } = useAuth();

  const { toast } = useToast();

  const fetchBookings = () => {
    if (user?.userId) {
      bookingApi.getUserBookings(user.userId)
        .then(res => setBookings(res.data))
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [user]);

  const handleCancel = async (bookingId: number) => {
    try {
      await bookingApi.cancel(bookingId);
      toast({
        title: "Booking Cancelled",
        description: "Your ticket has been cancelled successfully.",
      });
      fetchBookings(); // Refresh list
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to cancel booking",
        variant: "destructive"
      });
    }
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcomingBookings = bookings.filter(b => {
    const journeyDate = new Date(b.journeyDate); // Assuming YYYY-MM-DD
    // If journeyDate is UTC 00:00, and we are +5:30, it works fine as long as we compare days.
    // Simplest approach: Compare string YYYY-MM-DD if available, or use strict timestamps.
    // Let's use simple string comparison for "today or future" vs "past".
    // Alternatively, treat journeyDate as midnight local time.
    const jDate = new Date(b.journeyDate);
    jDate.setHours(0, 0, 0, 0);
    // If journeyDate is strictly YYYY-MM-DD string, `new Date(string)` is UTC.
    // We want to know if the journey DATE is >= TODAY's DATE.
    // Let's adjust for timezone offset if needed, or just compare ISO strings.
    return b.bookingStatus === 'CONFIRMED' && jDate >= today;
  });

  const pastBookings = bookings.filter(b => {
    const jDate = new Date(b.journeyDate);
    jDate.setHours(0, 0, 0, 0);
    return b.bookingStatus === 'CANCELLED' || jDate < today;
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="pt-20 px-4">
        <div className="container mx-auto py-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="font-display text-3xl font-bold mb-2">My Bookings</h1>
            <p className="text-muted-foreground">View and manage your train bookings</p>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card p-6 mb-8"
          >
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="font-semibold">Plan your next trip</p>
                  <p className="text-sm text-muted-foreground">Search and book trains instantly</p>
                </div>
              </div>
              <Button variant="hero" onClick={() => navigate('/')}>
                <Search className="w-4 h-4 mr-2" />
                Book New Ticket
              </Button>
            </div>
          </motion.div>

          {/* Bookings Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Tabs defaultValue="upcoming" className="space-y-6">
              <TabsList className="bg-muted/50">
                <TabsTrigger value="upcoming" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  <Clock className="w-4 h-4 mr-2" />
                  Upcoming ({upcomingBookings.length})
                </TabsTrigger>
                <TabsTrigger value="past" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  <Calendar className="w-4 h-4 mr-2" />
                  Past ({pastBookings.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="upcoming" className="space-y-4">
                {upcomingBookings.length > 0 ? (
                  upcomingBookings.map(booking => (
                    <TicketCard key={booking.bookingId} booking={booking} onCancel={handleCancel} />
                  ))
                ) : (
                  <div className="glass-card p-12 text-center">
                    <Calendar className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <p className="text-muted-foreground">No upcoming bookings</p>
                    <Button variant="hero" className="mt-4" onClick={() => navigate('/')}>
                      Book a Train
                    </Button>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="past" className="space-y-4">
                {pastBookings.length > 0 ? (
                  pastBookings.map(booking => (
                    <TicketCard key={booking.bookingId} booking={booking} />
                  ))
                ) : (
                  <div className="glass-card p-12 text-center">
                    <p className="text-muted-foreground">No past bookings</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
