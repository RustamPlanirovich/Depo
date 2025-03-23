import React from 'react';
import { formatNumber, formatPercentage } from '../../utils/calculations';
import AnimatedValue from '../common/AnimatedValue';
import AnimatedProgressBar from '../common/AnimatedProgressBar';
import StatsSummary from './StatsSummary';
import InputForm from './InputForm';
import { FiDollarSign, FiTrendingUp, FiTarget } from 'react-icons/fi';

/**
 * Dashboard component - main page with key metrics and transaction form
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
  cancelEditing
}) => {
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
  
  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold mb-8" style={{ color: 'var(--color-text-primary)' }}>Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Current Deposit Card */}
        <div className="mac-card fade-in">
          <div className="flex items-center mb-4">
            <FiDollarSign className="mr-2 text-xl" style={{ color: 'var(--color-accent)' }} />
            <h2 className="text-lg font-medium" style={{ color: 'var(--color-accent)' }}>Current Deposit</h2>
          </div>
          <div className="text-3xl font-bold mb-2">
            <AnimatedValue value={deposit} type="money" />
          </div>
          <div className="mt-2" style={{ color: 'var(--color-text-tertiary)' }}>
            Initial Deposit: <AnimatedValue value={initialDeposit} type="money" />
          </div>
        </div>
        
        {/* Total Growth Card */}
        <div className="mac-card fade-in">
          <div className="flex items-center mb-4">
            <FiTrendingUp className="mr-2 text-xl" style={{ color: 'var(--color-accent)' }} />
            <h2 className="text-lg font-medium" style={{ color: 'var(--color-accent)' }}>Total Growth</h2>
          </div>
          <div className="text-3xl font-bold mb-2">
            <AnimatedValue 
              value={totalGrowth} 
              type="money" 
              className={totalGrowth >= 0 ? 'text-green-500' : 'text-red-500'}
            />
          </div>
          <div className="flex justify-between items-center">
            <span style={{ color: 'var(--color-text-tertiary)' }}>
              Total Percentage:
            </span>
            <AnimatedValue 
              value={totalGrowthPercentage} 
              type="percentage" 
              className={totalGrowthPercentage >= 0 ? 'text-green-500' : 'text-red-500'}
            />
          </div>
          <div className="mt-2">
            <AnimatedProgressBar 
              value={Math.max(0, totalGrowthPercentage)} 
              showPercentage={false}
            />
          </div>
        </div>
        
        {/* Daily Target Card */}
        <div className={`mac-card fade-in ${goalAchieved ? 'pulse' : ''}`}>
          <div className="flex items-center mb-4">
            <FiTarget className="mr-2 text-xl" style={{ color: 'var(--color-accent)' }} />
            <h2 className="text-lg font-medium" style={{ color: 'var(--color-accent)' }}>Daily Target</h2>
          </div>
          <div className="text-3xl font-bold mb-2">
            <AnimatedValue value={dailyTarget} type="percentage" />
          </div>
          <div className="flex justify-between items-center mb-2">
            <span style={{ color: 'var(--color-text-tertiary)' }}>
              Target Amount:
            </span>
            <AnimatedValue value={dailyTargetAmount} type="money" />
          </div>
          <div className="flex justify-between items-center">
            <span style={{ color: 'var(--color-text-tertiary)' }}>
              Leverage:
            </span>
            <span className="font-medium">{leverage}x</span>
          </div>
          {goalAchieved && (
            <div className="mt-3 py-2 px-3 rounded-md text-center text-sm" style={{ 
              backgroundColor: 'var(--color-success)', 
              color: 'white',
              fontWeight: 'medium'
            }}>
              ✓ Target Achieved Today
            </div>
          )}
        </div>
      </div>
      
      {/* Statistics Summary */}
      <StatsSummary 
        deposit={deposit}
        leverage={leverage}
        initialDeposit={initialDeposit}
        days={days}
        dailyTarget={dailyTarget}
      />
      
      {/* Input Form */}
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
        editingTransactionIndex={editingTransactionIndex}
        saveEditedDay={saveEditedDay}
        cancelEditing={cancelEditing}
      />
      
      {/* Recent Transactions */}
      {days.length > 0 && (
        <div className="mac-card slide-up">
          <h2 className="text-xl font-medium mb-6" style={{ color: 'var(--color-accent)' }}>Recent Transactions</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="py-3 text-left" style={{ color: 'var(--color-text-secondary)' }}>Day</th>
                  <th className="py-3 text-left" style={{ color: 'var(--color-text-secondary)' }}>Date</th>
                  <th className="py-3 text-right" style={{ color: 'var(--color-text-secondary)' }}>Percentage</th>
                  <th className="py-3 text-right" style={{ color: 'var(--color-text-secondary)' }}>Amount</th>
                  <th className="py-3 text-right" style={{ color: 'var(--color-text-secondary)' }}>Deposit</th>
                </tr>
              </thead>
              <tbody>
                {days.slice(-5).reverse().map((day, index) => (
                  <tr key={index} className="border-t" style={{ borderColor: 'var(--color-border-light)' }}>
                    <td className="py-3">{day.day}</td>
                    <td className="py-3">{day.date}</td>
                    <td className="py-3 text-right">
                      <AnimatedValue 
                        value={day.percentage} 
                        type="percentage" 
                        className={day.percentage >= 0 ? 'text-green-500' : 'text-red-500'}
                      />
                    </td>
                    <td className="py-3 text-right">
                      <AnimatedValue 
                        value={day.amount} 
                        type="money" 
                        className={day.amount >= 0 ? 'text-green-500' : 'text-red-500'}
                      />
                    </td>
                    <td className="py-3 text-right">
                      <AnimatedValue value={day.deposit} type="money" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard; 