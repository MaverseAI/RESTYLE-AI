import React from 'react';
import { Zap } from 'lucide-react';

interface UsageCounterProps {
  remaining: number;
  max: number;
}

export const UsageCounter: React.FC<UsageCounterProps> = ({ remaining, max }) => {
  return (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/50 border border-border backdrop-blur-md">
      <Zap className={`w-4 h-4 ${remaining > 0 ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground'}`} />
      <span className="text-sm font-medium">
        {remaining} / {max} Free Generations
      </span>
    </div>
  );
};