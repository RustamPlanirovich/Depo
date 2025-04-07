import React, { useState, useEffect } from 'react';
import { FiChevronDown, FiChevronRight } from 'react-icons/fi';

/**
 * CollapsibleSection - компонент для создания сворачиваемых секций
 */
const CollapsibleSection = ({ title, icon: Icon, children, defaultExpanded = true, sectionId }) => {
  // Получаем сохраненное состояние из localStorage или используем значение по умолчанию
  const [isExpanded, setIsExpanded] = useState(() => {
    if (sectionId) {
      const savedState = localStorage.getItem(`section_${sectionId}`);
      return savedState ? JSON.parse(savedState) : defaultExpanded;
    }
    return defaultExpanded;
  });

  // Сохраняем состояние в localStorage при изменении
  useEffect(() => {
    if (sectionId) {
      localStorage.setItem(`section_${sectionId}`, JSON.stringify(isExpanded));
    }
  }, [isExpanded, sectionId]);

  return (
    <div className="mb-6">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 rounded-lg transition-colors duration-200 hover:bg-gray-700/50"
      >
        <div className="flex items-center">
          {Icon && <Icon className="mr-2 text-xl" style={{ color: 'var(--color-accent)' }} />}
          <h2 className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>{title}</h2>
        </div>
        {isExpanded ? (
          <FiChevronDown className="text-xl" style={{ color: 'var(--color-text-secondary)' }} />
        ) : (
          <FiChevronRight className="text-xl" style={{ color: 'var(--color-text-secondary)' }} />
        )}
      </button>
      <div
        className={`transition-all duration-300 ease-in-out ${
          isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
        }`}
      >
        {children}
      </div>
    </div>
  );
};

export default CollapsibleSection; 