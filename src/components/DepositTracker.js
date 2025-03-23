import React, { useState, useEffect } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import useDialog from '../hooks/useDialog';
import Dialog from './common/Dialog';
import Navigation from './common/Navigation';
import Dashboard from './dashboard/Dashboard';
import Transactions from './transactions/Transactions';
import Goals from './goals/Goals';
import Analytics from './analytics/Analytics';
import Archive from './archive/Archive';
import Settings from './settings/Settings';
import { readFileAsJson, validateImportedData } from '../utils/dataOperations';
import { calculateAmountFromPercentage, calculatePercentageFromAmount } from '../utils/calculations';
import { calculateGoalProgress, isGoalExpired } from '../utils/goals';

/**
 * Main DepositTracker component
 */
const DepositTracker = () => {
  // State management with localStorage persistence
  const [deposit, setDeposit] = useLocalStorage('deposit', 30);
  const [leverage, setLeverage] = useLocalStorage('leverage', 10);
  const [dailyTarget, setDailyTarget] = useLocalStorage('dailyTarget', 3);
  const [days, setDays] = useLocalStorage('days', []);
  const [initialDeposit, setInitialDeposit] = useLocalStorage('initialDeposit', 30);
  const [archivedDays, setArchivedDays] = useLocalStorage('archivedDays', []);
  const [goals, setGoals] = useLocalStorage('goals', []);
  
  // Local state management
  const [activeSection, setActiveSection] = useState('dashboard');
  const [newPercentage, setNewPercentage] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [inputMode, setInputMode] = useState('percentage');
  const [editingDayIndex, setEditingDayIndex] = useState(null);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  
  // Analytics section state
  const [includeArchived, setIncludeArchived] = useState(false);
  const [timeRange, setTimeRange] = useState('all');
  
  // Dialog management
  const dialog = useDialog();
  
  // Goals state
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [editingGoalIndex, setEditingGoalIndex] = useState(null);
  const [newGoalName, setNewGoalName] = useState('');
  const [newGoalType, setNewGoalType] = useState('deposit');
  const [newGoalValue, setNewGoalValue] = useState('');
  const [newGoalTimeLimit, setNewGoalTimeLimit] = useState(false);
  const [newGoalDuration, setNewGoalDuration] = useState(30);
  const [newGoalDurationType, setNewGoalDurationType] = useState('days');
  const [newGoalDeadline, setNewGoalDeadline] = useState('');
  const [newGoalDailyTarget, setNewGoalDailyTarget] = useState(dailyTarget);
  const [newGoalConsecutiveWins, setNewGoalConsecutiveWins] = useState(5);
  
  // Check and update goals status on app load and when days change
  useEffect(() => {
    if (days.length > 0) {
      // Check if any goals should be marked as completed automatically
      const updatedGoals = goals.map(goal => {
        // Skip already completed goals or goals that don't need auto-checking
        if (goal.completed || goal.autoCheck === false) {
          return goal;
        }
        
        // Calculate goal progress
        const progress = calculateGoalProgress(goal, deposit, initialDeposit, days);
        
        // If goal is 100% completed, mark it as completed
        if (progress >= 100) {
          return { ...goal, completed: true, completedDate: new Date().toISOString() };
        }
        
        // If time-limited goal has expired without completion, mark as failed
        if (goal.timeLimit && isGoalExpired(goal)) {
          return { ...goal, failed: true, failedDate: new Date().toISOString() };
        }
        
        return goal;
      });
      
      // Update goals state if there are changes
      if (JSON.stringify(updatedGoals) !== JSON.stringify(goals)) {
        setGoals(updatedGoals);
      }
    }
  }, [days, deposit, initialDeposit, goals, setGoals]);
  
  // Add a new trading day
  const addDay = () => {
    // Validate input
    if (inputMode === 'percentage' && !newPercentage) {
      alert('Пожалуйста, введите процент.');
      return;
    }
    
    if (inputMode === 'amount' && !newAmount) {
      alert('Пожалуйста, введите сумму.');
      return;
    }
    
    // Calculate amount and percentage
    let percentage, amount;
    
    if (inputMode === 'percentage') {
      percentage = parseFloat(newPercentage);
      amount = calculateAmountFromPercentage(deposit, percentage, leverage);
    } else {
      amount = parseFloat(newAmount);
      percentage = calculatePercentageFromAmount(deposit, amount, leverage);
    }
    
    // Create new day object
    const today = new Date().toISOString().split('T')[0];
    const newDeposit = deposit + amount;
    
    const newDay = {
      day: days.length + 1,
      date: today,
      percentage: percentage,
      amount: amount,
      deposit: newDeposit
    };
    
    // Update state
    setDays([...days, newDay]);
    setDeposit(newDeposit);
    setNewPercentage('');
    setNewAmount('');
  };
  
  // Start editing a day
  const startEditingDay = (index) => {
    const day = days[index];
    setEditingDayIndex(index);
    
    if (inputMode === 'percentage') {
      setNewPercentage(day.percentage.toString());
    } else {
      setNewAmount(day.amount.toString());
    }
  };
  
  // Save edited day
  const saveEditedDay = () => {
    if (editingDayIndex === null) return;
    
    // Validate input
    if (inputMode === 'percentage' && !newPercentage) {
      alert('Пожалуйста, введите процент.');
      return;
    }
    
    if (inputMode === 'amount' && !newAmount) {
      alert('Пожалуйста, введите сумму.');
      return;
    }
    
    // Get the day being edited
    const editedDay = days[editingDayIndex];
    
    // Calculate new amount and percentage
    let newPercentageValue, newAmountValue;
    
    if (inputMode === 'percentage') {
      newPercentageValue = parseFloat(newPercentage);
      newAmountValue = calculateAmountFromPercentage(editedDay.deposit - editedDay.amount, newPercentageValue, leverage);
    } else {
      newAmountValue = parseFloat(newAmount);
      newPercentageValue = calculatePercentageFromAmount(editedDay.deposit - newAmountValue, newAmountValue, leverage);
    }
    
    // Calculate difference in amount
    const amountDifference = newAmountValue - editedDay.amount;
    
    // Create updated day
    const updatedDay = {
      ...editedDay,
      percentage: newPercentageValue,
      amount: newAmountValue,
      deposit: editedDay.deposit + amountDifference
    };
    
    // Update following days' deposits
    const updatedDays = [...days];
    updatedDays[editingDayIndex] = updatedDay;
    
    for (let i = editingDayIndex + 1; i < days.length; i++) {
      updatedDays[i] = {
        ...updatedDays[i],
        deposit: updatedDays[i].deposit + amountDifference
      };
    }
    
    // Update state
    setDays(updatedDays);
    setDeposit(deposit + amountDifference);
    setEditingDayIndex(null);
    setNewPercentage('');
    setNewAmount('');
  };
  
  // Cancel editing
  const cancelEditing = () => {
    setEditingDayIndex(null);
    setNewPercentage('');
    setNewAmount('');
  };
  
  // Delete a day
  const deleteDay = async (index) => {
    const result = await dialog.createPromiseDialog(
      'Удаление дня',
      `Вы уверены, что хотите удалить день ${days[index].day}?`,
      ['Да', 'Нет']
    );
    
    if (result === 'Да') {
      const deletedDay = days[index];
      const updatedDays = [...days];
      updatedDays.splice(index, 1);
      
      // Update day numbers
      updatedDays.forEach((day, i) => {
        day.day = i + 1;
      });
      
      // Update deposits in following days
      for (let i = index; i < updatedDays.length; i++) {
        updatedDays[i].deposit = updatedDays[i].deposit - deletedDay.amount;
      }
      
      setDays(updatedDays);
      setDeposit(deposit - deletedDay.amount);
    }
  };
  
  // Archive a day
  const archiveDay = async (index) => {
    const result = await dialog.createPromiseDialog(
      'Архивация дня',
      `Вы уверены, что хотите архивировать день ${days[index].day}?`,
      ['Да', 'Нет']
    );
    
    if (result === 'Да') {
      // Add to archive
      const dayToArchive = { ...days[index] };
      setArchivedDays([...archivedDays, dayToArchive]);
      
      // Remove from days
      const updatedDays = [...days];
      const deletedDay = updatedDays[index];
      updatedDays.splice(index, 1);
      
      // Update day numbers
      updatedDays.forEach((day, i) => {
        day.day = i + 1;
      });
      
      // Update deposits in following days
      for (let i = index; i < updatedDays.length; i++) {
        updatedDays[i].deposit = updatedDays[i].deposit - deletedDay.amount;
      }
      
      setDays(updatedDays);
      setDeposit(deposit - deletedDay.amount);
    }
  };
  
  // Restore from archive
  const restoreFromArchive = async (index) => {
    const result = await dialog.createPromiseDialog(
      'Восстановление из архива',
      `Вы уверены, что хотите восстановить день ${archivedDays[index].day} из архива?`,
      ['Да', 'Нет']
    );
    
    if (result === 'Да') {
      // Create a new day with the next day number
      const dayToRestore = { 
        ...archivedDays[index],
        day: days.length + 1
      };
      
      // Sort days by date
      const allDays = [...days, dayToRestore].sort((a, b) => {
        return new Date(a.date) - new Date(b.date);
      });
      
      // Recalculate day numbers and deposits
      let currentDeposit = initialDeposit;
      const recalculatedDays = allDays.map((day, i) => {
        currentDeposit += day.amount;
        return {
          ...day,
          day: i + 1,
          deposit: currentDeposit
        };
      });
      
      // Remove from archive
      const updatedArchive = [...archivedDays];
      updatedArchive.splice(index, 1);
      
      setDays(recalculatedDays);
      setArchivedDays(updatedArchive);
      setDeposit(currentDeposit);
    }
  };
  
  // Delete from archive
  const deleteFromArchive = async (index) => {
    const result = await dialog.createPromiseDialog(
      'Удаление из архива',
      `Вы уверены, что хотите удалить день ${archivedDays[index].day} из архива?`,
      ['Да', 'Нет']
    );
    
    if (result === 'Да') {
      const updatedArchive = [...archivedDays];
      updatedArchive.splice(index, 1);
      setArchivedDays(updatedArchive);
    }
  };
  
  // Clear archive
  const clearArchive = async () => {
    const result = await dialog.createPromiseDialog(
      'Очистка архива',
      'Вы уверены, что хотите полностью очистить архив?',
      ['Да', 'Нет']
    );
    
    if (result === 'Да') {
      setArchivedDays([]);
    }
  };
  
  // Handle percentage input change
  const handlePercentageChange = (e) => {
    setNewPercentage(e.target.value);
  };
  
  // Handle amount input change
  const handleAmountChange = (e) => {
    setNewAmount(e.target.value);
  };
  
  // Toggle input mode between percentage and amount
  const toggleInputMode = () => {
    setInputMode(inputMode === 'percentage' ? 'amount' : 'percentage');
    setNewPercentage('');
    setNewAmount('');
  };
  
  // Import data from file
  const importData = async (event) => {
    try {
      const file = event.target.files[0];
      if (!file) return;
      
      const importedData = await readFileAsJson(file);
      
      if (!validateImportedData(importedData)) {
        alert('Неверный формат данных в файле.');
        return;
      }
      
      // Ask user if they want to replace or merge with existing data
      const importOption = await dialog.createPromiseDialog(
        'Импорт данных',
        'Как вы хотите импортировать данные?',
        ['Заменить все', 'Объединить', 'Отмена']
      );
      
      if (importOption === 'Заменить все') {
        handleReplaceImport(importedData);
      } else if (importOption === 'Объединить') {
        await handleMergeImport(importedData);
      }
      
      // Reset file input
      event.target.value = null;
    } catch (error) {
      alert(`Ошибка при импорте данных: ${error.message}`);
    }
  };
  
  // Handle replace import
  const handleReplaceImport = (importedData) => {
    setDeposit(importedData.deposit || 30);
    setLeverage(importedData.leverage || 10);
    setDailyTarget(importedData.dailyTarget || 3);
    setInitialDeposit(importedData.initialDeposit || 30);
    setDays(importedData.days || []);
    setArchivedDays(importedData.archivedDays || []);
    setGoals(importedData.goals || []);
    
    alert('Данные успешно импортированы!');
  };
  
  // Handle merge import
  const handleMergeImport = async (importedData) => {
    // Handle days merge
    if (importedData.days && importedData.days.length > 0) {
      // Combine existing and imported days
      const combinedDays = [...days, ...importedData.days];
      
      // Remove duplicates (same day and date)
      const uniqueDays = [];
      const dayDateMap = new Map();
      
      combinedDays.forEach(day => {
        const key = `${day.day}-${day.date}`;
        if (!dayDateMap.has(key)) {
          dayDateMap.set(key, day);
          uniqueDays.push(day);
        }
      });
      
      // Sort by date
      uniqueDays.sort((a, b) => new Date(a.date) - new Date(b.date));
      
      // Recalculate day numbers and deposits
      let currentDeposit = initialDeposit;
      const recalculatedDays = uniqueDays.map((day, i) => {
        currentDeposit += day.amount;
        return {
          ...day,
          day: i + 1,
          deposit: currentDeposit
        };
      });
      
      setDays(recalculatedDays);
      setDeposit(currentDeposit);
    }
    
    // Handle archived days merge
    if (importedData.archivedDays && importedData.archivedDays.length > 0) {
      const combinedArchive = [...archivedDays, ...importedData.archivedDays];
      
      // Remove duplicates
      const uniqueArchived = [];
      const archiveDayDateMap = new Map();
      
      combinedArchive.forEach(day => {
        const key = `${day.day}-${day.date}`;
        if (!archiveDayDateMap.has(key)) {
          archiveDayDateMap.set(key, day);
          uniqueArchived.push(day);
        }
      });
      
      setArchivedDays(uniqueArchived);
    }
    
    // Handle goals merge
    if (importedData.goals && importedData.goals.length > 0) {
      const combinedGoals = [...goals, ...importedData.goals];
      
      // Remove duplicates (based on name and type)
      const uniqueGoals = [];
      const goalNameTypeMap = new Map();
      
      combinedGoals.forEach(goal => {
        const key = `${goal.name}-${goal.type}`;
        if (!goalNameTypeMap.has(key)) {
          goalNameTypeMap.set(key, goal);
          uniqueGoals.push(goal);
        }
      });
      
      setGoals(uniqueGoals);
    }
    
    // Update settings if they're different
    if (importedData.leverage && importedData.leverage !== leverage) {
      setLeverage(importedData.leverage);
    }
    
    if (importedData.dailyTarget && importedData.dailyTarget !== dailyTarget) {
      setDailyTarget(importedData.dailyTarget);
    }
    
    alert('Данные успешно объединены!');
  };
  
  // Add a new goal
  const addGoal = () => {
    // Validate input
    if (!newGoalName) {
      alert('Пожалуйста, введите название цели.');
      return;
    }
    
    if (newGoalType === 'deposit' || newGoalType === 'percentage') {
      if (!newGoalValue || parseFloat(newGoalValue) <= 0) {
        alert('Пожалуйста, введите корректное значение цели.');
        return;
      }
    }
    
    // Create goal object
    const goalData = {
      name: newGoalName,
      type: newGoalType,
      value: newGoalValue,
      completed: false,
      autoCheck: true,
      timeLimit: newGoalTimeLimit
    };
    
    // Add type-specific properties
    if (newGoalType === 'consecutive_wins') {
      goalData.consecutiveWins = newGoalConsecutiveWins;
    }
    
    if (newGoalType === 'daily_target') {
      goalData.dailyTarget = newGoalDailyTarget;
    }
    
    // Add time limit properties
    if (newGoalTimeLimit) {
      const today = new Date();
      goalData.startDate = today.toISOString().split('T')[0];
      
      if (newGoalDeadline) {
        goalData.deadline = newGoalDeadline;
      } else {
        goalData.duration = newGoalDuration;
        goalData.durationType = newGoalDurationType;
        
        // Calculate deadline based on duration and durationType
        const deadline = new Date(today);
        switch (newGoalDurationType) {
          case 'days':
            deadline.setDate(today.getDate() + newGoalDuration);
            break;
          case 'weeks':
            deadline.setDate(today.getDate() + newGoalDuration * 7);
            break;
          case 'months':
            deadline.setMonth(today.getMonth() + newGoalDuration);
            break;
          default:
            deadline.setDate(today.getDate() + newGoalDuration);
        }
        goalData.deadline = deadline.toISOString().split('T')[0];
      }
    }
    
    // Update or add goal
    if (editingGoalIndex !== null) {
      // Update existing goal
      const updatedGoals = [...goals];
      updatedGoals[editingGoalIndex] = goalData;
      setGoals(updatedGoals);
    } else {
      // Add new goal
      setGoals([...goals, goalData]);
    }
    
    // Reset form
    cancelGoalEditing();
    setShowGoalForm(false);
  };
  
  // Start editing a goal
  const startEditingGoal = (index) => {
    const goal = goals[index];
    
    setEditingGoalIndex(index);
    setNewGoalName(goal.name);
    setNewGoalType(goal.type);
    setNewGoalValue(goal.value);
    setNewGoalTimeLimit(goal.timeLimit || false);
    
    if (goal.consecutiveWins) {
      setNewGoalConsecutiveWins(goal.consecutiveWins);
    }
    
    if (goal.dailyTarget) {
      setNewGoalDailyTarget(goal.dailyTarget);
    }
    
    if (goal.timeLimit) {
      if (goal.deadline) {
        setNewGoalDeadline(goal.deadline);
      } else {
        setNewGoalDuration(goal.duration || 30);
        setNewGoalDurationType(goal.durationType || 'days');
      }
    }
    
    setShowGoalForm(true);
  };
  
  // Delete a goal
  const deleteGoal = async (index) => {
    const result = await dialog.createPromiseDialog(
      'Удаление цели',
      `Вы уверены, что хотите удалить цель "${goals[index].name}"?`,
      ['Да', 'Нет']
    );
    
    if (result === 'Да') {
      const updatedGoals = [...goals];
      updatedGoals.splice(index, 1);
      setGoals(updatedGoals);
    }
  };
  
  // Mark a goal as completed
  const markGoalAsCompleted = async (index) => {
    const result = await dialog.createPromiseDialog(
      'Отметить цель как достигнутую',
      `Отметить цель "${goals[index].name}" как достигнутую?`,
      ['Да', 'Нет']
    );
    
    if (result === 'Да') {
      const updatedGoals = [...goals];
      updatedGoals[index] = {
        ...updatedGoals[index],
        completed: true,
        completedDate: new Date().toISOString()
      };
      setGoals(updatedGoals);
    }
  };
  
  // Cancel goal editing
  const cancelGoalEditing = () => {
    setEditingGoalIndex(null);
    setNewGoalName('');
    setNewGoalType('deposit');
    setNewGoalValue('');
    setNewGoalTimeLimit(false);
    setNewGoalDuration(30);
    setNewGoalDurationType('days');
    setNewGoalDeadline('');
    setNewGoalDailyTarget(dailyTarget);
    setNewGoalConsecutiveWins(5);
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-900 text-white">
      {/* Navigation */}
      <Navigation 
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        mobileNavOpen={mobileNavOpen}
        setMobileNavOpen={setMobileNavOpen}
      />
      
      {/* Main Content */}
      <main className="flex-grow container mx-auto px-4 py-6">
        {/* Dashboard Section */}
        {activeSection === 'dashboard' && (
          <Dashboard
            deposit={deposit}
            leverage={leverage}
            initialDeposit={initialDeposit}
            days={days}
            dailyTarget={dailyTarget}
            inputMode={inputMode}
            toggleInputMode={toggleInputMode}
            newPercentage={newPercentage}
            handlePercentageChange={handlePercentageChange}
            newAmount={newAmount}
            handleAmountChange={handleAmountChange}
            addDay={addDay}
            editingDayIndex={editingDayIndex}
            saveEditedDay={saveEditedDay}
            cancelEditing={cancelEditing}
          />
        )}
        
        {/* Transactions Section */}
        {activeSection === 'transactions' && (
          <Transactions
            days={days}
            leverage={leverage}
            startEditingDay={startEditingDay}
            archiveDay={archiveDay}
            deleteDay={deleteDay}
            initialDeposit={initialDeposit}
            deposit={deposit}
            setActiveSection={setActiveSection}
          />
        )}
        
        {/* Goals Section */}
        {activeSection === 'goals' && (
          <Goals
            goals={goals}
            showGoalForm={showGoalForm}
            setShowGoalForm={setShowGoalForm}
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
            editGoal={startEditingGoal}
            deleteGoal={deleteGoal}
            calculateGoalProgress={calculateGoalProgress}
            deposit={deposit}
            initialDeposit={initialDeposit}
            days={days}
            markGoalAsCompleted={markGoalAsCompleted}
          />
        )}
        
        {/* Analytics Section */}
        {activeSection === 'analytics' && (
          <Analytics
            days={days}
            initialDeposit={initialDeposit}
            deposit={deposit}
            leverage={leverage}
            dailyTarget={dailyTarget}
            goals={goals}
            archivedDays={archivedDays}
            includeArchived={includeArchived}
            setIncludeArchived={setIncludeArchived}
            timeRange={timeRange}
            setTimeRange={setTimeRange}
          />
        )}
        
        {/* Archive Section */}
        {activeSection === 'archive' && (
          <Archive
            archivedDays={archivedDays}
            restoreFromArchive={restoreFromArchive}
            deleteFromArchive={deleteFromArchive}
            clearArchive={clearArchive}
          />
        )}
        
        {/* Settings Section */}
        {activeSection === 'settings' && (
          <Settings
            leverage={leverage}
            setLeverage={setLeverage}
            dailyTarget={dailyTarget}
            setDailyTarget={setDailyTarget}
            initialDeposit={initialDeposit}
            setInitialDeposit={setInitialDeposit}
            deposit={deposit}
            setDeposit={setDeposit}
            days={days}
            setDays={setDays}
            archivedDays={archivedDays}
            setArchivedDays={setArchivedDays}
            goals={goals}
            setGoals={setGoals}
            setActiveSection={setActiveSection}
          />
        )}
        
        {/* Hidden file input for importing data */}
        <input 
          type="file" 
          id="fileInput" 
          accept=".json" 
          onChange={importData} 
          className="hidden" 
        />
      </main>
      
      {/* Dialog */}
      <Dialog
        isOpen={dialog.isOpen}
        title={dialog.title}
        message={dialog.message}
        options={dialog.options}
        onClose={dialog.handleClose}
        onOptionSelect={dialog.handleOptionSelect}
      />
    </div>
  );
};

export default DepositTracker; 