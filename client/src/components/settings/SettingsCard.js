import React from 'react';

const SettingsCard = ({ 
  children, 
  title, 
  badge, 
  className = '',
  padding = 'p-6' 
}) => {
  return (
    <div className={`relative rounded-3xl border border-slate-100 bg-white ${padding} shadow-md hover:shadow-lg transition-shadow ${className}`}>
      {(title || badge) && (
        <div className="flex items-center justify-between mb-4">
          {title && (
            <h2 className="text-lg font-semibold text-slate-900">
              {title}
            </h2>
          )}
          {badge && (
            <div className="text-xs">
              {badge}
            </div>
          )}
        </div>
      )}
      {children}
    </div>
  );
};

export default SettingsCard;
