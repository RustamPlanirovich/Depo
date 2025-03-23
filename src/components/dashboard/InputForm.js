import React from 'react';
import { calculateAmountFromPercentage, calculatePercentageFromAmount } from '../../utils/calculations';

/**
 * InputForm component - form for adding new trading days
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
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
      <h2 className="text-xl font-semibold text-blue-300 mb-4">
        {editingDayIndex !== null ? 'Редактировать день' : 'Добавить новый день'}
      </h2>
      
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <label className="text-gray-300">Режим ввода:</label>
          <button
            onClick={toggleInputMode}
            className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-sm text-gray-300"
          >
            {inputMode === 'percentage' ? 'Переключить на сумму' : 'Переключить на проценты'}
          </button>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Percentage Input */}
          {inputMode === 'percentage' ? (
            <div>
              <label className="block mb-2 text-gray-300">Процент:</label>
              <div className="relative">
                <input
                  type="number"
                  value={newPercentage}
                  onChange={handlePercentageChange}
                  className="w-full p-3 pr-10 bg-gray-700 border border-gray-600 rounded text-white"
                  placeholder="Введите процент"
                  step="0.01"
                />
                <span className="absolute right-3 top-3 text-gray-400">%</span>
              </div>
              
              {newPercentage && (
                <div className="mt-2 text-sm text-gray-400">
                  <div>% от депозита: {unleveragedPercentage.toFixed(2)}%</div>
                  <div>Базовая сумма: ${unleveragedAmount ? unleveragedAmount.toFixed(2) : '0.00'}</div>
                  <div>С плечом {leverage}x: ${calculatedAmount ? calculatedAmount.toFixed(2) : '0.00'}</div>
                </div>
              )}
            </div>
          ) : (
            <div>
              <label className="block mb-2 text-gray-300">Сумма:</label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-gray-400">$</span>
                <input
                  type="number"
                  value={newAmount}
                  onChange={handleAmountChange}
                  className="w-full p-3 pl-8 bg-gray-700 border border-gray-600 rounded text-white"
                  placeholder="Введите сумму"
                  step="0.01"
                />
              </div>
              
              {newAmount && (
                <div className="mt-2 text-sm text-gray-400">
                  <div>С плечом {leverage}x: ${parseFloat(newAmount).toFixed(2)}</div>
                  <div>Без плеча: ${(parseFloat(newAmount) / leverage).toFixed(2)}</div>
                  <div>% от депозита: {calculatedPercentage ? calculatedPercentage.toFixed(2) : '0.00'}%</div>
                </div>
              )}
            </div>
          )}
          
          {/* Information Block */}
          <div className="bg-gray-700 p-4 rounded">
            <div className="text-gray-300 mb-2">Информация:</div>
            <div className="text-sm text-gray-400 mb-1">
              Депозит: ${deposit.toFixed(2)}
            </div>
            <div className="text-sm text-gray-400 mb-1">
              Плечо: {leverage}x
            </div>
            <div className="text-sm text-gray-400">
              Торговая сумма: ${(deposit * leverage).toFixed(2)}
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex justify-end mt-4 space-x-3">
        {editingDayIndex !== null && (
          <button
            onClick={cancelEditing}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded text-gray-300"
          >
            Отмена
          </button>
        )}
        
        <button
          onClick={editingDayIndex !== null ? saveEditedDay : addDay}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white"
        >
          {editingDayIndex !== null ? 'Сохранить изменения' : 'Добавить день'}
        </button>
      </div>
    </div>
  );
};

export default InputForm; 