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
    <div className="relative group rounded-xl overflow-hidden border border-border bg-black/50 w-full shadow-lg" style={style}>
      <img src={imageUrl} alt={era} className="w-full h-full object-cover" />
      
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center p-6 z-10 text-center">
        <p className="text-white font-bold text-lg md:text-xl mb-6 drop-shadow-md">{era}</p>
        
        <div className="flex flex-col items-center gap-2 mb-6">
            <span className="text-white/90 text-xs font-bold uppercase tracking-wider drop-shadow-sm">Pobierz:</span>
            <div className="flex gap-4 items-end justify-center">
                <div className="flex flex-col items-center gap-1 group/btn">
                    <Button size="icon" variant="secondary" className="hover:scale-110 transition-transform shadow-md" onClick={() => onDownload(imageUrl, era, "4:3")} title="Pobierz poziomo (4:3)">
                        <RectangleHorizontal className="w-5 h-5" />
                    </Button>
                    <span className="text-[10px] text-white/90 font-semibold drop-shadow-sm">4:3</span>
                </div>
                
                <div className="flex flex-col items-center gap-1 group/btn">
                    <Button size="icon" variant="secondary" className="hover:scale-110 transition-transform shadow-md" onClick={() => onDownload(imageUrl, era, "1:1")} title="Pobierz kwadrat (1:1)">
                        <Square className="w-5 h-5" />
                    </Button>
                    <span className="text-[10px] text-white/90 font-semibold drop-shadow-sm">1:1</span>
                </div>

                <div className="flex flex-col items-center gap-1 group/btn">
                    <Button size="icon" variant="secondary" className="hover:scale-110 transition-transform shadow-md" onClick={() => onDownload(imageUrl, era, "3:4")} title="Pobierz pionowo (3:4)">
                        <RectangleVertical className="w-5 h-5" />
                    </Button>
                    <span className="text-[10px] text-white/90 font-semibold drop-shadow-sm">3:4</span>
                </div>
            </div>
        </div>

        <div className="pt-4 border-t border-white/20 w-full max-w-xs flex justify-center">
             <Button size="sm" variant="outline" className="bg-black/50 border-white/30 text-white hover:bg-white hover:text-black transition-colors font-medium" onClick={onRegenerate} title="Regeneruj">
                <RefreshCw className="w-4 h-4 mr-2" />
                Generuj ponownie
            </Button>
        </div>
      </div>
    </div>
  );
};