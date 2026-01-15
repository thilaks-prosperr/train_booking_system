import React, { useState, useEffect } from 'react';
import { statsApi, bookingsApi, stationsApi, trainsApi, seatsApi } from '@/services/adminApi';
import { AdminStats, Booking, BookingFilters, Station, Train, Seat, BookingStatus } from '@/types';
import { useToast } from '@/hooks/use-toast';
import {
  BarChart3, Ticket, Train as TrainIcon, Users, MapPin,
  Search, Filter, X, Eye, Ban, DollarSign, Armchair,
  Loader2, Calendar, ChevronDown, RefreshCw
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: string;
  color: string;
}

function StatCard({ title, value, icon, trend, color }: StatCardProps) {
  return (
    <div className="stat-card">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold mt-2">{value}</p>
          {trend && <p className="text-xs text-success mt-1">{trend}</p>}
        </div>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: BookingStatus }) {
  const styles: Record<BookingStatus, string> = {
    CONFIRMED: 'badge-success',
    PENDING: 'badge-warning',
    CANCELLED: 'badge-destructive',
    REFUNDED: 'badge-primary',
  };
  return <span className={styles[status]}>{status}</span>;
}

export default function StatsPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [stations, setStations] = useState<Station[]>([]);
  const [trains, setTrains] = useState<Train[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isBookingsLoading, setIsBookingsLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [actionBooking, setActionBooking] = useState<{ booking: Booking; action: 'cancel' | 'refund' } | null>(null);
  const [seatManagement, setSeatManagement] = useState<{ train: Train; booking: Booking } | null>(null);
  const [seats, setSeats] = useState<Seat[]>([]);
  const [selectedSeats, setSelectedSeats] = useState<number[]>([]);
  const [isSeatsLoading, setIsSeatsLoading] = useState(false);
  // const { isMockMode } = useApiMode(); // Removed
  const { toast } = useToast();

  const [filters, setFilters] = useState<BookingFilters>({
    trainNumber: '',
    bookingId: '',
    passengerName: '',
    status: '',
    dateFrom: '',
    dateTo: '',
  });

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [statsData, stationsData, trainsData] = await Promise.all([
        statsApi.getStats(),
        stationsApi.getAll(),
        trainsApi.getAll(),
      ]);
      setStats(statsData);
      setStations(stationsData);
      setTrains(trainsData);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch data',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchBookings = async () => {
    setIsBookingsLoading(true);
    try {
      const data = await bookingsApi.getAll(filters);
      setBookings(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch bookings',
        variant: 'destructive',
      });
    } finally {
      setIsBookingsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    fetchBookings();
  }, []);

  const handleSearch = () => {
    fetchBookings();
  };

  const clearFilters = () => {
    setFilters({
      trainNumber: '',
      bookingId: '',
      passengerName: '',
      status: '',
      dateFrom: '',
      dateTo: '',
    });
  };

  const handleAction = async () => {
    if (!actionBooking) return;
    try {
      if (actionBooking.action === 'cancel') {
        await bookingsApi.cancel(actionBooking.booking.booking_id);
        toast({ title: 'Success', description: 'Booking cancelled successfully' });
      } else {
        await bookingsApi.refund(actionBooking.booking.booking_id);
        toast({ title: 'Success', description: 'Refund processed successfully' });
      }
      setActionBooking(null);
      fetchBookings();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Action failed',
        variant: 'destructive',
      });
    }
  };

  const openSeatManagement = async (booking: Booking) => {
    if (!booking.train) return;
    setSeatManagement({ train: booking.train, booking });
    setIsSeatsLoading(true);
    setSelectedSeats([]);
    try {
      const seatsData = await seatsApi.getSeats(
        booking.train_id,
        booking.journey_date,
        booking.seats?.[0]?.coach_type || 'S1'
      );
      setSeats(seatsData);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch seats',
        variant: 'destructive',
      });
    } finally {
      setIsSeatsLoading(false);
    }
  };

  const toggleSeatSelection = (seatNumber: number) => {
    setSelectedSeats(prev =>
      prev.includes(seatNumber)
        ? prev.filter(s => s !== seatNumber)
        : [...prev, seatNumber]
    );
  };

  const handleBlockSeats = async () => {
    if (!seatManagement || selectedSeats.length === 0) return;
    try {
      await seatsApi.blockSeats(
        seatManagement.booking.train_id,
        seatManagement.booking.journey_date,
        seatManagement.booking.seats?.[0]?.coach_type || 'S1',
        selectedSeats
      );
      toast({ title: 'Success', description: `${selectedSeats.length} seats blocked` });
      setSelectedSeats([]);
      // Refresh seats
      const seatsData = await seatsApi.getSeats(
        seatManagement.booking.train_id,
        seatManagement.booking.journey_date,
        seatManagement.booking.seats?.[0]?.coach_type || 'S1'
      );
      setSeats(seatsData);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to block seats', variant: 'destructive' });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Bookings"
          value={stats?.totalBookings || 0}
          icon={<Ticket className="w-6 h-6 text-white" />}
          trend="+12% from last month"
          color="bg-gradient-to-br from-primary to-accent"
        />
        <StatCard
          title="Active Trains"
          value={stats?.totalTrains || 0}
          icon={<TrainIcon className="w-6 h-6 text-white" />}
          color="bg-gradient-to-br from-secondary to-primary"
        />
        <StatCard
          title="Total Stations"
          value={stats?.totalStations || 0}
          icon={<MapPin className="w-6 h-6 text-white" />}
          color="bg-gradient-to-br from-success to-secondary"
        />
        <StatCard
          title="Registered Users"
          value={stats?.totalUsers || 0}
          icon={<Users className="w-6 h-6 text-white" />}
          color="bg-gradient-to-br from-accent to-destructive"
        />
      </div>

      {/* Bookings Section */}
      <div className="glass-card overflow-hidden">
        <div className="p-4 border-b border-border/50 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div>
            <h3 className="text-lg font-semibold gradient-text">Booking Management</h3>
            <p className="text-sm text-muted-foreground">View and manage all bookings</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleSearch}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/20 text-primary hover:bg-primary/30 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${showFilters ? 'bg-primary text-white' : 'bg-muted hover:bg-muted/80'}`}
            >
              <Filter className="w-4 h-4" />
              Filters
              <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="p-4 border-b border-border/50 bg-muted/30 animate-slide-up">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Train Number</label>
                <input
                  type="text"
                  value={filters.trainNumber}
                  onChange={(e) => setFilters({ ...filters, trainNumber: e.target.value })}
                  placeholder="e.g., 12951"
                  className="input-glass"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Booking ID</label>
                <input
                  type="text"
                  value={filters.bookingId}
                  onChange={(e) => setFilters({ ...filters, bookingId: e.target.value })}
                  placeholder="e.g., 1001"
                  className="input-glass"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Passenger Name</label>
                <input
                  type="text"
                  value={filters.passengerName}
                  onChange={(e) => setFilters({ ...filters, passengerName: e.target.value })}
                  placeholder="Search by name..."
                  className="input-glass"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Status</label>
                <Select
                  value={filters.status}
                  onValueChange={(val) => setFilters({ ...filters, status: val as BookingStatus | '' })}
                >
                  <SelectTrigger className="input-glass">
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent className="glass-card border-border/50">
                    <SelectItem value="">All statuses</SelectItem>
                    <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                    <SelectItem value="REFUNDED">Refunded</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Date From</label>
                <input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                  className="input-glass"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Date To</label>
                <input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                  className="input-glass"
                />
              </div>
              <div className="flex items-end gap-2 sm:col-span-2">
                <button
                  onClick={handleSearch}
                  className="flex-1 btn-gradient flex items-center justify-center gap-2"
                >
                  <Search className="w-4 h-4" />
                  Search
                </button>
                <button
                  onClick={clearFilters}
                  className="px-4 py-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Bookings Table */}
        {isBookingsLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : bookings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <Ticket className="w-12 h-12 mb-4 opacity-50" />
            <p className="text-lg font-medium">No bookings found</p>
            <p className="text-sm">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table-glass">
              <thead>
                <tr>
                  <th>Booking ID</th>
                  <th>Train</th>
                  <th>Journey Date</th>
                  <th>Route</th>
                  <th>Passenger</th>
                  <th>Status</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking) => (
                  <tr key={booking.booking_id}>
                    <td>
                      <span className="font-mono font-medium">#{booking.booking_id}</span>
                    </td>
                    <td>
                      <div>
                        <p className="font-medium">{booking.train?.train_name || 'N/A'}</p>
                        <p className="text-xs text-muted-foreground">#{booking.train?.train_number}</p>
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        {booking.journey_date}
                      </div>
                    </td>
                    <td>
                      <p className="text-sm">
                        {booking.source_station?.station_code || '?'} → {booking.dest_station?.station_code || '?'}
                      </p>
                    </td>
                    <td>
                      <p className="font-medium">{booking.user?.full_name || 'N/A'}</p>
                    </td>
                    <td>
                      <StatusBadge status={booking.booking_status} />
                    </td>
                    <td>
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setSelectedBooking(booking)}
                          className="p-2 rounded-lg hover:bg-primary/20 text-primary transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {booking.booking_status === 'CONFIRMED' && (
                          <>
                            <button
                              onClick={() => setActionBooking({ booking, action: 'cancel' })}
                              className="p-2 rounded-lg hover:bg-destructive/20 text-destructive transition-colors"
                              title="Cancel Booking"
                            >
                              <Ban className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setActionBooking({ booking, action: 'refund' })}
                              className="p-2 rounded-lg hover:bg-warning/20 text-warning transition-colors"
                              title="Issue Refund"
                            >
                              <DollarSign className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => openSeatManagement(booking)}
                          className="p-2 rounded-lg hover:bg-accent/20 text-accent transition-colors"
                          title="Manage Seats"
                        >
                          <Armchair className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Booking Details Dialog */}
      <Dialog open={!!selectedBooking} onOpenChange={() => setSelectedBooking(null)}>
        <DialogContent className="glass-card border-border/50 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="gradient-text">Booking Details</DialogTitle>
          </DialogHeader>
          {selectedBooking && (
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="glass-card p-3">
                  <p className="text-xs text-muted-foreground">Booking ID</p>
                  <p className="font-mono font-bold">#{selectedBooking.booking_id}</p>
                </div>
                <div className="glass-card p-3">
                  <p className="text-xs text-muted-foreground">Status</p>
                  <StatusBadge status={selectedBooking.booking_status} />
                </div>
              </div>
              <div className="glass-card p-3">
                <p className="text-xs text-muted-foreground">Train</p>
                <p className="font-medium">{selectedBooking.train?.train_name}</p>
                <p className="text-sm text-muted-foreground">#{selectedBooking.train?.train_number}</p>
              </div>
              <div className="glass-card p-3">
                <p className="text-xs text-muted-foreground">Journey</p>
                <p className="font-medium">
                  {selectedBooking.source_station?.station_name} → {selectedBooking.dest_station?.station_name}
                </p>
                <p className="text-sm text-muted-foreground">{selectedBooking.journey_date}</p>
              </div>
              <div className="glass-card p-3">
                <p className="text-xs text-muted-foreground">Passenger</p>
                <p className="font-medium">{selectedBooking.user?.full_name}</p>
                <p className="text-sm text-muted-foreground">{selectedBooking.user?.email}</p>
              </div>
              {selectedBooking.seats && selectedBooking.seats.length > 0 && (
                <div className="glass-card p-3">
                  <p className="text-xs text-muted-foreground mb-2">Seats</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedBooking.seats.map((seat) => (
                      <span key={seat.seat_id} className="badge-primary">
                        {seat.coach_type}-{seat.seat_number}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {selectedBooking.total_fare && (
                <div className="glass-card p-3">
                  <p className="text-xs text-muted-foreground">Total Fare</p>
                  <p className="text-2xl font-bold gradient-text">₹{selectedBooking.total_fare}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Cancel/Refund Confirmation Dialog */}
      <AlertDialog open={!!actionBooking} onOpenChange={() => setActionBooking(null)}>
        <AlertDialogContent className="glass-card border-border/50">
          <AlertDialogHeader>
            <AlertDialogTitle>
              {actionBooking?.action === 'cancel' ? 'Cancel Booking' : 'Issue Refund'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {actionBooking?.action === 'cancel'
                ? `Are you sure you want to cancel booking #${actionBooking?.booking.booking_id}? This action cannot be undone.`
                : `Are you sure you want to issue a refund for booking #${actionBooking?.booking.booking_id}?`
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-border hover:bg-muted/50">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleAction}
              className={actionBooking?.action === 'cancel' ? 'bg-destructive hover:bg-destructive/90' : 'bg-warning hover:bg-warning/90 text-warning-foreground'}
            >
              {actionBooking?.action === 'cancel' ? 'Cancel Booking' : 'Process Refund'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Seat Management Dialog */}
      <Dialog open={!!seatManagement} onOpenChange={() => setSeatManagement(null)}>
        <DialogContent className="glass-card border-border/50 sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="gradient-text">Seat Management</DialogTitle>
          </DialogHeader>
          {seatManagement && (
            <div className="space-y-4 mt-4">
              <div className="glass-card p-3">
                <p className="text-sm">
                  <span className="text-muted-foreground">Train:</span> {seatManagement.train.train_name} ({seatManagement.train.train_number})
                </p>
                <p className="text-sm">
                  <span className="text-muted-foreground">Date:</span> {seatManagement.booking.journey_date}
                </p>
                <p className="text-sm">
                  <span className="text-muted-foreground">Coach:</span> {seatManagement.booking.seats?.[0]?.coach_type || 'S1'}
                </p>
              </div>

              {/* Legend */}
              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="seat-available w-6 h-6 text-xs">1</div>
                  <span className="text-muted-foreground">Available</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="seat-booked w-6 h-6 text-xs">2</div>
                  <span className="text-muted-foreground">Booked</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="seat-blocked w-6 h-6 text-xs">3</div>
                  <span className="text-muted-foreground">Blocked</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="seat-selected w-6 h-6 text-xs">4</div>
                  <span className="text-muted-foreground">Selected</span>
                </div>
              </div>

              {/* Seats Grid */}
              {isSeatsLoading ? (
                <div className="flex items-center justify-center py-10">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : (
                <div className="glass-card p-4">
                  <div className="grid grid-cols-8 sm:grid-cols-12 gap-2">
                    {seats.map((seat) => (
                      <button
                        key={seat.seat_number}
                        onClick={() => seat.status !== 'booked' && toggleSeatSelection(seat.seat_number)}
                        disabled={seat.status === 'booked'}
                        className={`
                          ${selectedSeats.includes(seat.seat_number)
                            ? 'seat-selected'
                            : seat.status === 'available'
                              ? 'seat-available'
                              : seat.status === 'booked'
                                ? 'seat-booked'
                                : 'seat-blocked'
                          }
                        `}
                      >
                        {seat.seat_number}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              {selectedSeats.length > 0 && (
                <div className="flex items-center justify-between glass-card p-3">
                  <p className="text-sm">
                    <span className="font-medium">{selectedSeats.length}</span> seats selected
                  </p>
                  <button
                    onClick={handleBlockSeats}
                    className="btn-gradient px-4 py-2 text-sm"
                  >
                    Block Selected Seats
                  </button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
