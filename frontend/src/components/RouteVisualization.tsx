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

import { motion } from 'framer-motion';
import { MapPin, Train, Clock, ArrowDown } from 'lucide-react';
import { SearchResult, EnrichedStationPoint } from '@/types';

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

  // Debug log to see what we get
  // console.log('Route Path:', result.path);

  const routePath = result.path || [];

  // 1. COLORS PALETTE for train legs
  const TRAIN_COLORS = [
    'bg-blue-500',   // Leg 1
    'bg-orange-500', // Leg 2
    'bg-purple-500', // Leg 3
    'bg-pink-500',   // Leg 4
  ];

  // Map train numbers to distinct colors
  const trainColorMap = new Map<string, string>();
  let colorIndex = 0;

  routePath.forEach(stop => {
    if (stop.trainNumber && !trainColorMap.has(stop.trainNumber)) {
      trainColorMap.set(stop.trainNumber, TRAIN_COLORS[colorIndex % TRAIN_COLORS.length]);
      colorIndex++;
    } else if (!stop.trainNumber && stop.trainId) {
      // Fallback or attempt to find from segments?
      // Actually for now let's just ensure we don't crash and maybe show a default.
    }
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="h-full p-4 overflow-y-auto"
    >
      <div className="glass-card p-6 min-h-full">
        <h3 className="font-display text-xl font-bold mb-6 gradient-text">
          Journey Details
        </h3>

        <div className="space-y-0 relative pl-4 pb-4">

          {routePath.map((stop, index) => {
            const isLast = index === routePath.length - 1;
            const nextStop = !isLast ? routePath[index + 1] : null;

            // Determine if next segment is a LAYOVER or SAME TRAIN
            // A layover is essentially when station code is same but train number likely changes, 
            // OR simply we connect two different stations with different trains?
            // Actually, in our path:
            // A (T1) -> B (T1) [Arrive]
            // B (T2) [Depart] -> C (T2)
            // The list has duplicates for transfer stations usually? 
            // Let's check backend logic: getPath concatenates lists. 
            // If T1 ends at B and T2 starts at B, we might have B twice if getPath returns inclusive start/end.
            // Let's assume adjacent stops.

            // Logic for Connection Line Style:
            // The line connects stop[i] to stop[i+1].
            // If stop[i] and stop[i+1] are same station (Transfer point), line is GREY (Layover).
            // Else, line takes color of the train moving between them.

            let lineColor = 'bg-border'; // Default
            let isLayover = false;
            let segmentTrainNumber = '';

            if (nextStop) {
              if (stop.code === nextStop.code) {
                isLayover = true;
                lineColor = 'bg-muted-foreground/30 border-dashed';
              } else {
                // Moving between stations
                // Use color of the train arriving at nextStop (or departing current)
                // Usually same train number for this leg.
                segmentTrainNumber = nextStop.trainNumber || stop.trainNumber || '';
                lineColor = trainColorMap.get(segmentTrainNumber) || 'bg-primary';
              }
            }

            // Availability Badge Info (only show once per train leg, maybe at first stop of leg?)
            // Or show on the line itself?
            // Let's show it near the top of the connection line if it's the start of a train leg.
            const showTrainInfo = nextStop && !isLayover && (index === 0 || (routePath[index - 1] && routePath[index - 1].code === stop.code));

            // Fetch availability if showing info
            let availableSeats: number | undefined;
            if (showTrainInfo) {
              availableSeats = result.segments?.find(s => s.trainNumber === segmentTrainNumber)?.availableSeats
                ?? (result.trainNumber === segmentTrainNumber ? result.availableSeats : undefined);
            }

            const distDisplay = stop.distanceFromStartKm !== undefined ? `(${Math.round(stop.distanceFromStartKm)} km)` : '';

            return (
              <div key={index} className="relative pb-10 last:pb-0">

                {/* Connecting Line */}
                {!isLast && (
                  <div className={`absolute left-[7px] top-4 bottom-[-10px] w-0.5 ${lineColor} z-0`}>
                    {/* Embedded Badge on Line */}
                    {isLayover && (
                      <div className="absolute top-1/2 left-3 -translate-y-1/2 bg-muted/90 backdrop-blur px-2 py-0.5 rounded text-[10px] text-muted-foreground whitespace-nowrap border border-border">
                        Layover
                      </div>
                    )}
                    {showTrainInfo && (
                      <div className="absolute top-1/2 left-3 -translate-y-1/2 bg-card/95 backdrop-blur shadow-sm border border-border px-2 py-1 rounded w-max z-20">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <Train className="w-3 h-3 text-primary" />
                          <span className="font-bold text-xs">{segmentTrainNumber ? `#${segmentTrainNumber}` : 'Train'}</span>
                        </div>
                        {availableSeats !== undefined && (
                          <span className={`text-[10px] px-1.5 py-0 rounded-full font-medium ${availableSeats > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {availableSeats} Seats
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                )}

                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="relative flex items-start gap-8 z-10"
                >
                  {/* Dot - Standardized Size w-4 h-4 (16px), Center at 8px */}
                  <div className={`
                        w-4 h-4 rounded-full mt-1 shrink-0 border-2 border-background shadow-sm z-10
                        ${index === 0 || isLast ? 'ring-4 ring-primary/10 bg-primary' : 'bg-background border-muted-foreground'}
                        ${!isLayover && !isLast && nextStop ? trainColorMap.get(nextStop.trainNumber || '')?.replace('bg-', 'border-') : ''} 
                    `} style={{ borderColor: !isFirst(index) && !isLast ? getDotColor(stop.trainNumber, trainColorMap) : undefined }} />

                  {/* Content */}
                  <div className="flex-1 min-w-0 pt-0.5">
                    <div className="flex justify-between items-baseline ">
                      <div className="flex flex-col">
                        <div className="font-bold text-lg leading-none mb-1">{stop.code}</div>
                      </div>

                      <div className="text-right">
                        {index === 0 ? (
                          <>
                            <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Source</div>
                            <div className="text-sm text-muted-foreground">Dep: <span className="text-foreground font-mono font-bold text-lg">{stop.departureTime}</span></div>
                          </>
                        ) : isLast ? (
                          <>
                            <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Destination</div>
                            <div className="text-sm text-muted-foreground">Arr: <span className="text-foreground font-mono font-bold text-lg">{stop.arrivalTime}</span></div>
                          </>
                        ) : (
                          <div className="flex flex-col items-end gap-1">
                            <div className="text-xs text-muted-foreground">
                              Arr: <span className="text-foreground font-mono font-medium">{stop.arrivalTime}</span>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Dep: <span className="text-foreground font-mono font-medium">{stop.departureTime}</span>
                            </div>
                            {distDisplay && (
                              <div className="text-xs text-primary font-medium mt-1">
                                {distDisplay}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            );
          })}
        </div>

        {/* Global Stats */}
        <div className="mt-8 pt-6 border-t border-border grid grid-cols-2 gap-4 text-center">
          <div>
            <p className="text-sm text-muted-foreground">Total Duration</p>
            <p className="font-bold text-lg">{result.duration}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Price</p>
            <p className="font-bold text-lg">₹{result.price}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Helper for dot border color matches train line
function getDotColor(trainNum: string | undefined, map: Map<string, string>) {
  if (!trainNum) return '#64748b'; // slate-500
  const bgClass = map.get(trainNum);
  // Just return a slate color fallback if not found, since we can't easily map bg-class to border-color hex here dynamically without a full lookup table.
  // For now let's adhere to the existing logic structure or minimal fix.
  // We will let the className logic in the component handle it mostly.
  return undefined;
}

function isFirst(i: number) { return i === 0; }

export default RouteVisualization;
