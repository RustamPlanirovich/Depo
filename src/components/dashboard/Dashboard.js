import React, { useState, useEffect } from 'react';
import { formatNumber, formatPercentage } from '../../utils/calculations';
import AnimatedValue from '../common/AnimatedValue';
import AnimatedProgressBar from '../common/AnimatedProgressBar';
import StatsSummary from './StatsSummary';
import InputForm from './InputForm';
import RiskManagement from './RiskManagement';
import RiskCard from './RiskCard';
import { FiDollarSign, FiTrendingUp, FiTarget, FiShield } from 'react-icons/fi';
import { calculateNextUpdateDate, shouldUpdateByDepositGrowth } from '../../utils/riskManagement';

/**
 * Dashboard component - main page with key metrics and transaction form
 * Переведено на русский язык
 */
const Dashboard = ({
  deposit,
  leverage,
  initialDeposit,
  days,
  dailyTarget,
  inputMode,
  toggleInputMode,
  newPercentage,
  handlePercentageChange,
  newAmount,
  handleAmountChange,
  addDay,
  editingDayIndex,
  editingTransactionIndex,
  saveEditedDay,
  cancelEditing,
  onSaveRiskSettings
}) => {
  // Состояние для настроек риск-менеджмента
  const [riskSettings, setRiskSettings] = useState({
    tradingDaysPerMonth: 20,
    tradesPerDay: 10,
    updatePeriod: 'monthly',
    updateByGrowth: false,
    growthThreshold: 10,
    profitLimit: 60,
    lastUpdateDate: new Date().toISOString(),
    lastUpdateDeposit: deposit
  });
  
  // Загрузка настроек риск-менеджмента из localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem('riskSettings');
    if (savedSettings) {
      setRiskSettings(JSON.parse(savedSettings));
    }
  }, []);
  
  // Сохранение настроек риск-менеджмента в localStorage
  useEffect(() => {
    localStorage.setItem('riskSettings', JSON.stringify(riskSettings));
  }, [riskSettings]);
  
  // Проверка необходимости обновления риск-менеджмента
  useEffect(() => {
    const lastUpdate = new Date(riskSettings.lastUpdateDate);
    const nextUpdate = calculateNextUpdateDate(riskSettings.updatePeriod, lastUpdate);
    const shouldUpdate = new Date() >= nextUpdate || 
                        (riskSettings.updateByGrowth && 
                         shouldUpdateByDepositGrowth(deposit, riskSettings.lastUpdateDeposit, riskSettings.growthThreshold));
    
    if (shouldUpdate) {
      // Обновляем настройки риск-менеджмента
      const updatedSettings = {
        ...riskSettings,
        lastUpdateDate: new Date().toISOString(),
        lastUpdateDeposit: deposit
      };
      
      setRiskSettings(updatedSettings);
      if (onSaveRiskSettings) {
        onSaveRiskSettings(updatedSettings);
      }
    }
  }, [deposit, riskSettings, onSaveRiskSettings]);
  
  // Calculate total growth
  const totalGrowth = deposit - initialDeposit;
  const totalGrowthPercentage = ((deposit - initialDeposit) / initialDeposit) * 100;
  
  // Calculate today's daily target amount
  const dailyTargetAmount = (deposit * dailyTarget * leverage) / 100;
  
  // Determine if we're in edit mode
  const isEditing = editingDayIndex !== null;
  
  // Get editing message
  const getEditingMessage = () => {
    if (!isEditing) return '';
    
    const day = days[editingDayIndex];
    if (editingTransactionIndex !== null && day.transactions && day.transactions.length > 0) {
      return `Транзакция #${editingTransactionIndex + 1} за ${day.date} (День ${day.day})`;
    }
    return `День ${day.day} (${day.date})`;
  };
  
  // Determine if today's goal is achieved
  const isTodayGoalAchieved = () => {
    // Check if there's a transaction for today
    const today = new Date().toISOString().split('T')[0];
    const todayEntry = days.find(day => day.date === today);

    // If no transactions today, goal is not achieved
    if (!todayEntry) return false;

    // Goal is achieved if today's percentage is greater than or equal to daily target
    return todayEntry.percentage >= dailyTarget;
  };

  // Determine goal achievement status
  const goalAchieved = isTodayGoalAchieved();
  
  // Обработчик сохранения настроек риск-менеджмента
  const handleSaveRiskSettings = (settings) => {
    setRiskSettings(settings);
    if (onSaveRiskSettings) {
      onSaveRiskSettings(settings);
    }
  };
  
  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold mb-8" style={{ color: 'var(--color-text-primary)' }}>Панель управления</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Current Deposit Card */}
        <div className="mac-card fade-in" style={{ backgroundColor: 'var(--color-card)', color: 'var(--color-text-primary)' }}>
          <div className="flex items-center mb-4">
            <FiDollarSign className="mr-2 text-xl" style={{ color: 'var(--color-accent)' }} />
            <h2 className="text-lg font-medium" style={{ color: 'var(--color-accent)' }}>Текущий депозит</h2>
          </div>
          <div className="text-sm mb-4" style={{ color: 'var(--color-text-tertiary)' }}>
            Отображает актуальную сумму вашего торгового депозита. Позволяет отслеживать текущее состояние вашего счета и сравнивать с начальной суммой.
          </div>
          <div className="text-3xl font-bold mb-2">
            <AnimatedValue value={deposit} type="money" />
          </div>
          <div className="mt-2" style={{ color: 'var(--color-text-tertiary)' }}>
            Начальный депозит: <AnimatedValue value={initialDeposit} type="money" />
          </div>
        </div>
        
        {/* Total Growth Card */}
        <div className="mac-card fade-in" style={{ backgroundColor: 'var(--color-card)', color: 'var(--color-text-primary)' }}>
          <div className="flex items-center mb-4">
            <FiTrendingUp className="mr-2 text-xl" style={{ color: 'var(--color-accent)' }} />
            <h2 className="text-lg font-medium" style={{ color: 'var(--color-accent)' }}>Общий рост</h2>
          </div>
          <div className="text-sm mb-4" style={{ color: 'var(--color-text-tertiary)' }}>
            Показывает абсолютный и процентный рост вашего депозита с начала торговли. Помогает оценить общую эффективность вашей торговой стратегии.
          </div>
          <div className="text-3xl font-bold mb-2">
            <AnimatedValue 
              value={totalGrowth} 
              type="money" 
              className={totalGrowth >= 0 ? 'text-green-500' : 'text-red-500'}
            />
          </div>
          <div className="mt-2" style={{ color: 'var(--color-text-tertiary)' }}>
            <AnimatedValue 
              value={totalGrowthPercentage} 
              type="percentage" 
              className={totalGrowthPercentage >= 0 ? 'text-green-500' : 'text-red-500'}
            />
          </div>
        </div>
        
        {/* Daily Target Card */}
        <div className="mac-card fade-in" style={{ backgroundColor: 'var(--color-card)', color: 'var(--color-text-primary)' }}>
          <div className="flex items-center mb-4">
            <FiTarget className="mr-2 text-xl" style={{ color: 'var(--color-accent)' }} />
            <h2 className="text-lg font-medium" style={{ color: 'var(--color-accent)' }}>Дневная цель</h2>
          </div>
          <div className="text-sm mb-4" style={{ color: 'var(--color-text-tertiary)' }}>
            Отображает ваш ежедневный целевой процент доходности. Помогает контролировать выполнение плана торговли и показывает сумму в долларах, которую нужно заработать с учетом плеча.
          </div>
          <div className="text-3xl font-bold mb-2">
            <AnimatedValue 
              value={dailyTarget} 
              type="percentage" 
              className={goalAchieved ? 'text-green-500' : 'text-yellow-500'}
            />
          </div>
          <div className="mt-2" style={{ color: 'var(--color-text-tertiary)' }}>
            ${dailyTargetAmount.toFixed(2)} с плечом {leverage}x
          </div>
        </div>
      </div>
      
      {/* Risk Management Section */}
      <div className="mt-8">
        <div className="flex items-center mb-4">
          <FiShield className="mr-2 text-xl" style={{ color: 'var(--color-accent)' }} />
          <h2 className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>Управление рисками</h2>
        </div>
        
        <div className="text-sm mb-4" style={{ color: 'var(--color-text-tertiary)' }}>
          Секция управления рисками позволяет контролировать ваши риски при торговле. Здесь отображаются рекомендуемые размеры позиций, максимальные риски на сделку и другие ключевые параметры для безопасной торговли.
        </div>
        
        <RiskManagement 
          days={days} 
          deposit={deposit} 
          leverage={leverage} 
          initialDeposit={initialDeposit}
          riskSettings={riskSettings}
        />
        
        <RiskCard 
          days={days} 
          deposit={deposit} 
          leverage={leverage} 
          dailyTarget={dailyTarget}
        />
      </div>
      
      {/* Stats Summary */}
      <StatsSummary days={days} deposit={deposit} initialDeposit={initialDeposit} />
      
      {/* Input Form */}
      <div className="mb-4">
        <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>Ввод результатов торговли</h2>
        <div className="text-sm mb-4" style={{ color: 'var(--color-text-tertiary)' }}>
          Форма для добавления новых торговых результатов. Позволяет вносить данные в процентах или в денежном выражении и сохранять историю ваших торговых дней.
        </div>
      </div>
      <InputForm 
        deposit={deposit}
        leverage={leverage}
        inputMode={inputMode}
        toggleInputMode={toggleInputMode}
        newPercentage={newPercentage}
        handlePercentageChange={handlePercentageChange}
        newAmount={newAmount}
        handleAmountChange={handleAmountChange}
        addDay={addDay}
        editingDayIndex={editingDayIndex}
        saveEditedDay={saveEditedDay}
        cancelEditing={cancelEditing}
      />
    </div>
  );
};

export default Dashboard; 