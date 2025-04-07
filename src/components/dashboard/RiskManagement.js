import React, { useState, useEffect } from 'react';
import { FiTrendingDown, FiAlertTriangle, FiShield, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import AnimatedValue from '../common/AnimatedValue';
import AnimatedProgressBar from '../common/AnimatedProgressBar';
import { cardGradients, specialGradients } from '../../utils/gradients';
import {
  calculateDailyDrawdownLimit,
  calculateTradeDrawdownLimit,
  calculateCurrentDailyDrawdown,
  calculateCurrentDailyProfit,
  calculateProfitableTrades,
  calculateUnprofitableTrades,
  isDailyDrawdownExceeded,
  calculateDrawdownWithLeverage,
  calculateProfitWithLeverage,
  generateRiskRecommendation
} from '../../utils/riskManagement';

// Отладочный код - проверка наличия градиентов
console.log('cardGradients imported:', cardGradients);
console.log('specialGradients imported:', specialGradients);

/**
 * RiskManagement компонент - отображает метрики управления рисками
 */
const RiskManagement = ({ 
  days, 
  deposit, 
  leverage, 
  initialDeposit,
  riskSettings = {
    tradingDaysPerMonth: 20,
    tradesPerDay: 10,
    profitLimit: 60
  }
}) => {
  // Отладочный код - проверка свойств cardGradients
  console.log('cardGradients.red:', cardGradients?.red);
  console.log('cardGradients.orange:', cardGradients?.orange);
  console.log('cardGradients.purple:', cardGradients?.purple);
  console.log('cardGradients.teal:', cardGradients?.teal);
  
  // Определяем дефолтные градиенты на случай, если импорт не работает
  const defaultGradient = "linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(37, 99, 235, 0.2) 100%)";
  
  // Расчет максимальной просадки
  const calculateMaxDrawdown = () => {
    if (!days || days.length === 0) return 0;
    
    let maxDrawdown = 0;
    let peak = initialDeposit;
    
    // Проход по всем дням для расчета максимальной просадки
    for (const day of days) {
      if (day.deposit > peak) {
        peak = day.deposit;
      }
      
      const drawdown = ((peak - day.deposit) / peak) * 100;
      
      if (drawdown > maxDrawdown) {
        maxDrawdown = drawdown;
      }
    }
    
    return maxDrawdown;
  };
  
  // Расчет риска на сделку (процент от депозита)
  const calculateRiskPerTrade = () => {
    // Стандартный риск - 1-2% от депозита
    return 2;
  };
  
  // Максимальный размер убытка
  const calculateMaxLoss = () => {
    return deposit * (calculateRiskPerTrade() / 100);
  };
  
  // Расчет максимальной последовательности убыточных дней
  const calculateMaxLossDays = () => {
    if (!days || days.length === 0) return 0;
    
    let maxConsecutive = 0;
    let currentConsecutive = 0;
    
    for (const day of days) {
      if (day.percentage < 0) {
        currentConsecutive++;
        maxConsecutive = Math.max(maxConsecutive, currentConsecutive);
      } else {
        currentConsecutive = 0;
      }
    }
    
    return maxConsecutive;
  };
  
  // Получение текущего дня
  const getCurrentDay = () => {
    if (!days || days.length === 0) return null;
    
    // Сортируем дни по дате и берем последний
    const sortedDays = [...days].sort((a, b) => new Date(b.date) - new Date(a.date));
    return sortedDays[0];
  };
  
  // Проверка достижения лимита прибыльных сделок
  const isProfitLimitReached = (profitableTrades, totalTrades) => {
    if (totalTrades === 0) return false;
    
    const profitablePercentage = (profitableTrades / totalTrades) * 100;
    return profitablePercentage >= riskSettings.profitLimit;
  };
  
  // Расчет метрик риск-менеджмента для текущего дня
  const calculateCurrentDayMetrics = () => {
    const currentDay = getCurrentDay();
    if (!currentDay || !currentDay.transactions) {
      return {
        currentDrawdown: 0,
        currentProfit: 0,
        profitableTrades: 0,
        unprofitableTrades: 0,
        totalTrades: 0,
        dailyDrawdownLimit: 0,
        tradeDrawdownLimit: 0,
        isDrawdownExceeded: false,
        isProfitLimitReached: false,
        recommendation: null
      };
    }
    
    const dailyDrawdownLimit = calculateDailyDrawdownLimit(deposit, riskSettings.tradingDaysPerMonth);
    const tradeDrawdownLimit = calculateTradeDrawdownLimit(dailyDrawdownLimit, riskSettings.tradesPerDay);
    
    const currentDrawdown = calculateCurrentDailyDrawdown(currentDay.transactions);
    const currentProfit = calculateCurrentDailyProfit(currentDay.transactions);
    
    const profitableTrades = calculateProfitableTrades(currentDay.transactions);
    const unprofitableTrades = calculateUnprofitableTrades(currentDay.transactions);
    const totalTrades = currentDay.transactions.length;
    
    const isDrawdownExceeded = isDailyDrawdownExceeded(currentDrawdown, dailyDrawdownLimit);
    const profitLimitReached = isProfitLimitReached(profitableTrades, totalTrades);
    
    const recommendation = generateRiskRecommendation({
      isDrawdownExceeded,
      isProfitLimitReached: profitLimitReached,
      currentDrawdown,
      dailyDrawdownLimit,
      profitableTrades,
      totalTrades
    });
    
    return {
      currentDrawdown,
      currentProfit,
      profitableTrades,
      unprofitableTrades,
      totalTrades,
      dailyDrawdownLimit,
      tradeDrawdownLimit,
      isDrawdownExceeded,
      isProfitLimitReached: profitLimitReached,
      recommendation
    };
  };
  
  // Метрики риск-менеджмента
  const maxDrawdown = calculateMaxDrawdown();
  const riskPerTrade = calculateRiskPerTrade();
  const maxLoss = calculateMaxLoss();
  const maxLossDays = calculateMaxLossDays();
  
  // Метрики текущего дня
  const currentDayMetrics = calculateCurrentDayMetrics();
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      {/* Максимальная просадка */}
      <div className="mac-card glassmorphism" style={{ 
        background: cardGradients?.red?.medium || defaultGradient,
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        borderColor: "rgba(239, 68, 68, 0.2)",
        color: 'var(--color-text-primary)'
      }}>
        <div className="flex items-center mb-4">
          <div className="p-2 rounded-lg mr-3" style={{ background: "rgba(239, 68, 68, 0.15)" }}>
            <FiTrendingDown className="text-xl text-red-500" />
          </div>
          <h2 className="text-lg font-medium text-red-500">Максимальная просадка</h2>
        </div>
        <div className="text-3xl font-bold mb-2">
          <AnimatedValue 
            value={maxDrawdown} 
            type="percentage" 
            className="text-red-500"
          />
        </div>
        <div className="mt-2">
          <AnimatedProgressBar 
            value={Math.min(100, maxDrawdown)} 
            showPercentage={false}
            backgroundColor="rgba(255, 99, 132, 0.2)"
            fillColor="rgba(239, 68, 68, 0.7)"
          />
        </div>
      </div>
      
      {/* Риск на сделку */}
      <div className="mac-card glassmorphism" style={{ 
        background: cardGradients?.orange?.medium || defaultGradient,
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        borderColor: "rgba(249, 115, 22, 0.2)",
        color: 'var(--color-text-primary)'
      }}>
        <div className="flex items-center mb-4">
          <div className="p-2 rounded-lg mr-3" style={{ background: "rgba(249, 115, 22, 0.15)" }}>
            <FiAlertTriangle className="text-xl text-orange-500" />
          </div>
          <h2 className="text-lg font-medium text-orange-500">Риск на сделку</h2>
        </div>
        <div className="text-3xl font-bold mb-2">
          <AnimatedValue 
            value={riskPerTrade} 
            type="percentage" 
            className="text-orange-500"
          />
        </div>
        <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          Максимальный убыток: ${maxLoss.toFixed(2)}
        </div>
      </div>
      
      {/* Лимит просадки на день */}
      <div className="mac-card glassmorphism" style={{ 
        background: cardGradients?.purple?.medium || defaultGradient,
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        borderColor: "rgba(168, 85, 247, 0.2)",
        color: 'var(--color-text-primary)'
      }}>
        <div className="flex items-center mb-4">
          <div className="p-2 rounded-lg mr-3" style={{ background: "rgba(168, 85, 247, 0.15)" }}>
            <FiShield className="text-xl text-purple-500" />
          </div>
          <h2 className="text-lg font-medium text-purple-500">Лимит просадки на день</h2>
        </div>
        <div className="text-3xl font-bold mb-2">
          ${currentDayMetrics.dailyDrawdownLimit.toFixed(2)}
        </div>
        <div className="mt-2">
          <AnimatedProgressBar 
            value={Math.min(100, (currentDayMetrics.currentDrawdown / currentDayMetrics.dailyDrawdownLimit) * 100)} 
            showPercentage={false}
            backgroundColor="rgba(168, 85, 247, 0.2)"
            fillColor={currentDayMetrics.isDrawdownExceeded ? "rgba(239, 68, 68, 0.7)" : "rgba(168, 85, 247, 0.7)"}
          />
        </div>
        <div className="text-sm mt-2" style={{ color: 'var(--color-text-secondary)' }}>
          Текущая просадка: ${currentDayMetrics.currentDrawdown.toFixed(2)}
        </div>
      </div>
      
      {/* Лимит просадки на сделку */}
      <div className="mac-card glassmorphism" style={{ 
        background: cardGradients?.teal?.medium || defaultGradient,
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        borderColor: "rgba(20, 184, 166, 0.2)",
        color: 'var(--color-text-primary)'
      }}>
        <div className="flex items-center mb-4">
          <div className="p-2 rounded-lg mr-3" style={{ background: "rgba(20, 184, 166, 0.15)" }}>
            <FiShield className="text-xl text-teal-500" />
          </div>
          <h2 className="text-lg font-medium text-teal-500">Лимит просадки на сделку</h2>
        </div>
        <div className="text-3xl font-bold mb-2">
          ${currentDayMetrics.tradeDrawdownLimit.toFixed(2)}
        </div>
        <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          С учетом плеча {leverage}x: ${(currentDayMetrics.tradeDrawdownLimit * leverage).toFixed(2)}
        </div>
      </div>
      
      {/* Статистика сделок */}
      <div className="mac-card glassmorphism md:col-span-2" style={{ 
        background: cardGradients?.blue?.medium || defaultGradient,
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        borderColor: "rgba(59, 130, 246, 0.2)",
        color: 'var(--color-text-primary)'
      }}>
        <div className="flex items-center mb-4">
          <div className="p-2 rounded-lg mr-3" style={{ background: "rgba(59, 130, 246, 0.15)" }}>
            <FiShield className="text-xl text-blue-500" />
          </div>
          <h2 className="text-lg font-medium text-blue-500">Статистика сделок</h2>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Прибыльные сделки */}
          <div className="p-4 rounded-lg glassmorphism" style={{ 
            background: specialGradients?.forest || defaultGradient,
            backdropFilter: "blur(5px)",
            WebkitBackdropFilter: "blur(5px)",
            border: "1px solid rgba(var(--color-border-rgb), 0.2)"
          }}>
            <div className="flex items-center mb-2">
              <FiCheckCircle className="mr-2 text-sm text-green-500" />
              <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                Прибыльные сделки
              </div>
            </div>
            <div className="text-xl font-bold text-green-500">
              {currentDayMetrics.profitableTrades} / {currentDayMetrics.totalTrades}
            </div>
            <div className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
              {currentDayMetrics.totalTrades > 0 
                ? `${((currentDayMetrics.profitableTrades / currentDayMetrics.totalTrades) * 100).toFixed(1)}%` 
                : '0%'}
            </div>
          </div>
          
          {/* Убыточные сделки */}
          <div className="p-4 rounded-lg glassmorphism" style={{ 
            background: specialGradients?.sunset || defaultGradient,
            backdropFilter: "blur(5px)",
            WebkitBackdropFilter: "blur(5px)",
            border: "1px solid rgba(var(--color-border-rgb), 0.2)"
          }}>
            <div className="flex items-center mb-2">
              <FiXCircle className="mr-2 text-sm text-red-500" />
              <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                Убыточные сделки
              </div>
            </div>
            <div className="text-xl font-bold text-red-500">
              {currentDayMetrics.unprofitableTrades} / {currentDayMetrics.totalTrades}
            </div>
            <div className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
              {currentDayMetrics.totalTrades > 0 
                ? `${((currentDayMetrics.unprofitableTrades / currentDayMetrics.totalTrades) * 100).toFixed(1)}%` 
                : '0%'}
            </div>
          </div>
          
          {/* Рекомендация */}
          <div className="p-4 rounded-lg glassmorphism" style={{ 
            background: currentDayMetrics.recommendation?.type === 'warning' 
              ? specialGradients?.sunset || defaultGradient
              : currentDayMetrics.recommendation?.type === 'info' 
                ? specialGradients?.ocean || defaultGradient
                : currentDayMetrics.recommendation?.type === 'caution' 
                  ? specialGradients?.sunrise || defaultGradient
                  : specialGradients?.forest || defaultGradient,
            backdropFilter: "blur(5px)",
            WebkitBackdropFilter: "blur(5px)",
            border: "1px solid rgba(var(--color-border-rgb), 0.2)"
          }}>
            <div className="flex items-center mb-2">
              <FiShield className="mr-2 text-sm" style={{ 
                color: currentDayMetrics.recommendation?.type === 'warning' 
                  ? 'var(--color-red)' 
                  : currentDayMetrics.recommendation?.type === 'info' 
                    ? 'var(--color-blue)' 
                    : currentDayMetrics.recommendation?.type === 'caution' 
                      ? 'var(--color-yellow)' 
                      : 'var(--color-green)'
              }} />
              <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                Рекомендация
              </div>
            </div>
            <div className="text-sm font-medium" style={{ 
              color: currentDayMetrics.recommendation?.type === 'warning' 
                ? 'var(--color-red)' 
                : currentDayMetrics.recommendation?.type === 'info' 
                  ? 'var(--color-blue)' 
                  : currentDayMetrics.recommendation?.type === 'caution' 
                    ? 'var(--color-yellow)' 
                    : 'var(--color-green)'
            }}>
              {currentDayMetrics.recommendation?.message || 'Нет данных'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RiskManagement; 