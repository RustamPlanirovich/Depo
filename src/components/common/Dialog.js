import React, { useRef, useEffect } from 'react';
import { FiX } from 'react-icons/fi';

/**
 * Dialog component for showing modal dialogs with macOS styling
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Whether the dialog is open
 * @param {string} props.title - Dialog title
 * @param {string} props.message - Dialog message
 * @param {Array} props.options - Array of option strings
 * @param {Function} props.onClose - Function to close the dialog
 * @param {Function} props.onOptionSelect - Function to handle option selection
 */
const Dialog = ({ isOpen, title, message, options = ['OK'], onClose, onOptionSelect, children }) => {
  const dialogRef = useRef(null);
  
  if (!isOpen) return null;

  // Handle option click
  const handleOptionClick = (option) => {
    if (onOptionSelect) {
      onOptionSelect(option);
    }
  };

  // Handle backdrop click (close dialog)
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Handle escape key press
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      
      // Focus the dialog when it opens for accessibility
      if (dialogRef.current) {
        dialogRef.current.focus();
      }
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 fade-in"
      onClick={handleBackdropClick}
      style={{ 
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        backdropFilter: 'blur(4px)',
      }}
    >
      <div
        ref={dialogRef}
        className="mac-card max-w-md w-full mx-4 md:mx-0 slide-up"
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        style={{ 
          maxHeight: '80vh',
          overflowY: 'auto'
        }}
      >
        <div className="flex justify-between items-center mb-4">
          {title && (
            <h2 className="text-xl font-medium" style={{ color: 'var(--color-text-primary)' }}>{title}</h2>
          )}
          
          <button
            onClick={onClose}
            className="rounded-full p-1 hover:bg-opacity-10 transition-colors"
            style={{ backgroundColor: 'var(--color-bg-tertiary)' }}
            aria-label="Close dialog"
          >
            <FiX size={18} style={{ color: 'var(--color-text-secondary)' }} />
          </button>
        </div>
        
        {message && (
          <p className="mb-6" style={{ color: 'var(--color-text-secondary)' }}>{message}</p>
        )}
        
        {children}
        
        {!children && (
          <div className="flex flex-col sm:flex-row sm:justify-end gap-3 mt-6">
            {options.map((option, index) => (
              <button
                key={index}
                className={index === 0 ? 'mac-button' : 'mac-button-secondary'}
                onClick={() => handleOptionClick(option)}
              >
                {option}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dialog; 