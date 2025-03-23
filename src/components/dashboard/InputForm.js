import React from 'react';
import { calculateAmountFromPercentage, calculatePercentageFromAmount } from '../../utils/calculations';
import { FiDollarSign, FiPercent, FiRefreshCw } from 'react-icons/fi';
import AnimatedValue from '../common/AnimatedValue';

/**
 * InputForm component - form for adding new trading days with macOS styling
 * Переведено на русский язык
 */
const InputForm = ({
  deposit,
  leverage,
  inputMode,
  toggleInputMode,
  newPercentage,
  handlePercentageChange,
  newAmount,
  handleAmountChange,
  addDay,
  editingDayIndex,
  saveEditedDay,
  cancelEditing
}) => {
  // Calculate the other value based on the input mode
  const calculatedPercentage = inputMode === 'amount' && newAmount 
    ? calculatePercentageFromAmount(deposit, parseFloat(newAmount), leverage)
    : null;
    
  const calculatedAmount = inputMode === 'percentage' && newPercentage
    ? calculateAmountFromPercentage(deposit, parseFloat(newPercentage), leverage)
    : null;
  
  // Calculate unleveraged values
  const unleveragedAmount = calculatedAmount ? calculatedAmount / leverage : null;
  const unleveragedPercentage = parseFloat(newPercentage) || 0;
  
  return (
    <div className="mac-card slide-up" style={{ backgroundColor: 'var(--color-card)', color: 'var(--color-text-primary)' }}>
      <h2 className="text-xl font-medium mb-6" style={{ color: 'var(--color-accent)' }}>
        {editingDayIndex !== null ? 'Редактировать день' : 'Добавить новый день'}
      </h2>
      
      <div className="mb-4">
        <div className="flex justify-between items-center mb-4">
          <label style={{ color: 'var(--color-text-secondary)' }}>Режим ввода:</label>
          <button
            onClick={toggleInputMode}
            className="mac-button-secondary flex items-center"
          >
            <FiRefreshCw className="mr-2" />
            {inputMode === 'percentage' ? 'Переключить на сумму' : 'Переключить на процент'}
          </button>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Percentage Input */}
          {inputMode === 'percentage' ? (
            <div className="mac-card" style={{ backgroundColor: 'var(--color-card)', color: 'var(--color-text-primary)' }}>
              <label className="block mb-2 font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                <div className="flex items-center">
                  <FiPercent className="mr-2" />
                  Процент:
                </div>
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={newPercentage}
                  onChange={handlePercentageChange}
                  className="mac-input"
                  placeholder="Введите процент"
                  step="0.01"
                />
                <span className="absolute right-3 top-3" style={{ color: 'var(--color-text-tertiary)' }}>%</span>
              </div>
              
              {newPercentage && (
                <div className="mt-4 space-y-2 p-3 rounded-lg" style={{ backgroundColor: 'var(--color-bg-tertiary)' }}>
                  <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                    <span style={{ color: 'var(--color-text-tertiary)' }}>Процент депозита:</span> {unleveragedPercentage.toFixed(2)}%
                  </div>
                  <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                    <span style={{ color: 'var(--color-text-tertiary)' }}>Базовая сумма:</span> ${unleveragedAmount ? unleveragedAmount.toFixed(2) : '0.00'}
                  </div>
                  <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                    <span style={{ color: 'var(--color-text-tertiary)' }}>С {leverage}x плечом:</span> ${calculatedAmount ? calculatedAmount.toFixed(2) : '0.00'}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="mac-card" style={{ backgroundColor: 'var(--color-card)', color: 'var(--color-text-primary)' }}>
              <label className="block mb-2 font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                <div className="flex items-center">
                  <FiDollarSign className="mr-2" />
                  Сумма:
                </div>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-3" style={{ color: 'var(--color-text-tertiary)' }}>$</span>
                <input
                  type="number"
                  value={newAmount}
                  onChange={handleAmountChange}
                  className="mac-input pl-8"
                  placeholder="Введите сумму"
                  step="0.01"
                />
              </div>
              
              {newAmount && (
                <div className="mt-4 space-y-2 p-3 rounded-lg" style={{ backgroundColor: 'var(--color-bg-tertiary)' }}>
                  <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                    <span style={{ color: 'var(--color-text-tertiary)' }}>С {leverage}x плечом:</span> ${parseFloat(newAmount).toFixed(2)}
                  </div>
                  <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                    <span style={{ color: 'var(--color-text-tertiary)' }}>Без плеча:</span> ${(parseFloat(newAmount) / leverage).toFixed(2)}
                  </div>
                  <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                    <span style={{ color: 'var(--color-text-tertiary)' }}>Процент депозита:</span> {calculatedPercentage ? calculatedPercentage.toFixed(2) : '0.00'}%
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* Information Block */}
          <div className="mac-card" style={{ backgroundColor: 'var(--color-card)', color: 'var(--color-text-primary)' }}>
            <div className="font-medium mb-4" style={{ color: 'var(--color-text-primary)' }}>Торговая информация</div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span style={{ color: 'var(--color-text-secondary)' }}>Текущий депозит:</span>
                <AnimatedValue value={deposit} type="money" className="font-medium" />
              </div>
              <div className="flex justify-between items-center">
                <span style={{ color: 'var(--color-text-secondary)' }}>Кредитное плечо:</span>
                <span className="font-medium">{leverage}x</span>
              </div>
              <div className="flex justify-between items-center">
                <span style={{ color: 'var(--color-text-secondary)' }}>Торговый объем:</span>
                <AnimatedValue value={deposit * leverage} type="money" className="font-medium" />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex justify-end mt-6 space-x-3">
        {editingDayIndex !== null && (
          <button
            onClick={cancelEditing}
            className="mac-button-secondary"
          >
            Отмена
          </button>
        )}
        
        <button
          onClick={editingDayIndex !== null ? saveEditedDay : addDay}
          className="mac-button"
        >
          {editingDayIndex !== null ? 'Сохранить изменения' : 'Добавить день'}
        </button>
      </div>
    </div>
  );
};

export default InputForm; 