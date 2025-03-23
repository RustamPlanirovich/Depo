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
  return (deposit * percentage * leverage) / 100;
};

/**
 * Calculate percentage from amount and deposit
 * @param {number} deposit - Current deposit amount
 * @param {number} amount - Amount of profit/loss
 * @param {number} leverage - Current leverage
 * @returns {number} - Calculated percentage
 */
export const calculatePercentageFromAmount = (deposit, amount, leverage) => {
  return (amount * 100) / (deposit * leverage);
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