import React from 'react';
import GoalList from './GoalList';
import GoalForm from './GoalForm';
import GoalCalendar from './GoalCalendar';

/**
 * Goals component - manages financial goals
 */
const Goals = ({
  goals,
  showGoalForm,
  setShowGoalForm,
  editingGoalIndex,
  newGoalName,
  setNewGoalName,
  newGoalType,
  setNewGoalType,
  newGoalValue,
  setNewGoalValue,
  deposit,
  initialDeposit,
  days,
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
  cancelGoalEditing,
  editGoal,
  deleteGoal,
  calculateGoalProgress,
  markGoalAsCompleted
}) => {
  return (
    <div>
      <h1 className="text-3xl font-bold text-blue-300 mb-6">Финансовые цели</h1>
      
      <div className="mb-6 flex justify-between items-center">
        <p className="text-gray-300">
          Ставьте финансовые цели и отслеживайте прогресс их достижения.
        </p>
        
        <button
          onClick={() => setShowGoalForm(!showGoalForm)}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          {showGoalForm ? 'Отмена' : 'Добавить цель'}
        </button>
      </div>
      
      {/* Goal Form */}
      {showGoalForm && (
        <div className="mb-8">
          <GoalForm
            editingGoalIndex={editingGoalIndex}
            newGoalName={newGoalName}
            setNewGoalName={setNewGoalName}
            newGoalType={newGoalType}
            setNewGoalType={setNewGoalType}
            newGoalValue={newGoalValue}
            setNewGoalValue={setNewGoalValue}
            newGoalTimeLimit={newGoalTimeLimit}
            setNewGoalTimeLimit={setNewGoalTimeLimit}
            newGoalDuration={newGoalDuration}
            setNewGoalDuration={setNewGoalDuration}
            newGoalDurationType={newGoalDurationType}
            setNewGoalDurationType={setNewGoalDurationType}
            newGoalDeadline={newGoalDeadline}
            setNewGoalDeadline={setNewGoalDeadline}
            newGoalDailyTarget={newGoalDailyTarget}
            setNewGoalDailyTarget={setNewGoalDailyTarget}
            newGoalConsecutiveWins={newGoalConsecutiveWins}
            setNewGoalConsecutiveWins={setNewGoalConsecutiveWins}
            dailyTarget={dailyTarget}
            addGoal={addGoal}
            cancelGoalEditing={cancelGoalEditing}
          />
        </div>
      )}
      
      {/* Main content: Goals list and Calendar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Goals List */}
        <div>
          <GoalList
            goals={goals}
            editGoal={editGoal}
            deleteGoal={deleteGoal}
            calculateGoalProgress={calculateGoalProgress}
            deposit={deposit}
            initialDeposit={initialDeposit}
            days={days}
            markGoalAsCompleted={markGoalAsCompleted}
          />
        </div>
        
        {/* Calendar (if there are goals with time limits) */}
        {goals.some(goal => goal.timeLimit) && (
          <div>
            <GoalCalendar
              goals={goals}
              setNewGoalDeadline={setNewGoalDeadline}
              setShowGoalForm={setShowGoalForm}
              setNewGoalTimeLimit={setNewGoalTimeLimit}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Goals; 