import React from 'react';
import { calculateAmountFromPercentage, calculatePercentageFromAmount } from '../../utils/calculations';
import { FiDollarSign, FiPercent, FiRefreshCw } from 'react-icons/fi';
import AnimatedValue from '../common/AnimatedValue';

/**
 * InputForm component - form for adding new trading days with macOS styling
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
    <div className="mac-card slide-up">
      <h2 className="text-xl font-medium mb-6" style={{ color: 'var(--color-accent)' }}>
        {editingDayIndex !== null ? 'Edit Day' : 'Add New Day'}
      </h2>
      
      <div className="mb-4">
        <div className="flex justify-between items-center mb-4">
          <label style={{ color: 'var(--color-text-secondary)' }}>Input Mode:</label>
          <button
            onClick={toggleInputMode}
            className="mac-button-secondary flex items-center"
          >
            <FiRefreshCw className="mr-2" />
            {inputMode === 'percentage' ? 'Switch to Amount' : 'Switch to Percentage'}
          </button>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Percentage Input */}
          {inputMode === 'percentage' ? (
            <div className="mac-card">
              <label className="block mb-2 font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                <div className="flex items-center">
                  <FiPercent className="mr-2" />
                  Percentage:
                </div>
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={newPercentage}
                  onChange={handlePercentageChange}
                  className="mac-input"
                  placeholder="Enter percentage"
                  step="0.01"
                />
                <span className="absolute right-3 top-3" style={{ color: 'var(--color-text-tertiary)' }}>%</span>
              </div>
              
              {newPercentage && (
                <div className="mt-4 space-y-2 p-3 rounded-lg" style={{ backgroundColor: 'var(--color-bg-tertiary)' }}>
                  <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                    <span style={{ color: 'var(--color-text-tertiary)' }}>Deposit Percentage:</span> {unleveragedPercentage.toFixed(2)}%
                  </div>
                  <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                    <span style={{ color: 'var(--color-text-tertiary)' }}>Base Amount:</span> ${unleveragedAmount ? unleveragedAmount.toFixed(2) : '0.00'}
                  </div>
                  <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                    <span style={{ color: 'var(--color-text-tertiary)' }}>With {leverage}x Leverage:</span> ${calculatedAmount ? calculatedAmount.toFixed(2) : '0.00'}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="mac-card">
              <label className="block mb-2 font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                <div className="flex items-center">
                  <FiDollarSign className="mr-2" />
                  Amount:
                </div>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-3" style={{ color: 'var(--color-text-tertiary)' }}>$</span>
                <input
                  type="number"
                  value={newAmount}
                  onChange={handleAmountChange}
                  className="mac-input pl-8"
                  placeholder="Enter amount"
                  step="0.01"
                />
              </div>
              
              {newAmount && (
                <div className="mt-4 space-y-2 p-3 rounded-lg" style={{ backgroundColor: 'var(--color-bg-tertiary)' }}>
                  <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                    <span style={{ color: 'var(--color-text-tertiary)' }}>With {leverage}x Leverage:</span> ${parseFloat(newAmount).toFixed(2)}
                  </div>
                  <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                    <span style={{ color: 'var(--color-text-tertiary)' }}>Without Leverage:</span> ${(parseFloat(newAmount) / leverage).toFixed(2)}
                  </div>
                  <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                    <span style={{ color: 'var(--color-text-tertiary)' }}>Deposit Percentage:</span> {calculatedPercentage ? calculatedPercentage.toFixed(2) : '0.00'}%
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* Information Block */}
          <div className="mac-card">
            <div className="font-medium mb-4" style={{ color: 'var(--color-text-primary)' }}>Trading Information</div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span style={{ color: 'var(--color-text-secondary)' }}>Current Deposit:</span>
                <AnimatedValue value={deposit} type="money" className="font-medium" />
              </div>
              <div className="flex justify-between items-center">
                <span style={{ color: 'var(--color-text-secondary)' }}>Leverage:</span>
                <span className="font-medium">{leverage}x</span>
              </div>
              <div className="flex justify-between items-center">
                <span style={{ color: 'var(--color-text-secondary)' }}>Trading Capacity:</span>
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
            Cancel
          </button>
        )}
        
        <button
          onClick={editingDayIndex !== null ? saveEditedDay : addDay}
          className="mac-button"
        >
          {editingDayIndex !== null ? 'Save Changes' : 'Add Day'}
        </button>
      </div>
    </div>
  );
};

export default InputForm; 