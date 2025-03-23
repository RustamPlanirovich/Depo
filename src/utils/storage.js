/**
 * Utility functions for local storage operations
 */

// Save data to local storage
export const saveToLocalStorage = (data) => {
  try {
    localStorage.setItem('depositTrackerData', JSON.stringify(data));
    return true;
  } catch (error) {
    console.error('Error saving to localStorage:', error);
    return false;
  }
};

// Load data from local storage
export const loadFromLocalStorage = () => {
  try {
    const savedData = localStorage.getItem('depositTrackerData');
    if (savedData) {
      return JSON.parse(savedData);
    }
    return null;
  } catch (error) {
    console.error('Error loading from localStorage:', error);
    return null;
  }
};

// Check if local storage is available
export const isLocalStorageAvailable = () => {
  try {
    const test = '__test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch (e) {
    return false;
  }
}; 