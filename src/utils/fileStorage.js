/**
 * File-based storage utility
 * Uses browser's fetch API to communicate with the server for data storage
 */

const API_URL = 'http://localhost:3001/api/data'; // This will be handled by a simple Express server

/**
 * Load data from the server
 * @returns {Promise<Object>} The loaded data
 */
export const loadData = async () => {
  try {
    console.log('Loading data from server...');
    const response = await fetch(API_URL);
    
    if (!response.ok) {
      console.error(`Server responded with status: ${response.status}`);
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Data loaded successfully:', data);
    return data;
  } catch (error) {
    console.error('Error loading data from file:', error);
    // Return default data structure if loading fails
    return {
      deposit: 30,
      leverage: 10,
      dailyTarget: 3,
      initialDeposit: 30,
      days: [],
      archivedDays: [],
      goals: []
    };
  }
};

/**
 * Save data to the server
 * @param {Object} data - The data to save
 * @returns {Promise<boolean>} Whether the save was successful
 */
export const saveData = async (data) => {
  try {
    console.log('Saving data to server:', data);
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      console.error(`Server responded with status: ${response.status}`);
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const result = await response.json();
    console.log('Data saved successfully:', result);
    return true;
  } catch (error) {
    console.error('Error saving data to file:', error);
    alert('Не удалось сохранить данные. Пожалуйста, проверьте соединение с сервером.');
    return false;
  }
};

/**
 * Throttled save function to prevent too many saves
 */
let saveTimeout = null;
export const saveDataThrottled = (data) => {
  if (saveTimeout) {
    clearTimeout(saveTimeout);
  }
  
  saveTimeout = setTimeout(() => {
    saveData(data);
  }, 1000); // Throttle to save at most once per second
}; 