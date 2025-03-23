import { countCurrentConsecutiveProfitableDays } from './calculations';

/**
 * Utility functions for goal-related operations
 */

// Calculate progress for different types of goals
export const calculateGoalProgress = (goal, currentDeposit, initialDeposit, days) => {
  if (!goal) return 0;
  
  switch (goal.type) {
    case 'deposit':
      // Goal is to reach a specific deposit amount
      const targetDeposit = parseFloat(goal.value);
      if (targetDeposit <= initialDeposit) return 100;
      
      const depositProgress = ((currentDeposit - initialDeposit) / (targetDeposit - initialDeposit)) * 100;
      return Math.min(Math.max(depositProgress, 0), 100);
      
    case 'percentage':
      // Goal is to achieve a specific growth percentage
      const targetPercentage = parseFloat(goal.value);
      const currentPercentage = ((currentDeposit - initialDeposit) / initialDeposit) * 100;
      
      const percentageProgress = (currentPercentage / targetPercentage) * 100;
      return Math.min(Math.max(percentageProgress, 0), 100);
      
    case 'consecutive_wins':
      // Goal is to achieve a streak of profitable days
      const targetWins = parseInt(goal.consecutiveWins, 10);
      const currentWins = countCurrentConsecutiveProfitableDays(days);
      
      const winsProgress = (currentWins / targetWins) * 100;
      return Math.min(Math.max(winsProgress, 0), 100);
      
    case 'daily_target':
      // Goal is to achieve a specific daily target consistently
      if (!days || days.length === 0) return 0;
      
      const targetDailyPercentage = parseFloat(goal.dailyTarget);
      const recentDays = days.slice(-7); // Consider last week
      
      if (recentDays.length === 0) return 0;
      
      const daysAboveTarget = recentDays.filter(day => day.percentage >= targetDailyPercentage).length;
      const dailyTargetProgress = (daysAboveTarget / recentDays.length) * 100;
      
      return Math.min(Math.max(dailyTargetProgress, 0), 100);
      
    default:
      return 0;
  }
};

// Check if a goal should be marked as failed (for time-limited goals)
export const isGoalExpired = (goal) => {
  if (!goal.timeLimit) return false;
  
  const today = new Date();
  
  if (goal.deadline) {
    // Check against explicit deadline
    const deadlineDate = new Date(goal.deadline);
    return today > deadlineDate;
  } else if (goal.startDate && goal.duration && goal.durationType) {
    // Calculate deadline based on start date and duration
    const startDate = new Date(goal.startDate);
    const endDate = new Date(startDate);
    
    switch (goal.durationType) {
      case 'days':
        endDate.setDate(startDate.getDate() + parseInt(goal.duration, 10));
        break;
      case 'weeks':
        endDate.setDate(startDate.getDate() + parseInt(goal.duration, 10) * 7);
        break;
      case 'months':
        endDate.setMonth(startDate.getMonth() + parseInt(goal.duration, 10));
        break;
      default:
        return false;
    }
    
    return today > endDate;
  }
  
  return false;
};

// Get the goals for a specific date
export const getGoalsForDate = (goals, date) => {
  if (!goals || !date) return [];
  
  const formattedDate = typeof date === 'string' ? date : date.toISOString().split('T')[0];
  
  return goals.filter(goal => {
    if (!goal.timeLimit || !goal.deadline) return false;
    
    const deadlineDate = new Date(goal.deadline);
    const formattedDeadline = deadlineDate.toISOString().split('T')[0];
    
    return formattedDeadline === formattedDate;
  });
};

/**
 * Calculate deadline date for a goal
 * @param {Object} goal - Goal object
 * @returns {string|null} - Deadline date in ISO format, or null if not applicable
 */
export const calculateGoalDeadline = (goal) => {
  if (!goal.timeLimit) return null;
  
  if (goal.deadline) {
    return goal.deadline;
  } else if (goal.startDate && goal.duration && goal.durationType) {
    const startDate = new Date(goal.startDate);
    const endDate = new Date(startDate);
    
    switch (goal.durationType) {
      case 'days':
        endDate.setDate(startDate.getDate() + parseInt(goal.duration, 10));
        break;
      case 'weeks':
        endDate.setDate(startDate.getDate() + parseInt(goal.duration, 10) * 7);
        break;
      case 'months':
        endDate.setMonth(startDate.getMonth() + parseInt(goal.duration, 10));
        break;
      default:
        return null;
    }
    
    return endDate.toISOString().split('T')[0];
  }
  
  return null;
};

/**
 * Calculate days remaining until goal deadline
 * @param {Object} goal - Goal object
 * @returns {number|null} - Days remaining, or null if not applicable
 */
export const calculateDaysRemaining = (goal) => {
  const deadlineDate = calculateGoalDeadline(goal);
  if (!deadlineDate) return null;
  
  const today = new Date();
  const deadline = new Date(deadlineDate);
  
  // Set both dates to midnight for accurate day calculation
  today.setHours(0, 0, 0, 0);
  deadline.setHours(0, 0, 0, 0);
  
  const diffTime = deadline.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
}; 