import React, { useState, useEffect } from 'react';
import { FiShield, FiCalendar, FiDollarSign, FiPercent } from 'react-icons/fi';
import { cardGradients } from '../../utils/gradients';

/**
 * Компонент настроек риск-менеджмента
 */
const RiskManagementSettings = ({ 
  deposit, 
  leverage, 
  onSaveSettings,
  initialSettings = {
    tradingDaysPerMonth: 20,
    tradesPerDay: 10,
    updatePeriod: 'monthly',
    updateByGrowth: false,
    growthThreshold: 10,
    profitLimit: 60
  }
}) => {
  const [settings, setSettings] = useState(initialSettings);
  const [dailyDrawdownLimit, setDailyDrawdownLimit] = useState(0);
  const [tradeDrawdownLimit, setTradeDrawdownLimit] = useState(0);
  
  // Расчет лимитов просадки при изменении настроек
  useEffect(() => {
    const dailyLimit = deposit / settings.tradingDaysPerMonth;
    const tradeLimit = dailyLimit / settings.tradesPerDay;
    
    setDailyDrawdownLimit(dailyLimit);
    setTradeDrawdownLimit(tradeLimit);
  }, [deposit, settings.tradingDaysPerMonth, settings.tradesPerDay]);
  
  // Обработчик изменения настроек
  const handleSettingChange = (setting, value) => {
    setSettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };
  
  // Обработчик сохранения настроек
  const handleSave = () => {
    onSaveSettings(settings);
  };
  
  return (
    <div className="mac-card glassmorphism mb-6" style={{ 
      background: cardGradients.blue.medium,
      backdropFilter: "blur(10px)",
      WebkitBackdropFilter: "blur(10px)",
      borderColor: "rgba(59, 130, 246, 0.2)",
      color: 'var(--color-text-primary)'
    }}>
      <div className="flex items-center mb-4">
        <div className="p-2 rounded-lg mr-3" style={{ background: "rgba(59, 130, 246, 0.15)" }}>
          <FiShield className="text-xl text-blue-500" />
        </div>
        <h2 className="text-lg font-medium text-blue-500">Настройки риск-менеджмента</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {/* Количество торговых дней в месяце */}
        <div className="form-group">
          <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>
            Торговых дней в месяце
          </label>
          <div className="relative">
            <input
              type="number"
              className="form-input w-full rounded-lg"
              value={settings.tradingDaysPerMonth}
              onChange={(e) => handleSettingChange('tradingDaysPerMonth', parseInt(e.target.value) || 0)}
              min="1"
              max="31"
            />
          </div>
          <div className="mt-1 text-xs" style={{ color: 'var(--color-text-secondary)' }}>
            Лимит просадки на день: ${dailyDrawdownLimit.toFixed(2)}
          </div>
        </div>
        
        {/* Количество сделок в день */}
        <div className="form-group">
          <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>
            Сделок в день
          </label>
          <div className="relative">
            <input
              type="number"
              className="form-input w-full rounded-lg"
              value={settings.tradesPerDay}
              onChange={(e) => handleSettingChange('tradesPerDay', parseInt(e.target.value) || 0)}
              min="1"
              max="100"
            />
          </div>
          <div className="mt-1 text-xs" style={{ color: 'var(--color-text-secondary)' }}>
            Лимит просадки на сделку: ${tradeDrawdownLimit.toFixed(2)}
          </div>
        </div>
        
        {/* Период обновления риск-менеджмента */}
        <div className="form-group">
          <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>
            Период обновления
          </label>
          <div className="relative">
            <select
              className="form-select w-full rounded-lg"
              value={settings.updatePeriod}
              onChange={(e) => handleSettingChange('updatePeriod', e.target.value)}
            >
              <option value="monthly">Ежемесячно</option>
              <option value="biweekly">Раз в две недели</option>
              <option value="weekly">Еженедельно</option>
            </select>
          </div>
        </div>
        
        {/* Лимит прибыльных сделок */}
        <div className="form-group">
          <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>
            Лимит прибыльных сделок (%)
          </label>
          <div className="relative">
            <input
              type="number"
              className="form-input w-full rounded-lg"
              value={settings.profitLimit}
              onChange={(e) => handleSettingChange('profitLimit', parseInt(e.target.value) || 0)}
              min="1"
              max="100"
            />
          </div>
          <div className="mt-1 text-xs" style={{ color: 'var(--color-text-secondary)' }}>
            Рекомендуется прекратить торговлю при достижении этого процента
          </div>
        </div>
      </div>
      
      {/* Обновление по приросту депозита */}
      <div className="mb-4">
        <div className="flex items-center mb-2">
          <input
            type="checkbox"
            id="updateByGrowth"
            className="form-checkbox mr-2"
            checked={settings.updateByGrowth}
            onChange={(e) => handleSettingChange('updateByGrowth', e.target.checked)}
          />
          <label htmlFor="updateByGrowth" className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
            Обновлять при росте депозита
          </label>
        </div>
        
        {settings.updateByGrowth && (
          <div className="form-group ml-6">
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>
              Порог роста депозита (%)
            </label>
            <div className="relative">
              <input
                type="number"
                className="form-input w-full rounded-lg"
                value={settings.growthThreshold}
                onChange={(e) => handleSettingChange('growthThreshold', parseInt(e.target.value) || 0)}
                min="1"
                max="100"
              />
            </div>
          </div>
        )}
      </div>
      
      {/* Кнопка сохранения */}
      <div className="flex justify-end">
        <button
          className="btn-primary px-4 py-2 rounded-lg"
          onClick={handleSave}
        >
          Сохранить настройки
        </button>
      </div>
    </div>
  );
};

export default RiskManagementSettings; 