import React, { useState } from 'react';
import { FiHelpCircle } from 'react-icons/fi';

/**
 * Компонент QuestionCircle - отображает знак вопроса с всплывающей подсказкой
 * @param {Object} props
 * @param {string} props.text - Текст подсказки
 * @param {string} [props.className] - Дополнительные CSS классы
 */
const QuestionCircle = ({ text, className = '' }) => {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className={`relative inline-block ${className}`}>
      <FiHelpCircle
        className="text-gray-400 hover:text-gray-600 transition-colors cursor-help"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onClick={() => setShowTooltip(!showTooltip)}
      />
      
      {showTooltip && (
        <div 
          className="absolute z-10 w-64 p-3 mt-2 text-sm rounded-lg shadow-lg text-left"
          style={{
            backgroundColor: 'var(--color-tooltip-bg, rgba(0, 0, 0, 0.8))',
            color: 'var(--color-tooltip-text, white)',
            left: '50%',
            transform: 'translateX(-50%)',
            top: '100%',
            backdropFilter: 'blur(5px)',
            WebkitBackdropFilter: 'blur(5px)',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}
        >
          <div className="absolute w-3 h-3 origin-center rotate-45"
            style={{
              backgroundColor: 'var(--color-tooltip-bg, rgba(0, 0, 0, 0.8))',
              top: '-6px',
              left: '50%',
              transform: 'translateX(-50%)',
              borderLeft: '1px solid rgba(255, 255, 255, 0.1)',
              borderTop: '1px solid rgba(255, 255, 255, 0.1)'
            }}
          />
          {text}
        </div>
      )}
    </div>
  );
};

export default QuestionCircle; 