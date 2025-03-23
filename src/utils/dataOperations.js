/**
 * Utility functions for data import/export operations
 */

/**
 * Export data to a JSON file
 * @param {Object} data - The data to export
 * @param {string} filename - Optional filename (defaults to deposit-tracker-data.json)
 */
export const exportDataToJson = (data, filename = 'deposit-tracker-data.json') => {
  try {
    // Add an export timestamp
    const dataToExport = {
      ...data,
      exportTimestamp: new Date().toISOString()
    };
    
    // Convert data to JSON string
    const jsonString = JSON.stringify(dataToExport, null, 2);
    
    // Create a blob from the JSON string
    const blob = new Blob([jsonString], { type: 'application/json' });
    
    // Create a URL for the blob
    const url = URL.createObjectURL(blob);
    
    // Create a link element to trigger the download
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    
    // Append the link to the document body
    document.body.appendChild(a);
    
    // Click the link to trigger the download
    a.click();
    
    // Clean up
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error exporting data:', error);
    throw error;
  }
};

/**
 * Read a file and parse its contents as JSON
 * @param {File} file - The file to read
 * @returns {Promise<Object>} - Promise that resolves to the parsed JSON data
 */
export const readFileAsJson = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        resolve(data);
      } catch (error) {
        reject(new Error('Invalid JSON format'));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Error reading file'));
    };
    
    reader.readAsText(file);
  });
};

/**
 * Validate imported data to ensure it has the required structure
 * @param {Object} data - The data to validate
 * @returns {boolean} - True if data is valid, false otherwise
 */
export const validateImportedData = (data) => {
  // Check if data is an object
  if (!data || typeof data !== 'object') {
    return false;
  }
  
  // Check for required fields - deposit must exist at minimum
  if (typeof data.deposit === 'undefined') {
    return false;
  }
  
  // Check that days is an array if it exists
  if (data.days && !Array.isArray(data.days)) {
    return false;
  }
  
  // Check that archivedDays is an array if it exists
  if (data.archivedDays && !Array.isArray(data.archivedDays)) {
    return false;
  }
  
  // Check that goals is an array if it exists
  if (data.goals && !Array.isArray(data.goals)) {
    return false;
  }
  
  return true;
}; 