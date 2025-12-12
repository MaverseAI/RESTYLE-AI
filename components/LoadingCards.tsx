import React from 'react';
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from './ui/button';

export const LoadingCard: React.FC<{ style?: React.CSSProperties }> = ({ style }) => (
  <div className="rounded-xl border border-border bg-muted/30 flex items-center justify-center" style={style}>
    <div className="flex flex-col items-center gap-3">
      <Loader2 className="w-8 h-8 text-primary animate-spin" />
      <p className="text-sm text-muted-foreground animate-pulse">Generowanie...</p>
    </div>
  </div>
);

export const ErrorCard: React.FC<{ onRegenerate: () => void; style?: React.CSSProperties }> = ({ onRegenerate, style }) => (
  <div className="rounded-xl border border-destructive/50 bg-destructive/10 flex items-center justify-center" style={style}>
    <div className="flex flex-col items-center gap-3 p-4 text-center">
      <AlertCircle className="w-8 h-8 text-destructive" />
      <p className="text-sm text-destructive font-medium">Błąd generowania</p>
      <Button variant="outline" size="sm" onClick={onRegenerate} className="mt-2">
        <RefreshCw className="w-3 h-3 mr-2" />
        Spróbuj ponownie
      </Button>
    </div>
  </div>
);