import React, { useState, useEffect } from 'react';

/**
 * An animated progress bar component with smooth transitions
 * @param {Object} props Component props
 * @param {number} props.value Current value (0-100)
 * @param {string} props.color Optional custom color (defaults to theme accent)
 * @param {number} props.height Optional height in pixels
 * @param {boolean} props.showPercentage Whether to show percentage text
 * @param {string} props.className Additional CSS classes
 */
const AnimatedProgressBar = ({
  value = 0,
  color,
  height = 8,
  showPercentage = false,
  className = ''
}) => {
  // Clamp value between 0-100
  const safeValue = Math.min(100, Math.max(0, value));
  const [animatedWidth, setAnimatedWidth] = useState(0);
  
  // Handle animation when value changes
  useEffect(() => {
    // Small delay to ensure the animation is visible
    const timeout = setTimeout(() => {
      setAnimatedWidth(safeValue);
    }, 50);
    
    return () => clearTimeout(timeout);
  }, [safeValue]);
  
  // Determine color class based on value
  const getColorClass = () => {
    if (color) return '';
    
    if (safeValue >= 100) return 'bg-green-500';
    if (safeValue >= 75) return 'bg-blue-500';
    if (safeValue >= 50) return 'bg-yellow-500';
    if (safeValue >= 25) return 'bg-orange-500';
    return 'bg-red-500';
  };
  
  return (
    <div className={`relative ${className}`}>
      <div 
        className="animated-progress-bar"
        style={{ height: `${height}px` }}
      >
        <div 
          className={`animated-progress-bar-fill ${color ? '' : getColorClass()}`}
          style={{ 
            width: `${animatedWidth}%`,
            backgroundColor: color || undefined,
            transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
        />
      </div>
      
      {showPercentage && (
        <div className="text-xs mt-1 text-right font-medium" style={{ color: 'var(--color-text-secondary)' }}>
          {Math.round(safeValue)}%
        </div>
      )}
    </div>
  );
};

export default AnimatedProgressBar; 