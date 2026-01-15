import { useState } from 'react';
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
import { mockTrains, mockStations } from '@/data/mockData';

const SeatSelection = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  
  const [selectedCoach, setSelectedCoach] = useState('S1');
  const [selectedSeats, setSelectedSeats] = useState<number[]>([]);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const trainId = Number(searchParams.get('trainId'));
  const date = searchParams.get('date') || '';
  const price = Number(searchParams.get('price')) || 850;
  
  const train = mockTrains.find(t => t.trainId === trainId) || mockTrains[0];
  const fromStation = mockStations.find(s => s.stationId === Number(searchParams.get('from')));
  const toStation = mockStations.find(s => s.stationId === Number(searchParams.get('to')));

  const coaches = ['S1', 'S2', 'S3'];

  const handleSeatToggle = (seatNumber: number) => {
    setSelectedSeats(prev => 
      prev.includes(seatNumber)
        ? prev.filter(s => s !== seatNumber)
        : [...prev, seatNumber]
    );
  };

  const handleProceed = () => {
    if (selectedSeats.length === 0) {
      toast({
        title: 'Select seats',
        description: 'Please select at least one seat to proceed.',
        variant: 'destructive',
      });
      return;
    }

    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }

    // Navigate to payment/confirmation
    toast({
      title: 'Booking Confirmed!',
      description: `Your seats ${selectedSeats.join(', ')} in ${selectedCoach} have been booked.`,
    });
    navigate('/dashboard');
  };

  const totalPrice = selectedSeats.length * price;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="pt-20 px-4">
        <div className="container mx-auto py-8 max-w-4xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Results
            </Button>
            
            <div className="glass-card p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h1 className="font-display text-2xl font-bold">{train.trainName}</h1>
                  <p className="text-muted-foreground">#{train.trainNumber}</p>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">From</p>
                    <p className="font-semibold">{fromStation?.stationCode || 'CEN'}</p>
                  </div>
                  <div className="text-2xl">→</div>
                  <div>
                    <p className="text-muted-foreground">To</p>
                    <p className="font-semibold">{toStation?.stationCode || 'NDLS'}</p>
                  </div>
                  <div className="border-l border-border pl-4 ml-2">
                    <p className="text-muted-foreground">Date</p>
                    <p className="font-semibold">{date}</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Coach Selection */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Tabs value={selectedCoach} onValueChange={(v) => { setSelectedCoach(v); setSelectedSeats([]); }}>
              <TabsList className="w-full justify-start mb-6 bg-muted/50">
                {coaches.map(coach => (
                  <TabsTrigger
                    key={coach}
                    value={coach}
                    className="flex-1 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-secondary data-[state=active]:text-white"
                  >
                    Coach {coach}
                  </TabsTrigger>
                ))}
              </TabsList>

              {coaches.map(coach => (
                <TabsContent key={coach} value={coach}>
                  <SeatSelector
                    trainId={trainId}
                    coach={coach}
                    date={date}
                    selectedSeats={selectedSeats}
                    onSeatToggle={handleSeatToggle}
                  />
                </TabsContent>
              ))}
            </Tabs>
          </motion.div>

          {/* Bottom Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="fixed bottom-0 left-0 right-0 glass-card border-t border-border p-4"
          >
            <div className="container mx-auto max-w-4xl flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  {selectedSeats.length} seat{selectedSeats.length !== 1 ? 's' : ''} selected
                </p>
                <div className="flex items-center gap-1">
                  <IndianRupee className="w-5 h-5 text-primary" />
                  <span className="text-2xl font-bold">{totalPrice}</span>
                </div>
              </div>
              <Button
                variant="hero"
                size="lg"
                onClick={handleProceed}
                disabled={selectedSeats.length === 0}
              >
                <Check className="w-5 h-5" />
                Proceed to Pay
              </Button>
            </div>
          </motion.div>
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
