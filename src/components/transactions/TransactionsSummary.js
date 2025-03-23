import React from 'react';
import {
  calculateTotalGrowthPercentage,
  calculateAverageDailyPercentage,
  calculateSuccessRate,
  findBestDay,
  findWorstDay,
  countConsecutiveProfitableDays
} from '../../utils/calculations';

/**
 * TransactionsSummary component - displays statistics about transactions
 */
const TransactionsSummary = ({ days, initialDeposit, deposit, leverage }) => {
  // Calculate statistics
  const totalGrowthPercentage = calculateTotalGrowthPercentage(initialDeposit, deposit);
  const averageDailyPercentage = calculateAverageDailyPercentage(days);
  const successRate = calculateSuccessRate(days);
  const bestDay = findBestDay(days);
  const worstDay = findWorstDay(days);
  const consecutiveProfitableDays = countConsecutiveProfitableDays(days);
  
  // Format functions
  const formatNumber = (num) => {
    return Number(num).toFixed(2).replace(/\.00$/, '');
  };
  
  const formatPercentage = (num) => {
    return Number(num).toFixed(2) + '%';
  };
  
  // Calculate profitable and unprofitable days
  const profitableDays = days.filter(day => day.percentage > 0).length;
  const unprofitableDays = days.filter(day => day.percentage < 0).length;
  const neutralDays = days.filter(day => day.percentage === 0).length;
  
  return (
    <div className="bg-gray-800 rounded-lg shadow-lg p-5">
      <h2 className="text-xl font-semibold text-blue-300 mb-4">Статистика</h2>
      
      <div className="space-y-4">
        {/* Growth */}
        <div className="p-4 bg-gray-700 rounded-lg">
          <div className="text-gray-400 mb-1 text-sm">Общий рост</div>
          <div className={`text-xl font-medium ${totalGrowthPercentage >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {formatPercentage(totalGrowthPercentage)}
          </div>
          <div className="text-gray-400 text-sm mt-1">
            ${formatNumber(initialDeposit)} → ${formatNumber(deposit)}
          </div>
        </div>
        
        {/* Days Count */}
        <div className="p-4 bg-gray-700 rounded-lg">
          <div className="text-gray-400 mb-1 text-sm">Всего дней</div>
          <div className="text-xl font-medium text-white">{days.length}</div>
          <div className="flex items-center justify-between mt-2 text-sm">
            <div>
              <span className="inline-block w-3 h-3 rounded-full bg-green-500 mr-1"></span>
              <span className="text-gray-300">Прибыльных: {profitableDays}</span>
            </div>
            <div>
              <span className="inline-block w-3 h-3 rounded-full bg-red-500 mr-1"></span>
              <span className="text-gray-300">Убыточных: {unprofitableDays}</span>
            </div>
          </div>
        </div>
        
        {/* Success Rate */}
        <div className="p-4 bg-gray-700 rounded-lg">
          <div className="text-gray-400 mb-1 text-sm">Процент успеха</div>
          <div className="text-xl font-medium text-white">{formatPercentage(successRate)}</div>
          <div className="w-full bg-gray-600 h-2 rounded-full mt-2">
            <div 
              className="bg-green-500 h-2 rounded-full" 
              style={{ width: `${successRate}%` }}
            ></div>
          </div>
        </div>
        
        {/* Average Percentage */}
        <div className="p-4 bg-gray-700 rounded-lg">
          <div className="text-gray-400 mb-1 text-sm">Средний % в день</div>
          <div className={`text-xl font-medium ${averageDailyPercentage >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {formatPercentage(averageDailyPercentage)}
          </div>
        </div>
        
        {/* Best Day */}
        {bestDay && (
          <div className="p-4 bg-gray-700 rounded-lg">
            <div className="text-gray-400 mb-1 text-sm">Лучший день</div>
            <div className="text-xl font-medium text-green-400">
              {formatPercentage(bestDay.percentage)}
            </div>
            <div className="text-gray-400 text-sm mt-1">
              День {bestDay.day} ({bestDay.date})
            </div>
          </div>
        )}
        
        {/* Worst Day */}
        {worstDay && (
          <div className="p-4 bg-gray-700 rounded-lg">
            <div className="text-gray-400 mb-1 text-sm">Худший день</div>
            <div className="text-xl font-medium text-red-400">
              {formatPercentage(worstDay.percentage)}
            </div>
            <div className="text-gray-400 text-sm mt-1">
              День {worstDay.day} ({worstDay.date})
            </div>
          </div>
        )}
        
        {/* Consecutive Profitable Days */}
        <div className="p-4 bg-gray-700 rounded-lg">
          <div className="text-gray-400 mb-1 text-sm">Макс. прибыльных дней подряд</div>
          <div className="text-xl font-medium text-white">{consecutiveProfitableDays}</div>
        </div>
      </div>
    </div>
  );
};

export default TransactionsSummary; 