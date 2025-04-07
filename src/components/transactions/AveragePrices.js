import React from 'react';
import { getCurrencyRates } from '../../utils/currencyService';

const AveragePrices = ({ days }) => {
  const [rates, setRates] = React.useState({ usd: 1, usdt: 1, rub: 0 });

  React.useEffect(() => {
    const fetchRates = async () => {
      const currentRates = await getCurrencyRates();
      setRates(currentRates);
    };
    fetchRates();
  }, []);

  const calculateAveragePrices = () => {
    let totalDepositAmount = 0;
    let totalDepositCount = 0;
    let totalWithdrawAmount = 0;
    let totalWithdrawCount = 0;

    days.forEach(day => {
      if (day.transactions) {
        day.transactions.forEach(transaction => {
          if (transaction.amount !== undefined && transaction.amount !== null) {
            if (transaction.type === 'deposit') {
              // For deposits, use the actual transaction amount
              totalDepositAmount += Math.abs(transaction.amount);
              totalDepositCount++;
            } else if (transaction.type === 'withdraw') {
              // For withdrawals, use the actual transaction amount
              totalWithdrawAmount += Math.abs(transaction.amount);
              totalWithdrawCount++;
            }
            // Skip trade transactions (they don't affect average prices)
          }
        });
      }
    });

    // Calculate average prices
    const avgDepositPrice = totalDepositCount > 0 ? totalDepositAmount / totalDepositCount : 0;
    const avgWithdrawPrice = totalWithdrawCount > 0 ? totalWithdrawAmount / totalWithdrawCount : 0;

    return {
      deposit: {
        usd: avgDepositPrice,
        rub: avgDepositPrice * (rates.rub || 0)
      },
      withdraw: {
        usd: avgWithdrawPrice,
        rub: avgWithdrawPrice * (rates.rub || 0)
      }
    };
  };

  const prices = calculateAveragePrices();

  return (
    <div className="bg-gray-800 rounded-lg shadow-lg p-5">
      <h2 className="text-xl font-semibold text-blue-300 mb-4">Средние цены</h2>
      
      <div className="space-y-4">
        {/* Average Deposit Price */}
        <div className="p-4 bg-gray-700 rounded-lg">
          <div className="text-gray-400 mb-1 text-sm">Средняя цена пополнения</div>
          <div className="text-xl font-medium text-white">
            ${(prices.deposit.usd || 0).toFixed(2)}
          </div>
          <div className="text-gray-400 text-sm mt-1">
            {(prices.deposit.rub || 0).toFixed(2)} ₽
          </div>
        </div>
        
        {/* Average Withdrawal Price */}
        <div className="p-4 bg-gray-700 rounded-lg">
          <div className="text-gray-400 mb-1 text-sm">Средняя цена снятия</div>
          <div className="text-xl font-medium text-white">
            ${(prices.withdraw.usd || 0).toFixed(2)}
          </div>
          <div className="text-gray-400 text-sm mt-1">
            {(prices.withdraw.rub || 0).toFixed(2)} ₽
          </div>
        </div>
      </div>
    </div>
  );
};

export default AveragePrices; 