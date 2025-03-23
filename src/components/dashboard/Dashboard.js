import React from 'react';
import { formatNumber, formatPercentage } from '../../utils/calculations';

/**
 * Dashboard component - main page with key metrics and transaction form
 */
const Dashboard = ({
  deposit,
  leverage,
  initialDeposit,
  days,
  dailyTarget,
  inputMode,
  toggleInputMode,
  newPercentage,
  handlePercentageChange,
  newAmount,
  handleAmountChange,
  addDay,
  editingDayIndex,
  editingTransactionIndex,
  saveEditedDay,
  cancelEditing
}) => {
  // Calculate total growth
  const totalGrowth = deposit - initialDeposit;
  const totalGrowthPercentage = ((deposit - initialDeposit) / initialDeposit) * 100;
  
  // Calculate today's daily target amount
  const dailyTargetAmount = (deposit * dailyTarget * leverage) / 100;
  
  // Determine if we're in edit mode
  const isEditing = editingDayIndex !== null;
  
  // Get editing message
  const getEditingMessage = () => {
    if (!isEditing) return '';
    
    const day = days[editingDayIndex];
    if (editingTransactionIndex !== null && day.transactions && day.transactions.length > 0) {
      return `Транзакция #${editingTransactionIndex + 1} за ${day.date} (День ${day.day})`;
    }
    return `День ${day.day} (${day.date})`;
  };
  
  // Determine if today's goal is achieved
  const isTodayGoalAchieved = () => {
    // Check if there's a transaction for today
    const today = new Date().toISOString().split('T')[0];
    const todayEntry = days.find(day => day.date === today);

    // If no transactions today, goal is not achieved
    if (!todayEntry) return false;

    // Goal is achieved if today's percentage is greater than or equal to daily target
    return todayEntry.percentage >= dailyTarget;
  };

  // Determine goal achievement status
  const goalAchieved = isTodayGoalAchieved();
  const goalBgGradient = goalAchieved 
    ? 'bg-gradient-to-br from-gray-800 to-green-800 goal-achieved-pulse' 
    : 'bg-gradient-to-br from-gray-800 to-red-800';
  
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Главная</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Current Deposit Card */}
        <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
          <h2 className="text-xl font-semibold mb-2 text-blue-300">Текущий депозит</h2>
          <p className="text-3xl font-bold">${formatNumber(deposit)}</p>
          <div className="mt-2 text-sm text-gray-400">
            Начальный депозит: ${formatNumber(initialDeposit)}
          </div>
        </div>
        
        {/* Total Growth Card */}
        <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
          <h2 className="text-xl font-semibold mb-2 text-blue-300">Общий рост</h2>
          <p className={`text-3xl font-bold ${totalGrowth >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {totalGrowth >= 0 ? '+' : ''}{formatNumber(totalGrowth)}$ 
            ({totalGrowthPercentage >= 0 ? '+' : ''}{formatPercentage(totalGrowthPercentage)})
          </p>
          <div className="mt-2 text-sm text-gray-400">
            Всего дней: {days.length}
          </div>
        </div>
        
        {/* Daily Target Card */}
        <div className={`rounded-lg p-6 shadow-lg ${goalBgGradient} transition-colors duration-300`}>
          <h2 className="text-xl font-semibold mb-2 text-blue-300">Дневная цель</h2>
          <p className="text-3xl font-bold text-yellow-500">
            {formatPercentage(dailyTarget)} ({formatNumber(dailyTargetAmount)}$)
          </p>
          <div className="mt-2 text-sm text-gray-300">
            Кредитное плечо: {leverage}x
            {goalAchieved && <span className="ml-2 text-green-300">✓ Достигнуто</span>}
          </div>
        </div>
      </div>
      
      {/* Add Transaction Form */}
      <div className="bg-gray-800 rounded-lg p-6 shadow-lg mb-8">
        <h2 className="text-xl font-semibold mb-4">
          {isEditing ? 'Редактировать транзакцию' : 'Добавить новую транзакцию'}
        </h2>
        
        {isEditing && (
          <div className="mb-4 text-blue-300 text-sm font-medium">
            Редактируется: {getEditingMessage()}
          </div>
        )}
        
        <div className="flex flex-col md:flex-row gap-4 items-start">
          {/* Toggle Input Mode */}
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <button
              onClick={toggleInputMode}
              className="px-4 py-2 bg-gray-700 rounded-md hover:bg-gray-600 transition-colors"
            >
              {inputMode === 'percentage' ? 'Ввести сумму' : 'Ввести процент'}
            </button>
          </div>
          
          {/* Input Field */}
          {inputMode === 'percentage' ? (
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Процент прибыли/убытка
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={newPercentage}
                  onChange={handlePercentageChange}
                  className="w-full bg-gray-700 border border-gray-600 rounded-md pl-3 pr-10 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Введите процент"
                  step="0.01"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <span className="text-gray-400">%</span>
                </div>
              </div>
              {newPercentage && (
                <div className="mt-2 text-sm text-gray-400">
                  Расчет: {formatPercentage(parseFloat(newPercentage))} от ${formatNumber(deposit)} = ${formatNumber((deposit * parseFloat(newPercentage)) / 100)}
                  <br />
                  С плечом {leverage}x: ${formatNumber((deposit * parseFloat(newPercentage) * leverage) / 100)}
                </div>
              )}
            </div>
          ) : (
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Сумма прибыли/убытка
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={newAmount}
                  onChange={handleAmountChange}
                  className="w-full bg-gray-700 border border-gray-600 rounded-md pl-3 pr-10 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Введите сумму"
                  step="0.01"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <span className="text-gray-400">$</span>
                </div>
              </div>
              {newAmount && (
                <div className="mt-2 text-sm text-gray-400">
                  С плечом {leverage}x: ${formatNumber(parseFloat(newAmount))}
                  <br />
                  Без плеча: ${formatNumber(parseFloat(newAmount) / leverage)} ({formatPercentage((parseFloat(newAmount) / leverage * 100) / deposit)} от депозита)
                </div>
              )}
            </div>
          )}
          
          {/* Action Buttons */}
          <div className="flex space-x-2">
            {isEditing ? (
              <>
                <button
                  onClick={saveEditedDay}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Сохранить
                </button>
                <button
                  onClick={cancelEditing}
                  className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition-colors"
                >
                  Отмена
                </button>
              </>
            ) : (
              <button
                onClick={addDay}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Добавить
              </button>
            )}
          </div>
        </div>
      </div>
      
      {/* Last Transactions Preview */}
      {days.length > 0 && (
        <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
          <h2 className="text-xl font-semibold mb-4">Последние транзакции</h2>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead>
                <tr>
                  <th className="px-4 py-3 bg-gray-700 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    День
                  </th>
                  <th className="px-4 py-3 bg-gray-700 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Дата
                  </th>
                  <th className="px-4 py-3 bg-gray-700 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Процент
                  </th>
                  <th className="px-4 py-3 bg-gray-700 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Сумма
                  </th>
                  <th className="px-4 py-3 bg-gray-700 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Депозит
                  </th>
                  <th className="px-4 py-3 bg-gray-700 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Сделок
                  </th>
                </tr>
              </thead>
              <tbody className="bg-gray-800 divide-y divide-gray-700">
                {days.slice(-5).map((day) => (
                  <tr key={day.day}>
                    <td className="px-4 py-3 whitespace-nowrap">{day.day}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{day.date}</td>
                    <td className={`px-4 py-3 whitespace-nowrap ${day.percentage >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {day.percentage >= 0 ? '+' : ''}{formatPercentage(day.percentage)}
                    </td>
                    <td className={`px-4 py-3 whitespace-nowrap ${day.amount >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {day.amount >= 0 ? '+' : ''}{formatNumber(day.amount)}$
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {formatNumber(day.deposit)}$
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {day.transactions ? day.transactions.length : 1}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard; 