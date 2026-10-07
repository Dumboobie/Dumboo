import React from 'react';
import { 
  Utensils, 
  Car, 
  ShoppingBag, 
  Home, 
  Zap, 
  Film, 
  HeartPulse, 
  GraduationCap, 
  Heart, 
  MoreHorizontal,
  WalletCards,
  Trophy,
  Briefcase,
  TrendingUp,
  Store,
  Gift,
  Coins,
  Banknote,
  Building2,
  QrCode,
  CreditCard,
  Smartphone,
  Tag
} from 'lucide-react';

interface CategoryIconProps {
  name: string;
  className?: string;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({ name, className = 'w-5 h-5' }) => {
  switch (name) {
    case 'Utensils': return <Utensils className={className} />;
    case 'Car': return <Car className={className} />;
    case 'ShoppingBag': return <ShoppingBag className={className} />;
    case 'Home': return <Home className={className} />;
    case 'Zap': return <Zap className={className} />;
    case 'Film': return <Film className={className} />;
    case 'HeartPulse': return <HeartPulse className={className} />;
    case 'GraduationCap': return <GraduationCap className={className} />;
    case 'Heart': return <Heart className={className} />;
    case 'WalletCards': return <WalletCards className={className} />;
    case 'Trophy': return <Trophy className={className} />;
    case 'Briefcase': return <Briefcase className={className} />;
    case 'TrendingUp': return <TrendingUp className={className} />;
    case 'Store': return <Store className={className} />;
    case 'Gift': return <Gift className={className} />;
    case 'Coins': return <Coins className={className} />;
    case 'Banknote': return <Banknote className={className} />;
    case 'Building2': return <Building2 className={className} />;
    case 'QrCode': return <QrCode className={className} />;
    case 'CreditCard': return <CreditCard className={className} />;
    case 'Smartphone': return <Smartphone className={className} />;
    default: return <MoreHorizontal className={className} />;
  }
};
