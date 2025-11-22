// Predefined color palette for categories
export const CATEGORY_COLORS = [
  { name: 'Amber', value: '#F5510BFF', light: '#fffbeb', text: '#F5510BFF' },
  { name: 'Teal', value: '#0A9D8CFF', light: '#F0FDFAFF', text: '#0D9488FF' },
  { name: 'Indigo', value: '#0B4B60FF', light: '#eef2ff', text: '#0B4B60FF' },
  { name: 'Yellow', value: '#F6C40DFF', light: '#fefce8', text: '#F6C40DFF' },
  { name: 'Golden', value: '#F79F23FF', light: '#fefce8', text: '#F79F23FF' },
  { name: 'Coral', value: '#FB7782FF', light: '#fefce8', text: '#FB7782FF' },
  { name: 'Violet', value: '#DA81FDFF', light: '#fefce8', text: '#DA81FDFF' },
  { name: 'Cyan', value: '#0CB5C7FF', light: '#fefce8', text: '#0CB5C7FF' },
  { name: 'Mint', value: '#82E07BFF', light: '#fefce8', text: '#82E07BFF' },
  { name: 'Periwinkle', value: '#5EACFFFF', light: '#fefce8', text: '#5EACFFFF' },
/*   { name: 'Purple', value: '#a855f7', light: '#faf5ff', text: '#7c3aed' },
  { name: 'Pink', value: '#ec4899', light: '#fdf2f8', text: '#db2777' },
  { name: 'Red', value: '#ef4444', light: '#fef2f2', text: '#dc2626' },
  { name: 'Orange', value: '#f97316', light: '#fff7ed', text: '#ea580c' },
  { name: 'Amber', value: '#f59e0b', light: '#fffbeb', text: '#d97706' },
  { name: 'Yellow', value: '#eab308', light: '#fefce8', text: '#ca8a04' },
  { name: 'Lime', value: '#84cc16', light: '#f7fee7', text: '#65a30d' },
  { name: 'Green', value: '#22c55e', light: '#f0fdf4', text: '#16a34a' },
  { name: 'Emerald', value: '#10b981', light: '#ecfdf5', text: '#059669' },
  { name: 'Teal', value: '#14b8a6', light: '#f0fdfa', text: '#0d9488' },
  { name: 'Cyan', value: '#06b6d4', light: '#ecfeff', text: '#0891b2' },
  { name: 'Sky', value: '#0ea5e9', light: '#f0f9ff', text: '#0284c7' },
  { name: 'Blue', value: '#3b82f6', light: '#eff6ff', text: '#2563eb' },
  { name: 'Violet', value: '#8b5cf6', light: '#f5f3ff', text: '#7c3aed' },
  { name: 'Fuchsia', value: '#d946ef', light: '#fdf4ff', text: '#c026d3' },
  { name: 'Rose', value: '#f43f5e', light: '#fff1f2', text: '#e11d48' },
  { name: 'Slate', value: '#64748b', light: '#f8fafc', text: '#475569' }, */
];

export const DEFAULT_CATEGORY_COLOR = '#6366f1';

export function getCategoryColor(category: { color?: string }): string {
  return category.color || DEFAULT_CATEGORY_COLOR;
}

export function getCategoryColorShades(category: { color?: string }) {
  const color = getCategoryColor(category);
  const matchedColor = CATEGORY_COLORS.find(c => c.value === color);
  
  if (matchedColor) {
    return {
      primary: matchedColor.value,
      light: matchedColor.light,
      text: matchedColor.text,
    };
  }
  
  // Fallback for custom colors
  return {
    primary: color,
    light: `${color}20`, // Add alpha for light shade
    text: color,
  };
}
