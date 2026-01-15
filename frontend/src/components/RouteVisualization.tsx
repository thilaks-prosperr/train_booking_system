import { motion } from 'framer-motion';
import { MapPin, Train } from 'lucide-react';
import { SearchResult } from '@/types';
import { mockStations } from '@/data/mockData';

interface RouteVisualizationProps {
  result: SearchResult | null;
}

const RouteVisualization = ({ result }: RouteVisualizationProps) => {
  if (!result) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground">
        <div className="text-center">
          <Train className="w-16 h-16 mx-auto mb-4 opacity-30" />
          <p>Select a train to view route details</p>
        </div>
      </div>
    );
  }

  // Mock route stops
  const stops = [
    { station: result.sourceStation, time: result.departureTime, isStop: true },
    ...(result.isDirect ? [] : [
      { station: mockStations[1], time: '08:30', isStop: true },
      { station: mockStations[2], time: '10:00', isStop: false },
    ]),
    { station: result.destStation, time: result.arrivalTime, isStop: true },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="h-full p-6"
    >
      <div className="glass-card p-6 h-full">
        <h3 className="font-display text-xl font-bold mb-6 gradient-text">
          Route: {result.train.trainName}
        </h3>

        <div className="relative">
          {/* Vertical Line */}
          <div className="absolute left-4 top-4 bottom-4 w-0.5 bg-gradient-to-b from-primary via-secondary to-primary" />

          {/* Stops */}
          <div className="space-y-8">
            {stops.map((stop, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-4"
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center z-10 ${
                  index === 0 || index === stops.length - 1
                    ? 'bg-gradient-to-br from-primary to-secondary'
                    : stop.isStop
                    ? 'bg-secondary/50 border-2 border-secondary'
                    : 'bg-muted border-2 border-border'
                }`}>
                  <MapPin className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">{stop.station.stationName}</p>
                      <p className="text-sm text-muted-foreground">{stop.station.city}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg">{stop.time}</p>
                      <p className="text-xs text-muted-foreground">
                        {index === 0 ? 'Departure' : index === stops.length - 1 ? 'Arrival' : 'Stop'}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Train Info */}
        <div className="mt-8 pt-6 border-t border-border">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <p className="text-sm text-muted-foreground">Total Duration</p>
              <p className="font-bold text-lg">{result.duration}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Stops</p>
              <p className="font-bold text-lg">{stops.length - 2}</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default RouteVisualization;
