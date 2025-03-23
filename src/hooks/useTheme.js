import { useState, useEffect } from 'react';
import useLocalStorage from './useLocalStorage';

/**
 * A custom hook for managing theme with system preference detection
 * Supports 'light', 'dark', and 'system' modes
 */
const useTheme = () => {
  // Store theme preference in localStorage
  const [themePreference, setThemePreference] = useLocalStorage('theme', 'system');
  
  // Internal state for the active theme ('light' or 'dark')
  const [activeTheme, setActiveTheme] = useState('dark');
  
  // Listen for system theme changes
  useEffect(() => {
    const updateThemeFromSystem = () => {
      if (themePreference === 'system') {
        const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
        setActiveTheme(isDarkMode ? 'dark' : 'light');
      } else {
        setActiveTheme(themePreference);
      }
    };
    
    // Initial setup
    updateThemeFromSystem();
    
    // Set up listener for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', updateThemeFromSystem);
    
    // Clean up listener
    return () => mediaQuery.removeEventListener('change', updateThemeFromSystem);
  }, [themePreference]);
  
  // Apply theme to document element
  useEffect(() => {
    document.documentElement.classList.remove('light-theme', 'dark-theme');
    document.documentElement.classList.add(`${activeTheme}-theme`);
  }, [activeTheme]);
  
  // Toggle between light, dark, and system modes
  const toggleTheme = () => {
    const modes = ['light', 'dark', 'system'];
    const currentIndex = modes.indexOf(themePreference);
    const nextIndex = (currentIndex + 1) % modes.length;
    setThemePreference(modes[nextIndex]);
  };
  
  return {
    theme: activeTheme,
    themePreference,
    setTheme: setThemePreference,
    toggleTheme
  };
};

export default useTheme; 