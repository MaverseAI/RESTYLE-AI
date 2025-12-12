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
      whileHover={{ scale: 1.03, y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onSelect(id)}
      className={`relative cursor-pointer rounded-2xl p-5 transition-all duration-300 flex flex-col items-center text-center group h-full
        ${isSelected
          ? 'border-2 border-primary bg-primary/5 shadow-lg shadow-primary/10'
          : 'border border-transparent bg-white shadow-soft hover:shadow-xl dark:bg-slate-800 dark:border-slate-700 dark:hover:bg-slate-700 dark:hover:border-slate-600'
        }`}
    >
      <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-4 transition-all duration-300 ${
        isSelected 
          ? 'bg-primary text-white shadow-lg shadow-primary/30 scale-110' 
          : `${bgColor} ${color} group-hover:scale-110`
      }`}>
        <Icon className="w-7 h-7" />
      </div>
      <h3 className={`font-bold text-base mb-2 tracking-tight ${isSelected ? 'text-primary' : 'text-foreground'}`}>
        {name}
      </h3>
      <p className="text-xs text-muted-foreground leading-relaxed font-medium">
        {description}
      </p>
    </motion.div>
  );
};