import React from 'react';
import { Users, User, Heart } from 'lucide-react';
import { useScope } from '@/context/ScopeContext';
import type { ScopeSelectorProps, ScopeType } from '@/types/scope';

export const ScopeSelector: React.FC<ScopeSelectorProps> = ({
  className = '',
  disabled = false,
  loading: externalLoading = false,
  onScopeChange,
}) => {
  const {
    currentScope,
    setScope,
    isLoading: contextLoading,
    isPartnerConnected
  } = useScope();

  const isLoading = externalLoading || contextLoading;

  const handleScopeSelect = (scopeId: ScopeType) => {
    if (disabled || isLoading) return;
    setScope(scopeId);
    onScopeChange?.(scopeId);
  };

  return (
    <div className={`scope-selector w-fit ${className} ${disabled || isLoading ? 'opacity-50 pointer-events-none' : ''}`}>
      <div 
        className={`scope-option ${currentScope === 'ours' ? 'active' : ''}`} 
        onClick={() => handleScopeSelect('ours')}
      >
        <Users className="w-4 h-4" /> Shared
      </div>
      
      <div 
        className={`scope-option ${currentScope === 'mine' ? 'active' : ''}`} 
        onClick={() => handleScopeSelect('mine')}
      >
        <User className="w-4 h-4" /> Mine
      </div>

      {isPartnerConnected && (
        <div 
          className={`scope-option ${currentScope === 'partner' ? 'active' : ''}`} 
          onClick={() => handleScopeSelect('partner')}
        >
          <Heart className="w-4 h-4" /> Partner
        </div>
      )}
    </div>
  );
};

export default ScopeSelector;
