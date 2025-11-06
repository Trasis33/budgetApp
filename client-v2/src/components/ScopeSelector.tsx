import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronDown, Users, User, Heart, Check } from 'lucide-react';
import { useScope } from '@/context/ScopeContext';
import type { ScopeSelectorProps, ScopeType } from '@/types/scope';

const SCOPE_ICONS = {
  ours: Users,
  mine: User,
  partner: Heart
} as const;

const SCOPE_DESCRIPTIONS = {
  ours: 'Shared expenses and combined finances',
  mine: 'Personal expenses and individual finances',
  partner: "Partner's personal expenses and finances"
} as const;

export const ScopeSelector: React.FC<ScopeSelectorProps> = ({
  className = '',
  disabled = false,
  loading: externalLoading = false,
  showLabels = true,
  showDescriptions = false,
  size = 'md',
  variant = 'default',
  onScopeChange,
  filter
}) => {
  const {
    currentScope,
    scopes,
    setScope,
    isLoading: contextLoading,
    isPartnerConnected
  } = useScope();

  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const isLoading = externalLoading || contextLoading;
  const filteredScopes = filter ? scopes.filter(filter) : scopes;

  const handleScopeSelect = useCallback((scopeId: ScopeType) => {
    setScope(scopeId);
    setIsOpen(false);
    onScopeChange?.(scopeId);
  }, [setScope, onScopeChange]);

  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (disabled || isLoading) return;

    switch (event.key) {
      case 'Enter':
      case ' ':
        if (isOpen) {
          event.preventDefault();
          handleScopeSelect(filteredScopes[highlightedIndex]?.id);
        } else {
          event.preventDefault();
          setIsOpen(true);
        }
        break;

      case 'ArrowDown':
        event.preventDefault();
        if (isOpen) {
          setHighlightedIndex(prev => (prev + 1) % filteredScopes.length);
        } else {
          setIsOpen(true);
        }
        break;

      case 'ArrowUp':
        event.preventDefault();
        if (isOpen) {
          setHighlightedIndex(prev => 
            prev === 0 ? filteredScopes.length - 1 : prev - 1
          );
        } else {
          setIsOpen(true);
        }
        break;

      case 'Escape':
        event.preventDefault();
        setIsOpen(false);
        buttonRef.current?.focus();
        break;

      case 'Tab':
        setIsOpen(false);
        break;
    }
  }, [disabled, isLoading, isOpen, highlightedIndex, filteredScopes, handleScopeSelect]);

  useEffect(() => {
    if (isOpen && highlightedIndex >= 0 && itemRefs.current[highlightedIndex]) {
      itemRefs.current[highlightedIndex]?.focus();
    }
  }, [isOpen, highlightedIndex]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (buttonRef.current && !buttonRef.current.contains(event.target as Node) &&
          listRef.current && !listRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentScopeConfig = scopes.find(s => s.id === currentScope);

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-5 py-3 text-lg'
  } as const;

  const variantClasses = {
    default: 'bg-white border border-gray-200 rounded-lg shadow-sm hover:border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
    pills: 'bg-gray-100 border-0 rounded-full hover:bg-gray-200 focus:ring-2 focus:ring-blue-500',
    dropdown: 'bg-white border border-gray-200 rounded-md shadow-sm hover:border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
  } as const;

  if (variant === 'pills') {
    return (
      <div 
        className={`inline-flex p-1 bg-gray-100 rounded-full ${className}`}
        role="radiogroup"
        aria-label="Budget scope selection"
      >
        {filteredScopes.map((scope, index) => {
          const Icon = SCOPE_ICONS[scope.id];
          const isActive = currentScope === scope.id;
          const isDisabled = disabled || (scope.requiresPartner && !isPartnerConnected);

          return (
            <button
              key={scope.id}
              ref={el => { itemRefs.current[index] = el; }}
              type="button"
              role="radio"
              aria-checked={isActive}
              aria-disabled={isDisabled}
              disabled={isDisabled}
              className={`
                inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all
                ${isActive 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
                }
                ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                ${sizeClasses[size]}
              `}
              onClick={() => !isDisabled && handleScopeSelect(scope.id)}
              onKeyDown={handleKeyDown}
            >
              <Icon className="w-4 h-4" />
              {showLabels && scope.label}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <button
        ref={buttonRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-labelledby="scope-selector-label"
        disabled={disabled || isLoading}
        className={`
          inline-flex items-center justify-between w-full min-w-[200px]
          ${sizeClasses[size]}
          ${variantClasses[variant]}
          ${disabled || isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          transition-colors duration-200
        `}
        onClick={() => !disabled && !isLoading && setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
      >
        <div className="flex items-center gap-2">
          {currentScopeConfig && (
            <>
              {(() => {
                const Icon = SCOPE_ICONS[currentScopeConfig.id];
                return <Icon className="w-4 h-4 text-gray-500" />;
              })()}
              {showLabels && (
                <span className="font-medium text-gray-900">
                  {currentScopeConfig.label}
                </span>
              )}
            </>
          )}
        </div>
        
        <ChevronDown 
          className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
            isOpen ? 'transform rotate-180' : ''
          }`} 
        />
      </button>

      {isOpen && (
        <ul
          ref={listRef}
          role="listbox"
          aria-labelledby="scope-selector-label"
          aria-activedescendant={`scope-option-${highlightedIndex}`}
          className={`
            absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg
            ${variant === 'dropdown' ? 'rounded-md' : 'rounded-lg'}
            max-h-60 overflow-auto
          `}
        >
          {filteredScopes.map((scope, index) => {
            const Icon = SCOPE_ICONS[scope.id];
            const isActive = currentScope === scope.id;
            const isHighlighted = index === highlightedIndex;
            const isDisabled = scope.requiresPartner && !isPartnerConnected;

            return (
              <li key={scope.id} role="presentation">
                <button
                  ref={el => { itemRefs.current[index] = el; }}
                  id={`scope-option-${index}`}
                  type="button"
                  role="option"
                  aria-selected={isActive}
                  disabled={isDisabled}
                  className={`
                    w-full px-4 py-3 text-left flex items-center gap-3 transition-colors
                    ${isActive 
                      ? 'bg-blue-50 text-blue-700 border-l-2 border-blue-500' 
                      : isHighlighted
                      ? 'bg-gray-50 text-gray-900'
                      : 'text-gray-700 hover:bg-gray-50'
                    }
                    ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                    ${index === 0 ? 'rounded-t-lg' : ''}
                    ${index === filteredScopes.length - 1 ? 'rounded-b-lg' : ''}
                  `}
                  onClick={() => !isDisabled && handleScopeSelect(scope.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      !isDisabled && handleScopeSelect(scope.id);
                    }
                  }}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-medium truncate">
                        {scope.label}
                      </span>
                      {isActive && (
                        <Check className="w-4 h-4 text-blue-500" />
                      )}
                    </div>
                    
                    {showDescriptions && (
                      <span className="text-sm text-gray-500 truncate block mt-1">
                        {SCOPE_DESCRIPTIONS[scope.id]}
                      </span>
                    )}
                    
                    {isDisabled && (
                      <span className="text-xs text-orange-600 block mt-1">
                        Requires partner connection
                      </span>
                    )}
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default ScopeSelector;
