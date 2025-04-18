import React, { useState, useEffect } from 'react';
import { formatNumber, formatPercentage } from '../../utils/calculations';
import AnimatedValue from '../common/AnimatedValue';
import AnimatedProgressBar from '../common/AnimatedProgressBar';
import { QuestionCircle } from '../common';
import StatsSummary from './StatsSummary';
import InputForm from './InputForm';
import RiskManagement from './RiskManagement';
import RiskCard from './RiskCard';
import { FiDollarSign, FiTrendingUp, FiTarget, FiShield, FiShare2 } from 'react-icons/fi';
import { calculateNextUpdateDate, shouldUpdateByDepositGrowth } from '../../utils/riskManagement';
import { DepositOperations } from '../DepositOperations';
import ExtendedReport from '../reports/ExtendedReport';

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
  onSaveRiskSettings,
  balances,
  onDeposit,
  onWithdraw
}) => {
  const [showReport, setShowReport] = useState(false);

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
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>Панель управления</h1>
        <button
          onClick={() => setShowReport(!showReport)}
          className="flex items-center px-4 py-2 rounded-lg text-white"
          style={{ backgroundColor: 'var(--color-accent)' }}
        >
          <FiShare2 className="mr-2" />
          {showReport ? 'Скрыть отчет' : 'Создать отчет'}
        </button>
      </div>

      {showReport && (
        <ExtendedReport days={days} currentDeposit={deposit} />
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Current Deposit Card */}
        <div className="mac-card fade-in" style={{ backgroundColor: 'var(--color-card)', color: 'var(--color-text-primary)' }}>
          <div className="flex items-center mb-4">
            <FiDollarSign className="mr-2 text-xl" style={{ color: 'var(--color-accent)' }} />
            <h2 className="text-lg font-medium" style={{ color: 'var(--color-accent)' }}>Текущий депозит</h2>
            <QuestionCircle 
              className="ml-2" 
              text="Отображает актуальную сумму вашего торгового депозита. Позволяет отслеживать текущее состояние вашего счета и сравнивать с начальной суммой."
            />
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
            <QuestionCircle 
              className="ml-2" 
              text="Показывает общий процент роста депозита с начала торговли. Крупно показан рост без учета плеча, ниже - с учетом кредитного плеча."
            />
          </div>
          <div className="text-3xl font-bold mb-2">
            <AnimatedValue 
              value={((deposit - initialDeposit) / initialDeposit) * 100} 
              type="percentage" 
              className={deposit >= initialDeposit ? 'text-green-500' : 'text-red-500'}
            />
          </div>
          <div className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
            С плечом: <AnimatedValue 
              value={((deposit - initialDeposit) / initialDeposit) * 100 * leverage} 
              type="percentage" 
              className={deposit >= initialDeposit ? 'text-green-500' : 'text-red-500'}
            />
          </div>
          <div className="mt-2" style={{ color: 'var(--color-text-tertiary)' }}>
            <AnimatedValue value={deposit - initialDeposit} type="money" showSign={true} />
          </div>
        </div>
        
        {/* Daily Target Card */}
        <div className="mac-card fade-in" style={{ backgroundColor: 'var(--color-card)', color: 'var(--color-text-primary)' }}>
          <div className="flex items-center mb-4">
            <FiTarget className="mr-2 text-xl" style={{ color: 'var(--color-accent)' }} />
            <h2 className="text-lg font-medium" style={{ color: 'var(--color-accent)' }}>Дневная цель</h2>
            <QuestionCircle 
              className="ml-2" 
              text="Отображает ваш ежедневный целевой процент доходности. Помогает контролировать выполнение плана торговли и показывает сумму в долларах, которую нужно заработать с учетом плеча."
            />
          </div>
          <div className="text-3xl font-bold mb-2">
            <AnimatedValue value={dailyTarget} type="percentage" />
          </div>
          <div className="mt-2" style={{ color: 'var(--color-text-tertiary)' }}>
            ${(deposit * dailyTarget / 100).toFixed(2)} без плеча
          </div>
          <div className="mt-1" style={{ color: 'var(--color-text-tertiary)' }}>
            ${(deposit * leverage * dailyTarget / 100).toFixed(2)} с плечом {leverage}x
          </div>
        </div>
      </div>
      
      {/* Risk Management Section */}
      <div className="mt-8">
        <div className="flex items-center mb-4">
          <FiShield className="mr-2 text-xl" style={{ color: 'var(--color-accent)' }} />
          <h2 className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>Управление рисками</h2>
          <QuestionCircle 
            className="ml-2" 
            text="Секция управления рисками позволяет контролировать ваши риски при торговле. Здесь отображаются рекомендуемые размеры позиций, максимальные риски на сделку и другие ключевые параметры для безопасной торговли."
          />
        </div>
        
        <RiskManagement 
          days={days} 
          deposit={deposit} 
          leverage={leverage} 
          initialDeposit={initialDeposit}
          onSaveRiskSettings={onSaveRiskSettings}
        />
        
        <RiskCard 
          days={days} 
          deposit={deposit} 
          leverage={leverage} 
          dailyTarget={dailyTarget}
        />
      </div>
      {/* Stats Summary */}
      {/* <StatsSummary days={days} deposit={deposit} initialDeposit={initialDeposit} /> */}
      <StatsSummary deposit={deposit} leverage={leverage} initialDeposit={initialDeposit} days={days} dailyTarget={dailyTarget} />
      
      {/* Input Form */}
      <div className="mb-4">
        <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>Ввод результатов торговли</h2>
        <QuestionCircle 
          className="ml-2" 
          text="Форма для добавления новых торговых результатов. Позволяет вносить данные в процентах или в денежном выражении и сохранять историю ваших торговых дней."
        />
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
      cancelEditing={cancelEditing} />
      

      <DepositOperations
        balances={balances}
        onDeposit={onDeposit}
        onWithdraw={onWithdraw}
      />
    </div>
  );
};

export default Dashboard; 