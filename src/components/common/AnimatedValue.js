import React, { useState, useEffect, useRef } from 'react';

/**
 * A component that animates value changes with smooth transitions
 * @param {Object} props Component props
 * @param {number|string} props.value The value to display and animate
 * @param {string} props.type The type of value ('money', 'percentage', or 'number')
 * @param {string} props.className Additional CSS classes
 * @param {boolean} props.showSign Whether to show +/- sign for changes
 */
const AnimatedValue = ({ value, type = 'number', className = '', showSign = true }) => {
  const [displayValue, setDisplayValue] = useState(value);
  const [isAnimating, setIsAnimating] = useState(false);
  const previousValue = useRef(value);
  
  useEffect(() => {
    // Skip animation on first render
    if (previousValue.current !== value) {
      setIsAnimating(true);
      
      // After animation completes, update the display value
      const timeout = setTimeout(() => {
        setDisplayValue(value);
        setIsAnimating(false);
      }, 500); // Match this to animation duration in CSS
      
      return () => clearTimeout(timeout);
    }
    
    // Store the current value as previous for next comparison
    previousValue.current = value;
  }, [value]);
  
  // Format the value based on type
  const formatValue = (val) => {
    // Проверка на undefined и null
    if (val === undefined || val === null) {
      return '0';
    }
    
    switch (type) {
      case 'money':
        return formatMoney(val);
      case 'percentage':
        return formatPercentage(val);
      default:
        return val.toString();
    }
  };
  
  // Format as money with $ sign and 2 decimal places
  const formatMoney = (val) => {
    const numVal = parseFloat(val);
    return `$${Math.abs(numVal).toFixed(2)}`;
  };
  
  // Format as percentage with % sign
  const formatPercentage = (val) => {
    const numVal = parseFloat(val);
    return `${Math.abs(numVal).toFixed(2)}%`;
  };
  
  // Determine if value increased, decreased, or stayed the same
  const getChangeType = () => {
    const current = parseFloat(value);
    const previous = parseFloat(previousValue.current);
    
    if (current > previous) return 'increase';
    if (current < previous) return 'decrease';
    return 'same';
  };
  
  // Get sign (+ or -) based on change
  const getSign = () => {
    const changeType = getChangeType();
    if (!showSign) return '';
    if (changeType === 'increase') return '+';
    if (changeType === 'decrease') return '-';
    return '';
  };
  
  // Determine CSS class based on change type
  const getChangeClass = () => {
    const changeType = getChangeType();
    
    if (changeType === 'increase') return 'percentage-increase';
    if (changeType === 'decrease') return 'percentage-decrease';
    return '';
  };
  
  return (
    <span className={`${className} ${isAnimating ? 'number-change' : ''} ${getChangeClass()}`}>
      {getSign()}{formatValue(displayValue)}
    </span>
  );
};

export default AnimatedValue; 