import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface TemplateCardProps {
  id: string;
  name: string;
  icon: LucideIcon;
  description: string;
  isSelected: boolean;
  onSelect: (id: string) => void;
  color?: string;
  bgColor?: string;
}

export const TemplateCard: React.FC<TemplateCardProps> = ({ 
  id, 
  name, 
  icon: Icon, 
  description, 
  isSelected, 
  onSelect,
  color = "text-foreground",
  bgColor = "bg-muted"
}) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onSelect(id)}
      className={`relative cursor-pointer rounded-xl p-4 border-2 transition-all duration-300 flex flex-col items-center text-center group ${
        isSelected
          ? 'border-primary bg-primary/5 shadow-[0_0_20px_rgba(139,92,246,0.2)]'
          : 'border-border bg-card/50 hover:border-primary/30 hover:bg-card/80'
      }`}
    >
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-3 transition-colors duration-300 ${
        isSelected ? 'bg-primary text-white shadow-lg shadow-primary/30' : `${bgColor} ${color} group-hover:scale-110 transform transition-transform`
      }`}>
        <Icon className="w-6 h-6" />
      </div>
      <h3 className={`font-bold mb-1 ${isSelected ? 'text-primary' : 'text-foreground'}`}>
        {name}
      </h3>
      <p className="text-xs text-muted-foreground leading-relaxed">
        {description}
      </p>
    </motion.div>
  );
};