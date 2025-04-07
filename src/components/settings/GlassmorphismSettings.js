import React, { useState } from 'react';
import { FiEye, FiStar, FiSquare } from 'react-icons/fi';
import { specialGradients, cardGradients } from '../../utils/gradients';

/**
 * GlassmorphismSettings - компонент для настройки стилей гласморфизма
 */
const GlassmorphismSettings = ({ onStyleChange, currentStyle }) => {
  const [selectedCategory, setSelectedCategory] = useState('card');
  const [blurLevel, setBlurLevel] = useState(10);
  const [opacity, setOpacity] = useState(0.2);
  
  // Категории градиентов
  const categories = [
    { id: 'card', name: 'Стандартные', icon: <FiSquare /> },
    { id: 'special', name: 'Специальные', icon: <FiStar /> }
  ];
  
  // Обработчик выбора градиента
  const handleSelectGradient = (gradientKey, gradientValue) => {
    onStyleChange({
      key: gradientKey,
      value: gradientValue,
      blur: blurLevel,
      opacity: opacity
    });
  };
  
  // Получение списка градиентов для выбранной категории
  const getGradients = () => {
    switch (selectedCategory) {
      case 'card':
        return Object.entries(cardGradients).reduce((acc, [colorKey, colorObj]) => {
          // Превращаем вложенный объект в плоский список
          Object.entries(colorObj).forEach(([intensityKey, gradientValue]) => {
            acc.push({
              key: `${colorKey}_${intensityKey}`,
              name: `${colorKey.charAt(0).toUpperCase() + colorKey.slice(1)} ${intensityKey}`,
              value: gradientValue
            });
          });
          return acc;
        }, []);
      case 'special':
        return Object.entries(specialGradients).map(([key, value]) => ({
          key,
          name: key.charAt(0).toUpperCase() + key.slice(1),
          value
        }));
      default:
        return [];
    }
  };
  
  return (
    <div className="mac-card mb-6">
      <h2 className="text-xl font-medium mb-4" style={{ color: 'var(--color-accent)' }}>Настройки гласморфизма</h2>
      
      {/* Селектор категорий */}
      <div className="flex space-x-2 mb-4">
        {categories.map(category => (
          <button
            key={category.id}
            className={`flex items-center px-3 py-2 rounded-md ${
              selectedCategory === category.id 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
            onClick={() => setSelectedCategory(category.id)}
          >
            <span className="mr-2">{category.icon}</span>
            {category.name}
          </button>
        ))}
      </div>
      
      {/* Настройки размытия и прозрачности */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm mb-2" style={{ color: 'var(--color-text-secondary)' }}>
            Размытие ({blurLevel}px)
          </label>
          <input
            type="range"
            min="0"
            max="20"
            value={blurLevel}
            onChange={(e) => setBlurLevel(parseInt(e.target.value))}
            className="w-full"
          />
        </div>
        <div>
          <label className="block text-sm mb-2" style={{ color: 'var(--color-text-secondary)' }}>
            Прозрачность ({opacity.toFixed(2)})
          </label>
          <input
            type="range"
            min="0"
            max="0.5"
            step="0.01"
            value={opacity}
            onChange={(e) => setOpacity(parseFloat(e.target.value))}
            className="w-full"
          />
        </div>
      </div>
      
      {/* Превью с эффектом */}
      <div className="mb-6">
        <p className="text-sm mb-2" style={{ color: 'var(--color-text-secondary)' }}>Предпросмотр:</p>
        <div 
          className="h-24 rounded-lg flex items-center justify-center glassmorphism"
          style={{
            background: currentStyle?.value || cardGradients.blue.medium,
            backdropFilter: `blur(${blurLevel}px)`,
            WebkitBackdropFilter: `blur(${blurLevel}px)`,
            border: `1px solid rgba(var(--color-border-rgb), ${opacity})`,
          }}
        >
          <div className="flex items-center">
            <FiEye className="mr-2 text-xl" />
            <span className="text-lg font-medium">Пример эффекта гласморфизма</span>
          </div>
        </div>
      </div>
      
      {/* Палитра градиентов */}
      <div>
        <p className="text-sm mb-2" style={{ color: 'var(--color-text-secondary)' }}>Выберите градиент:</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {getGradients().map(gradient => (
            <div
              key={gradient.key}
              className={`h-16 rounded-lg cursor-pointer hover:shadow-md transition-shadow ${
                currentStyle?.key === gradient.key ? 'ring-2 ring-blue-500' : ''
              }`}
              style={{
                background: gradient.value,
                border: '1px solid var(--color-border)'
              }}
              onClick={() => handleSelectGradient(gradient.key, gradient.value)}
            >
              <div className="h-full flex items-end p-2">
                <span className="text-xs font-medium truncate" style={{ color: 'var(--color-text-primary)' }}>
                  {gradient.name}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GlassmorphismSettings; 