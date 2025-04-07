/**
 * Utility functions for various calculations
 */

// Calculate the current deposit value based on days history
export const calculateCurrentDeposit = (initialDeposit, days) => {
  if (!days || days.length === 0) return initialDeposit;
  
  let currentDeposit = initialDeposit;
  days.forEach(day => {
    currentDeposit += day.amount;
  });
  
  return currentDeposit;
};

/**
 * Calculate amount from percentage and deposit
 * @param {number} deposit - Current deposit amount
 * @param {number} percentage - Percentage of profit/loss
 * @param {number} leverage - Current leverage
 * @returns {number} - Calculated amount
 */
export const calculateAmountFromPercentage = (deposit, percentage, leverage) => {
  // First calculate the amount based on percentage of deposit
  const unleveragedAmount = (deposit * percentage) / 100;
  // Then multiply by leverage to get the final amount
  return unleveragedAmount * leverage;
};

/**
 * Calculate percentage from amount and deposit
 * @param {number} deposit - Current deposit amount
 * @param {number} amount - Amount of profit/loss
 * @param {number} leverage - Current leverage
 * @returns {number} - Calculated percentage
 */
export const calculatePercentageFromAmount = (deposit, amount, leverage) => {
  // First get the unleveraged amount by dividing by leverage
  const unleveragedAmount = amount / leverage;
  // Then calculate percentage based on the unleveraged amount relative to deposit
  return (unleveragedAmount * 100) / deposit;
};

/**
 * Calculate total growth percentage
 * @param {number} initialDeposit - Initial deposit amount
 * @param {number} currentDeposit - Current deposit amount
 * @returns {number} - Total growth percentage
 */
export const calculateTotalGrowthPercentage = (initialDeposit, currentDeposit) => {
  return ((currentDeposit - initialDeposit) / initialDeposit) * 100;
};

/**
 * Calculate average daily percentage
 * @param {Array} days - Array of trading days
 * @returns {number} - Average daily percentage
 */
export const calculateAverageDailyPercentage = (days) => {
  if (!days || days.length === 0) return 0;
  
  const totalPercentage = days.reduce((sum, day) => sum + day.percentage, 0);
  return totalPercentage / days.length;
};

/**
 * Calculate success rate (percentage of profitable days)
 * @param {Array} days - Array of trading days
 * @returns {number} - Success rate (0-100)
 */
export const calculateSuccessRate = (days) => {
  if (!days || days.length === 0) return 0;
  
  const profitableDays = days.filter(day => day.percentage > 0).length;
  return (profitableDays / days.length) * 100;
};

/**
 * Find best trading day
 * @param {Array} days - Array of trading days
 * @returns {Object|null} - Best day or null if no days
 */
export const findBestDay = (days) => {
  if (!days || days.length === 0) return null;
  
  return days.reduce((best, current) => {
    return current.percentage > best.percentage ? current : best;
  }, days[0]);
};

/**
 * Find worst trading day
 * @param {Array} days - Array of trading days
 * @returns {Object|null} - Worst day or null if no days
 */
export const findWorstDay = (days) => {
  if (!days || days.length === 0) return null;
  
  return days.reduce((worst, current) => {
    return current.percentage < worst.percentage ? current : worst;
  }, days[0]);
};

/**
 * Count maximum consecutive profitable days
 * @param {Array} days - Array of trading days
 * @returns {number} - Count of maximum consecutive profitable days
 */
export const countConsecutiveProfitableDays = (days) => {
  if (!days || days.length === 0) return 0;
  
  let maxConsecutive = 0;
  let currentConsecutive = 0;
  
  for (const day of days) {
    if (day.percentage > 0) {
      currentConsecutive++;
      maxConsecutive = Math.max(maxConsecutive, currentConsecutive);
    } else {
      currentConsecutive = 0;
    }
  }
  
  return maxConsecutive;
};

/**
 * Calculate current consecutive profitable days
 * @param {Array} days - Array of trading days
 * @returns {number} - Count of current consecutive profitable days
 */
export const countCurrentConsecutiveProfitableDays = (days) => {
  if (!days || days.length === 0) return 0;
  
  let currentConsecutive = 0;
  
  // Start from the end (most recent days)
  for (let i = days.length - 1; i >= 0; i--) {
    if (days[i].percentage > 0) {
      currentConsecutive++;
    } else {
      break;
    }
  }
  
  return currentConsecutive;
};

/**
 * Format number with thousands separator
 * @param {number} num - Number to format
 * @returns {string} - Formatted number
 */
export const formatNumber = (num) => {
  return num.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

/**
 * Format percentage
 * @param {number} percentage - Percentage to format
 * @returns {string} - Formatted percentage
 */
export const formatPercentage = (percentage) => {
  return percentage.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + '%';
};

/**
 * Calculate maximum drawdown
 * @param {Array} days - Array of trading days
 * @param {number} initialDeposit - Initial deposit amount
 * @returns {number} - Maximum drawdown percentage
 */
export const calculateMaxDrawdown = (days, initialDeposit) => {
  if (!days || days.length === 0) return 0;
  
  let maxDrawdown = 0;
  let peak = initialDeposit;
  
  // Start with initialDeposit and iterate through all days
  let currentDeposit = initialDeposit;
  
  for (const day of days) {
    currentDeposit += day.amount;
    
    if (currentDeposit > peak) {
      peak = currentDeposit;
    }
    
    const drawdown = ((peak - currentDeposit) / peak) * 100;
    
    if (drawdown > maxDrawdown) {
      maxDrawdown = drawdown;
    }
  }
  
  return maxDrawdown;
};

/**
 * Calculate risk per trade
 * @param {number} deposit - Current deposit
 * @param {number} riskPercentage - Risk percentage (default: 2%)
 * @returns {number} - Amount at risk
 */
export const calculateRiskPerTrade = (deposit, riskPercentage = 2) => {
  return deposit * (riskPercentage / 100);
};

/**
 * Calculate risk to reward ratio
 * @param {Array} days - Array of trading days
 * @returns {number} - Risk to reward ratio
 */
export const calculateRiskRewardRatio = (days) => {
  if (!days || days.length === 0) return 0;
  
  const profitableDays = days.filter(day => day.percentage > 0);
  const unprofitableDays = days.filter(day => day.percentage < 0);
  
  if (unprofitableDays.length === 0) return profitableDays.length > 0 ? 99 : 0;
  
  const avgProfit = profitableDays.reduce((sum, day) => sum + day.percentage, 0) / 
                   (profitableDays.length || 1);
  const avgLoss = Math.abs(unprofitableDays.reduce((sum, day) => sum + day.percentage, 0) / 
                  (unprofitableDays.length || 1));
  
  return avgLoss === 0 ? 99 : avgProfit / avgLoss;
};

/**
 * Count maximum consecutive losing days
 * @param {Array} days - Array of trading days
 * @returns {number} - Count of maximum consecutive losing days
 */
export const countConsecutiveLosingDays = (days) => {
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