import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, Train, Loader2, X, GripVertical } from 'lucide-react';
import AdminLayout from '@/components/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { trainApi, stationApi } from '@/lib/api';
import { Train as TrainType, Station } from '@/types';

// ...

const ManageTrains = () => {
  const { toast } = useToast();
  const [trains, setTrains] = useState<TrainType[]>([]);
  const [stations, setStations] = useState<Station[]>([]);

  useEffect(() => {
    // Fetch stations for the dropdown
    stationApi.getAll().then(res => setStations(res.data)).catch(console.error);

    // Fetch trains - assuming an endpoint exists or we leave empty for now
    // trainApi.getAll().then(res => setTrains(res.data)).catch(console.error);
  }, []);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    trainNumber: '',
    trainName: '',
    totalSeatsPerCoach: '40',
  });
  const [routeStops, setRouteStops] = useState<RouteStop[]>([]);

  const handleAddStop = () => {
    setRouteStops([
      ...routeStops,
      { stationId: 0, arrivalTime: '', departureTime: '' },
    ]);
  };

  const handleRemoveStop = (index: number) => {
    setRouteStops(routeStops.filter((_, i) => i !== index));
  };

  const handleStopChange = (index: number, field: keyof RouteStop, value: string | number) => {
    const updated = [...routeStops];
    updated[index] = { ...updated[index], [field]: value };
    setRouteStops(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    const newTrain: TrainType = {
      trainId: trains.length + 1,
      trainNumber: formData.trainNumber,
      trainName: formData.trainName,
      totalSeatsPerCoach: parseInt(formData.totalSeatsPerCoach),
    };

    setTrains([...trains, newTrain]);
    setFormData({ trainNumber: '', trainName: '', totalSeatsPerCoach: '40' });
    setRouteStops([]);
    setIsLoading(false);

    toast({
      title: 'Train Added',
      description: `${newTrain.trainName} has been added successfully.`,
    });
  };

  const handleDelete = (id: number) => {
    setTrains(trains.filter(t => t.trainId !== id));
    toast({
      title: 'Train Deleted',
      description: 'The train has been removed.',
      variant: 'destructive',
    });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Add Train Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="admin-card"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <Train className="w-5 h-5 text-white" />
            </div>
            <h2 className="font-display text-xl font-bold">Add New Train</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="trainNumber">Train Number</Label>
                <Input
                  id="trainNumber"
                  value={formData.trainNumber}
                  onChange={(e) => setFormData({ ...formData, trainNumber: e.target.value })}
                  placeholder="e.g., 12301"
                  className="bg-muted/50"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="trainName">Train Name</Label>
                <Input
                  id="trainName"
                  value={formData.trainName}
                  onChange={(e) => setFormData({ ...formData, trainName: e.target.value })}
                  placeholder="e.g., Express Special"
                  className="bg-muted/50"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="totalSeats">Seats Per Coach</Label>
                <Input
                  id="totalSeats"
                  type="number"
                  value={formData.totalSeatsPerCoach}
                  onChange={(e) => setFormData({ ...formData, totalSeatsPerCoach: e.target.value })}
                  placeholder="40"
                  className="bg-muted/50"
                  required
                />
              </div>
            </div>

            {/* Route Builder */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">Route Builder</Label>
                <Button type="button" variant="outline" size="sm" onClick={handleAddStop}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Stop
                </Button>
              </div>

              {routeStops.length === 0 ? (
                <div className="text-center py-8 border border-dashed border-border rounded-lg">
                  <p className="text-muted-foreground">No stops added yet. Click "Add Stop" to build the route.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {routeStops.map((stop, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg"
                    >
                      <GripVertical className="w-4 h-4 text-muted-foreground" />
                      <span className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </span>
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
                        <Select
                          value={stop.stationId.toString()}
                          onValueChange={(v) => handleStopChange(index, 'stationId', parseInt(v))}
                        >
                          <SelectTrigger className="bg-muted/50">
                            <SelectValue placeholder="Select Station" />
                          </SelectTrigger>
                          <SelectContent className="bg-card border-border">
                            {stations.map((station) => (
                              <SelectItem key={station.stationId} value={station.stationId.toString()}>
                                {station.stationName} ({station.stationCode})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Input
                          type="time"
                          value={stop.arrivalTime}
                          onChange={(e) => handleStopChange(index, 'arrivalTime', e.target.value)}
                          placeholder="Arrival"
                          className="bg-muted/50"
                        />
                        <Input
                          type="time"
                          value={stop.departureTime}
                          onChange={(e) => handleStopChange(index, 'departureTime', e.target.value)}
                          placeholder="Departure"
                          className="bg-muted/50"
                        />
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="text-destructive"
                        onClick={() => handleRemoveStop(index)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            <Button type="submit" variant="hero" disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Add Train
                </>
              )}
            </Button>
          </form>
        </motion.div>

        {/* Trains List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="admin-card"
        >
          <h2 className="font-display text-xl font-bold mb-6">Existing Trains ({trains.length})</h2>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border">
                  <TableHead>Number</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Seats/Coach</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {trains.map((train) => (
                  <TableRow key={train.trainId} className="border-border">
                    <TableCell className="font-mono font-bold text-primary">#{train.trainNumber}</TableCell>
                    <TableCell className="font-medium">{train.trainName}</TableCell>
                    <TableCell>{train.totalSeatsPerCoach}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="icon">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive"
                          onClick={() => handleDelete(train.trainId)}
                        >
                          <Trash2 className="w-4 h-4" />
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

export default ManageTrains;
