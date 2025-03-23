import React from 'react';
import useTheme from '../../hooks/useTheme';
import { FiSun, FiMoon, FiMonitor } from 'react-icons/fi';

/**
 * A macOS style theme switcher that toggles between light, dark, and system modes
 */
const ThemeSwitch = () => {
  const { theme, themePreference, toggleTheme } = useTheme();
  
  // Determine which icon to display based on the current theme preference
  const getThemeIcon = () => {
    switch (themePreference) {
      case 'light':
        return <FiSun className="text-yellow-400" />;
      case 'dark':
        return <FiMoon className="text-blue-400" />;
      case 'system':
        return <FiMonitor className="text-gray-400" />;
      default:
        return <FiSun className="text-yellow-400" />;
    }
  };
  
  return (
    <div className="flex items-center">
      <button 
        onClick={toggleTheme}
        className="flex items-center justify-center w-10 h-10 rounded-full bg-opacity-20 hover:bg-opacity-30 transition-all"
        style={{ 
          backgroundColor: 'var(--color-bg-tertiary)',
          color: 'var(--color-text-primary)'
        }}
        aria-label="Toggle theme"
      >
        {getThemeIcon()}
      </button>
      <div className="ml-2 text-sm hidden sm:block">
        {themePreference.charAt(0).toUpperCase() + themePreference.slice(1)}
      </div>
    </div>
  );
};

export default ThemeSwitch; 