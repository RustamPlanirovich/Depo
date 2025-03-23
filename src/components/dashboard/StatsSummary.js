import React from 'react';
import { calculateTotalGrowthPercentage, calculateAverageDailyPercentage } from '../../utils/calculations';

/**
 * StatsSummary component - displays deposit statistics
 */
const StatsSummary = ({ deposit, leverage, initialDeposit, days, dailyTarget }) => {
  const totalGrowthPercentage = calculateTotalGrowthPercentage(initialDeposit, deposit);
  const averageDailyPercentage = calculateAverageDailyPercentage(days);
  
  const formatNumber = (num) => {
    return Number(num).toFixed(2).replace(/\.00$/, '');
  };
  
  const formatPercentage = (num) => {
    return Number(num).toFixed(2) + '%';
  };
  
  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
      <h2 className="text-xl font-semibold text-blue-300 mb-4">Статистика</h2>
      
      <div className="grid grid-cols-1 gap-4">
        {/* Current Deposit */}
        <div className="p-4 bg-gray-700 rounded-lg">
          <div className="text-gray-400 text-sm mb-1">Текущий депозит</div>
          <div className="text-2xl font-bold text-white">${formatNumber(deposit)}</div>
        </div>
        
        {/* Initial Deposit */}
        <div className="p-4 bg-gray-700 rounded-lg">
          <div className="text-gray-400 text-sm mb-1">Начальный депозит</div>
          <div className="text-xl font-medium text-white">${formatNumber(initialDeposit)}</div>
        </div>
        
        {/* Total Growth */}
        <div className="p-4 bg-gray-700 rounded-lg">
          <div className="text-gray-400 text-sm mb-1">Общий рост</div>
          <div className={`text-xl font-medium ${totalGrowthPercentage >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {formatPercentage(totalGrowthPercentage)}
            <span className="text-white text-sm ml-2">
              (${formatNumber(deposit - initialDeposit)})
            </span>
          </div>
        </div>
        
        {/* Leverage */}
        <div className="p-4 bg-gray-700 rounded-lg">
          <div className="text-gray-400 text-sm mb-1">Плечо</div>
          <div className="text-xl font-medium text-white">{leverage}x</div>
        </div>
        
        {/* Trading Capacity */}
        <div className="p-4 bg-gray-700 rounded-lg">
          <div className="text-gray-400 text-sm mb-1">Торговая сумма</div>
          <div className="text-xl font-medium text-white">${formatNumber(deposit * leverage)}</div>
        </div>
        
        {/* Average Daily Percentage */}
        <div className="p-4 bg-gray-700 rounded-lg">
          <div className="text-gray-400 text-sm mb-1">Средний % в день</div>
          <div className={`text-xl font-medium ${averageDailyPercentage >= dailyTarget ? 'text-green-400' : 'text-blue-400'}`}>
            {formatPercentage(averageDailyPercentage)}
            <span className="text-gray-400 text-sm ml-2">
              (Цель: {formatPercentage(dailyTarget)})
            </span>
          </div>
        </div>
        
        {/* Trading Days */}
        <div className="p-4 bg-gray-700 rounded-lg">
          <div className="text-gray-400 text-sm mb-1">Торговых дней</div>
          <div className="text-xl font-medium text-white">{days.length}</div>
        </div>
      </div>
    </div>
  );
};

export default StatsSummary; 