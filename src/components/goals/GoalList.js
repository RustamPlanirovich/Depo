import React from 'react';

/**
 * GoalList component for displaying and managing the list of goals
 */
const GoalList = ({
  goals,
  startEditingGoal,
  deleteGoal,
  markGoalAsCompleted,
  calculateGoalProgress,
  deposit,
  initialDeposit,
  days
}) => {
  // Helper function to format dates
  const formatDate = (dateString) => {
    if (!dateString) return 'Бессрочно';
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU');
  };

  // Helper function to calculate days remaining for a goal with a deadline
  const getDaysRemaining = (deadline) => {
    if (!deadline) return null;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const deadlineDate = new Date(deadline);
    deadlineDate.setHours(0, 0, 0, 0);
    
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };

  // Helper for showing goal type in human readable form
  const getGoalTypeText = (goal) => {
    switch (goal.type) {
      case 'deposit':
        return `Достичь депозита $${parseFloat(goal.value).toLocaleString('ru-RU', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
      case 'percentage':
        return `Достичь роста ${parseFloat(goal.value)}%`;
      case 'consecutive_wins':
        return `${goal.consecutiveWins} прибыльных дней подряд`;
      case 'daily_target':
        return `Дневной целевой % (${parseFloat(goal.dailyTarget)}%)`;
      default:
        return 'Неизвестный тип цели';
    }
  };

  // Get status and color for the goal
  const getGoalStatus = (goal) => {
    if (goal.completed) {
      return { status: 'Достигнута', color: 'text-green-400' };
    }
    
    if (goal.deadline) {
      const daysRemaining = getDaysRemaining(goal.deadline);
      
      if (daysRemaining < 0) {
        return { status: 'Просрочена', color: 'text-red-400' };
      } else if (daysRemaining === 0) {
        return { status: 'Последний день', color: 'text-yellow-400' };
      }
    }
    
    return { status: 'Активна', color: 'text-blue-400' };
  };

  // If there are no goals, display a message
  if (goals.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        <p>У вас пока нет финансовых целей.</p>
        <p className="mt-2">Создайте свою первую цель, чтобы начать отслеживать прогресс!</p>
      </div>
    );
  }

  return (
    <div className="mt-4">
      <div className="overflow-x-auto">
        <table className="min-w-full bg-gray-800 rounded-lg overflow-hidden">
          <thead className="bg-gray-700">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Название
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Тип
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Статус
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Прогресс
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Срок
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">
                Действия
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {goals.map((goal, index) => {
              const progress = calculateGoalProgress(goal, deposit, initialDeposit, days);
              const { status, color } = getGoalStatus(goal);
              const daysRemaining = goal.deadline ? getDaysRemaining(goal.deadline) : null;
              
              return (
                <tr key={index} className={goal.completed ? 'bg-gray-900 bg-opacity-40' : ''}>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm text-white">{goal.name}</div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-300">{getGoalTypeText(goal)}</div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${color} bg-opacity-10`}>
                      {status}
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="w-full bg-gray-700 rounded-full h-2.5">
                      <div 
                        className={`h-2.5 rounded-full ${
                          progress >= 100 
                            ? 'bg-green-600' 
                            : progress > 66 
                              ? 'bg-blue-600' 
                              : progress > 33 
                                ? 'bg-yellow-600' 
                                : 'bg-red-600'
                        }`}
                        style={{ width: `${Math.min(100, progress)}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-right mt-1 text-gray-400">
                      {progress.toFixed(1)}%
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    {goal.deadline ? (
                      <div>
                        <div className="text-sm text-gray-300">{formatDate(goal.deadline)}</div>
                        {daysRemaining !== null && daysRemaining >= 0 && (
                          <div className="text-xs text-gray-400">
                            {daysRemaining === 0 
                              ? 'Сегодня последний день' 
                              : `Осталось: ${daysRemaining} ${
                                  daysRemaining === 1 ? 'день' : 
                                  daysRemaining < 5 ? 'дня' : 'дней'
                                }`
                            }
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-sm text-gray-500">Бессрочно</div>
                    )}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-center">
                    <div className="flex justify-center space-x-3">
                      {!goal.completed && (
                        <>
                          <button
                            onClick={() => startEditingGoal(index)}
                            className="text-blue-400 hover:text-blue-300"
                            title="Редактировать цель"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => markGoalAsCompleted(index)}
                            className="text-green-400 hover:text-green-300"
                            title="Отметить как достигнутую"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => deleteGoal(index)}
                        className="text-red-400 hover:text-red-300"
                        title="Удалить цель"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default GoalList; 