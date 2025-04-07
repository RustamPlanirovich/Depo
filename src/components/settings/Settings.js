import React, { useState, useEffect } from 'react';
import { exportDataToJson } from '../../utils/dataOperations';
import GlassmorphismSettings from './GlassmorphismSettings';
import { cardGradients } from '../../utils/gradients';

/**
 * Settings component - handle application configuration and data management
 */
const Settings = ({
  leverage,
  setLeverage,
  dailyTarget,
  setDailyTarget,
  initialDeposit,
  setInitialDeposit,
  deposit,
  setDeposit,
  days,
  setDays,
  archivedDays,
  setArchivedDays,
  goals,
  setGoals,
  setActiveSection
}) => {
  const [newLeverage, setNewLeverage] = useState(leverage);
  const [newDailyTarget, setNewDailyTarget] = useState(dailyTarget);
  const [newInitialDeposit, setNewInitialDeposit] = useState(initialDeposit);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [resetType, setResetType] = useState('all');
  
  // Добавляем состояние для гласморфизма
  const [glassmorphismStyle, setGlassmorphismStyle] = useState(() => {
    // Попытка загрузить сохраненный стиль из localStorage
    const savedStyle = localStorage.getItem('glassmorphismStyle');
    return savedStyle ? JSON.parse(savedStyle) : {
      key: 'blue_medium',
      value: cardGradients.blue.medium,
      blur: 10,
      opacity: 0.2
    };
  });
  
  // Сохраняем выбранный стиль в localStorage при изменении
  useEffect(() => {
    localStorage.setItem('glassmorphismStyle', JSON.stringify(glassmorphismStyle));
    
    // Добавляем стили CSS для применения гласморфизма глобально
    document.documentElement.style.setProperty('--glassmorphism-gradient', glassmorphismStyle.value);
    document.documentElement.style.setProperty('--glassmorphism-blur', `${glassmorphismStyle.blur}px`);
    document.documentElement.style.setProperty('--glassmorphism-opacity', glassmorphismStyle.opacity);
  }, [glassmorphismStyle]);
  
  // Handle saving new settings
  const handleSaveSettings = () => {
    if (newLeverage > 0 && newDailyTarget > 0 && newInitialDeposit > 0) {
      // Calculate the difference between new and old initial deposit
      const depositDifference = newInitialDeposit - initialDeposit;
      
      // Update settings
      setLeverage(newLeverage);
      setDailyTarget(newDailyTarget);
      setInitialDeposit(newInitialDeposit);
      
      // Recalculate all days based on the new initial deposit
      if (days.length > 0 && depositDifference !== 0) {
        // We need to recalculate all deposits in the days array
        const updatedDays = days.map((day, index) => {
          if (index === 0) {
            // First day is based directly on initial deposit
            return {
              ...day,
              deposit: newInitialDeposit + day.amount
            };
          } else {
            // For subsequent days, use the updated deposit from the previous day
            return {
              ...day,
              deposit: updatedDays[index - 1].deposit + day.amount
            };
          }
        });
        
        setDays(updatedDays);
      }
      
      alert('Настройки сохранены успешно!');
    } else {
      alert('Все значения должны быть больше нуля.');
    }
  };
  
  // Handle export data
  const handleExportData = () => {
    const dataToExport = {
      deposit,
      initialDeposit,
      leverage,
      dailyTarget,
      days,
      archivedDays,
      goals
    };
    
    exportDataToJson(dataToExport);
  };
  
  // Show reset confirmation
  const handleShowResetConfirm = (type) => {
    setResetType(type);
    setShowResetConfirm(true);
  };
  
  // Handle reset
  const handleReset = () => {
    switch (resetType) {
      case 'days':
        setDays([]);
        // Reset current deposit to match initial deposit
        setDeposit(initialDeposit);
        break;
      case 'archive':
        setArchivedDays([]);
        break;
      case 'goals':
        setGoals([]);
        break;
      case 'all':
        setDays([]);
        setArchivedDays([]);
        setGoals([]);
        setInitialDeposit(30);
        setLeverage(10);
        setDailyTarget(3);
        setDeposit(30); // Also reset current deposit
        // Update the input fields
        setNewInitialDeposit(30);
        setNewLeverage(10);
        setNewDailyTarget(3);
        break;
      default:
        break;
    }
    
    setShowResetConfirm(false);
  };
  
  // Handle glassmorphism style selection
  const handleGlassmorphismChange = (style) => {
    setGlassmorphismStyle(style);
  };
  
  return (
    <div>
      <h1 className="text-3xl font-bold text-blue-300 mb-6">Настройки</h1>
      
      {/* Glassmorphism Settings */}
      <GlassmorphismSettings 
        onSelectStyle={handleGlassmorphismChange}
        currentStyle={glassmorphismStyle}
      />
      
      {/* General Settings */}
      <div className="bg-gray-800 p-5 rounded-lg mb-6">
        <h2 className="text-xl font-semibold text-blue-300 mb-4">Общие настройки</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-gray-300 mb-2">Начальный депозит ($):</label>
            <input
              type="number"
              min="0.01"
              step="0.01"
              value={newInitialDeposit}
              onChange={(e) => setNewInitialDeposit(parseFloat(e.target.value) || 0)}
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded text-white"
            />
            <p className="text-gray-400 text-sm mt-1">Текущее значение: ${initialDeposit}</p>
          </div>
          
          <div>
            <label className="block text-gray-300 mb-2">Плечо (x):</label>
            <input
              type="number"
              min="1"
              step="1"
              value={newLeverage}
              onChange={(e) => setNewLeverage(parseFloat(e.target.value) || 0)}
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded text-white"
            />
            <p className="text-gray-400 text-sm mt-1">Текущее значение: {leverage}x</p>
          </div>
          
          <div>
            <label className="block text-gray-300 mb-2">Целевой процент в день (%):</label>
            <input
              type="number"
              min="0.01"
              step="0.01"
              value={newDailyTarget}
              onChange={(e) => setNewDailyTarget(parseFloat(e.target.value) || 0)}
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded text-white"
            />
            <p className="text-gray-400 text-sm mt-1">Текущее значение: {dailyTarget}%</p>
          </div>
          
          <div className="flex justify-end pt-2">
            <button
              onClick={handleSaveSettings}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Сохранить настройки
            </button>
          </div>
        </div>
      </div>
      
      {/* Data Management */}
      <div className="bg-gray-800 p-5 rounded-lg mb-6">
        <h2 className="text-xl font-semibold text-blue-300 mb-4">Управление данными</h2>
        
        <div className="space-y-4">
          <div>
            <h3 className="text-lg text-gray-300 mb-2">Экспорт/Импорт данных</h3>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleExportData}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Экспортировать данные
              </button>
              
              <button
                onClick={() => setActiveSection('dashboard')}
                className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
              >
                Импортировать данные
              </button>
            </div>
            <p className="text-gray-400 text-sm mt-1">
              Экспортируйте данные для резервного копирования или перенесите на другое устройство.
            </p>
          </div>
          
          <div className="border-t border-gray-700 pt-4 mt-2">
            <h3 className="text-lg text-gray-300 mb-2">Сброс данных</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
              <button
                onClick={() => handleShowResetConfirm('days')}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 opacity-80"
              >
                Очистить дни
              </button>
              
              <button
                onClick={() => handleShowResetConfirm('archive')}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 opacity-80"
              >
                Очистить архив
              </button>
              
              <button
                onClick={() => handleShowResetConfirm('goals')}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 opacity-80"
              >
                Очистить цели
              </button>
              
              <button
                onClick={() => handleShowResetConfirm('all')}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Сбросить все
              </button>
            </div>
            <p className="text-gray-400 text-sm mt-1">
              Внимание: Сброс данных приведет к необратимой потере информации. Рекомендуем сначала сделать экспорт.
            </p>
          </div>
        </div>
      </div>
      
      {/* App Info */}
      <div className="bg-gray-800 p-5 rounded-lg">
        <h2 className="text-xl font-semibold text-blue-300 mb-4">О приложении</h2>
        
        <div className="space-y-2 text-gray-300">
          <p><span className="text-gray-400">Версия:</span> 1.0.0</p>
          <p><span className="text-gray-400">Разработчик:</span> Трейдер</p>
          <p className="text-gray-400 text-sm mt-2">
            Приложение для отслеживания роста депозита и торговой статистики.
          </p>
        </div>
      </div>
      
      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg max-w-md w-full">
            <h3 className="text-xl font-medium mb-4 text-red-400">Подтверждение сброса</h3>
            
            <p className="text-white mb-6">
              {resetType === 'days' && 'Вы уверены, что хотите удалить все записи о торговых днях?'}
              {resetType === 'archive' && 'Вы уверены, что хотите очистить архив?'}
              {resetType === 'goals' && 'Вы уверены, что хотите удалить все цели?'}
              {resetType === 'all' && 'Вы уверены, что хотите полностью сбросить все данные приложения? Это действие нельзя отменить!'}
            </p>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600"
              >
                Отмена
              </button>
              
              <button
                onClick={handleReset}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Да, сбросить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings; 