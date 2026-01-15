import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  Train, 
  CalendarCheck, 
  Percent,
  Search,
  Filter,
  Eye,
  XCircle,
  Ban
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
import { mockAdminStats, mockAdminBookings } from '@/data/mockData';
import { cn } from '@/lib/utils';

const AdminDashboard = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const stats = [
    { 
      label: 'Total Revenue', 
      value: `₹${(mockAdminStats.totalRevenue / 100000).toFixed(1)}L`, 
      icon: TrendingUp,
      color: 'text-success'
    },
    { 
      label: 'Active Trains', 
      value: mockAdminStats.activeTrains, 
      icon: Train,
      color: 'text-primary'
    },
    { 
      label: 'Total Bookings', 
      value: mockAdminStats.totalBookings.toLocaleString(), 
      icon: CalendarCheck,
      color: 'text-secondary'
    },
    { 
      label: 'Occupancy Rate', 
      value: `${mockAdminStats.occupancyPercentage}%`, 
      icon: Percent,
      color: 'text-warning'
    },
  ];

  const filteredBookings = mockAdminBookings.filter(booking => {
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
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
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
                        <Button variant="ghost" size="icon">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-destructive">
                          <XCircle className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
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
    </AdminLayout>
  );
};

export default AdminDashboard;
