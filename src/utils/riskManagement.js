/**
 * Утилиты для расчета риск-менеджмента
 */

/**
 * Рассчитывает допустимую просадку на день
 * @param {number} deposit - Текущий депозит
 * @param {number} tradingDaysPerMonth - Количество торговых дней в месяце
 * @returns {number} - Допустимая просадка на день в долларах
 */
export const calculateDailyDrawdownLimit = (deposit, tradingDaysPerMonth = 20) => {
  return deposit / tradingDaysPerMonth;
};

/**
 * Рассчитывает допустимую просадку на одну сделку
 * @param {number} dailyDrawdownLimit - Допустимая просадка на день
 * @param {number} tradesPerDay - Количество сделок в день
 * @returns {number} - Допустимая просадка на сделку в долларах
 */
export const calculateTradeDrawdownLimit = (dailyDrawdownLimit, tradesPerDay = 10) => {
  return dailyDrawdownLimit / tradesPerDay;
};

/**
 * Рассчитывает текущую просадку за день
 * @param {Array} transactions - Массив транзакций за день
 * @returns {number} - Текущая просадка за день в долларах
 */
export const calculateCurrentDailyDrawdown = (transactions) => {
  if (!transactions || transactions.length === 0) return 0;
  
  return transactions.reduce((sum, transaction) => {
    return sum + (transaction.amount < 0 ? Math.abs(transaction.amount) : 0);
  }, 0);
};

/**
 * Рассчитывает текущую прибыль за день
 * @param {Array} transactions - Массив транзакций за день
 * @returns {number} - Текущая прибыль за день в долларах
 */
export const calculateCurrentDailyProfit = (transactions) => {
  if (!transactions || transactions.length === 0) return 0;
  
  return transactions.reduce((sum, transaction) => {
    return sum + (transaction.amount > 0 ? transaction.amount : 0);
  }, 0);
};

/**
 * Рассчитывает количество прибыльных сделок за день
 * @param {Array} transactions - Массив транзакций за день
 * @returns {number} - Количество прибыльных сделок
 */
export const calculateProfitableTrades = (transactions) => {
  if (!transactions || transactions.length === 0) return 0;
  
  return transactions.filter(transaction => transaction.amount > 0).length;
};

/**
 * Рассчитывает количество убыточных сделок за день
 * @param {Array} transactions - Массив транзакций за день
 * @returns {number} - Количество убыточных сделок
 */
export const calculateUnprofitableTrades = (transactions) => {
  if (!transactions || transactions.length === 0) return 0;
  
  return transactions.filter(transaction => transaction.amount < 0).length;
};

/**
 * Проверяет, превышена ли допустимая просадка за день
 * @param {number} currentDrawdown - Текущая просадка за день
 * @param {number} dailyDrawdownLimit - Допустимая просадка на день
 * @returns {boolean} - true, если просадка превышена
 */
export const isDailyDrawdownExceeded = (currentDrawdown, dailyDrawdownLimit) => {
  return currentDrawdown >= dailyDrawdownLimit;
};

/**
 * Проверяет, достигнут ли лимит прибыльных сделок
 * @param {number} profitableTrades - Количество прибыльных сделок
 * @param {number} totalTrades - Общее количество сделок
 * @param {number} profitLimit - Лимит прибыльных сделок (в процентах)
 * @returns {boolean} - true, если лимит достигнут
 */
export const isProfitLimitReached = (profitableTrades, totalTrades, profitLimit = 60) => {
  if (totalTrades === 0) return false;
  
  const profitablePercentage = (profitableTrades / totalTrades) * 100;
  return profitablePercentage >= profitLimit;
};

/**
 * Рассчитывает просадку с учетом плеча
 * @param {number} amount - Сумма просадки
 * @param {number} leverage - Используемое плечо
 * @returns {number} - Просадка с учетом плеча
 */
export const calculateDrawdownWithLeverage = (amount, leverage) => {
  return amount * leverage;
};

