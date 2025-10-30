import React, { useState, useMemo } from 'react';
import { X, Search } from 'lucide-react';
import { getAvailableIcons } from './categoryUtils';

const IconPickerModal = ({ isOpen, onClose, onSelectIcon, selectedIcon = '' }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const availableIcons = getAvailableIcons();

  const filteredIcons = useMemo(() => {
    if (!searchTerm) return availableIcons;
    
    const term = searchTerm.toLowerCase();
    return availableIcons.filter(icon => 
      icon.name.toLowerCase().includes(term) || 
      icon.key.toLowerCase().includes(term)
    );
  }, [searchTerm]);

  const handleIconSelect = (iconKey) => {
    onSelectIcon(iconKey);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl border border-slate-100 shadow-xl max-w-2xl w-full max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h3 className="text-lg font-semibold text-slate-900">Choose Category Icon</h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-lg hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="p-6 border-b border-slate-100">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search icons..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-100 focus:border-emerald-300"
            />
          </div>
        </div>

        {/* Icon Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          {filteredIcons.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-slate-500">No icons found for "{searchTerm}"</p>
            </div>
          ) : (
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
              {filteredIcons.map(({ key, name, IconComponent }) => {
                const isSelected = key === selectedIcon;
                
                return (
                  <button
                    key={key}
                    onClick={() => handleIconSelect(key)}
                    className={`group relative p-4 rounded-xl border-2 transition-all duration-200 hover:scale-105 ${
                      isSelected
                        ? 'border-emerald-300 bg-emerald-50 shadow-sm'
                        : 'border-slate-200 bg-white hover:border-emerald-300 hover:bg-emerald-50/50'
                    }`}
                    title={name}
                  >
                    <IconComponent className={`w-6 h-6 mx-auto ${
                      isSelected ? 'text-emerald-600' : 'text-slate-600 group-hover:text-emerald-600'
                    }`} />
                    
                    {/* Selection indicator */}
                    {isSelected && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white" />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-100 bg-slate-50/30">
          <div className="flex items-center justify-between text-sm text-slate-600">
            <span>{filteredIcons.length} icons available</span>
            {selectedIcon && (
              <span className="flex items-center gap-2">
                Selected: <strong className="text-slate-900">
                  {availableIcons.find(icon => icon.key === selectedIcon)?.name || selectedIcon}
                </strong>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default IconPickerModal;
