import { motion } from 'framer-motion';
import { Clock, IndianRupee, Train, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SearchResult } from '@/types';
import { cn } from '@/lib/utils';

interface TrainCardProps {
  result: SearchResult;
  isSelected: boolean;
  onSelect: () => void;
  onCheckAvailability: () => void;
}

const TrainCard = ({ result, isSelected, onSelect, onCheckAvailability }: TrainCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      whileHover={{ scale: 1.02 }}
      onClick={onSelect}
      className={cn(
        "glass-card p-4 cursor-pointer transition-all duration-300",
        isSelected && "ring-2 ring-primary glow"
      )}
    >
      <div className="flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <Train className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold">{result.trainName}</h3>
              <p className="text-sm text-muted-foreground">#{result.trainNumber}</p>
            </div>
          </div>
          <Badge variant={result.isDirect ? "default" : "secondary"} className={result.isDirect ? "bg-blue-500 hover:bg-blue-600" : ""}>
            {result.isDirect ? 'Direct' : 'Via'}
          </Badge>
        </div>

        {/* Time & Route */}
        <div className="flex items-center justify-between">
          <div className="text-center">
            <p className="text-2xl font-bold">{result.sourceTime}</p>
            <p className="text-xs text-muted-foreground">{result.sourceStationCode}</p>
          </div>
          <div className="flex-1 px-4">
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
              <div className="flex items-center gap-1 text-xs">
                <Clock className="w-3 h-3" />
                {result.duration}
              </div>
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
            </div>
            <ArrowRight className="w-4 h-4 mx-auto mt-1 text-primary" />
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold">{result.destTime}</p>
            <p className="text-xs text-muted-foreground">{result.destStationCode}</p>
          </div>
        </div>

        {/* Price & Action */}
        <div className="flex items-center justify-between pt-2 border-t border-border">
          <div className="flex items-center gap-1">
            <IndianRupee className="w-4 h-4 text-primary" />
            <span className="text-xl font-bold">{result.price}</span>
            <span className="text-sm text-muted-foreground">/seat</span>
          </div>
          <Button
            variant="hero"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onCheckAvailability();
            }}
          >
            Check Availability
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default TrainCard;
