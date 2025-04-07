import { useState, useEffect, useCallback } from "react";
import { STORAGE_KEYS } from "../constants";

/**
 * Custom hook for managing deposit data
 * @param {number} initialDeposit - Initial deposit amount
 * @returns {Object} Deposit data and management functions
 */
const useDepositData = (initialDeposit) => {
  const [deposit, setDeposit] = useState(() => {
    const savedDeposit = localStorage.getItem(STORAGE_KEYS.DEPOSIT);
    return savedDeposit ? parseFloat(savedDeposit) : initialDeposit;
  });

  const [days, setDays] = useState(() => {
    const savedDays = localStorage.getItem(STORAGE_KEYS.DAYS);
    return savedDays ? JSON.parse(savedDays) : [];
  });

  const [archivedDays, setArchivedDays] = useState(() => {
    const savedArchivedDays = localStorage.getItem(STORAGE_KEYS.ARCHIVED_DAYS);
    return savedArchivedDays ? JSON.parse(savedArchivedDays) : [];
  });

  // Save deposit to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.DEPOSIT, deposit.toString());
  }, [deposit]);

  // Save days to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.DAYS, JSON.stringify(days));
  }, [days]);

  // Save archived days to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ARCHIVED_DAYS, JSON.stringify(archivedDays));
  }, [archivedDays]);

  // Add a new day
  const addDay = useCallback((dayData) => {
    setDays(prevDays => [...prevDays, dayData]);
    setDeposit(prevDeposit => prevDeposit + dayData.profit);
  }, []);

  // Archive a day
  const archiveDay = useCallback((dayIndex) => {
    setDays(prevDays => {
      const dayToArchive = prevDays[dayIndex];
      const newDays = prevDays.filter((_, index) => index !== dayIndex);
      setArchivedDays(prevArchived => [...prevArchived, dayToArchive]);
      return newDays;
    });
  }, []);

  // Reset deposit
  const resetDeposit = useCallback(() => {
    setDeposit(initialDeposit);
    setDays([]);
    setArchivedDays([]);
  }, [initialDeposit]);

  return {
    deposit,
    setDeposit,
    days,
    setDays,
    archivedDays,
    setArchivedDays,
    addDay,
    archiveDay,
    resetDeposit
  };
};

export default useDepositData;
