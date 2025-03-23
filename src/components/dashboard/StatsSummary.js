import React from 'react';
import { calculateTotalGrowthPercentage, calculateAverageDailyPercentage } from '../../utils/calculations';
import AnimatedValue from '../common/AnimatedValue';
import AnimatedProgressBar from '../common/AnimatedProgressBar';

/**
 * StatsSummary component - displays deposit statistics with macOS styling and animations
 */
const StatsSummary = ({ deposit, leverage, initialDeposit, days, dailyTarget }) => {
  const totalGrowthPercentage = calculateTotalGrowthPercentage(initialDeposit, deposit);
  const averageDailyPercentage = calculateAverageDailyPercentage(days);
  
  // Progress percentage for target achievement
  const targetAchievement = (averageDailyPercentage / dailyTarget) * 100;
  
  return (
    <div className="mac-card slide-up">
      <h2 className="text-xl font-medium mb-6" style={{ color: 'var(--color-accent)' }}>Statistics</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Current Deposit */}
        <div className="mac-card">
          <div className="text-sm mb-2" style={{ color: 'var(--color-text-secondary)' }}>Current Deposit</div>
          <div className="text-2xl font-semibold">
            <AnimatedValue value={deposit} type="money" />
          </div>
        </div>
        
        {/* Initial Deposit */}
        <div className="mac-card">
          <div className="text-sm mb-2" style={{ color: 'var(--color-text-secondary)' }}>Initial Deposit</div>
          <div className="text-xl">
            <AnimatedValue value={initialDeposit} type="money" />
          </div>
        </div>
        
        {/* Total Growth */}
        <div className="mac-card">
          <div className="text-sm mb-2" style={{ color: 'var(--color-text-secondary)' }}>Total Growth</div>
          <div className="text-xl">
            <AnimatedValue value={totalGrowthPercentage} type="percentage" />
            <span className="text-sm ml-2" style={{ color: 'var(--color-text-tertiary)' }}>
              (<AnimatedValue value={deposit - initialDeposit} type="money" showSign={false} />)
            </span>
          </div>
          <div className="mt-2">
            <AnimatedProgressBar 
              value={Math.max(0, totalGrowthPercentage)} 
              showPercentage={false}
              height={6}
            />
          </div>
        </div>
        
        {/* Leverage */}
        <div className="mac-card">
          <div className="text-sm mb-2" style={{ color: 'var(--color-text-secondary)' }}>Leverage</div>
          <div className="text-xl">
            <AnimatedValue value={leverage} />x
          </div>
        </div>
        
        {/* Trading Capacity */}
        <div className="mac-card">
          <div className="text-sm mb-2" style={{ color: 'var(--color-text-secondary)' }}>Trading Capacity</div>
          <div className="text-xl">
            <AnimatedValue value={deposit * leverage} type="money" />
          </div>
        </div>
        
        {/* Average Daily Percentage */}
        <div className="mac-card">
          <div className="text-sm mb-2" style={{ color: 'var(--color-text-secondary)' }}>Daily Average</div>
          <div className="text-xl">
            <AnimatedValue value={averageDailyPercentage} type="percentage" />
            <span className="text-sm ml-2" style={{ color: 'var(--color-text-tertiary)' }}>
              (Target: {dailyTarget}%)
            </span>
          </div>
          <div className="mt-2">
            <AnimatedProgressBar 
              value={targetAchievement} 
              showPercentage={true}
              height={6}
            />
          </div>
        </div>
        
        {/* Trading Days */}
        <div className="mac-card">
          <div className="text-sm mb-2" style={{ color: 'var(--color-text-secondary)' }}>Trading Days</div>
          <div className="text-xl">
            <AnimatedValue value={days.length} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsSummary; 