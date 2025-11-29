import React from 'react';
import { LucideIcon } from 'lucide-react';

/**
 * Standardized icon utilities for consistent styling across components
 */

export interface IconStyleOptions {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'category' | 'ui' | 'avatar';
  backgroundColor?: string;
  color?: string;
}

export const ICON_SIZES = {
  xs: 'h-3 w-3',
  sm: 'h-4 w-4', 
  md: 'h-5 w-5',
  lg: 'h-6 w-6',
  xl: 'h-8 w-8'
} as const;

export const ICON_CONTAINER_SIZES = {
  xs: 'w-6 h-6',
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
  lg: 'w-12 h-12',
  xl: 'w-14 h-14'
} as const;

/**
 * Convert hex color to rgba with standardized opacity
 */
export const hexToRgba = (hex: string, alpha: number = 0.2): string => {
  const cleanedHex = hex.replace('#', '');
  const r = parseInt(cleanedHex.slice(0, 2), 16);
  const g = parseInt(cleanedHex.slice(2, 4), 16);
  const b = parseInt(cleanedHex.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

/**
 * Get standardized icon styling for categories
 */
export const getCategoryIconStyle = (categoryColor: string, isSelected: boolean = false, opacity: number = 0.2) => {
  const bgOpacity = isSelected ? 1 : opacity;
  const backgroundColor = isSelected ? categoryColor : hexToRgba(categoryColor, bgOpacity);
  const color = isSelected ? 'white' : categoryColor;
  
  return {
    backgroundColor,
    color,
    borderColor: isSelected ? 'transparent' : categoryColor,
    boxShadow: isSelected ? `0 10px 15px -3px ${hexToRgba(categoryColor, 0.3)}` : undefined
  };
};

/**
 * Get standardized icon container classes
 */
export const getIconContainerClasses = (size: IconStyleOptions['size'] = 'md', variant: IconStyleOptions['variant'] = 'category') => {
  const sizeClasses = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8', 
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-14 h-14'
  };

  const variantClasses = {
    category: 'rounded-xl flex items-center justify-center transition-all',
    ui: 'flex items-center justify-center',
    avatar: 'rounded-full flex items-center justify-center text-xs font-bold'
  };

  return `${sizeClasses[size]} ${variantClasses[variant]}`;
};

/**
 * Get standardized icon classes
 */
export const getIconClasses = (size: IconStyleOptions['size'] = 'md') => {
  return ICON_SIZES[size];
};

/**
 * Complete icon props for consistent rendering
 */
export interface IconProps {
  icon: LucideIcon;
  color?: string;
  size?: IconStyleOptions['size'];
  variant?: IconStyleOptions['variant'];
  isSelected?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Standardized icon component
 */
export const StandardIcon = ({ 
  icon: Icon, 
  color, 
  size = 'md', 
  variant = 'category',
  isSelected = false,
  className = '',
  style = {}
}: IconProps) => {
  const containerStyle = color ? getCategoryIconStyle(color, isSelected) : {};
  const containerClasses = getIconContainerClasses(size, variant);
  const iconClasses = getIconClasses(size);

  return React.createElement(
    'div',
    {
      className: `${containerClasses} ${className}`,
      style: { ...containerStyle, ...style }
    },
    React.createElement(Icon, { className: iconClasses })
  );
};
