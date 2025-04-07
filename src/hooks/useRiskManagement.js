import { useState, useEffect, useCallback } from "react";
import { 
  MAX_DAILY_LOSS_PERCENTAGE, 
  MAX_TOTAL_LOSS_PERCENTAGE,
  RISK_WARNING_THRESHOLD 
} from "../constants";

/**
 * Custom hook for managing risk parameters
 * @param {number} initialDeposit - Initial deposit amount
 * @param {number} currentDeposit - Current deposit amount
 * @param {Array} days - Array of trading days
 * @returns {Object} Risk management data and functions
 */
const useRiskManagement = (initialDeposit, currentDeposit, days) => {
  const [dailyLossLimit, setDailyLossLimit] = useState(MAX_DAILY_LOSS_PERCENTAGE);
  const [totalLossLimit, setTotalLossLimit] = useState(MAX_TOTAL_LOSS_PERCENTAGE);

  // Calculate current risk metrics
  const calculateRiskMetrics = useCallback(() => {
    const totalLossPercentage = ((initialDeposit - currentDeposit) / initialDeposit) * 100;
    const isNearDailyLimit = days.length > 0 && 
      Math.abs(days[days.length - 1].percentage) >= (dailyLossLimit - RISK_WARNING_THRESHOLD);
    const isNearTotalLimit = totalLossPercentage >= (totalLossLimit - RISK_WARNING_THRESHOLD);

    return {
      totalLossPercentage,
      isNearDailyLimit,
      isNearTotalLimit,
      isExceededDailyLimit: days.length > 0 && Math.abs(days[days.length - 1].percentage) > dailyLossLimit,
      isExceededTotalLimit: totalLossPercentage > totalLossLimit
    };
  }, [initialDeposit, currentDeposit, days, dailyLossLimit, totalLossLimit]);

  // Check if a new trade would exceed limits
  const checkTradeRisk = useCallback((potentialLoss) => {
    const { totalLossPercentage } = calculateRiskMetrics();
    const potentialTotalLoss = totalLossPercentage + (potentialLoss / initialDeposit) * 100;
    
    return {
      wouldExceedDailyLimit: Math.abs(potentialLoss) > dailyLossLimit,
      wouldExceedTotalLimit: potentialTotalLoss > totalLossLimit
    };
  }, [initialDeposit, dailyLossLimit, totalLossLimit, calculateRiskMetrics]);

  const riskMetrics = calculateRiskMetrics();

  return {
    dailyLossLimit,
    setDailyLossLimit,
    totalLossLimit,
    setTotalLossLimit,
    riskMetrics,
    checkTradeRisk
  };
};

export default useRiskManagement;