/**
 * Рассчитывает прибыль с учетом плеча
 * @param {number} amount - Сумма прибыли
 * @param {number} leverage - Используемое плечо
 * @returns {number} - Прибыль с учетом плеча
 */
export const calculateProfitWithLeverage = (amount, leverage) => {
  return amount * leverage;
};

/**
 * Генерирует рекомендацию на основе текущего состояния риск-менеджмента
 * @param {Object} params - Параметры для генерации рекомендации
 * @returns {Object} - Объект с рекомендацией и типом рекомендации
 */
export const generateRiskRecommendation = ({
  isDrawdownExceeded,
  isProfitLimitReached,
  currentDrawdown,
  dailyDrawdownLimit,
  profitableTrades,
  totalTrades,
  currentDeposit,
  initialDeposit,
  profitLimit = 60
}) => {
  // Проверяем, превышает ли прибыль установленный лимит от начального депозита
  const profitPercentage = ((currentDeposit - initialDeposit) / initialDeposit) * 100;
  const isHighProfit = profitPercentage >= profitLimit;

  if (isDrawdownExceeded) {
    return {
      type: 'warning',
      message: 'Достигнут лимит просадки на день. Рекомендуется прекратить торговлю и проанализировать сделки.'
    };
  }
  
  if (isHighProfit) {
    return {
      type: 'info',
      message: `Достигнута высокая прибыль (более ${profitLimit}% к депозиту). Рекомендуется зафиксировать часть прибыли и уменьшить риски.`
    };
  }

  if (isProfitLimitReached) {
    return {
      type: 'info',
      message: 'Достигнут лимит прибыльных сделок. Рекомендуется прекратить торговлю, так как положительные эмоции могут влиять на качество торговли.'
    };
  }
  
  if (currentDrawdown > dailyDrawdownLimit * 0.8) {
    return {
      type: 'caution',
      message: 'Приближаетесь к лимиту просадки на день. Будьте осторожны с новыми сделками.'
    };
  }
  
  if (profitableTrades > 0 && totalTrades > 0) {
    const winRate = (profitableTrades / totalTrades) * 100;
    if (winRate < 30) {
      return {
        type: 'caution',
        message: 'Низкий процент прибыльных сделок. Рекомендуется пересмотреть стратегию.'
      };
    }
  }
  
  return {
    type: 'success',
    message: 'Торговля в пределах риск-менеджмента.'
  };
};

/**
 * Рассчитывает дату следующего обновления риск-менеджмента
 * @param {string} updatePeriod - Период обновления ('monthly', 'biweekly', 'weekly')
 * @param {Date} lastUpdate - Дата последнего обновления
 * @returns {Date} - Дата следующего обновления
 */
export const calculateNextUpdateDate = (updatePeriod, lastUpdate = new Date()) => {
  const nextUpdate = new Date(lastUpdate);
  
  switch (updatePeriod) {
    case 'monthly':
      nextUpdate.setMonth(nextUpdate.getMonth() + 1);
      break;
    case 'biweekly':
      nextUpdate.setDate(nextUpdate.getDate() + 14);
      break;
    case 'weekly':
      nextUpdate.setDate(nextUpdate.getDate() + 7);
      break;
    default:
      nextUpdate.setMonth(nextUpdate.getMonth() + 1);
  }
  
  return nextUpdate;
};

/**
 * Проверяет, нужно ли обновить риск-менеджмент по приросту депозита
 * @param {number} currentDeposit - Текущий депозит
 * @param {number} lastUpdateDeposit - Депозит при последнем обновлении
 * @param {number} growthThreshold - Порог роста в процентах
 * @returns {boolean} - true, если нужно обновить
 */
export const shouldUpdateByDepositGrowth = (currentDeposit, lastUpdateDeposit, growthThreshold = 10) => {
  if (!lastUpdateDeposit || lastUpdateDeposit <= 0) return false;
  
  const growthPercentage = ((currentDeposit - lastUpdateDeposit) / lastUpdateDeposit) * 100;
  return growthPercentage >= growthThreshold;
}; 