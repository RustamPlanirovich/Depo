import React from 'react';

/**
 * Dialog component for showing modal dialogs
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Whether the dialog is open
 * @param {string} props.title - Dialog title
 * @param {string} props.message - Dialog message
 * @param {Array} props.options - Array of option strings
 * @param {Function} props.onClose - Function to close the dialog
 * @param {Function} props.onOptionSelect - Function to handle option selection
 */
const Dialog = ({ isOpen, title, message, options = ['OK'], onClose, onOptionSelect }) => {
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
  React.useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
      onClick={handleBackdropClick}
    >
      <div
        className="bg-gray-800 p-6 rounded-lg shadow-xl max-w-md w-full mx-4 md:mx-0"
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <h2 className="text-xl font-bold mb-4 text-white">{title}</h2>
        )}
        
        {message && (
          <p className="mb-6 text-gray-300">{message}</p>
        )}
        
        <div className="flex flex-col sm:flex-row sm:justify-end gap-3">
          {options.map((option, index) => (
            <button
              key={index}
              className={`px-4 py-2 rounded-md transition-colors ${
                index === 0
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-gray-700 hover:bg-gray-600 text-white'
              }`}
              onClick={() => handleOptionClick(option)}
            >
              {option}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dialog; 