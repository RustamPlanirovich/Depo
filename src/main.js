import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
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
import { Line, Bar, Pie } from 'react-chartjs-2';

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

const DepositTracker = () => {
  const [deposit, setDeposit] = useState(30); // Начальный депозит
  const [leverage, setLeverage] = useState(10); // Плечо
  const [dailyTarget, setDailyTarget] = useState(3); // Целевой процент в день
  const [days, setDays] = useState([]); // Массив дней
  const [newPercentage, setNewPercentage] = useState(''); // Новый процент для добавления
  const [newAmount, setNewAmount] = useState(''); // Новая сумма для добавления
  const [inputMode, setInputMode] = useState('percentage'); // Режим ввода: 'percentage' или 'amount'
  const [initialDeposit, setInitialDeposit] = useState(30); // Начальный депозит (для статистики)
  const [editingDayIndex, setEditingDayIndex] = useState(null); // Индекс редактируемого дня
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [archivedDays, setArchivedDays] = useState([]);
  const [showArchive, setShowArchive] = useState(false); // Для отображения/скрытия архива
  const [goals, setGoals] = useState([]);
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [newGoalType, setNewGoalType] = useState('deposit'); // 'deposit' или 'percentage'
  const [newGoalValue, setNewGoalValue] = useState('');
  const [newGoalName, setNewGoalName] = useState('');
  const [editingGoalIndex, setEditingGoalIndex] = useState(null);
  const [activeSection, setActiveSection] = useState('dashboard'); // Новый state для активного раздела
  const [mobileNavOpen, setMobileNavOpen] = useState(false); // State for mobile navigation
  // Time-limited goal settings
  const [newGoalTimeLimit, setNewGoalTimeLimit] = useState(false);
  const [newGoalDuration, setNewGoalDuration] = useState(30);
  const [newGoalDurationType, setNewGoalDurationType] = useState('days');
  const [newGoalDeadline, setNewGoalDeadline] = useState('');
  // Daily profit goal settings
  const [newGoalDailyTarget, setNewGoalDailyTarget] = useState(dailyTarget);
  // Consecutive wins goal settings
  const [newGoalConsecutiveWins, setNewGoalConsecutiveWins] = useState(5);

  // Загрузка данных из localStorage при инициализации
  useEffect(() => {
    try {
      // Проверяем доступность localStorage
      if (typeof window !== 'undefined' && window.localStorage) {
        console.log('localStorage доступен');
        
        // Получаем данные
        const savedData = localStorage.getItem('depositTrackerData');
        console.log('Прочитанные данные из localStorage:', savedData);
        
        if (savedData) {
          const parsedData = JSON.parse(savedData);
          console.log('Распарсенные данные:', parsedData);
          
          // Создаем флаг для отслеживания изменений
          let hasChanges = false;
          
          // Проверяем наличие всех необходимых полей
          if (parsedData.deposit !== undefined) {
            setDeposit(parsedData.deposit);
            hasChanges = true;
          }
          
          if (parsedData.leverage !== undefined) {
            setLeverage(parsedData.leverage);
            hasChanges = true;
          }
          
          if (parsedData.dailyTarget !== undefined) {
            setDailyTarget(parsedData.dailyTarget);
            hasChanges = true;
          }
          
          if (Array.isArray(parsedData.days) && parsedData.days.length > 0) {
            // Убедимся, что у каждого дня есть поле amount
            const updatedDays = parsedData.days.map(day => {
              // Если поле amount отсутствует, вычисляем его
              if (day.amount === undefined) {
                const prevDeposit = day.day > 1 
                  ? parsedData.days[day.day - 2].deposit 
                  : (parsedData.initialDeposit || 30);
                
                return {
                  ...day,
                  amount: (prevDeposit * (parsedData.leverage || 10) * (day.percentage / 100))
                };
              }
              return day;
            });
            
            setDays(updatedDays);
            hasChanges = true;
          }
          
          if (parsedData.initialDeposit !== undefined) {
            setInitialDeposit(parsedData.initialDeposit);
            hasChanges = true;
          }
          
          // Загружаем цели, если они есть
          if (Array.isArray(parsedData.goals)) {
            setGoals(parsedData.goals);
            hasChanges = true;
          }
          
          console.log('Данные успешно загружены из localStorage, изменения:', hasChanges);
        } else {
          console.log('Данные в localStorage отсутствуют');
        }
      } else {
        console.error('localStorage недоступен');
      }
    } catch (error) {
      console.error('Ошибка при загрузке данных из localStorage:', error);
    }
  }, []);

  // Сохранение данных в localStorage при изменении
  useEffect(() => {
    // Пропускаем первое выполнение эффекта
    if (isInitialLoad) {
      setIsInitialLoad(false);
      return;
    }
    
    try {
      // Проверяем доступность localStorage
      if (typeof window !== 'undefined' && window.localStorage) {
        // Проверяем, что у нас есть данные для сохранения
        if (days.length > 0 || deposit !== 30 || leverage !== 10 || dailyTarget !== 3 || initialDeposit !== 30) {
          const dataToSave = {
            deposit,
            leverage,
            dailyTarget,
            days,
            initialDeposit,
            goals
          };
          
          const dataString = JSON.stringify(dataToSave);
          localStorage.setItem('depositTrackerData', dataString);
          
          // Проверяем, что данные сохранились
          const savedData = localStorage.getItem('depositTrackerData');
          console.log('Проверка сохранения:', savedData === dataString);
          
          console.log('Данные сохранены в localStorage');
        } else {
          console.log('Нет данных для сохранения');
        }
      } else {
        console.error('localStorage недоступен для сохранения');
      }
    } catch (error) {
      console.error('Ошибка при сохранении данных в localStorage:', error);
    }
  }, [deposit, leverage, dailyTarget, days, initialDeposit, goals]);

  // Добавление нового дня
  const addDay = () => {
    let percentage;
    
    if (inputMode === 'percentage') {
      if (newPercentage === '') return;
      percentage = parseFloat(newPercentage);
    } else {
      if (newAmount === '') return;
      const amount = parseFloat(newAmount);
      // Рассчитываем процент от суммы с учетом плеча
      percentage = (amount / (deposit * leverage)) * 100;
    }
    
    const dayNumber = days.length + 1;
    const currentDate = new Date().toISOString().split('T')[0]; // Получаем текущую дату в формате YYYY-MM-DD
    
    // Рассчитываем новый депозит с учетом плеча
    // Прибыль в долларах = сумма с плечом * процент прироста / 100
    const profitAmount = (deposit * leverage) * (percentage / 100);
    // Новый депозит = старый депозит + прибыль
    const newDeposit = deposit + profitAmount;
    
    // Определяем цвет и дополнительный текст
    let color = 'green';
    let additionalText = '';
    
    if (percentage < 0) {
      // Отрицательный процент - убыток
      color = 'red';
      // Не показываем дополнительный текст для убытков, так как процент уже отрицательный
    } else if (percentage === 0) {
      // Нулевой процент - нейтрально
      color = 'gray';
    } else if (percentage > dailyTarget) {
      // Больше целевого - отлично
      color = 'purple';
      additionalText = `(+${(percentage - dailyTarget).toFixed(2)}%)`;
    } else if (percentage < dailyTarget) {
      // Меньше целевого, но положительный - нормально
      color = 'blue';
      additionalText = `(-${(dailyTarget - percentage).toFixed(2)}%)`;
    }
    
    // Добавляем день в массив
    const newDay = {
      day: dayNumber,
      percentage,
      amount: profitAmount,
      deposit: newDeposit,
      color,
      additionalText,
      date: currentDate
    };
    
    setDays([...days, newDay]);
    setDeposit(newDeposit);
    setNewPercentage('');
    setNewAmount('');
  };

  // Редактирование дня
  const startEditingDay = (index) => {
    setEditingDayIndex(index);
    const day = days[index];
    if (inputMode === 'percentage') {
      setNewPercentage(day.percentage.toString());
    } else {
      setNewAmount(day.amount.toString());
    }
  };

  // Сохранение отредактированного дня
  const saveEditedDay = () => {
    if (editingDayIndex === null) return;
    
    let percentage;
    let amount;
    
    // Получаем предыдущий депозит (перед редактируемым днем)
    let previousDeposit = editingDayIndex > 0 ? days[editingDayIndex - 1].deposit : initialDeposit;
    
    if (inputMode === 'percentage') {
      if (newPercentage === '') return;
      percentage = parseFloat(newPercentage);
      // Рассчитываем сумму прибыли на основе процента
      amount = (previousDeposit * leverage) * (percentage / 100);
    } else {
      if (newAmount === '') return;
      amount = parseFloat(newAmount);
      // Рассчитываем процент от суммы с учетом плеча
      percentage = (amount / (previousDeposit * leverage)) * 100;
    }
    
    // Создаем копию массива дней
    const updatedDays = [...days];
    
    // Рассчитываем новый депозит
    const newDayDeposit = previousDeposit + amount;
    
    // Обновляем редактируемый день
    updatedDays[editingDayIndex] = {
      ...updatedDays[editingDayIndex],
      percentage,
      amount,
      deposit: newDayDeposit,
      color: percentage < 0 ? 'red' : 
             percentage === 0 ? 'gray' : 
             percentage > dailyTarget ? 'purple' : 
             percentage < dailyTarget ? 'blue' : 'green',
      additionalText: percentage < 0 ? '' :
                      percentage === 0 ? '' : 
                      percentage > dailyTarget ? `(+${(percentage - dailyTarget).toFixed(2)}%)` : 
                      percentage < dailyTarget ? `(-${(dailyTarget - percentage).toFixed(2)}%)` : ''
    };
    
    // Пересчитываем депозит для всех последующих дней
    let currentDeposit = newDayDeposit;
    for (let i = editingDayIndex + 1; i < updatedDays.length; i++) {
      const day = updatedDays[i];
      // Рассчитываем новый депозит
      const dayProfitAmount = (currentDeposit * leverage) * (day.percentage / 100);
      currentDeposit += dayProfitAmount;
      
      // Обновляем день
      updatedDays[i] = {
        ...day,
        deposit: currentDeposit,
        amount: dayProfitAmount
      };
    }
    
    // Обновляем состояние
    setDays(updatedDays);
    setDeposit(updatedDays[updatedDays.length - 1].deposit);
    setEditingDayIndex(null);
    setNewPercentage('');
    setNewAmount('');
  };

  // Отмена редактирования
  const cancelEditing = () => {
    setEditingDayIndex(null);
    setNewPercentage('');
    setNewAmount('');
  };

  // Функция для экспорта данных в JSON
  const exportData = () => {
    const dataToExport = {
      deposit,
      leverage,
      dailyTarget,
      days,
      initialDeposit,
      goals, // Добавляем цели в экспортируемые данные
      exportDate: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(dataToExport);
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
    
    const exportFileDefaultName = `deposit-tracker-export-${new Date().toISOString().slice(0, 10)}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  // Импорт данных из JSON с возможностью выбора действия
  const importData = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target.result);
        
        // Проверяем наличие необходимых полей
        if (importedData.deposit !== undefined && 
            importedData.leverage !== undefined && 
            Array.isArray(importedData.days)) {
          
          // Если у нас уже есть данные, предлагаем выбор
          if (days.length > 0) {
            const importOption = window.confirm(
              `У вас уже есть ${days.length} записей. Хотите:\n\n` +
              `- Нажмите "OK" чтобы добавить импортируемые данные к существующим\n` +
              `- Нажмите "Отмена" чтобы заменить существующие данные импортируемыми`
            );
            
            if (importOption) {
              // Добавляем импортируемые данные к существующим
              handleMergeImport(importedData);
            } else {
              // Заменяем существующие данные импортируемыми
              handleReplaceImport(importedData);
            }
          } else {
            // Если данных нет, просто импортируем
            handleReplaceImport(importedData);
          }
        } else {
          alert('Некорректный формат импортируемых данных');
        }
      } catch (error) {
        alert('Ошибка при импорте данных: ' + error.message);
      }
    };
    
    reader.readAsText(file);
    
    // Сбрасываем значение input, чтобы можно было повторно импортировать тот же файл
    event.target.value = '';
  };

  // Функция для замены существующих данных импортируемыми
  const handleReplaceImport = (importedData) => {
    setDeposit(importedData.deposit);
    setLeverage(importedData.leverage);
    setDailyTarget(importedData.dailyTarget || 3);
    setDays(importedData.days);
    setInitialDeposit(importedData.initialDeposit || importedData.deposit);
    
    // Импортируем цели, если они есть
    if (Array.isArray(importedData.goals)) {
      setGoals(importedData.goals);
    }
    
    alert('Данные успешно импортированы');
  };

  // Функция для добавления импортируемых данных к существующим
  const handleMergeImport = async (importedData) => {
    // Создаем карту существующих дней по датам
    const existingDaysByDate = {};
    days.forEach(day => {
      if (!existingDaysByDate[day.date]) {
        existingDaysByDate[day.date] = [];
      }
      existingDaysByDate[day.date].push(day);
    });
    
    // Копируем существующие дни
    const newDays = [...days];
    
    // Проходим по импортируемым дням
    for (const importDay of importedData.days) {
      // Проверяем, есть ли день с такой же датой
      if (existingDaysByDate[importDay.date] && existingDaysByDate[importDay.date].length > 0) {
        // Для каждого импортируемого дня с конфликтующей датой спрашиваем пользователя
        const existingDaysForDate = existingDaysByDate[importDay.date];
        
        // Формируем информацию о существующих записях
        let existingInfo = existingDaysForDate.map(day => 
          `День ${day.day}: ${day.percentage.toFixed(2)}% (${day.amount.toFixed(2)}$)`
        ).join('\n');
        
        // Запрашиваем действие для этой даты
        const action = await customConfirmDialog(
          `Для даты ${importDay.date} уже существуют записи:`,
          `Существующие:\n${existingInfo}\n\nИмпортируемая:\nДень ${importDay.day}: ${importDay.percentage.toFixed(2)}% (${importDay.amount.toFixed(2)}$)`,
          ["Заменить все", "Добавить как новую", "Пропустить"]
        );
        
        if (action === "Заменить все") {
          // Удаляем все существующие записи с этой датой
          const indicesToRemove = existingDaysForDate.map(day => newDays.findIndex(d => d === day));
          // Удаляем с конца, чтобы не сбить индексы
          indicesToRemove.sort((a, b) => b - a).forEach(index => {
            if (index !== -1) newDays.splice(index, 1);
          });
          
          // Добавляем импортируемый день
          newDays.push({...importDay});
        } else if (action === "Добавить как новую") {
          // Просто добавляем импортируемый день как новую запись
          newDays.push({...importDay});
        }
        // Если "Пропустить", ничего не делаем
      } else {
        // Если нет конфликта, просто добавляем день
        newDays.push({...importDay});
      }
    }
    
    // Сортируем дни по дате
    newDays.sort((a, b) => {
      const dateComparison = new Date(a.date) - new Date(b.date);
      if (dateComparison !== 0) return dateComparison;
      
      // Если даты одинаковые, сортируем по проценту (или другому критерию)
      return a.percentage - b.percentage;
    });
    
    // Перенумеровываем дни
    const renumberedDays = newDays.map((day, index) => ({
      ...day,
      day: index + 1
    }));
    
    // Пересчитываем депозит для всех дней
    let currentDeposit = initialDeposit;
    const recalculatedDays = renumberedDays.map(day => {
      // Рассчитываем прибыль
      const profitAmount = (currentDeposit * leverage) * (day.percentage / 100);
      // Обновляем депозит
      currentDeposit += profitAmount;
      
      return {
        ...day,
        amount: profitAmount,
        deposit: currentDeposit
      };
    });
    
    // Обновляем состояние
    setDays(recalculatedDays);
    setDeposit(recalculatedDays[recalculatedDays.length - 1].deposit);
    
    alert(`Импорт завершен. Всего записей после импорта: ${recalculatedDays.length}`);
  };

  // Функция для создания кастомного диалога с тремя вариантами
  const customConfirmDialog = (title, message, options) => {
    return new Promise((resolve) => {
      // Создаем модальное окно
      const modal = document.createElement('div');
      modal.style.position = 'fixed';
      modal.style.top = '0';
      modal.style.left = '0';
      modal.style.width = '100%';
      modal.style.height = '100%';
      modal.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
      modal.style.display = 'flex';
      modal.style.justifyContent = 'center';
      modal.style.alignItems = 'center';
      modal.style.zIndex = '1000';
      
      // Создаем контейнер диалога
      const dialog = document.createElement('div');
      dialog.style.backgroundColor = '#1f2937';
      dialog.style.padding = '20px';
      dialog.style.borderRadius = '8px';
      dialog.style.maxWidth = '500px';
      dialog.style.width = '90%';
      dialog.style.color = 'white';
      dialog.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
      
      // Добавляем заголовок
      const titleElement = document.createElement('h3');
      titleElement.textContent = title;
      titleElement.style.fontSize = '18px';
      titleElement.style.marginBottom = '10px';
      titleElement.style.color = '#93c5fd';
      dialog.appendChild(titleElement);
      
      // Добавляем сообщение
      const messageElement = document.createElement('p');
      messageElement.textContent = message;
      messageElement.style.marginBottom = '20px';
      messageElement.style.whiteSpace = 'pre-line';
      dialog.appendChild(messageElement);
      
      // Добавляем кнопки
      const buttonsContainer = document.createElement('div');
      buttonsContainer.style.display = 'flex';
      buttonsContainer.style.justifyContent = 'space-between';
      
      options.forEach(option => {
        const button = document.createElement('button');
        button.textContent = option;
        button.style.padding = '8px 16px';
        button.style.borderRadius = '4px';
        button.style.border = 'none';
        button.style.cursor = 'pointer';
        button.style.marginRight = '10px';
        
        // Стили для разных кнопок
        if (option === "Заменить") {
          button.style.backgroundColor = '#ef4444';
        } else if (option === "Объединить") {
          button.style.backgroundColor = '#3b82f6';
        } else {
          button.style.backgroundColor = '#6b7280';
        }
        
        button.addEventListener('click', () => {
          document.body.removeChild(modal);
          resolve(option);
        });
        
        buttonsContainer.appendChild(button);
      });
      
      dialog.appendChild(buttonsContainer);
      modal.appendChild(dialog);
      document.body.appendChild(modal);
    });
  };

  // Очистка всех данных
  const resetData = () => {
    if (window.confirm('Вы уверены, что хотите сбросить все данные?')) {
      setDeposit(30);
      setLeverage(10);
      setDailyTarget(3);
      setDays([]);
      setNewPercentage('');
      setNewAmount('');
      setInitialDeposit(30);
      localStorage.removeItem('depositTrackerData');
    }
  };

  // Функция для обновления начальных настроек
  const updateSettings = (newDeposit, newLeverage, newTarget) => {
    // Проверяем, есть ли какие-то изменения
    const depositChanged = newDeposit !== deposit;
    const leverageChanged = newLeverage !== leverage;
    const targetChanged = newTarget !== dailyTarget;
    
    if (depositChanged) {
      setDeposit(newDeposit);
      if (days.length === 0) {
        setInitialDeposit(newDeposit);
      }
    }
    
    if (leverageChanged) {
      setLeverage(newLeverage);
    }
    
    if (targetChanged) {
      setDailyTarget(newTarget);
    }
  };

  // Исправляем обработку ввода для предотвращения ошибок
  const handlePercentageChange = (e) => {
    const value = e.target.value;
    // Разрешаем пустую строку, отрицательные или положительные числовые значения
    if (value === '' || !isNaN(parseFloat(value))) {
      setNewPercentage(value);
    }
  };

  // Обработчик изменения суммы
  const handleAmountChange = (e) => {
    const value = e.target.value;
    // Разрешаем пустую строку или числовые значения
    if (value === '' || !isNaN(parseFloat(value))) {
      setNewAmount(value);
    }
  };

  // Переключение режима ввода
  const toggleInputMode = () => {
    setInputMode(inputMode === 'percentage' ? 'amount' : 'percentage');
    setNewPercentage('');
    setNewAmount('');
  };

  // Добавьте эту функцию в компонент
  const checkLocalStorage = () => {
    try {
      const testKey = 'test_localStorage';
      localStorage.setItem(testKey, 'test');
      const testValue = localStorage.getItem(testKey);
      localStorage.removeItem(testKey);
      
      if (testValue === 'test') {
        alert('localStorage работает корректно');
      } else {
        alert('localStorage не работает корректно');
      }
    } catch (error) {
      alert('Ошибка при проверке localStorage: ' + error.message);
    }
  };

  // Функция для принудительного сохранения данных
  const forceSaveData = () => {
    try {
      const dataToSave = {
        deposit,
        leverage,
        dailyTarget,
        days,
        initialDeposit,
        goals
      };
      
      const dataString = JSON.stringify(dataToSave);
      localStorage.setItem('depositTrackerData', dataString);
      
      alert('Данные принудительно сохранены в localStorage');
    } catch (error) {
      alert('Ошибка при сохранении: ' + error.message);
    }
  };

  // Функция для удаления дня
  const deleteDay = (index) => {
    // Запрашиваем подтверждение
    if (!window.confirm(`Вы уверены, что хотите удалить запись за ${days[index].date}?`)) {
      return;
    }
    
    // Создаем копию массива дней
    const updatedDays = [...days];
    
    // Удаляем день
    updatedDays.splice(index, 1);
    
    // Если дней не осталось, сбрасываем депозит на начальный
    if (updatedDays.length === 0) {
      setDays([]);
      setDeposit(initialDeposit);
      return;
    }
    
    // Перенумеровываем дни
    const renumberedDays = updatedDays.map((day, idx) => ({
      ...day,
      day: idx + 1
    }));
    
    // Пересчитываем депозит для всех дней
    let currentDeposit = initialDeposit;
    const recalculatedDays = renumberedDays.map(day => {
      // Рассчитываем прибыль
      const profitAmount = (currentDeposit * leverage) * (day.percentage / 100);
      // Обновляем депозит
      currentDeposit += profitAmount;
      
      return {
        ...day,
        amount: profitAmount,
        deposit: currentDeposit
      };
    });
    
    // Обновляем состояние
    setDays(recalculatedDays);
    setDeposit(recalculatedDays[recalculatedDays.length - 1].deposit);
  };

  // Загрузка архивированных записей из localStorage
  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const savedArchive = localStorage.getItem('depositTrackerArchive');
        if (savedArchive) {
          const parsedArchive = JSON.parse(savedArchive);
          if (Array.isArray(parsedArchive)) {
            // Фильтруем записи старше недели
            const oneWeekAgo = new Date();
            oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
            
            const filteredArchive = parsedArchive.filter(item => {
              const archiveDate = new Date(item.archiveDate);
              return archiveDate > oneWeekAgo;
            });
            
            setArchivedDays(filteredArchive);
          }
        }
      }
    } catch (error) {
      console.error('Ошибка при загрузке архива:', error);
    }
  }, []);

  // Сохранение архивированных записей в localStorage
  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage && archivedDays.length > 0) {
        localStorage.setItem('depositTrackerArchive', JSON.stringify(archivedDays));
      }
    } catch (error) {
      console.error('Ошибка при сохранении архива:', error);
    }
  }, [archivedDays]);

  // Функция для архивирования дня вместо удаления
  const archiveDay = (index) => {
    // Запрашиваем подтверждение
    if (!window.confirm(`Вы уверены, что хотите архивировать запись за ${days[index].date}?`)) {
      return;
    }
    
    // Получаем день для архивирования
    const dayToArchive = {...days[index]};
    
    // Добавляем дату архивирования
    dayToArchive.archiveDate = new Date().toISOString();
    
    // Добавляем в архив
    setArchivedDays([...archivedDays, dayToArchive]);
    
    // Создаем копию массива дней
    const updatedDays = [...days];
    
    // Удаляем день
    updatedDays.splice(index, 1);
    
    // Если дней не осталось, сбрасываем депозит на начальный
    if (updatedDays.length === 0) {
      setDays([]);
      setDeposit(initialDeposit);
      return;
    }
    
    // Перенумеровываем дни
    const renumberedDays = updatedDays.map((day, idx) => ({
      ...day,
      day: idx + 1
    }));
    
    // Пересчитываем депозит для всех дней
    let currentDeposit = initialDeposit;
    const recalculatedDays = renumberedDays.map(day => {
      // Рассчитываем прибыль
      const profitAmount = (currentDeposit * leverage) * (day.percentage / 100);
      // Обновляем депозит
      currentDeposit += profitAmount;
      
      return {
        ...day,
        amount: profitAmount,
        deposit: currentDeposit
      };
    });
    
    // Обновляем состояние
    setDays(recalculatedDays);
    setDeposit(recalculatedDays[recalculatedDays.length - 1].deposit);
  };

  // Функция для восстановления дня из архива
  const restoreFromArchive = (index) => {
    // Получаем день для восстановления
    const dayToRestore = {...archivedDays[index]};
    
    // Удаляем поле даты архивирования
    delete dayToRestore.archiveDate;
    
    // Добавляем день в основной массив
    const newDays = [...days, dayToRestore];
    
    // Сортируем дни по дате
    newDays.sort((a, b) => {
      const dateComparison = new Date(a.date) - new Date(b.date);
      if (dateComparison !== 0) return dateComparison;
      
      // Если даты одинаковые, сортируем по проценту
      return a.percentage - b.percentage;
    });
    
    // Перенумеровываем дни
    const renumberedDays = newDays.map((day, idx) => ({
      ...day,
      day: idx + 1
    }));
    
    // Пересчитываем депозит для всех дней
    let currentDeposit = initialDeposit;
    const recalculatedDays = renumberedDays.map(day => {
      // Рассчитываем прибыль
      const profitAmount = (currentDeposit * leverage) * (day.percentage / 100);
      // Обновляем депозит
      currentDeposit += profitAmount;
      
      return {
        ...day,
        amount: profitAmount,
        deposit: currentDeposit
      };
    });
    
    // Обновляем состояние
    setDays(recalculatedDays);
    setDeposit(recalculatedDays[recalculatedDays.length - 1].deposit);
    
    // Удаляем день из архива
    const updatedArchive = [...archivedDays];
    updatedArchive.splice(index, 1);
    setArchivedDays(updatedArchive);
  };

  // Функция для полного удаления дня из архива
  const deleteFromArchive = (index) => {
    if (!window.confirm('Вы уверены, что хотите полностью удалить эту запись из архива?')) {
      return;
    }
    
    const updatedArchive = [...archivedDays];
    updatedArchive.splice(index, 1);
    setArchivedDays(updatedArchive);
  };

  // Функция для очистки архива
  const clearArchive = () => {
    if (!window.confirm('Вы уверены, что хотите очистить весь архив?')) {
      return;
    }
    
    setArchivedDays([]);
    localStorage.removeItem('depositTrackerArchive');
  };

  // Функция для добавления новой цели
  const addGoal = () => {
    if (newGoalValue === '' || newGoalName === '') return;
    
    const goalValue = parseFloat(newGoalValue);
    if (isNaN(goalValue) || goalValue <= 0) return;
    
    const newGoal = {
      id: Date.now(),
      name: newGoalName,
      type: newGoalType,
      value: goalValue,
      createdAt: new Date().toISOString(),
      completed: false
    };
    
    // Add time limit properties if enabled
    if (newGoalTimeLimit) {
      if (newGoalDeadline) {
        // Use specific deadline date
        newGoal.deadline = newGoalDeadline;
      } else {
        // Calculate deadline based on duration
        const deadline = new Date();
        switch (newGoalDurationType) {
          case 'days':
            deadline.setDate(deadline.getDate() + newGoalDuration);
            break;
          case 'weeks':
            deadline.setDate(deadline.getDate() + newGoalDuration * 7);
            break;
          case 'months':
            deadline.setMonth(deadline.getMonth() + newGoalDuration);
            break;
          default:
            deadline.setDate(deadline.getDate() + newGoalDuration);
        }
        newGoal.deadline = deadline.toISOString();
      }
      newGoal.timeLimit = true;
    }
    
    // Add properties for specific goal types
    if (newGoalType === 'daily_target') {
      newGoal.dailyTarget = newGoalDailyTarget;
    } else if (newGoalType === 'consecutive_wins') {
      newGoal.consecutiveWins = newGoalConsecutiveWins;
    }
    
    if (editingGoalIndex !== null) {
      // Редактируем существующую цель
      const updatedGoals = [...goals];
      updatedGoals[editingGoalIndex] = newGoal;
      setGoals(updatedGoals);
      setEditingGoalIndex(null);
    } else {
      // Добавляем новую цель
      setGoals([...goals, newGoal]);
    }
    
    // Сбрасываем форму
    setNewGoalType('deposit');
    setNewGoalValue('');
    setNewGoalName('');
    setNewGoalTimeLimit(false);
    setNewGoalDuration(30);
    setNewGoalDurationType('days');
    setNewGoalDeadline('');
    setNewGoalDailyTarget(dailyTarget);
    setNewGoalConsecutiveWins(5);
    setShowGoalForm(false);
  };

  // Функция для редактирования цели
  const editGoal = (index) => {
    const goal = goals[index];
    setNewGoalType(goal.type);
    setNewGoalValue(goal.value.toString());
    setNewGoalName(goal.name);
    
    // Set time limit properties if present
    if (goal.timeLimit) {
      setNewGoalTimeLimit(true);
      if (goal.deadline) {
        // If goal has a specific deadline date
        setNewGoalDeadline(goal.deadline.split('T')[0]); // Extract just the date part
      }
    } else {
      setNewGoalTimeLimit(false);
      setNewGoalDuration(30);
      setNewGoalDurationType('days');
      setNewGoalDeadline('');
    }
    
    // Set properties for specific goal types
    if (goal.type === 'daily_target' && goal.dailyTarget) {
      setNewGoalDailyTarget(goal.dailyTarget);
    } else {
      setNewGoalDailyTarget(dailyTarget);
    }
    
    if (goal.type === 'consecutive_wins' && goal.consecutiveWins) {
      setNewGoalConsecutiveWins(goal.consecutiveWins);
    } else {
      setNewGoalConsecutiveWins(5);
    }
    
    setEditingGoalIndex(index);
    setShowGoalForm(true);
  };

  // Функция для удаления цели
  const deleteGoal = (index) => {
    if (!window.confirm('Вы уверены, что хотите удалить эту цель?')) return;
    
    const updatedGoals = [...goals];
    updatedGoals.splice(index, 1);
    setGoals(updatedGoals);
  };

  // Функция для отметки цели как выполненной
  const markGoalAsCompleted = (index) => {
    const updatedGoals = [...goals];
    updatedGoals[index] = {
      ...updatedGoals[index],
      completed: true,
      completedAt: new Date().toISOString()
    };
    setGoals(updatedGoals);
    
    // Показываем уведомление
    alert(`Поздравляем! Вы достигли цели "${updatedGoals[index].name}"!`);
  };

  // Функция для расчета прогресса цели
  const calculateGoalProgress = (goal) => {
    // Calculate base progress based on goal type
    let progress = 0;
    
    if (goal.type === 'deposit') {
      // Прогресс для цели по депозиту
      progress = Math.min(100, (deposit / goal.value) * 100);
    } else if (goal.type === 'percentage') {
      // Прогресс для цели по процентному росту
      const percentageGrowth = ((deposit / initialDeposit) - 1) * 100;
      progress = Math.min(100, (percentageGrowth / goal.value) * 100);
    } else if (goal.type === 'consecutive_wins') {
      // Progress for consecutive wins goals
      if (days.length === 0) return 0;
      
      let currentStreak = 0;
      const sortedDays = [...days].sort((a, b) => new Date(b.date) - new Date(a.date));
      
      for (const day of sortedDays) {
        if (day.percentage > 0) {
          currentStreak++;
        } else {
          break;
        }
      }
      
      progress = Math.min(100, (currentStreak / goal.consecutiveWins) * 100);
    } else if (goal.type === 'daily_target') {
      // Progress for achieving daily target
      if (days.length === 0) return 0;
      
      const totalDays = days.length;
      const daysAboveTarget = days.filter(day => day.percentage >= goal.dailyTarget).length;
      progress = Math.min(100, (daysAboveTarget / totalDays) * 100);
    }
    
    // Adjust progress if there's a time limit
    if (goal.timeLimit && goal.deadline) {
      const now = new Date();
      const deadline = new Date(goal.deadline);
      const createdAt = new Date(goal.createdAt);
      
      // If deadline has passed and goal is not complete, show 0%
      if (now > deadline && progress < 100) {
        return 0;
      }
      
      // Calculate time progress (what percentage of time has passed)
      const totalTime = deadline - createdAt;
      const timeElapsed = now - createdAt;
      const timeProgress = Math.min(100, (timeElapsed / totalTime) * 100);
      
      // For time-limited goals, we want to show a good progress
      // if the person is ahead of schedule, so we compare
      // actual progress with time progress
      if (progress > timeProgress) {
        // Ahead of schedule - return actual progress
        return progress;
      } else {
        // Behind schedule - adjust progress based on remaining time
        const remainingTime = deadline - now;
        if (remainingTime <= 0) return 0;
        
        const remainingPercentage = 100 - progress;
        const urgencyFactor = Math.max(0, 1 - (remainingTime / totalTime));
        
        // Apply urgency factor to reduce progress when deadline approaches
        return Math.max(0, progress * (1 - urgencyFactor * 0.5));
      }
    }
    
    return progress;
  };

  // Функция для проверки достижения целей
  useEffect(() => {
    if (days.length === 0) return;
    
    goals.forEach((goal, index) => {
      if (goal.completed) return;
      
      let achieved = false;
      
      if (goal.type === 'deposit' && deposit >= goal.value) {
        achieved = true;
      } else if (goal.type === 'percentage') {
        const percentageGrowth = ((deposit / initialDeposit) - 1) * 100;
        if (percentageGrowth >= goal.value) {
          achieved = true;
        }
      } else if (goal.type === 'consecutive_wins') {
        // Check consecutive wins
        let currentStreak = 0;
        const sortedDays = [...days].sort((a, b) => new Date(b.date) - new Date(a.date));
        
        for (const day of sortedDays) {
          if (day.percentage > 0) {
            currentStreak++;
            if (currentStreak >= goal.consecutiveWins) {
              achieved = true;
              break;
            }
          } else {
            break;
          }
        }
      } else if (goal.type === 'daily_target') {
        // We don't automatically mark daily target goals as achieved
        // since they're based on ratio of days meeting target
      }
      
      // Check time limit - if deadline passed and goal not achieved,
      // mark it as failed
      if (goal.timeLimit && goal.deadline) {
        const now = new Date();
        const deadline = new Date(goal.deadline);
        
        if (now > deadline && !achieved) {
          const updatedGoals = [...goals];
          updatedGoals[index] = {
            ...updatedGoals[index],
            failed: true,
            failedAt: new Date().toISOString()
          };
          setGoals(updatedGoals);
          
          return; // Skip marking as completed
        }
      }
      
      if (achieved) {
        markGoalAsCompleted(index);
      }
    });
  }, [deposit, days]);

  // Отмена редактирования цели
  const cancelGoalEditing = () => {
    setEditingGoalIndex(null);
    setNewGoalType('deposit');
    setNewGoalValue('');
    setNewGoalName('');
    setNewGoalTimeLimit(false);
    setNewGoalDuration(30);
    setNewGoalDurationType('days');
    setNewGoalDeadline('');
    setNewGoalDailyTarget(dailyTarget);
    setNewGoalConsecutiveWins(5);
    setShowGoalForm(false);
  };

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-900 text-gray-100 overflow-hidden">
      {/* Mobile Navigation Bar (visible only on small screens) */}
      <div className="md:hidden bg-gray-800 border-b border-gray-700 p-3 flex justify-between items-center">
        <h1 className="text-lg font-bold text-blue-300">Разгон депозита</h1>
        <button 
          onClick={() => setMobileNavOpen(!mobileNavOpen)}
          className="p-2 rounded-md text-gray-300 hover:bg-gray-700"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>
      
      {/* Sidebar Navigation (responsive) */}
      <div className={`${mobileNavOpen ? 'block' : 'hidden'} md:block w-full md:w-64 bg-gray-800 border-r border-gray-700 flex flex-col ${mobileNavOpen ? 'h-screen fixed top-0 left-0 z-10' : ''}`}>
        {mobileNavOpen && (
          <div className="md:hidden p-3 border-b border-gray-700 flex justify-between items-center">
            <h1 className="text-lg font-bold text-blue-300">Разгон депозита</h1>
            <button 
              onClick={() => setMobileNavOpen(false)}
              className="p-2 rounded-md text-gray-300 hover:bg-gray-700"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
        
        <div className="hidden md:block p-4 border-b border-gray-700">
          <h1 className="text-xl font-bold text-blue-300">Разгон депозита</h1>
        </div>
        
        <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
          <button 
            onClick={() => {
              setActiveSection('dashboard');
              setMobileNavOpen(false);
            }}
            className={`w-full text-left px-3 py-2 rounded flex items-center ${activeSection === 'dashboard' ? 'bg-blue-700' : 'hover:bg-gray-700'}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
            </svg>
            Обзор
          </button>
          
          <button 
            onClick={() => {
              setActiveSection('transactions');
              setMobileNavOpen(false);
            }}
            className={`w-full text-left px-3 py-2 rounded flex items-center ${activeSection === 'transactions' ? 'bg-blue-700' : 'hover:bg-gray-700'}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 3a1 1 0 000 2h10a1 1 0 100-2H3zm0 4a1 1 0 000 2h10a1 1 0 100-2H3zm0 4a1 1 0 100 2h10a1 1 0 100-2H3z" clipRule="evenodd" />
            </svg>
            Сделки
          </button>
          
          <button 
            onClick={() => {
              setActiveSection('analytics');
              setMobileNavOpen(false);
            }}
            className={`w-full text-left px-3 py-2 rounded flex items-center ${activeSection === 'analytics' ? 'bg-blue-700' : 'hover:bg-gray-700'}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zm6-4a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zm6-3a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
            </svg>
            Аналитика
          </button>
          
          <button 
            onClick={() => {
              setActiveSection('goals');
              setMobileNavOpen(false);
            }}
            className={`w-full text-left px-3 py-2 rounded flex items-center ${activeSection === 'goals' ? 'bg-blue-700' : 'hover:bg-gray-700'}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM14 11a1 1 0 011 1v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0v-1h-1a1 1 0 110-2h1v-1a1 1 0 011-1z" />
            </svg>
            Цели
          </button>
          
          <button 
            onClick={() => {
              setActiveSection('archive');
              setMobileNavOpen(false);
            }}
            className={`w-full text-left px-3 py-2 rounded flex items-center ${activeSection === 'archive' ? 'bg-blue-700' : 'hover:bg-gray-700'}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path d="M4 3a2 2 0 100 4h12a2 2 0 100-4H4z" />
              <path fillRule="evenodd" d="M3 8h14v7a2 2 0 01-2 2H5a2 2 0 01-2-2V8zm5 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" clipRule="evenodd" />
            </svg>
            Архив
          </button>
          
          <button 
            onClick={() => {
              setActiveSection('settings');
              setMobileNavOpen(false);
            }}
            className={`w-full text-left px-3 py-2 rounded flex items-center ${activeSection === 'settings' ? 'bg-blue-700' : 'hover:bg-gray-700'}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
            </svg>
            Настройки
          </button>
        </nav>
        
        <div className="p-4 border-t border-gray-700">
          <div className="bg-gray-700 p-3 rounded">
            <h3 className="text-sm font-medium text-gray-300 mb-1">Текущий депозит</h3>
            <div className="text-xl font-bold text-blue-300">${deposit.toFixed(2)}</div>
            <div className="text-sm text-gray-400 mt-1">С плечом: ${(deposit * leverage).toFixed(2)}</div>
          </div>
        </div>
      </div>
      
      {/* Main Content Area */}
      <div className="flex-1 overflow-auto p-2 sm:p-4">
        {/* Content will change based on activeSection */}
        
        {/* Dashboard Section */}
        {activeSection === 'dashboard' && (
          <DashboardSection 
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
            updateSettings={updateSettings}
            exportData={exportData}
            importData={importData}
            resetData={resetData}
            checkLocalStorage={checkLocalStorage}
            forceSaveData={forceSaveData}
          />
        )}
        
        {/* Transactions Section */}
        {activeSection === 'transactions' && (
          <TransactionsSection 
            days={days}
            leverage={leverage}
            startEditingDay={startEditingDay}
            archiveDay={archiveDay}
            initialDeposit={initialDeposit}
            deposit={deposit}
            setActiveSection={setActiveSection}
          />
        )}
        
        {/* Analytics Section */}
        {activeSection === 'analytics' && (
          <AnalyticsSection 
            days={days}
            archivedDays={archivedDays}
            leverage={leverage}
            initialDeposit={initialDeposit}
            deposit={deposit}
            dailyTarget={dailyTarget}
          />
        )}
        
        {/* Goals Section */}
        {activeSection === 'goals' && (
          <GoalsSection 
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
            addGoal={addGoal}
            cancelGoalEditing={cancelGoalEditing}
            editGoal={editGoal}
            deleteGoal={deleteGoal}
            calculateGoalProgress={calculateGoalProgress}
            deposit={deposit}
            initialDeposit={initialDeposit}
            days={days}
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
            markGoalAsCompleted={markGoalAsCompleted}
          />
        )}
        
        {/* Archive Section */}
        {activeSection === 'archive' && (
          <ArchiveSection 
            archivedDays={archivedDays}
            clearArchive={clearArchive}
            restoreFromArchive={restoreFromArchive}
            deleteFromArchive={deleteFromArchive}
          />
        )}
        
        {/* Settings Section */}
        {activeSection === 'settings' && (
          <SettingsSection 
            deposit={deposit}
            leverage={leverage}
            dailyTarget={dailyTarget}
            initialDeposit={initialDeposit}
            days={days}
            updateSettings={updateSettings}
            exportData={exportData}
            importData={importData}
            resetData={resetData}
            checkLocalStorage={checkLocalStorage}
            forceSaveData={forceSaveData}
          />
        )}
      </div>
    </div>
  );
};

// Dashboard Section Component
const DashboardSection = ({
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
  saveEditedDay,
  cancelEditing
}) => {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 text-blue-300">Обзор</h1>
      
      {/* Dashboard Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Initial Deposit */}
        <div className="bg-gray-800 p-4 rounded border border-gray-700">
          <h3 className="text-sm text-gray-400 mb-2">Начальный депозит</h3>
          <div className="text-2xl font-bold">${initialDeposit.toFixed(2)}</div>
        </div>
        
        {/* Current Deposit */}
        <div className="bg-gray-800 p-4 rounded border border-gray-700">
          <h3 className="text-sm text-gray-400 mb-2">Текущий депозит</h3>
          <div className="text-2xl font-bold text-blue-300">${deposit.toFixed(2)}</div>
          <div className="text-xs text-gray-500 mt-1">
            {deposit > initialDeposit ? (
              <span className="text-green-400">+{((deposit - initialDeposit) / initialDeposit * 100).toFixed(2)}%</span>
            ) : (
              <span className="text-red-400">{((deposit - initialDeposit) / initialDeposit * 100).toFixed(2)}%</span>
            )}
          </div>
        </div>
        
        {/* Leveraged Deposit */}
        <div className="bg-gray-800 p-4 rounded border border-gray-700">
          <h3 className="text-sm text-gray-400 mb-2">С учетом плеча {leverage}x</h3>
          <div className="text-2xl font-bold text-yellow-400">${(deposit * leverage).toFixed(2)}</div>
        </div>
        
        {/* Number of Days */}
        <div className="bg-gray-800 p-4 rounded border border-gray-700">
          <h3 className="text-sm text-gray-400 mb-2">Кол-во сделок</h3>
          <div className="text-2xl font-bold text-purple-300">{days.length}</div>
          {days.length > 0 && (
            <div className="text-xs text-gray-500 mt-1">
              Последняя: {days[days.length - 1].date}
            </div>
          )}
        </div>
      </div>
      
      {/* Add Transaction Form */}
      <div className="bg-gray-800 p-4 md:p-6 rounded border border-gray-700 mb-6">
        <h2 className="text-lg font-medium mb-4 text-blue-300">{editingDayIndex !== null ? 'Редактировать сделку' : 'Добавить сделку'}</h2>
        
        <div className="flex flex-col sm:flex-row items-center mb-4">
          <div className="w-full sm:w-1/4 mb-3 sm:mb-0">
            <button 
              onClick={toggleInputMode} 
              className={`w-full px-3 py-2 rounded border ${inputMode === 'percentage' ? 'bg-blue-600 text-white border-blue-700' : 'bg-gray-700 text-gray-200 border-gray-600'}`}
            >
              Процент %
            </button>
          </div>
          <div className="w-full sm:w-1/4 mb-3 sm:mb-0 sm:ml-2">
            <button 
              onClick={toggleInputMode} 
              className={`w-full px-3 py-2 rounded border ${inputMode === 'amount' ? 'bg-blue-600 text-white border-blue-700' : 'bg-gray-700 text-gray-200 border-gray-600'}`}
            >
              Сумма $
            </button>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row items-end">
          {inputMode === 'percentage' ? (
            <div className="w-full sm:w-1/2 md:w-1/3 mb-3 sm:mb-0">
              <label className="block mb-2 text-sm">Процент прибыли/убытка:</label>
              <div className="flex">
                <input 
                  type="number" 
                  step="0.01"
                  value={newPercentage} 
                  onChange={handlePercentageChange}
                  className="flex-1 p-2 bg-gray-700 border border-gray-600 rounded-l text-white"
                  placeholder="-0.5 или 1.2"
                />
                <span className="bg-gray-600 text-white px-3 py-2 rounded-r">%</span>
              </div>
            </div>
          ) : (
            <div className="w-full sm:w-1/2 md:w-1/3 mb-3 sm:mb-0">
              <label className="block mb-2 text-sm">Сумма прибыли/убытка:</label>
              <div className="flex">
                <span className="bg-gray-600 text-white px-3 py-2 rounded-l">$</span>
                <input 
                  type="number" 
                  step="0.01"
                  value={newAmount} 
                  onChange={handleAmountChange}
                  className="flex-1 p-2 bg-gray-700 border border-gray-600 rounded-r text-white"
                  placeholder="-50 или 100"
                />
              </div>
            </div>
          )}
          
          <div className="mt-3 sm:mt-0 w-full sm:w-auto sm:ml-3">
            {editingDayIndex !== null ? (
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                <button 
                  onClick={saveEditedDay} 
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Сохранить
                </button>
                <button 
                  onClick={cancelEditing} 
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Отмена
                </button>
              </div>
            ) : (
              <button 
                onClick={addDay} 
                className="w-full sm:w-auto px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Добавить
              </button>
            )}
          </div>
        </div>
      </div>
      
      {/* Recent Transactions */}
      <div className="bg-gray-800 p-4 md:p-6 rounded border border-gray-700">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium text-blue-300">Последние сделки</h2>
        </div>
        
        {days.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-700">
                  <th className="p-2 text-left">№</th>
                  <th className="p-2 text-left">Дата</th>
                  <th className="p-2 text-left">%</th>
                  <th className="p-2 text-left">Сумма</th>
                  <th className="p-2 text-left">Депозит</th>
                </tr>
              </thead>
              <tbody>
                {days.slice(-5).map((day, index) => (
                  <tr key={index} className="border-b border-gray-700">
                    <td className="p-2">{day.dayNumber}</td>
                    <td className="p-2">{day.date}</td>
                    <td className="p-2">
                      <span className={day.percentage > 0 ? 'text-green-400' : day.percentage < 0 ? 'text-red-400' : 'text-gray-400'}>
                        {day.percentage > 0 ? '+' : ''}{day.percentage}%
                      </span>
                    </td>
                    <td className="p-2">
                      <span className={day.amount > 0 ? 'text-green-400' : day.amount < 0 ? 'text-red-400' : 'text-gray-400'}>
                        {day.amount > 0 ? '+' : ''}{day.amount.toFixed(2)}$
                      </span>
                    </td>
                    <td className="p-2">{day.deposit.toFixed(2)}$</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-400 text-center py-4">Нет данных. Добавьте свою первую сделку.</p>
        )}
      </div>
    </div>
  );
};

// Transactions Section Component
const TransactionsSection = ({
  days,
  leverage,
  startEditingDay,
  archiveDay,
  initialDeposit,
  deposit,
  setActiveSection
}) => {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 text-blue-300">История сделок</h1>
      
      {days.length > 0 ? (
        <div className="bg-gray-800 p-4 rounded border border-gray-700">
          <div className="flex justify-between items-center mb-4">
            <div>
              <span className="text-sm text-gray-400">Всего сделок: </span>
              <span className="font-bold">{days.length}</span>
              <span className="ml-4 text-sm text-gray-400">Общий прирост: </span>
              <span className="font-bold text-green-400">{((deposit / initialDeposit - 1) * 100).toFixed(2)}%</span>
            </div>
            <div className="text-sm text-gray-400">
              Начальный депозит: ${initialDeposit.toFixed(2)} → Текущий: ${deposit.toFixed(2)}
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-700">
                  <th className="p-2 text-left">День</th>
                  <th className="p-2 text-left">Дата</th>
                  <th className="p-2 text-left">Процент</th>
                  <th className="p-2 text-left">Прибыль</th>
                  <th className="p-2 text-left">Депозит</th>
                  <th className="p-2 text-left">С учетом плеча</th>
                  <th className="p-2 text-left">Действия</th>
                </tr>
              </thead>
              <tbody>
                {days.map((day, index) => (
                  <tr key={day.day} style={{ backgroundColor: 
                    day.color === 'green' ? 'rgba(74, 222, 128, 0.2)' : 
                    day.color === 'red' ? 'rgba(248, 113, 113, 0.2)' :
                    day.color === 'purple' ? 'rgba(192, 132, 252, 0.2)' : 
                    'rgba(125, 211, 252, 0.2)' 
                  }}>
                    <td className="p-2">{day.day}</td>
                    <td className="p-2">{day.date}</td>
                    <td className="p-2">{day.percentage.toFixed(2)}% {day.additionalText}</td>
                    <td className="p-2">${day.amount.toFixed(2)}</td>
                    <td className="p-2">${day.deposit.toFixed(2)}</td>
                    <td className="p-2">${(day.deposit * leverage).toFixed(2)}</td>
                    <td className="p-2">
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => startEditingDay(index)}
                          className="bg-yellow-600 text-white px-2 py-1 rounded hover:bg-yellow-700 text-sm"
                        >
                          Изменить
                        </button>
                        <button 
                          onClick={() => archiveDay(index)}
                          className="bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 text-sm"
                        >
                          Архивировать
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-gray-800 p-6 rounded border border-gray-700 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <p className="text-gray-400 mb-4">У вас пока нет записей о сделках</p>
          <button 
            onClick={() => setActiveSection('dashboard')}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Добавить первую сделку
          </button>
        </div>
      )}
    </div>
  );
};

// Goals Section Component
const GoalsSection = ({
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
  addGoal,
  cancelGoalEditing,
  editGoal,
  deleteGoal,
  calculateGoalProgress,
  deposit,
  initialDeposit,
  days,
  // New props
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
  markGoalAsCompleted
}) => {
  // GoalCalendar Component
  const GoalCalendar = ({ goals }) => {
    const [date, setDate] = useState(new Date());
    const [tooltipContent, setTooltipContent] = useState(null);
    const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
    const [selectedDate, setSelectedDate] = useState(null);
    const [showGoalModal, setShowGoalModal] = useState(false);
    const [goalsForSelectedDate, setGoalsForSelectedDate] = useState([]);
    
    // Filter goals that have a deadline
    const goalsWithDeadlines = goals.filter(goal => goal.timeLimit && goal.deadline);
    
    // Function to get goal classes for a specific date
    const getTileClassName = ({ date, view }) => {
      // Only for month view
      if (view !== 'month') return null;
      
      // Check if any goals have this date as a deadline
      const hasGoalDeadline = goalsWithDeadlines.some(goal => {
        const deadlineDate = new Date(goal.deadline);
        return (
          date.getDate() === deadlineDate.getDate() &&
          date.getMonth() === deadlineDate.getMonth() &&
          date.getFullYear() === deadlineDate.getFullYear()
        );
      });
      
      return hasGoalDeadline ? 'goal-deadline-date' : null;
    };
    
    // Function to get content for a specific date
    const getTileContent = ({ date, view }) => {
      // Only for month view
      if (view !== 'month') return null;
      
      // Find goals that have this date as a deadline
      const goalsForDate = goalsWithDeadlines.filter(goal => {
        const deadlineDate = new Date(goal.deadline);
        return (
          date.getDate() === deadlineDate.getDate() &&
          date.getMonth() === deadlineDate.getMonth() &&
          date.getFullYear() === deadlineDate.getFullYear()
        );
      });
      
      if (goalsForDate.length === 0) return null;
      
      // Display an indicator for each goal
      return (
        <div className="goal-indicators">
          {goalsForDate.map((goal, index) => (
            <div 
              key={index} 
              className={`goal-indicator ${
                goal.completed ? 'bg-green-500' : 
                goal.failed ? 'bg-red-500' : 
                'bg-blue-500'
              }`}
              title={goal.name}
              onMouseEnter={(e) => {
                setTooltipContent(goal.name);
                setTooltipPosition({ 
                  x: e.clientX, 
                  y: e.clientY 
                });
              }}
              onMouseLeave={() => setTooltipContent(null)}
            />
          ))}
        </div>
      );
    };
    
    // Handle date click to show goals or create a new goal
    const handleDateClick = (value) => {
      // Format date as YYYY-MM-DD for the input
      const formattedDate = value.toISOString().split('T')[0];
      
      // Find goals for this date
      const goalsForDate = goalsWithDeadlines.filter(goal => {
        const deadlineDate = new Date(goal.deadline);
        return (
          value.getDate() === deadlineDate.getDate() &&
          value.getMonth() === deadlineDate.getMonth() &&
          value.getFullYear() === deadlineDate.getFullYear()
        );
      });
      
      // If there are goals for this date, show them
      if (goalsForDate.length > 0) {
        setSelectedDate(formattedDate);
        setGoalsForSelectedDate(goalsForDate);
        setShowGoalModal(true);
      } else {
        // Otherwise, set up the form for adding a new goal with this date as the deadline
        setNewGoalTimeLimit(true);
        setNewGoalDeadline(formattedDate);
        setShowGoalForm(true);
      }
      
      // Update the calendar selected date
      setDate(value);
    };
    
    // Function to create a new goal with the selected date
    const handleCreateGoal = () => {
      setShowGoalModal(false);
      setNewGoalTimeLimit(true);
      setNewGoalDeadline(selectedDate);
      setShowGoalForm(true);
    };
    
    return (
      <div className="calendar-container bg-gray-800 p-5 rounded border border-gray-700">
        <h2 className="text-lg font-medium mb-4 text-blue-300">Календарь целей</h2>
        <div className="mb-2 text-sm text-gray-400">
          <p>Цвета индикаторов:</p>
          <div className="flex items-center mt-1">
            <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
            <span>Активная цель</span>
          </div>
          <div className="flex items-center mt-1">
            <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
            <span>Достигнутая цель</span>
          </div>
          <div className="flex items-center mt-1">
            <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
            <span>Просроченная цель</span>
          </div>
        </div>
        <div className="mb-3 text-sm text-gray-300">
          Нажмите на дату, чтобы просмотреть цели или создать новую
        </div>
        <Calendar 
          onChange={handleDateClick}
          value={date}
          tileClassName={getTileClassName}
          tileContent={getTileContent}
          minDate={new Date()}
        />
        {tooltipContent && (
          <div 
            className="tooltip absolute bg-gray-900 text-white p-2 rounded shadow-md text-sm z-10"
            style={{
              top: tooltipPosition.y + 10,
              left: tooltipPosition.x - 100,
            }}
          >
            {tooltipContent}
          </div>
        )}
        
        {/* Modal for displaying goals for a selected date */}
        {showGoalModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg max-w-lg w-full mx-4">
              <h3 className="text-xl font-medium mb-4 text-blue-300">
                Цели на {new Date(selectedDate).toLocaleDateString()}
              </h3>
              
              <div className="max-h-60 overflow-y-auto">
                {goalsForSelectedDate.map((goal, index) => (
                  <div 
                    key={index}
                    className={`p-3 mb-2 rounded ${
                      goal.completed ? 'bg-green-900 bg-opacity-20 border border-green-500' : 
                      goal.failed ? 'bg-red-900 bg-opacity-20 border border-red-500' : 
                      'bg-gray-700'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <h4 className="font-medium">{goal.name}</h4>
                      <span className={`px-2 py-1 text-xs rounded ${
                        goal.completed ? 'bg-green-600' : 
                        goal.failed ? 'bg-red-600' : 
                        'bg-blue-600'
                      }`}>
                        {goal.completed ? 'Достигнуто' : goal.failed ? 'Просрочено' : 'В процессе'}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-300 mt-1">
                      {goal.type === 'deposit' && `Цель: достичь $${parseFloat(goal.value).toFixed(2)}`}
                      {goal.type === 'percentage' && `Цель: вырасти на ${parseFloat(goal.value).toFixed(2)}%`}
                      {goal.type === 'consecutive_wins' && `Цель: серия из ${goal.consecutiveWins} прибыльных дней подряд`}
                      {goal.type === 'daily_target' && `Цель: достигать ${parseFloat(goal.dailyTarget).toFixed(2)}% в день`}
                    </p>
                  </div>
                ))}
              </div>
              
              <div className="flex justify-between mt-4">
                <button
                  onClick={() => setShowGoalModal(false)}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded"
                >
                  Закрыть
                </button>
                
                <button
                  onClick={handleCreateGoal}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded text-white"
                >
                  Добавить цель на эту дату
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-blue-300">Финансовые цели</h1>
        <button 
          onClick={() => setShowGoalForm(!showGoalForm)}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          {showGoalForm ? 'Отмена' : 'Добавить цель'}
        </button>
      </div>
      
      {/* Form for adding/editing goals */}
      {showGoalForm && (
        <div className="mb-6 bg-gray-800 p-5 rounded border border-gray-700">
          <h2 className="text-lg font-medium mb-4 text-green-300">
            {editingGoalIndex !== null ? 'Редактировать цель' : 'Новая цель'}
          </h2>
          
          <div className="grid grid-cols-1 gap-5">
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
      )}
      
      {/* Main content: Goals list and Calendar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Goals list */}
        <div>
          {goals.length > 0 ? (
            <div className="grid grid-cols-1 gap-5">
              {goals.map((goal, index) => {
                const progress = calculateGoalProgress(goal);
                const isExpired = goal.timeLimit && goal.deadline && new Date(goal.deadline) < new Date();
                
                return (
                  <div 
                    key={index} 
                    className={`bg-gray-800 p-5 rounded border ${
                      goal.completed ? 'border-green-500' : 
                      isExpired ? 'border-red-500' : 
                      'border-gray-700'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-medium text-white flex items-center">
                          {goal.name}
                          {goal.completed && (
                            <span className="ml-2 px-2 py-1 bg-green-600 text-xs text-white rounded">
                              Достигнуто
                            </span>
                          )}
                          {isExpired && !goal.completed && (
                            <span className="ml-2 px-2 py-1 bg-red-600 text-xs text-white rounded">
                              Просрочено
                            </span>
                          )}
                        </h3>
                        
                        <div className="mt-2 text-sm">
                          {goal.type === 'deposit' && (
                            <p className="text-gray-300">
                              Цель: достичь <span className="text-yellow-400">${parseFloat(goal.value).toFixed(2)}</span>
                            </p>
                          )}
                          
                          {goal.type === 'percentage' && (
                            <p className="text-gray-300">
                              Цель: вырасти на <span className="text-yellow-400">{parseFloat(goal.value).toFixed(2)}%</span>
                            </p>
                          )}
                          
                          {goal.type === 'consecutive_wins' && (
                            <p className="text-gray-300">
                              Цель: серия из <span className="text-yellow-400">{goal.consecutiveWins}</span> прибыльных дней подряд
                            </p>
                          )}
                          
                          {goal.type === 'daily_target' && (
                            <p className="text-gray-300">
                              Цель: достигать <span className="text-yellow-400">{parseFloat(goal.dailyTarget).toFixed(2)}%</span> в день
                            </p>
                          )}
                          
                          {/* Time limit information */}
                          {goal.timeLimit && (
                            <p className="text-blue-300 mt-1">
                              {goal.deadline ? (
                                <>Срок: до <span className="font-medium">{new Date(goal.deadline).toLocaleDateString()}</span></>
                              ) : (
                                <>Срок: <span className="font-medium">{goal.duration} {
                                  goal.durationType === 'days' ? 'дней' : 
                                  goal.durationType === 'weeks' ? 'недель' : 'месяцев'
                                }</span></>
                              )}
                            </p>
                          )}
                          
                          {/* Show current progress */}
                          <p className="mt-1">
                            Текущий прогресс: <span className="font-medium text-green-400">{progress.toFixed(2)}%</span>
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        <button
                          onClick={() => editGoal(index)}
                          className="text-blue-400 hover:text-blue-300"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => deleteGoal(index)}
                          className="text-red-400 hover:text-red-300"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    
                    <div className="w-full bg-gray-700 rounded-full h-2.5">
                      <div
                        className={`h-2.5 rounded-full ${
                          goal.completed ? 'bg-green-600' : 
                          progress >= 50 ? 'bg-blue-600' : 'bg-blue-400'
                        }`}
                        style={{ width: `${Math.min(100, progress)}%` }}
                      ></div>
                    </div>
                    
                    {!goal.completed && progress >= 100 && (
                      <div className="mt-4">
                        <button
                          onClick={() => markGoalAsCompleted(index)}
                          className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
                        >
                          Отметить как достигнутую
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-10 bg-gray-800 rounded">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-400">Нет активных целей</h3>
              <p className="text-gray-500 mt-2">Добавьте новую цель, чтобы отслеживать свой прогресс</p>
            </div>
          )}
        </div>
        
        {/* Calendar */}
        {goals.some(goal => goal.timeLimit) && (
          <div>
            <GoalCalendar goals={goals} />
          </div>
        )}
      </div>
    </div>
  );
};

// Archive Section Component
const ArchiveSection = ({
  archivedDays,
  restoreFromArchive,
  deleteFromArchive
}) => {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 text-blue-300">Архив</h1>
      
      {archivedDays.length > 0 ? (
        <div className="bg-gray-800 p-4 rounded border border-gray-700">
          <div className="flex justify-between items-center mb-4">
            <div>
              <span className="text-sm text-gray-400">Всего архивных записей: </span>
              <span className="font-bold">{archivedDays.length}</span>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-700">
                  <th className="p-2 text-left">День</th>
                  <th className="p-2 text-left">Дата</th>
                  <th className="p-2 text-left">Процент</th>
                  <th className="p-2 text-left">Прибыль</th>
                  <th className="p-2 text-left">Депозит</th>
                  <th className="p-2 text-left">Действия</th>
                </tr>
              </thead>
              <tbody>
                {archivedDays.map((day, index) => (
                  <tr key={day.day} style={{ backgroundColor: 
                    day.color === 'green' ? 'rgba(74, 222, 128, 0.2)' : 
                    day.color === 'red' ? 'rgba(248, 113, 113, 0.2)' :
                    day.color === 'purple' ? 'rgba(192, 132, 252, 0.2)' : 
                    'rgba(125, 211, 252, 0.2)' 
                  }}>
                    <td className="p-2">{day.day}</td>
                    <td className="p-2">{day.date}</td>
                    <td className="p-2">{day.percentage.toFixed(2)}% {day.additionalText}</td>
                    <td className="p-2">${day.amount.toFixed(2)}</td>
                    <td className="p-2">${day.deposit.toFixed(2)}</td>
                    <td className="p-2">
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => restoreFromArchive(index)}
                          className="bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700 text-sm"
                        >
                          Восстановить
                        </button>
                        <button 
                          onClick={() => deleteFromArchive(index)}
                          className="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700 text-sm"
                        >
                          Удалить
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-gray-800 p-6 rounded border border-gray-700 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <p className="text-gray-400 mb-4">У вас пока нет архивных записей</p>
        </div>
      )}
    </div>
  );
};

// Settings Section Component
const SettingsSection = ({
  leverage,
  setLeverage,
  dailyTarget,
  setDailyTarget,
  initialDeposit,
  setInitialDeposit,
  deposit,
  days,
  setDays,
  archivedDays,
  setArchivedDays,
  goals,
  setGoals,
  setActiveSection
}) => {
  const handleReset = () => {
    if (window.confirm('Вы уверены, что хотите сбросить все данные?')) {
      setLeverage(1);
      setDailyTarget(0.5);
      setInitialDeposit(100);
      setDays([]);
      setArchivedDays([]);
      setGoals([]);
      setActiveSection('dashboard');
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 text-blue-300">Настройки</h1>
      
      <div className="bg-gray-800 p-4 rounded border border-gray-700 mb-6">
        <h2 className="text-lg font-medium mb-4 text-blue-300">Общие настройки</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block mb-2">Плечо:</label>
            <input
              type="number"
              value={leverage}
              onChange={(e) => setLeverage(parseFloat(e.target.value) || 1)}
              className="w-full p-3 border rounded bg-gray-700 text-white"
              step="0.01"
              min="1"
            />
          </div>
          <div>
            <label className="block mb-2">Целевой процент в день (%):</label>
            <input
              type="number"
              value={dailyTarget}
              onChange={(e) => setDailyTarget(parseFloat(e.target.value) || 0.5)}
              className="w-full p-3 border rounded bg-gray-700 text-white"
              step="0.01"
              min="0.01"
            />
          </div>
        </div>
      </div>
      
      <div className="bg-gray-800 p-4 rounded border border-gray-700 mb-6">
        <h2 className="text-lg font-medium mb-4 text-blue-300">Сброс данных</h2>
        
        <p className="text-gray-400 mb-4">
          Это действие удалит все ваши данные, включая сделки, архивные записи и цели.
        </p>
        
        <button
          onClick={handleReset}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          Сбросить все данные
        </button>
      </div>
    </div>
  );
};

// Analytics Section Component
const AnalyticsSection = ({
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
  const [selectedTimeRange, setSelectedTimeRange] = useState('all');

  const handleTimeRangeChange = (e) => {
    setSelectedTimeRange(e.target.value);
    setTimeRange(e.target.value);
  };

  const calculateTotalGrowthPercentage = () => {
    if (days.length === 0) return 0;
    const lastDeposit = days[days.length - 1].deposit;
    return ((lastDeposit / initialDeposit - 1) * 100).toFixed(2);
  };

  const calculateAverageDailyPercentage = () => {
    if (days.length === 0) return 0;
    const totalPercentage = days.reduce((sum, day) => sum + day.percentage, 0);
    return (totalPercentage / days.length).toFixed(2);
  };

  return (
    <div>
      {/* Analytics content will be added here */}
    </div>
  );
};

// At the very end of the file
export default DepositTracker;