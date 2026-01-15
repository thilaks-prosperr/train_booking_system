import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Filter, ToggleLeft, ToggleRight } from 'lucide-react';
import Navbar from '@/components/Navbar';
import TrainCard from '@/components/TrainCard';
import RouteVisualization from '@/components/RouteVisualization';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
// import { mockSearchResults } from '@/data/mockData';
import { trainApi } from '@/lib/api';
import { SearchResult } from '@/types';

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedTrain, setSelectedTrain] = useState<SearchResult | null>(null);
  const [directOnly, setDirectOnly] = useState(false);

  const from = searchParams.get('from');
  const to = searchParams.get('to');
  const date = searchParams.get('date');

  useEffect(() => {
    const fetchResults = async () => {
      if (!from || !to || !date) return;
      try {
        const response = await trainApi.search(from, to, date);
        // Transform API response if necessary to match SearchResult type
        // For now assuming API returns compatible list
        setResults(response.data);
      } catch (err) {
        console.error("Failed to fetch trains:", err);
      }
    };
    fetchResults();
  }, [from, to, date]);

  const filteredResults = directOnly
    ? results.filter(r => r.isDirect)
    : results;

  const handleCheckAvailability = (result: SearchResult) => {
    const params = new URLSearchParams({
      trainId: result.trainId.toString(),
      from: result.sourceStationId.toString(),
      to: result.destStationId.toString(),
      fromCode: result.sourceStationCode,
      toCode: result.destStationCode,
      date: date || '',
      price: result.price.toString(),
    });
    navigate(`/seats?${params.toString()}`);
  };

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
            <h1 className="font-display text-3xl font-bold mb-2">
              Trains from <span className="gradient-text">{from}</span> to <span className="gradient-text">{to}</span>
            </h1>
            <p className="text-muted-foreground">
              {filteredResults.length} trains found for {date}
            </p>
          </motion.div>

          {/* Filter Bar */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card p-4 mb-6 flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">Filters</span>
            </div>
            <div className="flex items-center gap-3">
              <Label htmlFor="direct-only" className="text-sm cursor-pointer">
                Show Direct Trains Only
              </Label>
              <Switch
                id="direct-only"
                checked={directOnly}
                onCheckedChange={setDirectOnly}
              />
            </div>
          </motion.div>

          {/* Split View */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Train List */}
            <div className="space-y-4">
              {filteredResults.map((result, index) => (
                <TrainCard
                  key={result.trainId}
                  result={result}
                  isSelected={selectedTrain?.trainId === result.trainId}
                  onSelect={() => setSelectedTrain(result)}
                  onCheckAvailability={() => handleCheckAvailability(result)}
                />
              ))}

              {filteredResults.length === 0 && (
                <div className="glass-card p-12 text-center">
                  <p className="text-muted-foreground">No trains found matching your criteria</p>
                </div>
              )}
            </div>

            {/* Route Visualization */}
            <div className="hidden lg:block sticky top-24 h-[calc(100vh-8rem)]">
              <RouteVisualization result={selectedTrain} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchResults;
