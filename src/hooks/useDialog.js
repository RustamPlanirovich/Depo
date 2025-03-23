import { useState } from 'react';

/**
 * Custom hook for managing dialog state and promise-based interactions
 * @returns {Object} - Dialog state and functions for controlling the dialog
 */
const useDialog = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [options, setOptions] = useState([]);
  const [resolvePromise, setResolvePromise] = useState(null);

  /**
   * Create a dialog that returns a promise which resolves when an option is selected
   * @param {string} dialogTitle - Title of the dialog
   * @param {string} dialogMessage - Message to display in the dialog
   * @param {Array} dialogOptions - Array of option strings
   * @returns {Promise} - Promise that resolves to the selected option
   */
  const createPromiseDialog = (dialogTitle, dialogMessage, dialogOptions) => {
    return new Promise((resolve) => {
      setTitle(dialogTitle);
      setMessage(dialogMessage);
      setOptions(dialogOptions);
      setResolvePromise(() => resolve);
      setIsOpen(true);
    });
  };

  /**
   * Handle option selection and resolve the promise
   * @param {string} option - The selected option
   */
  const handleOptionSelect = (option) => {
    if (resolvePromise) {
      resolvePromise(option);
    }
    setIsOpen(false);
  };

  /**
   * Close the dialog without selecting an option
   */
  const handleClose = () => {
    if (resolvePromise) {
      resolvePromise(null);
    }
    setIsOpen(false);
  };

  return {
    isOpen,
    title,
    message,
    options,
    createPromiseDialog,
    handleOptionSelect,
    handleClose
  };
};

export default useDialog; 