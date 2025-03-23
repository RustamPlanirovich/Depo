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
  const [editingTransactionIndex, setEditingTransactionIndex] = useState(null);
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
      // Amount is calculated from percentage of deposit, then multiplied by leverage
      amount = calculateAmountFromPercentage(deposit, percentage, leverage);
    } else {
      amount = parseFloat(newAmount);
      // Percentage is calculated by first dividing the amount by leverage to get the raw amount
      percentage = calculatePercentageFromAmount(deposit, amount, leverage);
    }
    
    // Get today's date
    const today = new Date().toISOString().split('T')[0];
    const newDeposit = deposit + amount;
    
    // Check if there's already a transaction for today
    const todayIndex = days.findIndex(day => day.date === today);
    
    if (todayIndex === -1) {
      // No transactions for today - create a new day
      const newDay = {
        day: days.length + 1,
        date: today,
        percentage: percentage,
        amount: amount,
        deposit: newDeposit,
        transactions: [{ percentage, amount, timestamp: new Date().toISOString() }]
      };
      
      // Update state
      setDays([...days, newDay]);
    } else {
      // There's already a transaction for today - update it
      const updatedDays = [...days];
      const todayEntry = { ...updatedDays[todayIndex] };
      
      // Add the new transaction to today's transactions
      const transactions = todayEntry.transactions || [];
      transactions.push({ percentage, amount, timestamp: new Date().toISOString() });
      
      // Update the day's total amount
      const totalAmount = transactions.reduce((sum, t) => sum + t.amount, 0);
      
      // Calculate the total percentage based on the total amount divided by leverage
      // relative to the original deposit before any transactions today
      const baseDeposit = todayEntry.deposit - todayEntry.amount; // The deposit value before today's transactions
      const totalPercentage = calculatePercentageFromAmount(baseDeposit, totalAmount, leverage);
      
      // Update the day entry
      todayEntry.percentage = totalPercentage;
      todayEntry.amount = totalAmount;
      todayEntry.deposit = newDeposit;
      todayEntry.transactions = transactions;
      
      updatedDays[todayIndex] = todayEntry;
      
      // Update state
      setDays(updatedDays);
    }
    
    // Update deposit and reset input fields
    setDeposit(newDeposit);
    setNewPercentage('');
    setNewAmount('');
  };
  
  // Start editing a day transaction
  const startEditingDay = (dayIndex, transactionIndex = null) => {
    const day = days[dayIndex];
    setEditingDayIndex(dayIndex);
    
    // If transaction index is provided, edit that specific transaction
    if (transactionIndex !== null && day.transactions && day.transactions.length > transactionIndex) {
      setEditingTransactionIndex(transactionIndex);
      const transaction = day.transactions[transactionIndex];
      
      if (inputMode === 'percentage') {
        setNewPercentage(transaction.percentage.toString());
      } else {
        setNewAmount(transaction.amount.toString());
      }
    } else {
      // Otherwise edit the whole day (last transaction or day total)
      setEditingTransactionIndex(null);
      
      if (inputMode === 'percentage') {
        setNewPercentage(day.percentage.toString());
      } else {
        setNewAmount(day.amount.toString());
      }
    }
  };
  
  // Save edited day transaction
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
    const updatedDays = [...days];
    let updatedDay = { ...editedDay };
    
    // Calculate new amount and percentage for this transaction
    let newPercentageValue, newAmountValue;
    
    if (inputMode === 'percentage') {
      newPercentageValue = parseFloat(newPercentage);
      
      // If editing a specific transaction, calculate based on the deposit before this transaction
      if (editingTransactionIndex !== null && updatedDay.transactions) {
        const prevDeposit = editingTransactionIndex === 0 
          ? updatedDay.deposit - updatedDay.amount // First transaction of the day
          : updatedDay.deposit - updatedDay.transactions.reduce((sum, t, idx) => 
              idx >= editingTransactionIndex ? sum : sum + t.amount, 0);
              
        // Calculate amount based on percentage of deposit, then apply leverage
        newAmountValue = calculateAmountFromPercentage(prevDeposit, newPercentageValue, leverage);
      } else {
        // Editing the whole day
        // Calculate amount based on percentage of deposit before any transaction today
        const baseDeposit = editedDay.deposit - editedDay.amount;
        newAmountValue = calculateAmountFromPercentage(baseDeposit, newPercentageValue, leverage);
      }
    } else {
      newAmountValue = parseFloat(newAmount);
      
      // If editing a specific transaction, calculate based on the deposit before this transaction
      if (editingTransactionIndex !== null && updatedDay.transactions) {
        const prevDeposit = editingTransactionIndex === 0 
          ? updatedDay.deposit - updatedDay.amount // First transaction of the day
          : updatedDay.deposit - updatedDay.transactions.reduce((sum, t, idx) => 
              idx >= editingTransactionIndex ? sum : sum + t.amount, 0);
              
        // Calculate percentage by first dividing amount by leverage
        newPercentageValue = calculatePercentageFromAmount(prevDeposit, newAmountValue, leverage);
      } else {
        // Editing the whole day
        // Calculate percentage from amount/leverage relative to deposit before transaction
        const baseDeposit = editedDay.deposit - editedDay.amount;
        newPercentageValue = calculatePercentageFromAmount(baseDeposit, newAmountValue, leverage);
      }
    }
    
    // Calculate the amount difference to update deposits
    let amountDifference = 0;
    
    // Update the transactions array if it exists
    if (updatedDay.transactions && updatedDay.transactions.length > 0) {
      const updatedTransactions = [...updatedDay.transactions];
      
      if (editingTransactionIndex !== null) {
        // Editing a specific transaction
        const oldAmount = updatedTransactions[editingTransactionIndex].amount;
        amountDifference = newAmountValue - oldAmount;
        
        updatedTransactions[editingTransactionIndex] = {
          ...updatedTransactions[editingTransactionIndex],
          percentage: newPercentageValue,
          amount: newAmountValue,
          timestamp: new Date().toISOString() // Update timestamp to show it was edited
        };
      } else {
        // Editing the whole day - create a new single transaction with the total amount
        const oldTotalAmount = updatedDay.amount;
        amountDifference = newAmountValue - oldTotalAmount;
        
        // Replace all transactions with a single one
        updatedTransactions.length = 0; // Clear the array
        updatedTransactions.push({
          percentage: newPercentageValue,
          amount: newAmountValue,
          timestamp: new Date().toISOString()
        });
      }
      
      // Recalculate total day values
      const totalAmount = updatedTransactions.reduce((sum, t) => sum + t.amount, 0);
      
      // Calculate the overall day percentage based on the total amount relative to the starting deposit
      const baseDeposit = editedDay.deposit - editedDay.amount; // The deposit value before today's transactions
      const totalPercentage = calculatePercentageFromAmount(baseDeposit, totalAmount, leverage);
      
      updatedDay = {
        ...updatedDay,
        percentage: totalPercentage,
        amount: totalAmount,
        deposit: editedDay.deposit + amountDifference,
        transactions: updatedTransactions
      };
    } else {
      // No transactions array - update the day directly
      amountDifference = newAmountValue - editedDay.amount;
      
      updatedDay = {
        ...updatedDay,
        percentage: newPercentageValue,
        amount: newAmountValue,
        deposit: editedDay.deposit + amountDifference,
        transactions: [{
          percentage: newPercentageValue,
          amount: newAmountValue,
          timestamp: new Date().toISOString()
        }]
      };
    }
    
    // Update the day in the array
    updatedDays[editingDayIndex] = updatedDay;
    
    // Update deposits in following days
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
    setEditingTransactionIndex(null);
    setNewPercentage('');
    setNewAmount('');
  };
  
  // Cancel editing
  const cancelEditing = () => {
    setEditingDayIndex(null);
    setEditingTransactionIndex(null);
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
  
  // Archive a single transaction
  const archiveTransaction = async (dayIndex, transactionIndex) => {
    const day = days[dayIndex];
    
    // If there's only one transaction, archive the whole day
    if (!day.transactions || day.transactions.length <= 1) {
      archiveDay(dayIndex);
      return;
    }
    
    const transaction = day.transactions[transactionIndex];
    const result = await dialog.createPromiseDialog(
      'Архивация сделки',
      `Вы уверены, что хотите архивировать сделку #${transactionIndex + 1} (${transaction.percentage.toFixed(2)}%) за ${day.date}?`,
      ['Да', 'Нет']
    );
    
    if (result === 'Да') {
      // Create a copy of the day with only this transaction
      const transactionToArchive = {
        ...day,
        transactions: [transaction],
        amount: transaction.amount,
        percentage: transaction.percentage
      };
      
      // Add to archive
      setArchivedDays([...archivedDays, transactionToArchive]);
      
      // Remove the transaction from the day
      const updatedDays = [...days];
      const updatedDay = { ...day };
      const updatedTransactions = [...day.transactions];
      
      // Get the amount of the transaction to remove
      const amountToRemove = transaction.amount;
      
      // Remove the transaction
      updatedTransactions.splice(transactionIndex, 1);
      
      // If no transactions left, remove the day
      if (updatedTransactions.length === 0) {
        updatedDays.splice(dayIndex, 1);
        
        // Update day numbers
        updatedDays.forEach((d, i) => {
          d.day = i + 1;
        });
        
        // Update deposits in following days
        for (let i = dayIndex; i < updatedDays.length; i++) {
          updatedDays[i].deposit = updatedDays[i].deposit - amountToRemove;
        }
        
        setDays(updatedDays);
        setDeposit(deposit - amountToRemove);
        return;
      }
      
      // If there are transactions left, recalculate the day's total
      const totalAmount = updatedTransactions.reduce((sum, t) => sum + t.amount, 0);
      
      // Calculate the overall day percentage
      const baseDeposit = day.deposit - day.amount; // Deposit before all transactions of the day
      const totalPercentage = calculatePercentageFromAmount(baseDeposit, totalAmount, leverage);
      
      // Update the day
      updatedDay.transactions = updatedTransactions;
      updatedDay.amount = totalAmount;
      updatedDay.percentage = totalPercentage;
      updatedDay.deposit = updatedDay.deposit - amountToRemove;
      
      updatedDays[dayIndex] = updatedDay;
      
      // Update deposits in following days
      for (let i = dayIndex + 1; i < updatedDays.length; i++) {
        updatedDays[i].deposit = updatedDays[i].deposit - amountToRemove;
      }
      
      setDays(updatedDays);
      setDeposit(deposit - amountToRemove);
    }
  };
  
  // Restore from archive
  const restoreFromArchive = async (index) => {
    const archivedItem = archivedDays[index];
    const isTransaction = archivedItem.transactions && archivedItem.transactions.length === 1 && archivedItem.transactions[0].timestamp;
    
    const message = isTransaction 
      ? `Вы уверены, что хотите восстановить сделку (${archivedItem.percentage.toFixed(2)}%) за ${archivedItem.date}?`
      : `Вы уверены, что хотите восстановить день ${archivedItem.day} из архива?`;
    
    const result = await dialog.createPromiseDialog(
      'Восстановление из архива',
      message,
      ['Да', 'Нет']
    );
    
    if (result === 'Да') {
      if (isTransaction) {
        // This is a single transaction - need to restore it to its original day
        const transaction = archivedItem.transactions[0];
        const updatedDays = [...days];
        
        // Find if the original day exists by date
        const originalDayIndex = updatedDays.findIndex(day => day.date === archivedItem.date);
        
        if (originalDayIndex !== -1) {
          // Day exists - add the transaction to it
          const originalDay = updatedDays[originalDayIndex];
          
          // Make sure the day has a transactions array
          if (!originalDay.transactions) {
            originalDay.transactions = [{ 
              amount: originalDay.amount,
              percentage: originalDay.percentage,
              timestamp: null
            }];
          }
          
          // Add the restored transaction
          originalDay.transactions.push(transaction);
          
          // Recalculate the day's totals
          const totalAmount = originalDay.transactions.reduce((sum, t) => sum + t.amount, 0);
          const baseDeposit = originalDayIndex > 0 
            ? updatedDays[originalDayIndex - 1].deposit 
            : initialDeposit;
          const totalPercentage = calculatePercentageFromAmount(baseDeposit, totalAmount, leverage);
          
          // Update the day
          originalDay.amount = totalAmount;
          originalDay.percentage = totalPercentage;
          
          // Update the deposit for this day and all subsequent days
          let currentDeposit = baseDeposit;
          for (let i = originalDayIndex; i < updatedDays.length; i++) {
            currentDeposit += updatedDays[i].amount;
            updatedDays[i].deposit = currentDeposit;
          }
          
          // Update state
          setDays(updatedDays);
          setDeposit(currentDeposit);
        } else {
          // The day doesn't exist - create a new day with this transaction
          const dayToRestore = { 
            ...archivedItem,
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
          
          setDays(recalculatedDays);
          setDeposit(currentDeposit);
        }
      } else {
        // This is a full day - restore as before
        const dayToRestore = { 
          ...archivedItem,
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
        
        setDays(recalculatedDays);
        setDeposit(currentDeposit);
      }
      
      // Remove from archive
      const updatedArchive = [...archivedDays];
      updatedArchive.splice(index, 1);
      setArchivedDays(updatedArchive);
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
  
  // Render the main component
  return (
    <div className="deposit-tracker-container" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
      {/* Mobile navigation toggle button (visible only on mobile) */}
      <button
        className="mobile-nav-toggle md:hidden"
        onClick={() => setMobileNavOpen(!mobileNavOpen)}
        aria-label="Toggle navigation"
        style={{ 
          color: 'var(--color-text-primary)',
          backgroundColor: 'var(--color-bg-secondary)'
        }}
      >
        {mobileNavOpen ? 'Close Menu' : 'Menu'}
      </button>

      <div className="deposit-tracker-layout">
        {/* Side navigation - now styled with macOS design */}
        <aside className={`mac-sidebar ${mobileNavOpen ? 'mobile-open' : ''}`}>
          <Navigation
            activeSection={activeSection}
            setActiveSection={setActiveSection}
            setMobileNavOpen={setMobileNavOpen}
          />
        </aside>

        {/* Main content area - now with macOS styling */}
        <main className="main-content-area">
          {/* Render appropriate section based on active section */}
          {activeSection === 'dashboard' && (
            <Dashboard
              deposit={deposit}
              initialDeposit={initialDeposit}
              leverage={leverage}
              dailyTarget={dailyTarget}
              days={days}
              setDeposit={setDeposit}
              setInitialDeposit={setInitialDeposit}
              setLeverage={setLeverage}
              setDailyTarget={setDailyTarget}
              newPercentage={newPercentage}
              newAmount={newAmount}
              inputMode={inputMode}
              handlePercentageChange={handlePercentageChange}
              handleAmountChange={handleAmountChange}
              toggleInputMode={toggleInputMode}
              addDay={addDay}
            />
          )}

          {/* Transactions Section */}
          {activeSection === 'transactions' && (
            <Transactions
              days={days}
              leverage={leverage}
              startEditingDay={startEditingDay}
              archiveDay={archiveDay}
              archiveTransaction={archiveTransaction}
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
        </main>
      </div>

      {/* Import/Export data dialog */}
      <Dialog
        isOpen={dialog.isOpen('importExport')}
        title="Import/Export Data"
        onClose={() => dialog.close('importExport')}
      >
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Import Data</h3>
          <p className="text-sm">
            Select a JSON file to import. Note: This will overwrite your current data.
          </p>
          <div className="space-y-2">
            <input
              type="file"
              accept=".json"
              onChange={importData}
              className="mac-input"
            />
          </div>

          <div className="border-t border-gray-700 pt-4 mt-4">
            <h3 className="text-lg font-medium">Export Data</h3>
            <p className="text-sm">
              Export your data as a JSON file for backup or transfer to another device.
            </p>
            <button
              onClick={() => {
                const data = {
                  deposit,
                  leverage,
                  dailyTarget,
                  days,
                  initialDeposit,
                  archivedDays,
                  goals
                };
                
                const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `deposit-tracker-export-${new Date().toISOString().split('T')[0]}.json`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
              }}
              className="mac-button mt-2"
            >
              Export Data
            </button>
          </div>
        </div>
      </Dialog>

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