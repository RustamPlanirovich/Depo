import React from 'react';
import { Line, Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import {
  calculateTotalGrowthPercentage,
  calculateAverageDailyPercentage,
  calculateSuccessRate
} from '../../utils/calculations';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

/**
 * Analytics component - displays charts and statistics about deposit growth
 */
const Analytics = ({
  days,
  initialDeposit,
  deposit,
  leverage,
  dailyTarget,
  goals,
  archivedDays,
  includeArchived,
  setIncludeArchived,
  timeRange,
  setTimeRange
}) => {
  // Combine active and archived days if includeArchived is true
  const allDays = includeArchived 
    ? [...days, ...archivedDays].sort((a, b) => a.day - b.day)
    : [...days].sort((a, b) => a.day - b.day);
  
  // Apply time range filter
  let filteredDays = allDays;
  if (timeRange !== 'all') {
    const now = new Date();
    let cutoffDate = new Date();
    
    switch (timeRange) {
      case '7d':
        cutoffDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        cutoffDate.setDate(now.getDate() - 30);
        break;
      case '90d':
        cutoffDate.setDate(now.getDate() - 90);
        break;
      case '1y':
        cutoffDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        break;
    }
    
    filteredDays = allDays.filter(day => {
      const dayDate = new Date(day.date);
      return dayDate >= cutoffDate;
    });
  }
  
  // Calculate statistics
  const totalGrowthPercentage = calculateTotalGrowthPercentage(initialDeposit, deposit);
  const averageDailyPercentage = calculateAverageDailyPercentage(filteredDays);
  const successRate = calculateSuccessRate(filteredDays);
  
  // Create data for Deposit Growth Line Chart
  const depositChartData = {
    labels: filteredDays.map(day => `День ${day.day}`),
    datasets: [
      {
        label: 'Депозит',
        data: filteredDays.map(day => day.deposit),
        fill: false,
        borderColor: 'rgba(75, 192, 192, 1)',
        tension: 0.1
      },
      {
        label: 'Депозит с учетом плеча',
        data: filteredDays.map(day => day.deposit * leverage),
        fill: false,
        borderColor: 'rgba(153, 102, 255, 1)',
        borderDash: [5, 5],
        tension: 0.1
      }
    ]
  };
  
  // Options for Deposit Growth Line Chart
  const depositChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: false,
        ticks: {
          color: 'rgba(255, 255, 255, 0.7)'
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        }
      },
      x: {
        ticks: {
          color: 'rgba(255, 255, 255, 0.7)'
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        }
      }
    },
    plugins: {
      legend: {
        labels: {
          color: 'rgba(255, 255, 255, 0.9)'
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `${context.dataset.label}: $${parseFloat(context.raw).toFixed(2)}`;
          }
        }
      }
    }
  };
  
  // Create data for Daily Percentage Bar Chart
  const percentageChartData = {
    labels: filteredDays.map(day => `День ${day.day}`),
    datasets: [
      {
        label: 'Ежедневный %',
        data: filteredDays.map(day => day.percentage),
        backgroundColor: filteredDays.map(day => {
          if (day.percentage < 0) return 'rgba(255, 99, 132, 0.7)'; // Red for losses
          if (day.percentage === 0) return 'rgba(201, 203, 207, 0.7)'; // Gray for neutral
          if (day.percentage >= dailyTarget) return 'rgba(153, 102, 255, 0.7)'; // Purple for above target
          return 'rgba(54, 162, 235, 0.7)'; // Blue for below target
        }),
        borderWidth: 1
      }
    ]
  };
  
  // Options for Daily Percentage Bar Chart
  const percentageChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          color: 'rgba(255, 255, 255, 0.7)'
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        }
      },
      x: {
        ticks: {
          color: 'rgba(255, 255, 255, 0.7)'
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        }
      }
    },
    plugins: {
      legend: {
        labels: {
          color: 'rgba(255, 255, 255, 0.9)'
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `${context.dataset.label}: ${parseFloat(context.raw).toFixed(2)}%`;
          }
        }
      }
    }
  };
  
  // Count types of days for pie charts
  const profitableDays = filteredDays.filter(day => day.percentage > 0).length;
  const unprofitableDays = filteredDays.filter(day => day.percentage < 0).length;
  const neutralDays = filteredDays.filter(day => day.percentage === 0).length;
  
  const aboveTargetDays = filteredDays.filter(day => day.percentage >= dailyTarget).length;
  const belowTargetDays = filteredDays.filter(day => day.percentage > 0 && day.percentage < dailyTarget).length;
  
  // Create data for Profit/Loss Distribution Pie Chart
  const profitLossDistributionData = {
    labels: ['Прибыльные дни', 'Убыточные дни', 'Нейтральные дни'],
    datasets: [
      {
        data: [profitableDays, unprofitableDays, neutralDays],
        backgroundColor: [
          'rgba(75, 192, 192, 0.7)',
          'rgba(255, 99, 132, 0.7)',
          'rgba(201, 203, 207, 0.7)'
        ],
        borderWidth: 1
      }
    ]
  };
  
  // Create data for Performance vs Target Pie Chart
  const performanceVsTargetData = {
    labels: ['Выше цели', 'Ниже цели (прибыль)', 'Убытки'],
    datasets: [
      {
        data: [aboveTargetDays, belowTargetDays, unprofitableDays],
        backgroundColor: [
          'rgba(153, 102, 255, 0.7)',
          'rgba(54, 162, 235, 0.7)',
          'rgba(255, 99, 132, 0.7)'
        ],
        borderWidth: 1
      }
    ]
  };
  
  // Options for Pie Charts
  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          color: 'rgba(255, 255, 255, 0.9)'
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const value = context.raw;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = Math.round((value / total) * 100);
            return `${context.label}: ${value} (${percentage}%)`;
          }
        }
      }
    }
  };
  
  return (
    <div>
      <h1 className="text-3xl font-bold text-blue-300 mb-6">Аналитика</h1>
      
      {/* Filters */}
      <div className="bg-gray-800 p-4 rounded-lg mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div>
            <label className="text-gray-300 mr-2">Период:</label>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="bg-gray-700 text-white p-2 rounded"
            >
              <option value="all">Всё время</option>
              <option value="7d">7 дней</option>
              <option value="30d">30 дней</option>
              <option value="90d">90 дней</option>
              <option value="1y">1 год</option>
            </select>
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="includeArchived"
              checked={includeArchived}
              onChange={() => setIncludeArchived(!includeArchived)}
              className="mr-2"
            />
            <label htmlFor="includeArchived" className="text-gray-300">
              Включать архивные дни
            </label>
          </div>
        </div>
      </div>
      
      {filteredDays.length > 0 ? (
        <>
          {/* Key Metrics */}
          <div className="bg-gray-800 p-5 rounded-lg mb-6">
            <h2 className="text-xl font-semibold text-blue-300 mb-4">Ключевые метрики</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Total Growth */}
              <div className="bg-gray-700 p-4 rounded-lg">
                <div className="text-gray-400 text-sm mb-1">Общий рост</div>
                <div className={`text-2xl font-bold ${totalGrowthPercentage >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {totalGrowthPercentage.toFixed(2)}%
                </div>
                <div className="text-sm text-gray-400 mt-1">
                  от начального депозита
                </div>
              </div>
              
              {/* Average Percentage */}
              <div className="bg-gray-700 p-4 rounded-lg">
                <div className="text-gray-400 text-sm mb-1">Средний % в день</div>
                <div className="text-2xl font-bold text-blue-400">
                  {averageDailyPercentage.toFixed(2)}%
                </div>
                <div className="text-sm text-gray-400 mt-1">
                  цель: {dailyTarget}%
                </div>
              </div>
              
              {/* Success Rate */}
              <div className="bg-gray-700 p-4 rounded-lg">
                <div className="text-gray-400 text-sm mb-1">Успешность</div>
                <div className="text-2xl font-bold text-blue-400">
                  {successRate.toFixed(2)}%
                </div>
                <div className="text-sm text-gray-400 mt-1">
                  прибыльных дней
                </div>
              </div>
              
              {/* Leverage Impact */}
              <div className="bg-gray-700 p-4 rounded-lg">
                <div className="text-gray-400 text-sm mb-1">Влияние плеча</div>
                <div className="text-2xl font-bold text-purple-400">
                  {leverage}x
                </div>
                <div className="text-sm text-gray-400 mt-1">
                  доход: ${(deposit - initialDeposit).toFixed(2)}
                </div>
              </div>
            </div>
          </div>
          
          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Deposit Growth Chart */}
            <div className="bg-gray-800 p-5 rounded-lg">
              <h3 className="text-lg font-medium text-blue-300 mb-4">Рост депозита</h3>
              <div style={{ height: '300px' }}>
                <Line data={depositChartData} options={depositChartOptions} />
              </div>
            </div>
            
            {/* Daily Percentage Chart */}
            <div className="bg-gray-800 p-5 rounded-lg">
              <h3 className="text-lg font-medium text-blue-300 mb-4">Ежедневный процент</h3>
              <div style={{ height: '300px' }}>
                <Bar data={percentageChartData} options={percentageChartOptions} />
              </div>
            </div>
          </div>
          
          {/* Distribution Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Profit/Loss Distribution */}
            <div className="bg-gray-800 p-5 rounded-lg">
              <h3 className="text-lg font-medium text-blue-300 mb-4">Распределение дней</h3>
              <div style={{ height: '300px' }}>
                <Pie data={profitLossDistributionData} options={pieChartOptions} />
              </div>
            </div>
            
            {/* Performance vs Target */}
            <div className="bg-gray-800 p-5 rounded-lg">
              <h3 className="text-lg font-medium text-blue-300 mb-4">Производительность vs Цель</h3>
              <div style={{ height: '300px' }}>
                <Pie data={performanceVsTargetData} options={pieChartOptions} />
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="bg-gray-800 p-8 rounded-lg text-center">
          <p className="text-gray-400 mb-4">Нет данных для отображения за выбранный период.</p>
          <button
            onClick={() => setTimeRange('all')}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Показать все данные
          </button>
        </div>
      )}
    </div>
  );
};

export default Analytics; 