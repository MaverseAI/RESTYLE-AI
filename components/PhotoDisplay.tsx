import React from 'react';
import { RectangleHorizontal, Square, RectangleVertical, RefreshCw } from 'lucide-react';
import { Button } from './ui/button';

interface PhotoDisplayProps {
  era: string;
  imageUrl: string;
  onDownload: (url: string, era: string, ratio: string) => void;
  onRegenerate: () => void;
  style?: React.CSSProperties;
}

export const PhotoDisplay: React.FC<PhotoDisplayProps> = ({ era, imageUrl, onDownload, onRegenerate, style }) => {
  return (
    <div className="relative group rounded-xl overflow-hidden border border-border bg-black/50" style={style}>
      <img src={imageUrl} alt={era} className="w-full h-full object-cover" />
      
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center p-4">
        <p className="text-white font-semibold text-center mb-4">{era}</p>
        
        <div className="flex flex-col items-center gap-2">
            <span className="text-white/90 text-xs font-semibold uppercase tracking-wider">Pobierz:</span>
            <div className="flex gap-4 items-end">
                <div className="flex flex-col items-center gap-1 group/btn">
                    <Button size="icon" variant="secondary" className="hover:scale-110 transition-transform" onClick={() => onDownload(imageUrl, era, "4:3")} title="Pobierz poziomo (4:3)">
                        <RectangleHorizontal className="w-4 h-4" />
                    </Button>
                    <span className="text-[10px] text-white/70 font-medium">4:3</span>
                </div>
                
                <div className="flex flex-col items-center gap-1 group/btn">
                    <Button size="icon" variant="secondary" className="hover:scale-110 transition-transform" onClick={() => onDownload(imageUrl, era, "1:1")} title="Pobierz kwadrat (1:1)">
                        <Square className="w-4 h-4" />
                    </Button>
                    <span className="text-[10px] text-white/70 font-medium">1:1</span>
                </div>

                <div className="flex flex-col items-center gap-1 group/btn">
                    <Button size="icon" variant="secondary" className="hover:scale-110 transition-transform" onClick={() => onDownload(imageUrl, era, "3:4")} title="Pobierz pionowo (3:4)">
                        <RectangleVertical className="w-4 h-4" />
                    </Button>
                    <span className="text-[10px] text-white/70 font-medium">3:4</span>
                </div>
            </div>
        </div>

        <div className="mt-6 pt-4 border-t border-white/10 w-full flex justify-center">
             <Button size="sm" variant="outline" className="bg-black/50 border-white/30 text-white hover:bg-white hover:text-black transition-colors" onClick={onRegenerate} title="Regeneruj">
                <RefreshCw className="w-3 h-3 mr-2" />
                Generuj ponownie
            </Button>
        </div>
      </div>
    </div>
  );
};