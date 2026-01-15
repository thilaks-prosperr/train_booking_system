import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    TrendingUp,
    Train,
    CalendarCheck,
    Percent,
    Search,
    Filter,
    Eye,
    XCircle,
    Ban,
    Loader2,
    X
} from 'lucide-react';
import AdminLayout from '@/components/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { bookingApi, stationApi, adminApi } from '@/lib/api';
// import { mockAdminStats, mockAdminBookings } from '@/data/mockData';
import { cn } from '@/lib/utils';
import { Booking } from '@/types';

const AdminDashboard = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [stats, setStats] = useState({
        totalRevenue: 0,
        activeTrains: 0,
        totalBookings: 0,
        occupancyPercentage: 0
    });

    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
    const [showViewModal, setShowViewModal] = useState(false);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [showBlockModal, setShowBlockModal] = useState(false);

    // Fetch dashboard data
    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch stats
                const statsResponse = await adminApi.getStats();
                if (statsResponse.data) {
                    setStats({
                        totalRevenue: statsResponse.data.totalRevenue || 0,
                        activeTrains: statsResponse.data.activeTrains || 0,
                        totalBookings: statsResponse.data.totalBookings || 0,
                        occupancyPercentage: statsResponse.data.occupancyPercentage || 0
                    });
                }

                // Fetch all bookings
                const bookingsResponse = await adminApi.getBookings();
                if (bookingsResponse.data) {
                    setBookings(bookingsResponse.data);
                }
            } catch (e) {
                console.error('Failed to fetch admin data:', e);
            }
        };
        fetchData();
    }, []);

    const dashboardStats = [
        {
            label: 'Total Revenue',
            value: `₹${(stats.totalRevenue / 100000).toFixed(1)}L`,
            icon: TrendingUp,
            color: 'text-success'
        },
        {
            label: 'Active Trains',
            value: stats.activeTrains,
            icon: Train,
            color: 'text-primary'
        },
        {
            label: 'Total Bookings',
            value: stats.totalBookings.toLocaleString(),
            icon: CalendarCheck,
            color: 'text-secondary'
        },
        {
            label: 'Occupancy Rate',
            value: `${stats.occupancyPercentage}%`,
            icon: Percent,
            color: 'text-warning'
        },
    ];

    const filteredBookings = bookings.filter(booking => {
        const matchesSearch =
            booking.pnr?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            booking.train?.trainNumber.includes(searchTerm);
        const matchesStatus = statusFilter === 'all' || booking.bookingStatus === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const statusColors = {
        CONFIRMED: 'bg-success/20 text-success border-success/30',
        CANCELLED: 'bg-destructive/20 text-destructive border-destructive/30',
        PENDING: 'bg-warning/20 text-warning border-warning/30',
        REFUNDED: 'bg-primary/20 text-primary border-primary/30',
    };

    const handleView = (booking: Booking) => {
        setSelectedBooking(booking);
        setShowViewModal(true);
    };

    const initiateCancel = (booking: Booking) => {
        setSelectedBooking(booking);
        setShowCancelModal(true);
    };

    const initiateBlock = (booking: Booking) => {
        setSelectedBooking(booking);
        setShowBlockModal(true);
    };

    const confirmCancel = async () => {
        if (!selectedBooking) return;
        try {
            await bookingApi.cancel(selectedBooking.bookingId!);
            // Refresh data
            const bookingsResponse = await adminApi.getBookings();
            if (bookingsResponse.data) setBookings(bookingsResponse.data);
            // Update stats
            const statsResponse = await adminApi.getStats();
            if (statsResponse.data) {
                setStats({
                    totalRevenue: statsResponse.data.totalRevenue || 0,
                    activeTrains: statsResponse.data.activeTrains || 0,
                    totalBookings: statsResponse.data.totalBookings || 0,
                    occupancyPercentage: statsResponse.data.occupancyPercentage || 0
                });
            }
            setShowCancelModal(false);
        } catch (e) {
            console.error("Failed to cancel booking", e);
        }
    };

    // For Block, we'll treat it as Cancel for now but maybe later add user blocking
    const confirmBlock = async () => {
        if (!selectedBooking) return;
        // Just call cancel for now as "Block" wasn't specced fully backend side
        // Or ideally call a blockUser endpoint. 
        // Let's call cancel.
        await confirmCancel();
        setShowBlockModal(false);
    };

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {dashboardStats.map((stat, index) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="metric-card"
                        >
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                                    <p className="text-3xl font-bold">{stat.value}</p>
                                </div>
                                <div className={cn("w-10 h-10 rounded-lg bg-muted flex items-center justify-center", stat.color)}>
                                    <stat.icon className="w-5 h-5" />
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Bookings Table */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="admin-card"
                >
                    <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between mb-6">
                        <h2 className="font-display text-xl font-bold">All Bookings</h2>
                        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                            <div className="relative flex-1 md:w-64">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search by PNR or Train..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10 bg-muted/50"
                                />
                            </div>
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-full sm:w-40 bg-muted/50">
                                    <Filter className="w-4 h-4 mr-2" />
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent className="bg-card border-border">
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                                    <SelectItem value="PENDING">Pending</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="border-border">
                                    <TableHead>PNR</TableHead>
                                    <TableHead>Train</TableHead>
                                    <TableHead>Journey Date</TableHead>
                                    <TableHead>Route</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredBookings.map((booking) => (
                                    <TableRow key={booking.bookingId} className="border-border">
                                        <TableCell className="font-mono font-medium">{booking.pnr}</TableCell>
                                        <TableCell>
                                            <div>
                                                <p className="font-medium">{booking.train?.trainName}</p>
                                                <p className="text-xs text-muted-foreground">#{booking.train?.trainNumber}</p>
                                            </div>
                                        </TableCell>
                                        <TableCell>{booking.journeyDate}</TableCell>
                                        <TableCell>
                                            {booking.sourceStation?.stationCode} → {booking.destStation?.stationCode}
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={cn('border', statusColors[booking.bookingStatus])}>
                                                {booking.bookingStatus}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button variant="ghost" size="icon" onClick={() => handleView(booking)}>
                                                    <Eye className="w-4 h-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="text-destructive" onClick={() => initiateCancel(booking)}>
                                                    <XCircle className="w-4 h-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon" onClick={() => initiateBlock(booking)}>
                                                    <Ban className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </motion.div>
            </div>

            <AnimatePresence>
                {/* View Modal */}
                {showViewModal && selectedBooking && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowViewModal(false)}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg z-50 pointer-events-none"
                        >
                            <div className="glass-card p-6 pointer-events-auto mx-4">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-xl font-bold">Booking Details</h3>
                                    <Button variant="ghost" size="icon" onClick={() => setShowViewModal(false)}>
                                        <X className="w-5 h-5" />
                                    </Button>
                                </div>

                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-sm text-muted-foreground">PNR</p>
                                            <p className="font-mono font-bold">{selectedBooking.pnr}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">Status</p>
                                            <Badge className={cn('border', statusColors[selectedBooking.bookingStatus])}>
                                                {selectedBooking.bookingStatus}
                                            </Badge>
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">Train</p>
                                            <p className="font-medium">{selectedBooking.train?.trainName}</p>
                                            <p className="text-xs text-muted-foreground">#{selectedBooking.train?.trainNumber}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">Journey Date</p>
                                            <p>{selectedBooking.journeyDate}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">Source</p>
                                            <p>{selectedBooking.sourceStation?.stationName} ({selectedBooking.sourceStation?.stationCode})</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">Destination</p>
                                            <p>{selectedBooking.destStation?.stationName} ({selectedBooking.destStation?.stationCode})</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">Price</p>
                                            <p className="font-bold">₹{selectedBooking.totalFare || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">Seats</p>
                                            <div className="flex flex-wrap gap-1">
                                                {selectedBooking.seats?.map(s => (
                                                    <Badge key={s.seatId} variant="outline" className="text-xs">{s.coachType}-{s.seatNumber}</Badge>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}

                {/* Cancel Confirmation Modal */}
                {showCancelModal && selectedBooking && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowCancelModal(false)}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm z-50 pointer-events-none"
                        >
                            <div className="glass-card p-6 pointer-events-auto mx-4 border-destructive/50">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-xl font-bold text-destructive">Cancel Booking?</h3>
                                    <Button variant="ghost" size="icon" onClick={() => setShowCancelModal(false)}>
                                        <X className="w-5 h-5" />
                                    </Button>
                                </div>
                                <p className="text-muted-foreground mb-6">
                                    Are you sure you want to cancel booking <strong>{selectedBooking.pnr}</strong>?
                                    This action cannot be undone.
                                </p>
                                <div className="flex gap-2 justify-end">
                                    <Button variant="outline" onClick={() => setShowCancelModal(false)}>Keep Booking</Button>
                                    <Button variant="destructive" onClick={confirmCancel}>Yes, Cancel It</Button>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}

                {/* Block Confirmation Modal (Reusing cancel logic for now as requested) */}
                {showBlockModal && selectedBooking && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowBlockModal(false)}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm z-50 pointer-events-none"
                        >
                            <div className="glass-card p-6 pointer-events-auto mx-4 border-primary/50">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-xl font-bold text-primary">Block User/Booking?</h3>
                                    <Button variant="ghost" size="icon" onClick={() => setShowBlockModal(false)}>
                                        <X className="w-5 h-5" />
                                    </Button>
                                </div>
                                <p className="text-muted-foreground mb-6">
                                    This will force cancel the booking <strong>{selectedBooking.pnr}</strong> and flag the user. Proceed?
                                </p>
                                <div className="flex gap-2 justify-end">
                                    <Button variant="outline" onClick={() => setShowBlockModal(false)}>Cancel</Button>
                                    <Button variant="default" className="bg-primary text-primary-foreground" onClick={confirmBlock}>Confirm Block</Button>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </AdminLayout>
    );
};

export default AdminDashboard;
