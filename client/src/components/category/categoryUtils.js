import {
  ShoppingCart,
  Shirt,
  Home as HomeIcon,
  Car,
  Utensils,
  Film,
  Heart,
  Box,
  Tag,
  Zap,
  Coffee,
  Gamepad2,
  Book,
  Music,
  Camera,
  Plane,
  Gift,
  Smartphone,
  Dumbbell,
  Pizza,
  Beer,
  Baby,
  GraduationCap,
  Stethoscope,
  Briefcase,
  Wrench,
  TreePine,
  Dog,
  Cat
} from 'lucide-react';

// Category icon mapping - extends the existing system from AddExpenseModal
export const CATEGORY_ICON_MAP = {
  // Existing icons
  shopping: ShoppingCart,
  food: Utensils,
  home: HomeIcon,
  transport: Car,
  entertainment: Film,
  healthcare: Heart,
  utilities: Box,
  default: Tag,
  other: Zap,
  
  // Additional icons for more variety
  coffee: Coffee,
  gaming: Gamepad2,
  books: Book,
  music: Music,
  photography: Camera,
  travel: Plane,
  gifts: Gift,
  electronics: Smartphone,
  fitness: Dumbbell,
  restaurants: Pizza,
  nightlife: Beer,
  baby: Baby,
  education: GraduationCap,
  medical: Stethoscope,
  business: Briefcase,
  maintenance: Wrench,
  nature: TreePine,
  pets: Dog,
  cats: Cat,
  clothing: Shirt
};

// Get all available icons for the picker
export const getAvailableIcons = () => {
  return Object.entries(CATEGORY_ICON_MAP).map(([key, IconComponent]) => ({
    key,
    name: key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1'),
    IconComponent
  }));
};

// Resolve category icon - reuses existing logic
export const resolveCategoryIcon = (iconName) => {
  if (!iconName) return Tag;
  const normalized = String(iconName).toLowerCase().replace(/\s+/g, '-');
  return CATEGORY_ICON_MAP[normalized] || Tag;
};

// Category validation utilities
export const validateCategoryName = (name, existingCategories = []) => {
  if (!name || !name.trim()) {
    return { valid: false, message: 'Category name is required' };
  }
  
  if (name.trim().length < 2) {
    return { valid: false, message: 'Category name must be at least 2 characters' };
  }
  
  if (name.trim().length > 30) {
    return { valid: false, message: 'Category name must be less than 30 characters' };
  }
  
  const isDuplicate = existingCategories.some(
    category => category.name.toLowerCase() === name.trim().toLowerCase()
  );
  
  if (isDuplicate) {
    return { valid: false, message: 'A category with this name already exists' };
  }
  
  return { valid: true, message: '' };
};

// System categories that shouldn't be editable/deletable
export const SYSTEM_CATEGORIES = [
  'Groceries',
  'Dining Out',
  'Transportation',
  'Shopping',
  'Entertainment',
  'Healthcare',
  'Utilities',
  'Housing'
];

export const isSystemCategory = (categoryName) => {
  return SYSTEM_CATEGORIES.includes(categoryName);
};

// Format category usage count
export const formatUsageCount = (count) => {
  if (count === 0) return 'No expenses';
  if (count === 1) return '1 expense';
  return `${count} expenses`;
};

// Sort categories by usage and name
export const sortCategories = (categories) => {
  return [...categories].sort((a, b) => {
    // System categories first
    const aIsSystem = isSystemCategory(a.name);
    const bIsSystem = isSystemCategory(b.name);
    
    if (aIsSystem && !bIsSystem) return -1;
    if (!aIsSystem && bIsSystem) return 1;
    
    // Then by usage count (descending)
    if (b.usage_count !== a.usage_count) {
      return (b.usage_count || 0) - (a.usage_count || 0);
    }
    
    // Finally by name
    return a.name.localeCompare(b.name);
  });
};
