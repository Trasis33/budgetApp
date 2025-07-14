/**
 * Smart text truncation with responsive tooltips
 * Implements WCAG-compliant truncation with graceful degradation
 */

import React, { useState, useEffect, useRef } from 'react';

/**
 * Responsive truncation configuration
 */
const TRUNCATION_CONFIG = {
  mobile: { chars: 25, lines: 1 },
  tablet: { chars: 40, lines: 1 },
  desktop: { chars: 60, lines: 1 },
  wide: { chars: 80, lines: 2 }
};

/**
 * Hook to detect container width for responsive truncation
 */
const useResponsiveTruncation = () => {
  const [breakpoint, setBreakpoint] = useState('desktop');
  
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 640) setBreakpoint('mobile');
      else if (width < 768) setBreakpoint('tablet');
      else if (width < 1024) setBreakpoint('desktop');
      else setBreakpoint('wide');
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  return TRUNCATION_CONFIG[breakpoint];
};

/**
 * Truncated text component with tooltip
 */
export const TruncatedText = ({ 
  text, 
  maxLength, 
  lines = 1,
  className = '',
  tooltipClassName = '',
  showTooltip = true,
  tooltipPosition = 'top'
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isTruncated, setIsTruncated] = useState(false);
  const textRef = useRef(null);
  const responsiveConfig = useResponsiveTruncation();
  
  const effectiveMaxLength = maxLength || responsiveConfig.chars;
  const effectiveLines = lines || responsiveConfig.lines;
  
  useEffect(() => {
    if (textRef.current) {
      const isOverflowing = textRef.current.scrollHeight > textRef.current.clientHeight ||
                           textRef.current.scrollWidth > textRef.current.clientWidth;
      setIsTruncated(isOverflowing || (text && text.length > effectiveMaxLength));
    }
  }, [text, effectiveMaxLength, effectiveLines]);
  
  const truncatedText = text && text.length > effectiveMaxLength 
    ? `${text.slice(0, effectiveMaxLength)}...`
    : text;
  
  const tooltipClasses = `
    absolute z-50 px-3 py-2 text-sm bg-gray-900 text-white rounded-md shadow-lg
    whitespace-normal max-w-xs break-words
    ${tooltipPosition === 'top' ? 'bottom-full left-1/2 transform -translate-x-1/2 mb-2' : ''}
    ${tooltipPosition === 'bottom' ? 'top-full left-1/2 transform -translate-x-1/2 mt-2' : ''}
    ${tooltipPosition === 'left' ? 'right-full top-1/2 transform -translate-y-1/2 mr-2' : ''}
    ${tooltipPosition === 'right' ? 'left-full top-1/2 transform -translate-y-1/2 ml-2' : ''}
    opacity-0 pointer-events-none transition-opacity duration-200
    ${isHovered && showTooltip && isTruncated ? 'opacity-100' : ''}
    ${tooltipClassName}
  `.trim();
  
  return (
    <div className="relative inline-block">
      <div
        ref={textRef}
        className={`${className} ${effectiveLines > 1 ? 'line-clamp-' + effectiveLines : 'truncate'}`}
        style={{ 
          display: '-webkit-box',
          WebkitLineClamp: effectiveLines > 1 ? effectiveLines : undefined,
          WebkitBoxOrient: 'vertical',
          overflow: effectiveLines > 1 ? 'hidden' : undefined
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        title={!showTooltip && isTruncated ? text : undefined}
      >
        {truncatedText}
      </div>
      
      {showTooltip && isTruncated && (
        <div className={tooltipClasses} role="tooltip">
          {text}
        </div>
      )}
    </div>
  );
};

/**
 * Table cell truncation for responsive tables
 */
export const TruncatedTableCell = ({ 
  text, 
  maxLength = 30,
  className = '',
  showTooltip = true 
}) => {
  return (
    <TruncatedText
      text={text}
      maxLength={maxLength}
      className={`text-sm text-gray-900 ${className}`}
      tooltipClassName="max-w-sm"
      showTooltip={showTooltip}
      tooltipPosition="top"
    />
  );
};

/**
 * Currency display with truncation
 */
export const TruncatedCurrency = ({ 
  amount, 
  currency = 'USD',
  maxLength = 15,
  className = '',
  showTooltip = true 
}) => {
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(value);
  };
  
  const formatted = formatCurrency(amount);
  
  return (
    <TruncatedText
      text={formatted}
      maxLength={maxLength}
      className={`font-medium text-gray-900 ${className}`}
      tooltipClassName="font-mono"
      showTooltip={showTooltip}
    />
  );
};

/**
 * Category name truncation with icon support
 */
export const TruncatedCategory = ({ 
  name, 
  icon,
  maxLength = 20,
  className = '',
  showTooltip = true 
}) => {
  return (
    <div className="flex items-center gap-2">
      {icon && <span className="flex-shrink-0">{icon}</span>}
      <TruncatedText
        text={name}
        maxLength={maxLength}
        className={`text-sm font-medium ${className}`}
        showTooltip={showTooltip}
      />
    </div>
  );
};

export default TruncatedText;