import React from 'react';
import { 
  ShoppingBasket, 
  Clock, 
  Users, 
  Music, 
  Eye, 
  BrainCircuit, 
  Sparkles, 
  Shapes, 
  ListOrdered,
  Grid,
  Smile,
  Heart,
  HelpCircle,
  Gamepad2
} from 'lucide-react';

export const GAME_ICON_MAP = {
  ShoppingBasket,
  Clock,
  Users,
  Music,
  Eye,
  BrainCircuit,
  Sparkles,
  Shapes,
  ListOrdered,
  Grid,
  Smile,
  Heart,
  Gamepad2
};

export default function GameIcon({ icon, className = "w-7 h-7 text-[#2C5AA0]", size = 28 }) {
  if (React.isValidElement(icon)) {
    return icon;
  }

  if (typeof icon === 'function') {
    const Component = icon;
    return <Component className={className} size={size} />;
  }

  if (typeof icon === 'string') {
    const Component = GAME_ICON_MAP[icon] || BrainCircuit;
    return <Component className={className} size={size} />;
  }

  return <BrainCircuit className={className} size={size} />;
}
