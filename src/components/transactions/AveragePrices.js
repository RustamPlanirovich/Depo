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
    // Для USD/USDT курс всегда примерно 1:1
    const avgPrice = 1;

    return {
      deposit: {
        usd: avgPrice,
        rub: avgPrice * (rates.rub || 0)
      },
      withdraw: {
        usd: avgPrice,
        rub: avgPrice * (rates.rub || 0)
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