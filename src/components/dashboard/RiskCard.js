import React from 'react';
import { FiShield, FiPieChart, FiBarChart2 } from 'react-icons/fi';
import AnimatedValue from '../common/AnimatedValue';
import { QuestionCircle } from '../common';
import { cardGradients, specialGradients } from '../../utils/gradients';

/**
 * RiskCard компонент - отображает карточку с метриками риска
 */
const RiskCard = ({ days, deposit, leverage, dailyTarget }) => {
  // Расчет вероятности достижения цели
  const calculateProbability = () => {
    if (!days || days.length === 0) return 0;
    
    const targetDays = days.filter(day => day.percentage >= dailyTarget).length;
    return (targetDays / days.length) * 100;
  };
  
  // Расчет соотношения риск/прибыль
  const calculateRiskRewardRatio = () => {
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
  
  // Расчет максимального количества торговых дней для достижения цели
  const calculateMaxTradingDays = () => {
    if (!days || days.length === 0) return 0;
    
    const avgDailyPercentage = days.reduce((sum, day) => sum + day.percentage, 0) / days.length;
    if (avgDailyPercentage <= 0) return 999;
    
    // Предположим, что цель - удвоить депозит
    const targetGrowth = 100; // 100%
    return Math.ceil(targetGrowth / avgDailyPercentage);
  };
  
  // Метрики риск-менеджмента
  const probability = calculateProbability();
  const riskRewardRatio = calculateRiskRewardRatio();
  const maxTradingDays = calculateMaxTradingDays();
  
  return (
    <div className="mac-card glassmorphism mb-6" style={{ 
      background: cardGradients.blue.medium,
      backdropFilter: "blur(10px)",
      WebkitBackdropFilter: "blur(10px)",
      borderColor: "rgba(59, 130, 246, 0.2)",
      color: 'var(--color-text-primary)'
    }}>
      <div className="flex items-center mb-4">
        <div className="p-2 rounded-lg mr-3" style={{ background: "rgba(59, 130, 246, 0.15)" }}>
          <FiShield className="text-xl text-blue-500" />
        </div>
        <h2 className="text-lg font-medium text-blue-500">Анализ рисков стратегии</h2>
        <QuestionCircle 
          className="ml-2" 
          text="Аналитические показатели вашей торговой стратегии, основанные на исторических данных. Помогают оценить вероятность достижения поставленной цели и эффективность управления рисками."
        />
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Вероятность достижения цели */}
        <div className="p-4 rounded-lg glassmorphism" style={{ 
          background: probability >= 50 ? specialGradients.forest : specialGradients.sunrise,
          backdropFilter: "blur(5px)",
          WebkitBackdropFilter: "blur(5px)",
          border: "1px solid rgba(var(--color-border-rgb), 0.2)"
        }}>
          <div className="flex items-center mb-2">
            <FiPieChart className="mr-2 text-sm" style={{ color: 'var(--color-text-secondary)' }} />
            <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              Вероятность цели
              <QuestionCircle 
                className="ml-1" 
                text="Процент торговых дней, в которые вам удалось достичь или превысить дневную целевую доходность. Показывает стабильность вашей стратегии."
              />
            </div>
          </div>
          <div className="text-xl font-bold">
            <AnimatedValue 
              value={probability} 
              type="percentage" 
              className={probability >= 50 ? 'text-green-500' : 'text-yellow-500'}
            />
          </div>
        </div>
        
        {/* Соотношение риск/прибыль */}
        <div className="p-4 rounded-lg glassmorphism" style={{ 
          background: riskRewardRatio >= 1.5 ? specialGradients.ocean : specialGradients.sunset,
          backdropFilter: "blur(5px)",
          WebkitBackdropFilter: "blur(5px)",
          border: "1px solid rgba(var(--color-border-rgb), 0.2)"
        }}>
          <div className="flex items-center mb-2">
            <FiBarChart2 className="mr-2 text-sm" style={{ color: 'var(--color-text-secondary)' }} />
            <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              Риск/Прибыль
              <QuestionCircle 
                className="ml-1" 
                text="Соотношение средней прибыли в успешных днях к среднему убытку в неудачных. Значение выше 1.5 считается хорошим и указывает на эффективное управление рисками."
              />
            </div>
          </div>
          <div className="text-xl font-bold">
            <span className={riskRewardRatio >= 1.5 ? 'text-green-500' : 'text-yellow-500'}>
              1:{riskRewardRatio.toFixed(2)}
            </span>
          </div>
        </div>
        
        {/* Максимальное количество торговых дней */}
        <div className="p-4 rounded-lg glassmorphism" style={{ 
          background: maxTradingDays <= 100 ? specialGradients.forest : specialGradients.nightSky,
          backdropFilter: "blur(5px)",
          WebkitBackdropFilter: "blur(5px)",
          border: "1px solid rgba(var(--color-border-rgb), 0.2)"
        }}>
          <div className="flex items-center mb-2">
            <FiPieChart className="mr-2 text-sm" style={{ color: 'var(--color-text-secondary)' }} />
            <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              Дней до цели
              <QuestionCircle 
                className="ml-1" 
                text="Расчетное количество торговых дней, которое потребуется для удвоения депозита при текущей средней доходности. Меньшее число означает более быстрый рост капитала."
              />
            </div>
          </div>
          <div className="text-xl font-bold">
            <span className={maxTradingDays <= 100 ? 'text-green-500' : 'text-yellow-500'}>
              {maxTradingDays}
            </span>
          </div>
        </div>
      </div>
      
      <div className="mt-4 pt-3 border-t" style={{ borderColor: 'rgba(var(--color-border-rgb), 0.2)' }}>
        <div className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
          Анализ основан на исторических данных торговли и может меняться с новыми сделками
        </div>
      </div>
    </div>
  );
};

export default RiskCard; 