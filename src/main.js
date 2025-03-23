import React, { useState, useEffect } from 'react';
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
    setShowGoalForm(false);
  };

  // Функция для редактирования цели
  const editGoal = (index) => {
    const goal = goals[index];
    setNewGoalType(goal.type);
    setNewGoalValue(goal.value.toString());
    setNewGoalName(goal.name);
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
    if (goal.type === 'deposit') {
      // Прогресс для цели по депозиту
      return Math.min(100, (deposit / goal.value) * 100);
    } else if (goal.type === 'percentage') {
      // Прогресс для цели по процентному росту
      const percentageGrowth = ((deposit / initialDeposit) - 1) * 100;
      return Math.min(100, (percentageGrowth / goal.value) * 100);
    }
    return 0;
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
    setShowGoalForm(false);
  };

  return (
    <div className="flex h-screen bg-gray-900 text-gray-100 overflow-hidden">
      {/* Sidebar Navigation */}
      <div className="w-64 bg-gray-800 border-r border-gray-700 flex flex-col">
        <div className="p-4 border-b border-gray-700">
          <h1 className="text-xl font-bold text-blue-300">Разгон депозита</h1>
        </div>
        
        <nav className="flex-1 p-2 space-y-1">
          <button 
            onClick={() => setActiveSection('dashboard')}
            className={`w-full text-left px-3 py-2 rounded flex items-center ${activeSection === 'dashboard' ? 'bg-blue-700' : 'hover:bg-gray-700'}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
            </svg>
            Обзор
          </button>
          
          <button 
            onClick={() => setActiveSection('transactions')}
            className={`w-full text-left px-3 py-2 rounded flex items-center ${activeSection === 'transactions' ? 'bg-blue-700' : 'hover:bg-gray-700'}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 3a1 1 0 000 2h10a1 1 0 100-2H3zm0 4a1 1 0 000 2h10a1 1 0 100-2H3zm0 4a1 1 0 100 2h10a1 1 0 100-2H3z" clipRule="evenodd" />
            </svg>
            Сделки
          </button>
          
          <button 
            onClick={() => setActiveSection('analytics')}
            className={`w-full text-left px-3 py-2 rounded flex items-center ${activeSection === 'analytics' ? 'bg-blue-700' : 'hover:bg-gray-700'}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zm6-4a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zm6-3a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
            </svg>
            Аналитика
          </button>
          
          <button 
            onClick={() => setActiveSection('goals')}
            className={`w-full text-left px-3 py-2 rounded flex items-center ${activeSection === 'goals' ? 'bg-blue-700' : 'hover:bg-gray-700'}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM14 11a1 1 0 011 1v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0v-1h-1a1 1 0 110-2h1v-1a1 1 0 011-1z" />
            </svg>
            Цели
          </button>
          
          <button 
            onClick={() => setActiveSection('archive')}
            className={`w-full text-left px-3 py-2 rounded flex items-center ${activeSection === 'archive' ? 'bg-blue-700' : 'hover:bg-gray-700'}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path d="M4 3a2 2 0 100 4h12a2 2 0 100-4H4z" />
              <path fillRule="evenodd" d="M3 8h14v7a2 2 0 01-2 2H5a2 2 0 01-2-2V8zm5 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" clipRule="evenodd" />
            </svg>
            Архив
          </button>
          
          <button 
            onClick={() => setActiveSection('settings')}
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
      <div className="flex-1 overflow-auto p-4">
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
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Current State Card */}
        <div className="bg-gray-800 p-4 rounded border border-gray-700">
          <h2 className="text-lg font-medium mb-3 text-blue-300">Текущее состояние</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span>Текущий депозит:</span>
              <span className="font-bold">${deposit.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>С учетом плеча:</span>
              <span className="font-bold">${(deposit * leverage).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Количество сделок:</span>
              <span className="font-bold">{days.length}</span>
            </div>
            <div className="flex justify-between">
              <span>Прирост к начальному:</span>
              <span className="font-bold text-green-400">{deposit > initialDeposit ? '+' : ''}{((deposit / initialDeposit - 1) * 100).toFixed(2)}%</span>
            </div>
            <div className="flex justify-between">
              <span>Целевой % в день:</span>
              <span className="font-bold">{dailyTarget}%</span>
            </div>
          </div>
        </div>
        
        {/* Add New Transaction Card */}
        <div className="bg-gray-800 p-4 rounded border border-gray-700">
          <h2 className="text-lg font-medium mb-3 text-blue-300">Добавить новую сделку</h2>
          <div className="flex justify-between mb-3">
            <button 
              onClick={toggleInputMode}
              className={`px-4 py-2 rounded-md w-1/2 mr-2 ${inputMode === 'percentage' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'}`}
            >
              По проценту
            </button>
            <button 
              onClick={toggleInputMode}
              className={`px-4 py-2 rounded-md w-1/2 ${inputMode === 'amount' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'}`}
            >
              По сумме
            </button>
          </div>
          
          {inputMode === 'percentage' ? (
            <div className="mb-3">
              <label className="block mb-1">Процент за сделку:</label>
              <input
                type="number"
                value={newPercentage}
                onChange={handlePercentageChange}
                className="w-full p-2 border rounded bg-gray-700 text-white"
                step="0.01"
              />
            </div>
          ) : (
            <div className="mb-3">
              <label className="block mb-1">Сумма прибыли ($):</label>
              <input
                type="number"
                value={newAmount}
                onChange={handleAmountChange}
                className="w-full p-2 border rounded bg-gray-700 text-white"
                step="0.01"
              />
            </div>
          )}
          
          {editingDayIndex !== null ? (
            <div className="grid grid-cols-2 gap-2">
              <button 
                onClick={saveEditedDay}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                Сохранить
              </button>
              <button 
                onClick={cancelEditing}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
              >
                Отмена
              </button>
            </div>
          ) : (
            <button 
              onClick={addDay}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full"
            >
              Добавить сделку
            </button>
          )}
        </div>
        
        {/* Statistics Card */}
        {days.length > 0 && (
          <div className="bg-gray-800 p-4 rounded border border-gray-700">
            <h2 className="text-lg font-medium mb-3 text-blue-300">Прогнозы</h2>
            <div className="space-y-4">
              <div>
                <div className="text-sm text-gray-400 mb-1">Удвоение депозита</div>
                <div className="font-medium">
                  ${deposit.toFixed(2)} → ${(deposit * 2).toFixed(2)}{' '}
                  {(() => {
                    const avgPercentage = days.reduce((sum, day) => sum + day.percentage, 0) / days.length;
                    if (avgPercentage <= 0) {
                      return <span className="text-red-400">Невозможно (средний % отрицательный)</span>;
                    } else {
                      return (
                        <>
                          за{' '}
                          <span className="text-yellow-400 font-bold">
                            {Math.ceil(70 / avgPercentage).toFixed(0)} дней
                          </span>
                        </>
                      );
                    }
                  })()}
                </div>
              </div>
              
              <div>
                <div className="text-sm text-gray-400 mb-1">До $1000</div>
                <div className="font-medium">
                  {deposit < 1000 ? (
                    (() => {
                      const avgPercentage = days.reduce((sum, day) => sum + day.percentage, 0) / days.length;
                      if (avgPercentage <= 0) {
                        return <span className="text-red-400">Невозможно (средний % отрицательный)</span>;
                      } else {
                        return (
                          <>
                            ${deposit.toFixed(2)} → $1,000 за{' '}
                            <span className="text-yellow-400 font-bold">
                              {Math.ceil(Math.log(1000 / deposit) / Math.log(1 + avgPercentage / 100)).toFixed(0)} дней
                            </span>
                          </>
                        );
                      }
                    })()
                  ) : (
                    <span className="text-green-400">Достигнуто!</span>
                  )}
                </div>
              </div>
              
              <div>
                <div className="text-sm text-gray-400 mb-1">Средний % в день</div>
                <div className="font-medium">
                  <span className={days.reduce((sum, day) => sum + day.percentage, 0) / days.length >= 0 ? "text-blue-400" : "text-red-400"}>
                    {(days.reduce((sum, day) => sum + day.percentage, 0) / days.length).toFixed(2)}%
                  </span>
                  {' '} (цель: {dailyTarget}%)
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Recent Transactions */}
      {days.length > 0 && (
        <div className="mt-6 bg-gray-800 p-4 rounded border border-gray-700">
          <h2 className="text-lg font-medium mb-3 text-blue-300">Последние сделки</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-700">
                  <th className="p-2 text-left">День</th>
                  <th className="p-2 text-left">Дата</th>
                  <th className="p-2 text-left">Процент</th>
                  <th className="p-2 text-left">Прибыль</th>
                </tr>
              </thead>
              <tbody>
                {days.slice(-5).reverse().map((day) => (
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
  days
}) => {
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
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
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
              <div className="flex space-x-2">
                <button 
                  onClick={() => setNewGoalType('deposit')}
                  className={`px-4 py-3 rounded flex-1 ${newGoalType === 'deposit' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'}`}
                >
                  Сумма депозита
                </button>
                <button 
                  onClick={() => setNewGoalType('percentage')}
                  className={`px-4 py-3 rounded flex-1 ${newGoalType === 'percentage' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'}`}
                >
                  Процент роста
                </button>
              </div>
            </div>
            
            <div>
              <label className="block mb-2">
                {newGoalType === 'deposit' ? 'Целевая сумма ($):' : 'Целевой рост (%):'}
              </label>
              <input
                type="number"
                value={newGoalValue}
                onChange={(e) => setNewGoalValue(e.target.value)}
                className="w-full p-3 border rounded bg-gray-700 text-white"
                step="0.01"
                min="0"
              />
            </div>
            
            <div className="flex items-end">
              <button 
                onClick={addGoal}
                className="bg-green-600 text-white px-5 py-3 rounded hover:bg-green-700 w-full"
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
      
      {/* List of goals */}
      {goals.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {goals.map((goal, index) => {
            const progress = calculateGoalProgress(goal);
            const progressColor = 
              progress < 30 ? 'bg-red-500' : 
              progress < 70 ? 'bg-yellow-500' : 
              'bg-green-500';
            
            return (
              <div 
                key={goal.id} 
                className={`p-5 rounded border ${goal.completed ? 'bg-green-900 bg-opacity-30 border-green-700' : 'bg-gray-800 border-gray-700'}`}
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-lg font-medium">
                      {goal.name} 
                      {goal.completed && (
                        <span className="ml-2 text-xs bg-green-600 text-white px-2 py-0.5 rounded">
                          Выполнено
                        </span>
                      )}
                    </h3>
                    <p className="text-gray-300 mt-1">
                      {goal.type === 'deposit' 
                        ? `Цель: $${goal.value.toFixed(2)}` 
                        : `Цель: ${goal.value.toFixed(2)}% роста`}
                    </p>
                    {goal.completed && (
                      <p className="text-xs text-gray-400 mt-1">
                        Достигнуто: {new Date(goal.completedAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  
                  {!goal.completed && (
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => editGoal(index)}
                        className="text-blue-400 hover:text-blue-300 p-1"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
                      </button>
                      <button 
                        onClick={() => deleteGoal(index)}
                        className="text-red-400 hover:text-red-300 p-1"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
                
                {/* Progress bar */}
                <div className="w-full bg-gray-900 rounded-full h-4 mb-2 overflow-hidden shadow-inner">
                  <div 
                    className={`h-4 rounded-full ${progressColor} transition-all duration-500 ease-out`} 
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                
                <div className="flex justify-between text-sm mt-3 text-gray-300">
                  <span className="font-medium">{progress.toFixed(1)}% выполнено</span>
                  {goal.type === 'deposit' && (
                    <span>${deposit.toFixed(2)} из ${goal.value.toFixed(2)}</span>
                  )}
                  {goal.type === 'percentage' && (
                    <span>
                      {((deposit / initialDeposit - 1) * 100).toFixed(1)}% из {goal.value.toFixed(1)}%
                    </span>
                  )}
                </div>
                
                {/* Remaining time (forecast) */}
                {!goal.completed && days.length > 0 && (
                  <div className="mt-4 text-sm text-gray-400 bg-gray-900 p-3 rounded">
                    <div className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                      </svg>
                      {goal.type === 'deposit' && (
                        <p>
                          Прогноз: <span className="font-medium text-blue-300">
                            {Math.ceil(Math.log(goal.value / deposit) / Math.log(1 + (days.reduce((sum, day) => sum + day.percentage, 0) / days.length) / 100)).toFixed(0)} дней
                          </span> при текущем темпе
                        </p>
                      )}
                      {goal.type === 'percentage' && (
                        <p>
                          Прогноз: <span className="font-medium text-blue-300">
                            {Math.ceil(goal.value / (days.reduce((sum, day) => sum + day.percentage, 0) / days.length)).toFixed(0)} дней
                          </span> при текущем темпе
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-gray-800 p-6 rounded border border-gray-700 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-3 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <p className="text-gray-400 mb-4">У вас пока нет финансовых целей</p>
          <button 
            onClick={() => setShowGoalForm(true)}
            className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded transition duration-200"
          >
            Создать первую цель
          </button>
        </div>
      )}
    </div>
  );
};

// Archive Section Component
const ArchiveSection = ({
  archivedDays,
  clearArchive,
  restoreFromArchive,
  deleteFromArchive
}) => {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-blue-300">Архив сделок</h1>
        {archivedDays.length > 0 && (
          <button 
            onClick={clearArchive}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Очистить архив
          </button>
        )}
      </div>
      
      {archivedDays.length > 0 ? (
        <div className="bg-gray-800 p-4 rounded border border-gray-700">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-700">
                  <th className="p-2 text-left">День</th>
                  <th className="p-2 text-left">Дата</th>
                  <th className="p-2 text-left">Процент</th>
                  <th className="p-2 text-left">Прибыль</th>
                  <th className="p-2 text-left">Архивирован</th>
                  <th className="p-2 text-left">Действия</th>
                </tr>
              </thead>
              <tbody>
                {archivedDays.map((day, index) => {
                  // Рассчитываем, сколько дней осталось до удаления
                  const archiveDate = new Date(day.archiveDate);
                  const deleteDate = new Date(archiveDate);
                  deleteDate.setDate(deleteDate.getDate() + 7);
                  const daysLeft = Math.ceil((deleteDate - new Date()) / (1000 * 60 * 60 * 24));
                  
                  return (
                    <tr key={`archive-${index}`} className="bg-yellow-900 bg-opacity-20">
                      <td className="p-2">{day.day}</td>
                      <td className="p-2">{day.date}</td>
                      <td className="p-2">{day.percentage.toFixed(2)}% {day.additionalText}</td>
                      <td className="p-2">${day.amount.toFixed(2)}</td>
                      <td className="p-2">
                        {new Date(day.archiveDate).toLocaleDateString()}
                        <div className="text-xs text-yellow-500">
                          Удалится через {daysLeft} {daysLeft === 1 ? 'день' : daysLeft < 5 ? 'дня' : 'дней'}
                        </div>
                      </td>
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
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-gray-800 p-6 rounded border border-gray-700 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-3 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
          </svg>
          <p className="text-gray-400">Архив пуст</p>
        </div>
      )}
    </div>
  );
};

// Settings Section Component
const SettingsSection = ({
  deposit,
  leverage,
  dailyTarget,
  initialDeposit,
  days,
  updateSettings,
  exportData,
  importData,
  resetData,
  checkLocalStorage,
  forceSaveData
}) => {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 text-blue-300">Настройки</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Settings */}
        <div className="bg-gray-800 p-5 rounded border border-gray-700">
          <h2 className="text-lg font-medium mb-4 text-blue-300">Основные параметры</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block mb-2">Начальный депозит ($):</label>
              <input
                type="number"
                value={days.length === 0 ? deposit : initialDeposit}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  if (days.length === 0) {
                    updateSettings(val, leverage, dailyTarget);
                  } else {
                    // Показать предупреждение, что изменение не повлияет на текущий депозит
                    alert('Изменение начального депозита не повлияет на текущий. Это нужно только для расчета прироста.');
                    updateSettings(deposit, leverage, dailyTarget, val);
                  }
                }}
                className="w-full p-3 border rounded bg-gray-700 text-white"
              />
              {days.length > 0 && (
                <p className="text-xs text-gray-400 mt-1">
                  Изменение начального депозита не повлияет на текущий. Текущий: ${deposit.toFixed(2)}
                </p>
              )}
            </div>
            
            <div>
              <label className="block mb-2">Плечо:</label>
              <input
                type="number"
                value={leverage}
                onChange={(e) => updateSettings(deposit, Number(e.target.value), dailyTarget)}
                className="w-full p-3 border rounded bg-gray-700 text-white"
              />
              <p className="text-xs text-gray-400 mt-1">
                С учетом плеча: ${(deposit * leverage).toFixed(2)}
              </p>
            </div>
            
            <div>
              <label className="block mb-2">Целевой % в день:</label>
              <input
                type="number"
                value={dailyTarget}
                onChange={(e) => updateSettings(deposit, leverage, Number(e.target.value))}
                className="w-full p-3 border rounded bg-gray-700 text-white"
                step="0.01"
              />
              {days.length > 0 && (
                <p className="text-xs text-gray-400 mt-1">
                  Средний % за все сделки: {(days.reduce((sum, day) => sum + day.percentage, 0) / days.length).toFixed(2)}%
                </p>
              )}
            </div>
          </div>
        </div>
        
        {/* Import/Export */}
        <div className="bg-gray-800 p-5 rounded border border-gray-700">
          <h2 className="text-lg font-medium mb-4 text-blue-300">Импорт/Экспорт данных</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block mb-2">Экспорт данных:</label>
              <button 
                onClick={exportData}
                className="bg-green-600 text-white px-4 py-3 rounded hover:bg-green-700 w-full"
              >
                Экспортировать в JSON
              </button>
              <p className="text-xs text-gray-400 mt-1">
                Сохраняет все данные в JSON-файл, который можно использовать для резервного копирования или переноса на другое устройство.
              </p>
            </div>
            
            <div>
              <label className="block mb-2">Импорт из JSON:</label>
              <input
                type="file"
                accept=".json"
                onChange={importData}
                className="w-full p-2 bg-gray-700 text-white rounded"
              />
              <p className="text-xs text-gray-400 mt-1">
                Выберите файл JSON, ранее экспортированный из приложения.
              </p>
            </div>
          </div>
        </div>
        
        {/* Data Management */}
        <div className="bg-gray-800 p-5 rounded border border-gray-700 lg:col-span-2">
          <h2 className="text-lg font-medium mb-4 text-red-400">Управление данными</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <button 
              onClick={resetData}
              className="bg-red-600 text-white px-4 py-3 rounded hover:bg-red-700"
            >
              Сбросить все данные
            </button>
            <button 
              onClick={checkLocalStorage}
              className="bg-blue-600 text-white px-4 py-3 rounded hover:bg-blue-700"
            >
              Проверить localStorage
            </button>
            <button 
              onClick={forceSaveData}
              className="bg-green-600 text-white px-4 py-3 rounded hover:bg-green-700"
            >
              Принудительное сохранение
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-2">
            Внимание: сброс данных удалит все сделки, цели и настройки без возможности восстановления.
          </p>
        </div>
      </div>
    </div>
  );
};

// Analytics Section Component
const AnalyticsSection = ({
  days,
  archivedDays,
  leverage,
  initialDeposit,
  deposit,
  dailyTarget
}) => {
  const [timeRange, setTimeRange] = useState('all'); // 'all', 'month', 'week', 'custom'
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [filteredDays, setFilteredDays] = useState([]);
  const [showArchivedData, setShowArchivedData] = useState(false);
  const [comparisonPeriod, setComparisonPeriod] = useState(null); // null, 'previous', 'custom'
  const [benchmarkTarget, setBenchmarkTarget] = useState(dailyTarget);
  
  // Filter days based on selected time range
  useEffect(() => {
    let filtered = [...days];
    
    if (showArchivedData) {
      // Add archived days to the analysis, excluding the archiveDate property
      const processedArchivedDays = archivedDays.map(day => {
        const { archiveDate, ...rest } = day;
        return rest;
      });
      
      filtered = [...filtered, ...processedArchivedDays];
      
      // Sort all days by date and renumber them
      filtered.sort((a, b) => {
        const dateComparison = new Date(a.date) - new Date(b.date);
        if (dateComparison !== 0) return dateComparison;
        return a.percentage - b.percentage;
      });
    }
    
    // Apply time range filter
    const now = new Date();
    
    if (timeRange === 'month') {
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      filtered = filtered.filter(day => new Date(day.date) >= oneMonthAgo);
    } else if (timeRange === 'week') {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      filtered = filtered.filter(day => new Date(day.date) >= oneWeekAgo);
    } else if (timeRange === 'custom' && startDate) {
      const start = new Date(startDate);
      
      if (endDate) {
        const end = new Date(endDate);
        end.setDate(end.getDate() + 1); // Include the end date
        filtered = filtered.filter(day => {
          const date = new Date(day.date);
          return date >= start && date < end;
        });
      } else {
        filtered = filtered.filter(day => new Date(day.date) >= start);
      }
    }
    
    setFilteredDays(filtered);
  }, [days, archivedDays, timeRange, startDate, endDate, showArchivedData]);
  
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 text-blue-300">Аналитика</h1>
      
      {/* Filters and Controls */}
      <div className="bg-gray-800 p-4 rounded border border-gray-700 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block mb-2 text-sm">Период времени:</label>
            <select 
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white"
            >
              <option value="all">Все время</option>
              <option value="month">Последний месяц</option>
              <option value="week">Последняя неделя</option>
              <option value="custom">Произвольный период</option>
            </select>
          </div>
          
          {timeRange === 'custom' && (
            <>
              <div>
                <label className="block mb-2 text-sm">Начальная дата:</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white"
                />
              </div>
              <div>
                <label className="block mb-2 text-sm">Конечная дата:</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white"
                />
              </div>
            </>
          )}
          
          <div className="flex items-end">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={showArchivedData}
                onChange={(e) => setShowArchivedData(e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm">Включить архивные данные</span>
            </label>
          </div>
        </div>
      </div>
      
      {/* Content will be added in subsequent edits */}
      {days.length > 0 ? (
        <div>
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* Total Growth */}
            <div className="bg-gray-800 p-4 rounded border border-gray-700">
              <h3 className="text-sm text-gray-400 mb-2">Общий рост</h3>
              <div className="text-2xl font-bold mb-1">
                {filteredDays.length > 0 ? (
                  <span className={`${filteredDays[filteredDays.length-1].deposit > initialDeposit ? 'text-green-400' : 'text-red-400'}`}>
                    {((filteredDays[filteredDays.length-1].deposit / initialDeposit - 1) * 100).toFixed(2)}%
                  </span>
                ) : (
                  <span className="text-green-400">
                    {((deposit / initialDeposit - 1) * 100).toFixed(2)}%
                  </span>
                )}
              </div>
              <div className="text-xs text-gray-500">
                {initialDeposit.toFixed(2)}$ → {deposit.toFixed(2)}$
              </div>
            </div>
            
            {/* Average Percentage */}
            <div className="bg-gray-800 p-4 rounded border border-gray-700">
              <h3 className="text-sm text-gray-400 mb-2">Средний % в день</h3>
              <div className="text-2xl font-bold mb-1">
                {filteredDays.length > 0 ? (
                  <span className={`${(filteredDays.reduce((sum, day) => sum + day.percentage, 0) / filteredDays.length) > 0 ? 'text-blue-400' : 'text-red-400'}`}>
                    {(filteredDays.reduce((sum, day) => sum + day.percentage, 0) / filteredDays.length).toFixed(2)}%
                  </span>
                ) : (
                  <span>0.00%</span>
                )}
              </div>
              <div className="text-xs text-gray-500">
                Целевой показатель: {dailyTarget}%
              </div>
            </div>
            
            {/* Success Rate */}
            <div className="bg-gray-800 p-4 rounded border border-gray-700">
              <h3 className="text-sm text-gray-400 mb-2">Успешность сделок</h3>
              <div className="text-2xl font-bold mb-1">
                {filteredDays.length > 0 ? (
                  <span className="text-blue-400">
                    {(filteredDays.filter(day => day.percentage > 0).length / filteredDays.length * 100).toFixed(1)}%
                  </span>
                ) : (
                  <span>0.0%</span>
                )}
              </div>
              <div className="text-xs text-gray-500">
                {filteredDays.filter(day => day.percentage > 0).length} из {filteredDays.length} сделок
              </div>
            </div>
            
            {/* Leverage Impact */}
            <div className="bg-gray-800 p-4 rounded border border-gray-700">
              <h3 className="text-sm text-gray-400 mb-2">Влияние плеча</h3>
              <div className="text-2xl font-bold mb-1">
                <span className="text-yellow-400">
                  {(leverage)}x
                </span>
              </div>
              <div className="text-xs text-gray-500">
                Доход с плечом: ${(filteredDays.reduce((sum, day) => sum + day.amount, 0)).toFixed(2)}
              </div>
            </div>
          </div>
          
          {/* Additional metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <div className="bg-gray-800 p-4 rounded border border-gray-700">
              <h3 className="text-sm text-gray-400 mb-2">Лучший день</h3>
              {filteredDays.length > 0 ? (
                <>
                  <div className="text-xl font-bold mb-1">
                    {filteredDays.reduce((best, day) => (day.percentage > best.percentage ? day : best), filteredDays[0]).percentage.toFixed(2)}%
                  </div>
                  <div className="text-xs text-gray-500">
                    Дата: {filteredDays.reduce((best, day) => (day.percentage > best.percentage ? day : best), filteredDays[0]).date}
                  </div>
                </>
              ) : (
                <div className="text-gray-500">Нет данных</div>
              )}
            </div>
            
            <div className="bg-gray-800 p-4 rounded border border-gray-700">
              <h3 className="text-sm text-gray-400 mb-2">Худший день</h3>
              {filteredDays.length > 0 ? (
                <>
                  <div className="text-xl font-bold text-red-400 mb-1">
                    {filteredDays.reduce((worst, day) => (day.percentage < worst.percentage ? day : worst), filteredDays[0]).percentage.toFixed(2)}%
                  </div>
                  <div className="text-xs text-gray-500">
                    Дата: {filteredDays.reduce((worst, day) => (day.percentage < worst.percentage ? day : worst), filteredDays[0]).date}
                  </div>
                </>
              ) : (
                <div className="text-gray-500">Нет данных</div>
              )}
            </div>
            
            <div className="bg-gray-800 p-4 rounded border border-gray-700">
              <h3 className="text-sm text-gray-400 mb-2">Последовательные прибыльные дни</h3>
              {filteredDays.length > 0 ? (
                <>
                  <div className="text-xl font-bold mb-1">
                    {(() => {
                      let maxStreak = 0;
                      let currentStreak = 0;
                      
                      // Sort by date
                      const sortedDays = [...filteredDays].sort((a, b) => new Date(a.date) - new Date(b.date));
                      
                      sortedDays.forEach(day => {
                        if (day.percentage > 0) {
                          currentStreak++;
                          maxStreak = Math.max(maxStreak, currentStreak);
                        } else {
                          currentStreak = 0;
                        }
                      });
                      
                      return maxStreak;
                    })()}
                  </div>
                  <div className="text-xs text-gray-500">
                    Текущая серия: {(() => {
                      let currentStreak = 0;
                      
                      // Sort by date (descending)
                      const sortedDays = [...filteredDays].sort((a, b) => new Date(b.date) - new Date(a.date));
                      
                      for (const day of sortedDays) {
                        if (day.percentage > 0) {
                          currentStreak++;
                        } else {
                          break;
                        }
                      }
                      
                      return currentStreak;
                    })()}
                  </div>
                </>
              ) : (
                <div className="text-gray-500">Нет данных</div>
              )}
            </div>
          </div>
          
          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Deposit Growth Chart */}
            <div className="bg-gray-800 p-4 rounded border border-gray-700">
              <h3 className="text-lg font-medium mb-4 text-blue-300">Рост депозита</h3>
              {filteredDays.length > 0 && (
                <div className="h-80">
                  <Line
                    data={{
                      labels: filteredDays.map(day => day.date),
                      datasets: [
                        {
                          label: 'Депозит',
                          data: filteredDays.map(day => day.deposit),
                          borderColor: 'rgba(59, 130, 246, 0.8)',
                          backgroundColor: 'rgba(59, 130, 246, 0.2)',
                          fill: true,
                          tension: 0.4
                        },
                        {
                          label: 'С учетом плеча',
                          data: filteredDays.map(day => day.deposit * leverage),
                          borderColor: 'rgba(249, 115, 22, 0.8)',
                          backgroundColor: 'rgba(249, 115, 22, 0.1)',
                          borderDash: [5, 5],
                          fill: false
                        }
                      ]
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'top',
                          labels: {
                            color: 'white'
                          }
                        },
                        tooltip: {
                          mode: 'index',
                          intersect: false
                        }
                      },
                      scales: {
                        x: {
                          ticks: {
                            color: 'rgba(255, 255, 255, 0.7)',
                            maxRotation: 45,
                            minRotation: 45
                          },
                          grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                          }
                        },
                        y: {
                          ticks: {
                            color: 'rgba(255, 255, 255, 0.7)',
                            callback: function(value) {
                              return '$' + value.toFixed(2);
                            }
                          },
                          grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                          }
                        }
                      }
                    }}
                  />
                </div>
              )}
            </div>
            
            {/* Daily Percentage Chart */}
            <div className="bg-gray-800 p-4 rounded border border-gray-700">
              <h3 className="text-lg font-medium mb-4 text-blue-300">Процент за день</h3>
              {filteredDays.length > 0 && (
                <div className="h-80">
                  <Bar
                    data={{
                      labels: filteredDays.map(day => day.date),
                      datasets: [
                        {
                          label: 'Процент',
                          data: filteredDays.map(day => day.percentage),
                          backgroundColor: filteredDays.map(day => 
                            day.percentage < 0 ? 'rgba(239, 68, 68, 0.7)' : // red
                            day.percentage === 0 ? 'rgba(156, 163, 175, 0.7)' : // gray
                            day.percentage > dailyTarget ? 'rgba(139, 92, 246, 0.7)' : // purple
                            'rgba(59, 130, 246, 0.7)' // blue
                          ),
                          borderColor: 'rgba(255, 255, 255, 0.1)',
                          borderWidth: 1
                        },
                        {
                          label: 'Целевой %',
                          data: filteredDays.map(() => dailyTarget),
                          type: 'line',
                          borderColor: 'rgba(34, 197, 94, 0.8)',
                          borderDash: [5, 5],
                          borderWidth: 2,
                          fill: false,
                          pointRadius: 0
                        }
                      ]
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'top',
                          labels: {
                            color: 'white'
                          }
                        },
                        tooltip: {
                          mode: 'index',
                          intersect: false
                        }
                      },
                      scales: {
                        x: {
                          ticks: {
                            color: 'rgba(255, 255, 255, 0.7)',
                            maxRotation: 45,
                            minRotation: 45
                          },
                          grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                          }
                        },
                        y: {
                          ticks: {
                            color: 'rgba(255, 255, 255, 0.7)',
                            callback: function(value) {
                              return value.toFixed(2) + '%';
                            }
                          },
                          grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                          }
                        }
                      }
                    }}
                  />
                </div>
              )}
            </div>
          </div>
          
          {/* Distribution Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Profit/Loss Distribution */}
            <div className="bg-gray-800 p-4 rounded border border-gray-700">
              <h3 className="text-lg font-medium mb-4 text-blue-300">Распределение прибыли/убытка</h3>
              {filteredDays.length > 0 && (
                <div className="h-80">
                  <Pie
                    data={{
                      labels: ['Прибыльные дни', 'Убыточные дни', 'Нейтральные дни'],
                      datasets: [
                        {
                          data: [
                            filteredDays.filter(day => day.percentage > 0).length,
                            filteredDays.filter(day => day.percentage < 0).length,
                            filteredDays.filter(day => day.percentage === 0).length
                          ],
                          backgroundColor: [
                            'rgba(34, 197, 94, 0.7)', // green
                            'rgba(239, 68, 68, 0.7)', // red
                            'rgba(156, 163, 175, 0.7)' // gray
                          ],
                          borderColor: 'rgba(30, 41, 59, 1)',
                          borderWidth: 2
                        }
                      ]
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'top',
                          labels: {
                            color: 'white'
                          }
                        },
                        tooltip: {
                          callbacks: {
                            label: function(context) {
                              const value = context.raw;
                              const total = context.dataset.data.reduce((sum, val) => sum + val, 0);
                              const percentage = ((value / total) * 100).toFixed(1);
                              return `${context.label}: ${value} (${percentage}%)`;
                            }
                          }
                        }
                      }
                    }}
                  />
                </div>
              )}
            </div>
            
            {/* Performance vs Target */}
            <div className="bg-gray-800 p-4 rounded border border-gray-700">
              <h3 className="text-lg font-medium mb-4 text-blue-300">Производительность относительно цели</h3>
              {filteredDays.length > 0 && (
                <div className="h-80">
                  <Pie
                    data={{
                      labels: ['Выше цели', 'Ниже цели (прибыль)', 'Убыток'],
                      datasets: [
                        {
                          data: [
                            filteredDays.filter(day => day.percentage > dailyTarget).length,
                            filteredDays.filter(day => day.percentage > 0 && day.percentage < dailyTarget).length,
                            filteredDays.filter(day => day.percentage <= 0).length
                          ],
                          backgroundColor: [
                            'rgba(139, 92, 246, 0.7)', // purple
                            'rgba(59, 130, 246, 0.7)', // blue
                            'rgba(239, 68, 68, 0.7)' // red
                          ],
                          borderColor: 'rgba(30, 41, 59, 1)',
                          borderWidth: 2
                        }
                      ]
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'top',
                          labels: {
                            color: 'white'
                          }
                        },
                        tooltip: {
                          callbacks: {
                            label: function(context) {
                              const value = context.raw;
                              const total = context.dataset.data.reduce((sum, val) => sum + val, 0);
                              const percentage = ((value / total) * 100).toFixed(1);
                              return `${context.label}: ${value} (${percentage}%)`;
                            }
                          }
                        }
                      }
                    }}
                  />
                </div>
              )}
            </div>
          </div>
          
          {/* Advanced Analytics */}
          <div className="bg-gray-800 p-4 rounded border border-gray-700 mb-6">
            <h3 className="text-lg font-medium mb-4 text-blue-300">Анализ эффективности</h3>
            
            {filteredDays.length > 0 ? (
              <div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block mb-2 text-sm">Период сравнения:</label>
                    <select 
                      value={comparisonPeriod || ''}
                      onChange={(e) => setComparisonPeriod(e.target.value || null)}
                      className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white"
                    >
                      <option value="">Без сравнения</option>
                      <option value="previous">Предыдущий период</option>
                      <option value="benchmark">Эталонный показатель</option>
                    </select>
                  </div>
                  
                  {comparisonPeriod === 'benchmark' && (
                    <div>
                      <label className="block mb-2 text-sm">Эталонный % в день:</label>
                      <input
                        type="number"
                        value={benchmarkTarget}
                        onChange={(e) => setBenchmarkTarget(parseFloat(e.target.value) || dailyTarget)}
                        className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white"
                        step="0.01"
                        min="0"
                      />
                    </div>
                  )}
                </div>
                
                <div className="overflow-x-auto mt-4">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-700">
                        <th className="p-2 text-left">Показатель</th>
                        <th className="p-2 text-left">Текущий период</th>
                        {comparisonPeriod && <th className="p-2 text-left">Сравнение</th>}
                        {comparisonPeriod && <th className="p-2 text-left">Изменение</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {/* Average Percentage */}
                      <tr className="border-b border-gray-700">
                        <td className="p-2">Средний % в день</td>
                        <td className="p-2">
                          <span className={`${(filteredDays.reduce((sum, day) => sum + day.percentage, 0) / filteredDays.length) > 0 ? 'text-blue-400' : 'text-red-400'}`}>
                            {(filteredDays.reduce((sum, day) => sum + day.percentage, 0) / filteredDays.length).toFixed(2)}%
                          </span>
                        </td>
                        {comparisonPeriod === 'benchmark' && (
                          <>
                            <td className="p-2">
                              <span className="text-green-400">{benchmarkTarget}%</span>
                            </td>
                            <td className="p-2">
                              <span className={`${(filteredDays.reduce((sum, day) => sum + day.percentage, 0) / filteredDays.length) >= benchmarkTarget ? 'text-green-400' : 'text-red-400'}`}>
                                {((filteredDays.reduce((sum, day) => sum + day.percentage, 0) / filteredDays.length) - benchmarkTarget).toFixed(2)}%
                              </span>
                            </td>
                          </>
                        )}
                        {comparisonPeriod === 'previous' && (
                          <>
                            <td className="p-2">
                              {(() => {
                                // Divide the filtered days into two equal periods
                                const sortedDays = [...filteredDays].sort((a, b) => new Date(a.date) - new Date(b.date));
                                const half = Math.floor(sortedDays.length / 2);
                                const prevPeriod = sortedDays.slice(0, half);
                                
                                if (prevPeriod.length > 0) {
                                  const prevAvg = prevPeriod.reduce((sum, day) => sum + day.percentage, 0) / prevPeriod.length;
                                  return (
                                    <span className={`${prevAvg > 0 ? 'text-blue-400' : 'text-red-400'}`}>
                                      {prevAvg.toFixed(2)}%
                                    </span>
                                  );
                                }
                                
                                return <span className="text-gray-400">Н/Д</span>;
                              })()}
                            </td>
                            <td className="p-2">
                              {(() => {
                                // Divide the filtered days into two equal periods
                                const sortedDays = [...filteredDays].sort((a, b) => new Date(a.date) - new Date(b.date));
                                const half = Math.floor(sortedDays.length / 2);
                                const prevPeriod = sortedDays.slice(0, half);
                                const currentPeriod = sortedDays.slice(half);
                                
                                if (prevPeriod.length > 0 && currentPeriod.length > 0) {
                                  const prevAvg = prevPeriod.reduce((sum, day) => sum + day.percentage, 0) / prevPeriod.length;
                                  const currentAvg = currentPeriod.reduce((sum, day) => sum + day.percentage, 0) / currentPeriod.length;
                                  const change = currentAvg - prevAvg;
                                  
                                  return (
                                    <span className={`${change > 0 ? 'text-green-400' : 'text-red-400'}`}>
                                      {change > 0 ? '+' : ''}{change.toFixed(2)}%
                                    </span>
                                  );
                                }
                                
                                return <span className="text-gray-400">Н/Д</span>;
                              })()}
                            </td>
                          </>
                        )}
                      </tr>
                      
                      {/* Success Rate */}
                      <tr className="border-b border-gray-700">
                        <td className="p-2">Успешность сделок</td>
                        <td className="p-2">
                          <span className="text-blue-400">
                            {(filteredDays.filter(day => day.percentage > 0).length / filteredDays.length * 100).toFixed(1)}%
                          </span>
                        </td>
                        {comparisonPeriod === 'benchmark' && (
                          <>
                            <td className="p-2">
                              <span className="text-green-400">80.0%</span>
                            </td>
                            <td className="p-2">
                              <span className={`${(filteredDays.filter(day => day.percentage > 0).length / filteredDays.length * 100) >= 80 ? 'text-green-400' : 'text-red-400'}`}>
                                {((filteredDays.filter(day => day.percentage > 0).length / filteredDays.length * 100) - 80).toFixed(1)}%
                              </span>
                            </td>
                          </>
                        )}
                        {comparisonPeriod === 'previous' && (
                          <>
                            <td className="p-2">
                              {(() => {
                                // Divide the filtered days into two equal periods
                                const sortedDays = [...filteredDays].sort((a, b) => new Date(a.date) - new Date(b.date));
                                const half = Math.floor(sortedDays.length / 2);
                                const prevPeriod = sortedDays.slice(0, half);
                                
                                if (prevPeriod.length > 0) {
                                  const prevSuccessRate = prevPeriod.filter(day => day.percentage > 0).length / prevPeriod.length * 100;
                                  return (
                                    <span className="text-blue-400">
                                      {prevSuccessRate.toFixed(1)}%
                                    </span>
                                  );
                                }
                                
                                return <span className="text-gray-400">Н/Д</span>;
                              })()}
                            </td>
                            <td className="p-2">
                              {(() => {
                                // Divide the filtered days into two equal periods
                                const sortedDays = [...filteredDays].sort((a, b) => new Date(a.date) - new Date(b.date));
                                const half = Math.floor(sortedDays.length / 2);
                                const prevPeriod = sortedDays.slice(0, half);
                                const currentPeriod = sortedDays.slice(half);
                                
                                if (prevPeriod.length > 0 && currentPeriod.length > 0) {
                                  const prevSuccessRate = prevPeriod.filter(day => day.percentage > 0).length / prevPeriod.length * 100;
                                  const currentSuccessRate = currentPeriod.filter(day => day.percentage > 0).length / currentPeriod.length * 100;
                                  const change = currentSuccessRate - prevSuccessRate;
                                  
                                  return (
                                    <span className={`${change > 0 ? 'text-green-400' : 'text-red-400'}`}>
                                      {change > 0 ? '+' : ''}{change.toFixed(1)}%
                                    </span>
                                  );
                                }
                                
                                return <span className="text-gray-400">Н/Д</span>;
                              })()}
                            </td>
                          </>
                        )}
                      </tr>
                      
                      {/* Total Growth */}
                      <tr>
                        <td className="p-2">Общий рост</td>
                        <td className="p-2">
                          <span className={`${((filteredDays[filteredDays.length-1]?.deposit || deposit) / initialDeposit - 1) * 100 > 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {((filteredDays[filteredDays.length-1]?.deposit || deposit) / initialDeposit - 1) * 100 > 0 ? '+' : ''}
                            {(((filteredDays[filteredDays.length-1]?.deposit || deposit) / initialDeposit - 1) * 100).toFixed(2)}%
                          </span>
                        </td>
                        {comparisonPeriod === 'benchmark' && (
                          <>
                            <td className="p-2">
                              <span className="text-green-400">
                                {(() => {
                                  // Calculate expected compound growth based on benchmark
                                  const expectedGrowth = ((1 + benchmarkTarget / 100) ** filteredDays.length - 1) * 100;
                                  return `+${expectedGrowth.toFixed(2)}%`;
                                })()}
                              </span>
                            </td>
                            <td className="p-2">
                              <span className={`${((filteredDays[filteredDays.length-1]?.deposit || deposit) / initialDeposit - 1) * 100 > ((1 + benchmarkTarget / 100) ** filteredDays.length - 1) * 100 ? 'text-green-400' : 'text-red-400'}`}>
                                {(() => {
                                  // Calculate difference between actual and expected growth
                                  const actualGrowth = ((filteredDays[filteredDays.length-1]?.deposit || deposit) / initialDeposit - 1) * 100;
                                  const expectedGrowth = ((1 + benchmarkTarget / 100) ** filteredDays.length - 1) * 100;
                                  const diff = actualGrowth - expectedGrowth;
                                  return `${diff > 0 ? '+' : ''}${diff.toFixed(2)}%`;
                                })()}
                              </span>
                            </td>
                          </>
                        )}
                        {comparisonPeriod === 'previous' && (
                          <>
                            <td className="p-2">
                              <span className="text-gray-400">Неприменимо</span>
                            </td>
                            <td className="p-2">
                              <span className="text-gray-400">Неприменимо</span>
                            </td>
                          </>
                        )}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <p className="text-gray-400">Недостаточно данных для анализа.</p>
            )}
          </div>
          
          <p className="text-gray-400 mb-4">Дополнительные графики и аналитика будут добавлены в следующих обновлениях.</p>
        </div>
      ) : (
        <div className="bg-gray-800 p-6 rounded border border-gray-700 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <p className="text-gray-400 mb-4">У вас пока нет данных для анализа</p>
        </div>
      )}
    </div>
  );
};

export default DepositTracker;