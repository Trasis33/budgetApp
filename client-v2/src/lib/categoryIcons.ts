import * as Icons from 'lucide-react';

// Common category icons mapped to Lucide icon names
export const CATEGORY_ICONS = [
  // Shopping & Food
  { name: 'shopping-cart', icon: Icons.ShoppingCart, label: 'Shopping Cart' },
  { name: 'shopping-bag', icon: Icons.ShoppingBag, label: 'Shopping Bag' },
  { name: 'utensils', icon: Icons.Utensils, label: 'Dining' },
  { name: 'coffee', icon: Icons.Coffee, label: 'Coffee' },
  { name: 'pizza', icon: Icons.Pizza, label: 'Pizza' },
  { name: 'apple', icon: Icons.Apple, label: 'Food' },
  
  // Home & Living
  { name: 'home', icon: Icons.Home, label: 'Home' },
  { name: 'bed', icon: Icons.Bed, label: 'Bedroom' },
  { name: 'sofa', icon: Icons.Sofa, label: 'Furniture' },
  { name: 'lamp-desk', icon: Icons.LampDesk, label: 'Lighting' },
  { name: 'box', icon: Icons.Package, label: 'Package' },
  { name: 'armchair', icon: Icons.Armchair, label: 'Furniture' },
  
  // Transportation
  { name: 'car', icon: Icons.Car, label: 'Car' },
  { name: 'bike', icon: Icons.Bike, label: 'Bike' },
  { name: 'bus', icon: Icons.Bus, label: 'Bus' },
  { name: 'plane', icon: Icons.Plane, label: 'Travel' },
  { name: 'train', icon: Icons.Train, label: 'Train' },
  { name: 'ship', icon: Icons.Ship, label: 'Ship' },
  { name: 'fuel', icon: Icons.Fuel, label: 'Fuel' },
  
  // Entertainment & Leisure
  { name: 'film', icon: Icons.Film, label: 'Movies' },
  { name: 'tv', icon: Icons.Tv, label: 'TV' },
  { name: 'gamepad', icon: Icons.Gamepad2, label: 'Gaming' },
  { name: 'music', icon: Icons.Music, label: 'Music' },
  { name: 'headphones', icon: Icons.Headphones, label: 'Audio' },
  { name: 'book', icon: Icons.Book, label: 'Books' },
  { name: 'palette', icon: Icons.Palette, label: 'Arts' },
  
  // Health & Fitness
  { name: 'heart', icon: Icons.Heart, label: 'Health' },
  { name: 'activity', icon: Icons.Activity, label: 'Activity' },
  { name: 'dumbbell', icon: Icons.Dumbbell, label: 'Fitness' },
  { name: 'hospital', icon: Icons.Hospital, label: 'Medical' },
  { name: 'pill', icon: Icons.Pill, label: 'Medicine' },
  
  // Utilities & Services
  { name: 'bolt', icon: Icons.Zap, label: 'Electricity' },
  { name: 'droplet', icon: Icons.Droplet, label: 'Water' },
  { name: 'flame', icon: Icons.Flame, label: 'Gas/Heat' },
  { name: 'wifi', icon: Icons.Wifi, label: 'Internet' },
  { name: 'smartphone', icon: Icons.Smartphone, label: 'Phone' },
  { name: 'mail', icon: Icons.Mail, label: 'Mail' },
  
  // Finance & Business
  { name: 'credit-card', icon: Icons.CreditCard, label: 'Payment' },
  { name: 'wallet', icon: Icons.Wallet, label: 'Wallet' },
  { name: 'banknote', icon: Icons.Banknote, label: 'Money' },
  { name: 'piggy-bank', icon: Icons.PiggyBank, label: 'Savings' },
  { name: 'landmark', icon: Icons.Landmark, label: 'Bank' },
  { name: 'briefcase', icon: Icons.Briefcase, label: 'Work' },
  
  // Personal & Fashion
  { name: 'shirt', icon: Icons.Shirt, label: 'Clothing' },
  { name: 'glasses', icon: Icons.Glasses, label: 'Accessories' },
  { name: 'watch', icon: Icons.Watch, label: 'Watch' },
  { name: 'sparkles', icon: Icons.Sparkles, label: 'Beauty' },
  { name: 'scissors', icon: Icons.Scissors, label: 'Grooming' },
  
  // Pets & Animals
  { name: 'dog', icon: Icons.Dog, label: 'Dog' },
  { name: 'cat', icon: Icons.Cat, label: 'Cat' },
  { name: 'fish', icon: Icons.Fish, label: 'Fish' },
  { name: 'rabbit', icon: Icons.Rabbit, label: 'Pet' },
  
  // Education & Work
  { name: 'graduation-cap', icon: Icons.GraduationCap, label: 'Education' },
  { name: 'book-open', icon: Icons.BookOpen, label: 'Study' },
  { name: 'backpack', icon: Icons.Backpack, label: 'School' },
  { name: 'pencil', icon: Icons.Pencil, label: 'Writing' },
  
  // Gifts & Celebrations
  { name: 'gift', icon: Icons.Gift, label: 'Gifts' },
  { name: 'cake', icon: Icons.Cake, label: 'Party' },
  { name: 'party-popper', icon: Icons.PartyPopper, label: 'Celebration' },
  { name: 'heart-handshake', icon: Icons.HeartHandshake, label: 'Charity' },
  
  // General
  { name: 'tag', icon: Icons.Tag, label: 'General' },
  { name: 'star', icon: Icons.Star, label: 'Favorite' },
  { name: 'circle', icon: Icons.Circle, label: 'Basic' },
  { name: 'more-horizontal', icon: Icons.MoreHorizontal, label: 'Other' },
] as const;

export function getIconByName(iconName?: string) {
  if (!iconName) return Icons.Tag;
  const found = CATEGORY_ICONS.find(i => i.name === iconName);
  return found?.icon || Icons.Tag;
}

export function getIconLabel(iconName?: string) {
  if (!iconName) return 'Tag';
  const found = CATEGORY_ICONS.find(i => i.name === iconName);
  return found?.label || 'Tag';
}
