import React from 'react';
import DepositTracker from './components/DepositTracker';
import ThemeSwitch from './components/common/ThemeSwitch';
import './styles/App.css';

/**
 * Main App component with theme switching capability
 * Теперь с русским интерфейсом
 */
const App = () => {
  return (
    <div className="app-container">
      <div className="mac-toolbar">
        <div className="flex-1"></div>
        <div className="flex items-center">
          <ThemeSwitch />
        </div>
      </div>
      <div className="main-content">
        <DepositTracker />
      </div>
    </div>
  );
};

export default App; 