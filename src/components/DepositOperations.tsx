import React, { useState, useEffect } from 'react';
import { getCurrencyRates, convertAmount, CurrencyRate } from '../utils/currencyService';
import '../styles/DepositOperations.css';

interface DepositOperationsProps {
  onDeposit: (amount: number, currency: 'USD' | 'USDT') => void;
  onWithdraw: (amount: number, currency: 'USD' | 'USDT') => void;
  currentBalance: { USD: number; USDT: number };
}

export const DepositOperations: React.FC<DepositOperationsProps> = ({ 
  onDeposit, 
  onWithdraw,
  currentBalance 
}) => {
  const [amount, setAmount] = useState<string>('');
  const [currency, setCurrency] = useState<'USD' | 'USDT'>('USD');
  const [rates, setRates] = useState<CurrencyRate | null>(null);
  const [convertedAmount, setConvertedAmount] = useState<number>(0);

  useEffect(() => {
    const fetchRates = async () => {
      try {
        const currentRates = await getCurrencyRates();
        setRates(currentRates);
      } catch (error) {
        console.error('Failed to fetch currency rates:', error);
      }
    };

    fetchRates();
    const interval = setInterval(fetchRates, 60000); // Обновляем курсы каждую минуту

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (rates && amount) {
      const numAmount = parseFloat(amount);
      if (!isNaN(numAmount)) {
        const converted = convertAmount(numAmount, currency, currency === 'USD' ? 'USDT' : 'USD', rates);
        setConvertedAmount(converted);
      }
    }
  }, [amount, currency, rates]);

  const handleSubmit = (operation: 'deposit' | 'withdraw') => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      alert('Пожалуйста, введите корректную сумму');
      return;
    }

    if (operation === 'withdraw' && currentBalance[currency] < numAmount) {
      alert('Недостаточно средств для снятия');
      return;
    }

    if (operation === 'deposit') {
      onDeposit(numAmount, currency);
    } else {
      onWithdraw(numAmount, currency);
    }
    setAmount('');
  };

  return (
    <div className="deposit-operations">
      <h3>Операции с депозитом</h3>
      <div className="input-group">
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Введите сумму"
          min="0"
          step="0.01"
          className="amount-input"
        />
        <select
          value={currency}
          onChange={(e) => setCurrency(e.target.value as 'USD' | 'USDT')}
          className="currency-select"
        >
          <option value="USD">USD</option>
          <option value="USDT">USDT</option>
        </select>
      </div>
      
      {rates && amount && !isNaN(parseFloat(amount)) && (
        <div className="conversion-info">
          <p>
            {parseFloat(amount).toFixed(2)} {currency} = {' '}
            {convertedAmount.toFixed(2)} {currency === 'USD' ? 'USDT' : 'USD'}
          </p>
          <p className="rate-info">
            Текущий курс: 1 USDT = {rates.usdt.toFixed(4)} USD
          </p>
        </div>
      )}

      <div className="operation-buttons">
        <button 
          onClick={() => handleSubmit('deposit')} 
          className="operation-btn deposit-btn"
        >
          Пополнить
        </button>
        <button 
          onClick={() => handleSubmit('withdraw')} 
          className="operation-btn withdraw-btn"
        >
          Снять
        </button>
      </div>
    </div>
  );
}; 