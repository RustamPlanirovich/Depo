import React, { useState, useEffect } from 'react';
import html2canvas from 'html2canvas';

const ExtendedReport = ({ days, currentDeposit }) => {
  useEffect(() => {
    console.log('ExtendedReport rendered:', { days, currentDeposit });
  }, [days, currentDeposit]);

  const [selectedMetrics, setSelectedMetrics] = useState({
    currentDeposit: true,
    overallGrowth: true,
    dailyGoal: true,
    maxDrawdown: true,
    riskPerTrade: true,
    dailyDrawdownLimit: true,
    tradeDrawdownLimit: true,
    riskStatus: true,
    tradeStats: true,
    leverage: true
  });

  // Calculate metrics
  const calculateMetrics = () => {
    if (!days || days.length === 0) return null;

    const initialDeposit = days[days.length - 1]?.deposit || 0;
    const overallGrowth = ((currentDeposit - initialDeposit) / initialDeposit) * 100;
    
    // Calculate max drawdown
    let maxDrawdown = 0;
    let peak = initialDeposit;
    days.forEach(day => {
      if (day.deposit > peak) {
        peak = day.deposit;
      }
      const drawdown = ((peak - day.deposit) / peak) * 100;
      if (drawdown > maxDrawdown) {
        maxDrawdown = drawdown;
      }
    });

    // Calculate trade statistics
    const trades = days.flatMap(day => day.transactions || []);
    const profitableTrades = trades.filter(t => t.percentage > 0).length;
    const losingTrades = trades.filter(t => t.percentage < 0).length;
    const winRate = (profitableTrades / (profitableTrades + losingTrades)) * 100;

    return {
      currentDeposit: currentDeposit,
      overallGrowth: overallGrowth,
      dailyGoal: 1, // Default 1% daily goal
      maxDrawdown: maxDrawdown,
      riskPerTrade: 2, // Default 2% risk per trade
      dailyDrawdownLimit: 5, // Default 5% daily drawdown limit
      tradeDrawdownLimit: 10, // Default 10% trade drawdown limit
      profitableTrades,
      losingTrades,
      winRate,
      leverage: 3 // Default 3x leverage
    };
  };

  const metrics = calculateMetrics();

  const formatNumber = (value) => {
    if (value === undefined || value === null) return '0.00';
    return Number(value).toFixed(2);
  };

  const handleShare = async () => {
    try {
      const element = document.getElementById('extended-report');
      const canvas = await html2canvas(element, {
        backgroundColor: '#1F2937', // Match the dark theme
      });
      
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = 'trading-report.png';
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error('Error generating report:', error);
    }
  };

  if (!metrics) return <div className="text-gray-400">Нет данных для отчета</div>;

  return (
    <div className="bg-gray-800 rounded-lg shadow-lg p-6" id="extended-report">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-blue-300">Расширенный отчет</h2>
        <div className="flex space-x-4">
          <button
            onClick={handleShare}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
            </svg>
            Поделиться
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {selectedMetrics.currentDeposit && (
          <div className="bg-gray-700 rounded-lg p-4">
            <h3 className="text-gray-300 text-sm mb-2">Текущий депозит</h3>
            <p className="text-2xl font-bold text-green-400">${formatNumber(metrics.currentDeposit)}</p>
          </div>
        )}

        {selectedMetrics.overallGrowth && (
          <div className="bg-gray-700 rounded-lg p-4">
            <h3 className="text-gray-300 text-sm mb-2">Общий рост</h3>
            <p className={`text-2xl font-bold ${metrics.overallGrowth >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {formatNumber(metrics.overallGrowth)}%
            </p>
          </div>
        )}

        {selectedMetrics.maxDrawdown && (
          <div className="bg-gray-700 rounded-lg p-4">
            <h3 className="text-gray-300 text-sm mb-2">Максимальная просадка</h3>
            <p className="text-2xl font-bold text-red-400">{formatNumber(metrics.maxDrawdown)}%</p>
          </div>
        )}

        {selectedMetrics.tradeStats && (
          <div className="bg-gray-700 rounded-lg p-4">
            <h3 className="text-gray-300 text-sm mb-2">Статистика сделок</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-400">Прибыльные</p>
                <p className="text-xl font-bold text-green-400">{metrics.profitableTrades}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Убыточные</p>
                <p className="text-xl font-bold text-red-400">{metrics.losingTrades}</p>
              </div>
              <div className="col-span-2">
                <p className="text-sm text-gray-400">Винрейт</p>
                <p className="text-xl font-bold text-blue-400">{formatNumber(metrics.winRate)}%</p>
              </div>
            </div>
          </div>
        )}

        {selectedMetrics.riskPerTrade && (
          <div className="bg-gray-700 rounded-lg p-4">
            <h3 className="text-gray-300 text-sm mb-2">Риск на сделку</h3>
            <p className="text-2xl font-bold text-yellow-400">{formatNumber(metrics.riskPerTrade)}%</p>
          </div>
        )}

        {selectedMetrics.leverage && (
          <div className="bg-gray-700 rounded-lg p-4">
            <h3 className="text-gray-300 text-sm mb-2">Кредитное плечо</h3>
            <p className="text-2xl font-bold text-purple-400">{metrics.leverage}x</p>
          </div>
        )}
      </div>

      <div className="mt-6">
        <h3 className="text-gray-300 text-sm mb-4">Настройка отчета</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {Object.entries(selectedMetrics).map(([key, value]) => (
            <label key={key} className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={value}
                onChange={(e) => setSelectedMetrics(prev => ({
                  ...prev,
                  [key]: e.target.checked
                }))}
                className="form-checkbox h-4 w-4 text-blue-600 rounded border-gray-500 bg-gray-700"
              />
              <span className="text-sm text-gray-300">
                {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
              </span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ExtendedReport; 