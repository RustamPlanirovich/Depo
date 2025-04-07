import React, { useState, useEffect } from 'react';
import { exportDataToJson } from '../../utils/dataOperations';
import GlassmorphismSettings from './GlassmorphismSettings';
import RiskManagementSettings from './RiskManagementSettings';
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
  
  // Состояние для настроек риск-менеджмента
  const [riskSettings, setRiskSettings] = useState(() => {
    const savedSettings = localStorage.getItem('riskSettings');
    return savedSettings ? JSON.parse(savedSettings) : {
      tradingDaysPerMonth: 20,
      tradesPerDay: 10,
      updatePeriod: 'monthly',
      updateByGrowth: false,
      growthThreshold: 10,
      profitLimit: 60,
      lastUpdateDate: new Date().toISOString(),
      lastUpdateDeposit: deposit
    };
  });
  
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
  
  // Обработчик сохранения настроек риск-менеджмента
  const handleSaveRiskSettings = (settings) => {
    setRiskSettings(settings);
    localStorage.setItem('riskSettings', JSON.stringify(settings));
    alert('Настройки риск-менеджмента сохранены успешно!');
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
      goals,
      riskSettings
    };
    
    exportDataToJson(dataToExport);
  };
  
  // Handle show reset confirmation
  const handleShowResetConfirm = (type) => {
    setResetType(type);
    setShowResetConfirm(true);
  };
  
  // Handle reset
  const handleReset = () => {
    if (resetType === 'all') {
      // Reset all data
      setDeposit(initialDeposit);
      setDays([]);
      setArchivedDays([]);
      setGoals([]);
      setRiskSettings({
        tradingDaysPerMonth: 20,
        tradesPerDay: 10,
        updatePeriod: 'monthly',
        updateByGrowth: false,
        growthThreshold: 10,
        profitLimit: 60,
        lastUpdateDate: new Date().toISOString(),
        lastUpdateDeposit: initialDeposit
      });
    } else if (resetType === 'days') {
      // Reset only days
      setDays([]);
      setArchivedDays([]);
    } else if (resetType === 'goals') {
      // Reset only goals
      setGoals([]);
    }
    
    setShowResetConfirm(false);
    alert('Сброс выполнен успешно!');
  };
  
  // Handle glassmorphism change
  const handleGlassmorphismChange = (style) => {
    setGlassmorphismStyle(style);
  };
  
  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold mb-8" style={{ color: 'var(--color-text-primary)' }}>Настройки</h1>
      
      {/* Basic Settings */}
      <div className="mac-card fade-in" style={{ backgroundColor: 'var(--color-card)', color: 'var(--color-text-primary)' }}>
        <h2 className="text-xl font-medium mb-6" style={{ color: 'var(--color-accent)' }}>Основные настройки</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block mb-2" style={{ color: 'var(--color-text-secondary)' }}>
              Кредитное плечо
            </label>
            <input
              type="number"
              value={newLeverage}
              onChange={(e) => setNewLeverage(Number(e.target.value))}
              className="w-full p-2 rounded-md"
              style={{ 
                backgroundColor: 'var(--color-input)', 
                color: 'var(--color-text-primary)',
                border: '1px solid var(--color-border)'
              }}
            />
          </div>
          
          <div>
            <label className="block mb-2" style={{ color: 'var(--color-text-secondary)' }}>
              Дневная цель (%)
            </label>
            <input
              type="number"
              value={newDailyTarget}
              onChange={(e) => setNewDailyTarget(Number(e.target.value))}
              className="w-full p-2 rounded-md"
              style={{ 
                backgroundColor: 'var(--color-input)', 
                color: 'var(--color-text-primary)',
                border: '1px solid var(--color-border)'
              }}
            />
          </div>
          
          <div>
            <label className="block mb-2" style={{ color: 'var(--color-text-secondary)' }}>
              Начальный депозит
            </label>
            <input
              type="number"
              value={newInitialDeposit}
              onChange={(e) => setNewInitialDeposit(Number(e.target.value))}
              className="w-full p-2 rounded-md"
              style={{ 
                backgroundColor: 'var(--color-input)', 
                color: 'var(--color-text-primary)',
                border: '1px solid var(--color-border)'
              }}
            />
          </div>
          
          <button
            onClick={handleSaveSettings}
            className="w-full py-2 px-4 rounded-md text-white font-medium"
            style={{ backgroundColor: 'var(--color-accent)' }}
          >
            Сохранить настройки
          </button>
        </div>
      </div>
      
      {/* Risk Management Settings */}
      <RiskManagementSettings
        deposit={deposit}
        leverage={leverage}
        riskSettings={riskSettings}
        onSaveSettings={handleSaveRiskSettings}
      />
      
      {/* Glassmorphism Settings */}
      <GlassmorphismSettings
        currentStyle={glassmorphismStyle}
        onStyleChange={handleGlassmorphismChange}
      />
      
      {/* Data Management */}
      <div className="mac-card fade-in" style={{ backgroundColor: 'var(--color-card)', color: 'var(--color-text-primary)' }}>
        <h2 className="text-xl font-medium mb-6" style={{ color: 'var(--color-accent)' }}>Управление данными</h2>
        
        <div className="space-y-4">
          <button
            onClick={handleExportData}
            className="w-full py-2 px-4 rounded-md text-white font-medium"
            style={{ backgroundColor: 'var(--color-accent)' }}
          >
            Экспорт данных
          </button>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => handleShowResetConfirm('days')}
              className="py-2 px-4 rounded-md text-white font-medium"
              style={{ backgroundColor: 'var(--color-warning)' }}
            >
              Сбросить дни
            </button>
            
            <button
              onClick={() => handleShowResetConfirm('goals')}
              className="py-2 px-4 rounded-md text-white font-medium"
              style={{ backgroundColor: 'var(--color-warning)' }}
            >
              Сбросить цели
            </button>
            
            <button
              onClick={() => handleShowResetConfirm('all')}
              className="py-2 px-4 rounded-md text-white font-medium"
              style={{ backgroundColor: 'var(--color-danger)' }}
            >
              Сбросить все
            </button>
          </div>
        </div>
      </div>
      
      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Подтверждение сброса</h3>
            <p className="mb-6">
              {resetType === 'all' 
                ? 'Вы уверены, что хотите сбросить все данные? Это действие нельзя отменить.'
                : resetType === 'days'
                ? 'Вы уверены, что хотите сбросить все дни? Это действие нельзя отменить.'
                : 'Вы уверены, что хотите сбросить все цели? Это действие нельзя отменить.'}
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="py-2 px-4 rounded-md text-gray-600 font-medium"
              >
                Отмена
              </button>
              <button
                onClick={handleReset}
                className="py-2 px-4 rounded-md text-white font-medium"
                style={{ backgroundColor: 'var(--color-danger)' }}
              >
                Сбросить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings; 