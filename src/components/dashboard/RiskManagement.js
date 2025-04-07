import React from 'react';
import { FiTrendingDown, FiAlertTriangle, FiShield } from 'react-icons/fi';
import AnimatedValue from '../common/AnimatedValue';
import AnimatedProgressBar from '../common/AnimatedProgressBar';
import { cardGradients } from '../../utils/gradients';

/**
 * RiskManagement компонент - отображает метрики управления рисками
 */
const RiskManagement = ({ days, deposit, leverage, initialDeposit }) => {
  // Расчет максимальной просадки
  const calculateMaxDrawdown = () => {
    if (!days || days.length === 0) return 0;
    
    let maxDrawdown = 0;
    let peak = initialDeposit;
    
    // Проход по всем дням для расчета максимальной просадки
    for (const day of days) {
      if (day.deposit > peak) {
        peak = day.deposit;
      }
      
      const drawdown = ((peak - day.deposit) / peak) * 100;
      
      if (drawdown > maxDrawdown) {
        maxDrawdown = drawdown;
      }
    }
    
    return maxDrawdown;
  };
  
  // Расчет риска на сделку (процент от депозита)
  const calculateRiskPerTrade = () => {
    // Стандартный риск - 1-2% от депозита
    return 2;
  };
  
  // Максимальный размер убытка
  const calculateMaxLoss = () => {
    return deposit * (calculateRiskPerTrade() / 100);
  };
  
  // Расчет максимальной последовательности убыточных дней
  const calculateMaxLossDays = () => {
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
  
  // Метрики риск-менеджмента
  const maxDrawdown = calculateMaxDrawdown();
  const riskPerTrade = calculateRiskPerTrade();
  const maxLoss = calculateMaxLoss();
  const maxLossDays = calculateMaxLossDays();
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      {/* Максимальная просадка */}
      <div className="mac-card glassmorphism" style={{ 
        background: cardGradients.red.medium,
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        borderColor: "rgba(239, 68, 68, 0.2)",
        color: 'var(--color-text-primary)'
      }}>
        <div className="flex items-center mb-4">
          <div className="p-2 rounded-lg mr-3" style={{ background: "rgba(239, 68, 68, 0.15)" }}>
            <FiTrendingDown className="text-xl text-red-500" />
          </div>
          <h2 className="text-lg font-medium text-red-500">Максимальная просадка</h2>
        </div>
        <div className="text-3xl font-bold mb-2">
          <AnimatedValue 
            value={maxDrawdown} 
            type="percentage" 
            className="text-red-500"
          />
        </div>
        <div className="mt-2">
          <AnimatedProgressBar 
            value={Math.min(100, maxDrawdown)} 
            showPercentage={false}
            backgroundColor="rgba(255, 99, 132, 0.2)"
            fillColor="rgba(239, 68, 68, 0.7)"
          />
        </div>
        <div className="mt-3 text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
          Максимальное историческое падение депозита от пика до впадины
        </div>
      </div>
      
      {/* Риск на сделку */}
      <div className="mac-card glassmorphism" style={{ 
        background: cardGradients.yellow.medium,
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        borderColor: "rgba(234, 179, 8, 0.2)",
        color: 'var(--color-text-primary)'
      }}>
        <div className="flex items-center mb-4">
          <div className="p-2 rounded-lg mr-3" style={{ background: "rgba(234, 179, 8, 0.15)" }}>
            <FiAlertTriangle className="text-xl text-yellow-500" />
          </div>
          <h2 className="text-lg font-medium text-yellow-500">Риск на сделку</h2>
        </div>
        <div className="text-3xl font-bold mb-2">
          <AnimatedValue 
            value={riskPerTrade} 
            type="percentage" 
            className="text-yellow-500"
          />
        </div>
        <div className="flex justify-between items-center mb-1">
          <span style={{ color: 'var(--color-text-tertiary)' }}>
            Макс. потеря:
          </span>
          <AnimatedValue 
            value={maxLoss} 
            type="money" 
            className="text-red-500"
          />
        </div>
        <div className="flex justify-between items-center">
          <span style={{ color: 'var(--color-text-tertiary)' }}>
            Макс. убыточных дней подряд:
          </span>
          <span className="font-medium text-red-500">{maxLossDays}</span>
        </div>
        <div className="mt-3 text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
          Рекомендуемый риск на одну сделку - не более 2% от депозита
        </div>
      </div>
    </div>
  );
};

export default RiskManagement; 