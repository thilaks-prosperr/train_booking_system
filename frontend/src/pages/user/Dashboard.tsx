import { motion } from 'framer-motion';
import { Calendar, Clock, Search } from 'lucide-react';
import Navbar from '@/components/Navbar';
import TicketCard from '@/components/TicketCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { mockBookings } from '@/data/mockData';
import { useNavigate } from 'react-router-dom';

const UserDashboard = () => {
  const navigate = useNavigate();
  const upcomingBookings = mockBookings.filter(b => 
    b.bookingStatus === 'CONFIRMED' && new Date(b.journeyDate) >= new Date()
  );
  const pastBookings = mockBookings.filter(b => 
    new Date(b.journeyDate) < new Date() || b.bookingStatus === 'CANCELLED'
  );

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
                    <TicketCard key={booking.bookingId} booking={booking} />
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
