import React from 'react';
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from './ui/button';

export const LoadingCard: React.FC<{ style?: React.CSSProperties }> = ({ style }) => (
  <div className="rounded-2xl border border-transparent bg-white shadow-soft dark:bg-slate-800 dark:border-slate-700 flex items-center justify-center overflow-hidden" style={style}>
    <div className="flex flex-col items-center gap-3">
      <div className="p-4 bg-primary/10 rounded-full">
         <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
      <p className="text-sm text-muted-foreground animate-pulse font-medium">Generowanie...</p>
    </div>
  </div>
);

export const ErrorCard: React.FC<{ onRegenerate: () => void; style?: React.CSSProperties }> = ({ onRegenerate, style }) => (
  <div className="rounded-2xl border border-destructive/20 bg-destructive/5 dark:bg-destructive/10 flex items-center justify-center overflow-hidden" style={style}>
    <div className="flex flex-col items-center gap-3 p-4 text-center">
      <AlertCircle className="w-10 h-10 text-destructive mb-1" />
      <p className="text-sm text-destructive font-semibold">Błąd generowania</p>
      <Button variant="outline" size="sm" onClick={onRegenerate} className="mt-2 bg-white dark:bg-transparent hover:bg-destructive/10 border-destructive/30 text-destructive">
        <RefreshCw className="w-3 h-3 mr-2" />
        Spróbuj ponownie
      </Button>
    </div>
  </div>
);