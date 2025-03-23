import React from 'react';

/**
 * GoalForm component - form for creating/editing goals
 */
const GoalForm = ({
  editingGoalIndex,
  newGoalName,
  setNewGoalName,
  newGoalType,
  setNewGoalType,
  newGoalValue,
  setNewGoalValue,
  newGoalTimeLimit,
  setNewGoalTimeLimit,
  newGoalDuration,
  setNewGoalDuration,
  newGoalDurationType,
  setNewGoalDurationType,
  newGoalDeadline,
  setNewGoalDeadline,
  newGoalDailyTarget,
  setNewGoalDailyTarget,
  newGoalConsecutiveWins,
  setNewGoalConsecutiveWins,
  dailyTarget,
  addGoal,
  cancelGoalEditing
}) => {
  return (
    <div className="bg-gray-800 p-5 rounded border border-gray-700">
      <h2 className="text-lg font-medium mb-4 text-green-300">
        {editingGoalIndex !== null ? 'Редактировать цель' : 'Новая цель'}
      </h2>
      
      <div className="grid grid-cols-1 gap-5">
        {/* Goal Name */}
        <div>
          <label className="block mb-2">Название цели:</label>
          <input
            type="text"
            value={newGoalName}
            onChange={(e) => setNewGoalName(e.target.value)}
            className="w-full p-3 border rounded bg-gray-700 text-white"
            placeholder="Например: Удвоить депозит"
          />
        </div>
        
        {/* Goal Type */}
        <div>
          <label className="block mb-2">Тип цели:</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
            <button 
              onClick={() => setNewGoalType('deposit')}
              className={`px-4 py-3 rounded ${newGoalType === 'deposit' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'}`}
            >
              Сумма депозита
            </button>
            <button 
              onClick={() => setNewGoalType('percentage')}
              className={`px-4 py-3 rounded ${newGoalType === 'percentage' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'}`}
            >
              Процент роста
            </button>
            <button 
              onClick={() => setNewGoalType('consecutive_wins')}
              className={`px-4 py-3 rounded ${newGoalType === 'consecutive_wins' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'}`}
            >
              Серия прибыльных дней
            </button>
            <button 
              onClick={() => setNewGoalType('daily_target')}
              className={`px-4 py-3 rounded ${newGoalType === 'daily_target' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'}`}
            >
              Достижение цели в %
            </button>
          </div>
        </div>
        
        {/* Dynamic inputs based on goal type */}
        {newGoalType === 'deposit' && (
          <div>
            <label className="block mb-2">Целевая сумма ($):</label>
            <input
              type="number"
              value={newGoalValue}
              onChange={(e) => setNewGoalValue(e.target.value)}
              className="w-full p-3 border rounded bg-gray-700 text-white"
              step="0.01"
              min="0"
            />
          </div>
        )}
        
        {newGoalType === 'percentage' && (
          <div>
            <label className="block mb-2">Целевой рост (%):</label>
            <input
              type="number"
              value={newGoalValue}
              onChange={(e) => setNewGoalValue(e.target.value)}
              className="w-full p-3 border rounded bg-gray-700 text-white"
              step="0.01"
              min="0"
            />
          </div>
        )}
        
        {newGoalType === 'consecutive_wins' && (
          <div>
            <label className="block mb-2">Количество последовательных прибыльных дней:</label>
            <input
              type="number"
              value={newGoalConsecutiveWins}
              onChange={(e) => setNewGoalConsecutiveWins(parseInt(e.target.value) || 3)}
              className="w-full p-3 border rounded bg-gray-700 text-white"
              step="1"
              min="2"
              max="100"
            />
            {/* Hidden field to store the "value" */}
            <input
              type="hidden"
              value="1"
              onChange={(e) => setNewGoalValue(e.target.value)}
            />
          </div>
        )}
        
        {newGoalType === 'daily_target' && (
          <div>
            <label className="block mb-2">Целевой процент в день (%):</label>
            <input
              type="number"
              value={newGoalDailyTarget}
              onChange={(e) => setNewGoalDailyTarget(parseFloat(e.target.value) || dailyTarget)}
              className="w-full p-3 border rounded bg-gray-700 text-white"
              step="0.01"
              min="0.01"
            />
            {/* Hidden field to store the "value" */}
            <input
              type="hidden"
              value="1"
              onChange={(e) => setNewGoalValue(e.target.value)}
            />
          </div>
        )}
        
        {/* Time Limit Options */}
        <div className="border-t border-gray-700 pt-4 mt-2">
          <div className="flex items-center mb-3">
            <input
              type="checkbox"
              id="enableTimeLimit"
              checked={newGoalTimeLimit}
              onChange={(e) => setNewGoalTimeLimit(e.target.checked)}
              className="mr-2"
            />
            <label htmlFor="enableTimeLimit" className="text-green-300">Ограничить по времени</label>
          </div>
          
          {newGoalTimeLimit && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block mb-2">Тип ограничения:</label>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => setNewGoalDeadline('')}
                    className={`px-4 py-2 rounded flex-1 ${!newGoalDeadline ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'}`}
                  >
                    Длительность
                  </button>
                  <button 
                    onClick={() => setNewGoalDeadline(new Date().toISOString().split('T')[0])}
                    className={`px-4 py-2 rounded flex-1 ${newGoalDeadline ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'}`}
                  >
                    Дата окончания
                  </button>
                </div>
              </div>
              
              {!newGoalDeadline ? (
                // Duration based time limit
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block mb-2">Продолжительность:</label>
                    <input
                      type="number"
                      value={newGoalDuration}
                      onChange={(e) => setNewGoalDuration(parseInt(e.target.value) || 30)}
                      className="w-full p-3 border rounded bg-gray-700 text-white"
                      min="1"
                      max="365"
                    />
                  </div>
                  <div>
                    <label className="block mb-2">Единица:</label>
                    <select
                      value={newGoalDurationType}
                      onChange={(e) => setNewGoalDurationType(e.target.value)}
                      className="w-full p-3 border rounded bg-gray-700 text-white h-[50px]"
                    >
                      <option value="days">Дней</option>
                      <option value="weeks">Недель</option>
                      <option value="months">Месяцев</option>
                    </select>
                  </div>
                </div>
              ) : (
                // Specific date based time limit
                <div>
                  <label className="block mb-2">Дата окончания:</label>
                  <input
                    type="date"
                    value={newGoalDeadline}
                    onChange={(e) => setNewGoalDeadline(e.target.value)}
                    className="w-full p-3 border rounded bg-gray-700 text-white"
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
              )}
            </div>
          )}
        </div>
        
        <div className="flex justify-end mt-2">
          <button 
            onClick={addGoal}
            className="bg-green-600 text-white px-5 py-3 rounded hover:bg-green-700"
          >
            {editingGoalIndex !== null ? 'Сохранить изменения' : 'Добавить цель'}
          </button>
        </div>
      </div>
      
      {editingGoalIndex !== null && (
        <div className="mt-4">
          <button 
            onClick={cancelGoalEditing}
            className="text-red-400 hover:text-red-300"
          >
            Отменить редактирование
          </button>
        </div>
      )}
    </div>
  );
};

export default GoalForm; 