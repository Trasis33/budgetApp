import { Check } from 'lucide-react';

interface ColorPickerProps {
  selectedColor?: string;
  onColorChange: (color: string) => void;
}

export function ColorPicker({ selectedColor, onColorChange }: ColorPickerProps) {
  // Use the existing theme colors from the CSS variables
  const colors = [
    { name: 'Amber', value: 'oklch(.646 .222 41.116)' },
    { name: 'Teal', value: 'oklch(.6 .118 184.704)' },
    { name: 'Indigo', value: 'oklch(.398 .07 227.392)' },
    { name: 'Yellow', value: 'oklch(.828 .189 84.429)' },
    { name: 'Golden', value: 'oklch(.769 .188 70.08)' },
    { name: 'Coral', value: 'oklch(.71 .18 16)' },
    { name: 'Violet', value: 'oklch(.74 .16 320)' },
    { name: 'Cyan', value: 'oklch(.7 .16 200)' },
    { name: 'Periwinkle', value: 'oklch(.78 .16 260)' },
    { name: 'Mint', value: 'oklch(.82 .12 140)' },
  ];

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium">Avatar Color</label>
      <div className="grid grid-cols-5 gap-2">
        {colors.map((color) => (
          <button
            key={color.value}
            type="button"
            onClick={() => onColorChange(color.value)}
            className={`
              relative w-12 h-12 rounded-full transition-all duration-200 
              hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2
              ${selectedColor === color.value 
                ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' 
                : 'hover:ring-1 hover:ring-gray-300'
              }
            `}
            style={{ backgroundColor: color.value }}
            title={color.name}
          >
            {selectedColor === color.value && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Check className="w-5 h-5 text-white drop-shadow-md" />
              </div>
            )}
          </button>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">
        Choose a color for your avatar that will be displayed across the app
      </p>
    </div>
  );
}
