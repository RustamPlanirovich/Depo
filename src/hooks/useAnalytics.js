import { useState, useMemo } from "react";
import { TIME_RANGES } from "../constants";

/**
 * Custom hook for managing analytics data
 * @param {Array} days - Array of trading days
 * @param {Array} archivedDays - Array of archived trading days
 * @param {number} initialDeposit - Initial deposit amount
 * @param {number} currentDeposit - Current deposit amount
 * @returns {Object} Analytics data and management functions
 */
const useAnalytics = (days, archivedDays, initialDeposit, currentDeposit) => {
  const [includeArchived, setIncludeArchived] = useState(false);
  const [timeRange, setTimeRange] = useState(TIME_RANGES.ALL);

  // Filter days based on time range and archived status
  const filteredDays = useMemo(() => {
    let allDays = includeArchived ? [...days, ...archivedDays] : [...days];
    
    if (timeRange === TIME_RANGES.ALL) return allDays;

    const now = new Date();
    const cutoffDate = new Date();
    
    switch (timeRange) {
      case TIME_RANGES.WEEK:
        cutoffDate.setDate(now.getDate() - 7);
        break;
      case TIME_RANGES.MONTH:
        cutoffDate.setDate(now.getDate() - 30);
        break;
      case TIME_RANGES.QUARTER:
        cutoffDate.setDate(now.getDate() - 90);
        break;
      case TIME_RANGES.YEAR:
        cutoffDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        return allDays;
    }

    return allDays.filter(day => new Date(day.date) >= cutoffDate);
  }, [days, archivedDays, includeArchived, timeRange]);

  // Calculate metrics
  const metrics = useMemo(() => {
    if (filteredDays.length === 0) {
      return {
        totalGrowth: 0,
        averageDailyGrowth: 0,
        successRate: 0,
        totalDays: 0,
        profitableDays: 0
      };
    }
    
    const totalGrowth = ((currentDeposit - initialDeposit) / initialDeposit) * 100;
    const averageDailyGrowth = filteredDays.reduce((acc, day) => acc + day.percentage, 0) / filteredDays.length;
    const profitableDays = filteredDays.filter(day => day.percentage > 0).length;
    const successRate = (profitableDays / filteredDays.length) * 100;

    return {
      totalGrowth,
      averageDailyGrowth,
      successRate,
      totalDays: filteredDays.length,
      profitableDays
    };
  }, [filteredDays, initialDeposit, currentDeposit]);

  // Prepare chart data
  const chartData = useMemo(() => {
    const labels = filteredDays.map(day => `День ${day.day}`);
    
    return {
      depositGrowth: {
        labels,
        datasets: [{
          label:"Депозит",
          data: filteredDays.map(day => day.deposit),
          borderColor: "rgba(75, 192, 192, 1)",
          tension: 0.1
        }]
      },
      dailyPercentages: {
        labels,
        datasets: [{
          label: "Ежедневный %",
          data: filteredDays.map(day => day.percentage),
          backgroundColor: filteredDays.map(day => 
            day.percentage >= 0 ? "rgba(75, 192, 192, 0.7)" : "rgba(255, 99, 132, 0.7)"
          )
        }]
      },
      resultDistribution: {
        labels: ["Прибыльные", "Убыточные"],
        datasets: [{
          data: [
            metrics.profitableDays,
            filteredDays.length - metrics.profitableDays
          ],
          backgroundColor: [
            "rgba(75, 192, 192, 0.7)",
            "rgba(255, 99, 132, 0.7)"
          ]
        }]
      }
    };
  }, [filteredDays, metrics]);

  return {
    includeArchived,
    setIncludeArchived,
    timeRange,
    setTimeRange,
    filteredDays,
    metrics,
    chartData
  };
};

export default useAnalytics;
