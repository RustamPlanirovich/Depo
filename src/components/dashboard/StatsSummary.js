import React from 'react';
import { calculateTotalGrowthPercentage, calculateAverageDailyPercentage } from '../../utils/calculations';
import AnimatedValue from '../common/AnimatedValue';
import AnimatedProgressBar from '../common/AnimatedProgressBar';
import { QuestionCircle } from '../common';

/**
 * StatsSummary component - displays deposit statistics with macOS styling and animations
 * Компонент статистики депозита - переведен на русский язык
 */
const StatsSummary = ({ deposit, leverage, initialDeposit, days, dailyTarget }) => {
  const totalGrowthPercentage = calculateTotalGrowthPercentage(initialDeposit, deposit);
  const averageDailyPercentage = calculateAverageDailyPercentage(days);
  
  // Progress percentage for target achievement
  const targetAchievement = (averageDailyPercentage / dailyTarget) * 100;
  
  return (
    <div className="mac-card slide-up" style={{ backgroundColor: 'var(--color-card)', color: 'var(--color-text-primary)' }}>
      <h2 className="text-xl font-medium mb-6" style={{ color: 'var(--color-accent)' }}>
        Статистика
        <QuestionCircle 
          className="ml-2" 
          text="Сводная таблица основных показателей вашей торговли. Здесь представлены все ключевые параметры счета, включая текущий и начальный депозит, общий рост, плечо, торговый объем, средний дневной процент и количество торговых дней."
        />
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Current Deposit */}
        <div className="mac-card" style={{ backgroundColor: 'var(--color-card)', color: 'var(--color-text-primary)' }}>
          <div className="text-sm mb-2" style={{ color: 'var(--color-text-secondary)' }}>
            Текущий депозит
            <QuestionCircle 
              className="ml-2" 
              text="Текущая сумма на вашем торговом счете, учитывающая все прибыли и убытки от ваших сделок."
            />
          </div>
          <div className="text-2xl font-semibold">
            <AnimatedValue value={deposit} type="money" />
          </div>
        </div>
        
        {/* Initial Deposit */}
        <div className="mac-card" style={{ backgroundColor: 'var(--color-card)', color: 'var(--color-text-primary)' }}>
          <div className="text-sm mb-2" style={{ color: 'var(--color-text-secondary)' }}>
            Начальный депозит
            <QuestionCircle 
              className="ml-2" 
              text="Начальная сумма средств, с которой вы начали торговлю. Используется как базовое значение для расчета роста."
            />
          </div>
          <div className="text-xl">
            <AnimatedValue value={initialDeposit} type="money" />
          </div>
        </div>
        
        {/* Total Growth */}
        <div className="mac-card" style={{ backgroundColor: 'var(--color-card)', color: 'var(--color-text-primary)' }}>
          <div className="text-sm mb-2" style={{ color: 'var(--color-text-secondary)' }}>
            Общий рост
            <QuestionCircle 
              className="ml-2" 
              text="Процентный рост вашего депозита с момента начала торговли. Крупно показан рост без учета плеча, ниже - с учетом кредитного плеча (1%)."
            />
          </div>
          <div className="text-2xl font-bold mb-1">
            <AnimatedValue value={totalGrowthPercentage} type="percentage" />
          </div>
          <div className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
            С плечом (1%): <AnimatedValue value={totalGrowthPercentage} type="percentage" />
            <span className="ml-2">
              (<AnimatedValue value={deposit - initialDeposit} type="money" showSign={true} />)
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
        <div className="mac-card" style={{ backgroundColor: 'var(--color-card)', color: 'var(--color-text-primary)' }}>
          <div className="text-sm mb-2" style={{ color: 'var(--color-text-secondary)' }}>
            Кредитное плечо
            <QuestionCircle 
              className="ml-2" 
              text="Используемое вами кредитное плечо, которое увеличивает ваш торговый объем и потенциальную прибыль, а также риски."
            />
          </div>
          <div className="text-xl">
            <AnimatedValue value={leverage} />x
          </div>
        </div>
        
        {/* Trading Capacity */}
        <div className="mac-card" style={{ backgroundColor: 'var(--color-card)', color: 'var(--color-text-primary)' }}>
          <div className="text-sm mb-2" style={{ color: 'var(--color-text-secondary)' }}>
            Торговый объем
            <QuestionCircle 
              className="ml-2" 
              text="Максимальная сумма, с которой вы можете торговать с учетом вашего депозита и кредитного плеча."
            />
          </div>
          <div className="text-xl">
            <AnimatedValue value={deposit * leverage} type="money" />
          </div>
        </div>
        
        {/* Average Daily Percentage */}
        <div className="mac-card" style={{ backgroundColor: 'var(--color-card)', color: 'var(--color-text-primary)' }}>
          <div className="text-sm mb-2" style={{ color: 'var(--color-text-secondary)' }}>
            Дневной средний
            <QuestionCircle 
              className="ml-2" 
              text="Средний процент прибыли или убытка за торговый день. Показывает, насколько вы в среднем приближаетесь к своей дневной цели."
            />
          </div>
          <div className="text-xl">
            <AnimatedValue value={averageDailyPercentage} type="percentage" />
            <span className="text-sm ml-2" style={{ color: 'var(--color-text-tertiary)' }}>
              (Цель: {dailyTarget}%)
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
        <div className="mac-card" style={{ backgroundColor: 'var(--color-card)', color: 'var(--color-text-primary)' }}>
          <div className="text-sm mb-2" style={{ color: 'var(--color-text-secondary)' }}>
            Торговые дни
            <QuestionCircle 
              className="ml-2" 
              text="Общее количество дней, в которые вы совершали торговые операции. Используется для расчета среднедневных показателей."
            />
          </div>
          <div className="text-xl">
            <AnimatedValue value={days.length} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsSummary; 