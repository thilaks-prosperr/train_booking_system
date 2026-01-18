/*
 * Copyright (c) 2026 Thilaks. All Rights Reserved.
 *
 * This source code is licensed under the proprietary license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, IndianRupee, Check } from 'lucide-react';
import Navbar from '@/components/Navbar';
import SeatSelector from '@/components/SeatSelector';
import LoginModal from '@/components/LoginModal';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { trainApi, bookingApi } from '@/lib/api';
import { Segment } from '@/types';

interface JourneyLeg {
  trainId: number;
  trainName: string;
  trainNumber: string;
  sourceStation: string;
  destStation: string;
  sourceStationId: number;
  destStationId: number;
  date: string; // Add date to leg for clarity, though it's global for now
}

const SeatSelection = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();

  const [legs, setLegs] = useState<JourneyLeg[]>([]);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  // State maps: trainId -> value
  const [selectedCoaches, setSelectedCoaches] = useState<Record<number, string>>({});
  const [selectedSeats, setSelectedSeats] = useState<Record<number, number[]>>({});

  const [showLoginModal, setShowLoginModal] = useState(false);

  const globalDate = searchParams.get('date') || '';
  const pricePerLeg = (Number(searchParams.get('price')) || 850) / (legs.length || 1); // rough estimate

  useEffect(() => {
    const initLegs = async () => {
      const legsParam = searchParams.get('legs');

      if (legsParam) {
        try {
          const segments: Segment[] = JSON.parse(legsParam);
          const parsedLegs: JourneyLeg[] = segments.map(s => ({
            trainId: s.trainId,
            trainName: s.trainName,
            trainNumber: s.trainNumber,
            sourceStation: s.sourceStation,
            destStation: s.destStation,
            sourceStationId: s.sourceStationId,
            destStationId: s.destStationId,
            date: globalDate
          }));
          setLegs(parsedLegs);

          // Init state
          const initialCoaches: Record<number, string> = {};
          const initialSeats: Record<number, number[]> = {};
          parsedLegs.forEach(l => {
            initialCoaches[l.trainId] = 'S1';
            initialSeats[l.trainId] = [];
          });
          setSelectedCoaches(initialCoaches);
          setSelectedSeats(initialSeats);
          setLoading(false);

        } catch (e) {
          console.error("Failed to parse legs", e);
          navigate(-1);
        }
      } else {
        // Direct Train Fallback
        const trainId = Number(searchParams.get('trainId'));
        if (!trainId) return;

        try {
          const response = await trainApi.getDetails(trainId);
          const train = response.data;

          const leg: JourneyLeg = {
            trainId: trainId,
            trainName: train.trainName,
            trainNumber: train.trainNumber,
            sourceStation: searchParams.get('fromCode') || 'SRC', // Fallback display
            destStation: searchParams.get('toCode') || 'DEST',
            sourceStationId: Number(searchParams.get('from')),
            destStationId: Number(searchParams.get('to')),
            date: globalDate
          };

          setLegs([leg]);
          setSelectedCoaches({ [trainId]: 'S1' });
          setSelectedSeats({ [trainId]: [] });
        } catch (err) {
          console.error(err);
        } finally {
          setLoading(false);
        }
      }
    };
    initLegs();
  }, [searchParams]);


  const coaches = ['S1', 'S2', 'S3'];

  const handleSeatToggle = (trainId: number, seatNumber: number) => {
    setSelectedSeats(prev => {
      const current = prev[trainId] || [];
      const updated = current.includes(seatNumber)
        ? current.filter(s => s !== seatNumber)
        : [...current, seatNumber];
      return { ...prev, [trainId]: updated };
    });
  };

  const handleCoachChange = (trainId: number, coach: string) => {
    setSelectedCoaches(prev => ({ ...prev, [trainId]: coach }));
    // Clear seats when coach changes
    setSelectedSeats(prev => ({ ...prev, [trainId]: [] }));
  };

  const isSubmittingRef = useRef(false);

  const handleProceed = () => {
    if (isSubmittingRef.current) return;

    // Validate
    const missingLegs = legs.filter(l => (selectedSeats[l.trainId]?.length || 0) === 0);

    if (missingLegs.length > 0) {
      toast({
        title: 'Select seats',
        description: `Please select seats for: ${missingLegs.map(l => l.trainName).join(', ')}`,
        variant: 'destructive',
      });
      return;
    }

    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }

    // LOCK IMMEDIATELY
    isSubmittingRef.current = true;
    setIsProcessing(true);

    const bookingRequests = legs.map(leg => ({
      userId: user?.userId,
      trainId: leg.trainId,
      journeyDate: leg.date,
      sourceStationId: leg.sourceStationId,
      destStationId: leg.destStationId,
      coachType: selectedCoaches[leg.trainId],
      selectedSeats: selectedSeats[leg.trainId]
    }));

    (bookingRequests.length > 1
      ? bookingApi.createComposite({ bookings: bookingRequests })
      : bookingApi.create(bookingRequests[0]))
      .then(() => {
        toast({
          title: 'Booking Confirmed!',
          description: `Your journey has been successfully booked.`,
        });
        navigate('/dashboard');
      })
      .catch((err) => {
        console.error(err);
        toast({
          title: 'Booking Failed',
          description: 'Could not complete your booking. Please try again.',
          variant: 'destructive',
        });
        // Release lock on error
        isSubmittingRef.current = false;
      })
      .finally(() => {
        setIsProcessing(false);
        // We explicitly do NOT release ref on success immediately because we navigate away.
        // But if we stayed, we would need to release. 
        // If navigation fails or is slow, keeping it locked is safer.
        // However, if the catch block ran, we released it.
        // Let's release it here to be safe against SPA navigation logic where component might not unmount immediately.
        isSubmittingRef.current = false;
      });
  };

  const totalSeats = Object.values(selectedSeats).reduce((acc, curr) => acc + curr.length, 0);
  // Total Price: Sum of (seats_in_leg * price_of_leg)
  // We passed a global price. Let's just say totalSeats * (globalPrice / legs).
  // Or simpler: just display global price * max(seats)? 
  // Wait, if I book 2 seats on leg 1 and 2 seats on leg 2, I pay 2 * total_fare.
  // The 'price' param is total fare for 1 person (sum of legs).
  // So if I select same number of seats for both legs...
  // But user might select 1 seat on leg 1 and 2 on leg 2 (weird but possible).
  // Let's approximate: Total Price = (Sum of seats selected) * (price / legs)
  const estimatedTotal = Math.round(totalSeats * pricePerLeg);


  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <Navbar />

      <div className="pt-20 px-4">
        <div className="container mx-auto py-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back
            </Button>
            <h1 className="text-3xl font-display font-bold">Select Seats</h1>
            <p className="text-muted-foreground">{globalDate}</p>
          </motion.div>

          {/* Grid for multiple legs */}
          <div className={`grid gap-8 ${legs.length === 1 ? 'max-w-4xl mx-auto' : legs.length === 2 ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1 lg:grid-cols-3'}`}>
            {legs.map((leg, index) => (
              <motion.div
                key={leg.trainId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="glass-card p-6"
              >
                <div className="mb-6 border-b border-border pb-4">
                  <h2 className="text-xl font-bold">{leg.trainName}</h2>
                  <p className="text-sm text-muted-foreground">#{leg.trainNumber}</p>
                  <div className="flex items-center gap-2 mt-2 text-sm">
                    <span className="font-semibold">{leg.sourceStation}</span>
                    <span>→</span>
                    <span className="font-semibold">{leg.destStation}</span>
                  </div>
                </div>

                <Tabs value={selectedCoaches[leg.trainId]} onValueChange={(v) => handleCoachChange(leg.trainId, v)}>
                  <TabsList className="w-full justify-start mb-6 bg-muted/50">
                    {coaches.map(coach => (
                      <TabsTrigger
                        key={coach}
                        value={coach}
                        className="flex-1 data-[state=active]:bg-primary data-[state=active]:text-white"
                      >
                        {coach}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                  <SeatSelector
                    trainId={leg.trainId}
                    coach={selectedCoaches[leg.trainId]}
                    date={leg.date}
                    selectedSeats={selectedSeats[leg.trainId]}
                    onSeatToggle={(seat) => handleSeatToggle(leg.trainId, seat)}
                  />
                </Tabs>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 glass-card border-t border-border p-4 z-50">
        <div className="container mx-auto max-w-4xl flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">
              {totalSeats} seat(s) selected across {legs.length} train(s)
            </p>
            <div className="flex items-center gap-1">
              <IndianRupee className="w-5 h-5 text-primary" />
              <span className="text-2xl font-bold">{estimatedTotal}</span>
            </div>
          </div>
          <Button
            variant="hero"
            size="lg"
            onClick={handleProceed}
            disabled={totalSeats === 0 || isProcessing}
          >
            {isProcessing ? (
              <>
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                Processing...
              </>
            ) : (
              <>
                <Check className="w-5 h-5" />
                Proceed to Book All
              </>
            )}
          </Button>
        </div>
      </div>

      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSuccess={() => {
          setShowLoginModal(false);
          handleProceed();
        }}
      />
    </div>
  );
};

export default SeatSelection;
