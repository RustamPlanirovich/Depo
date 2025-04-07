import React, { useState, useEffect } from 'react';
import DepositTracker from './DepositTracker';
import Transactions from './transactions/Transactions';
import Archive from './archive/Archive';
import ExtendedReport from './reports/ExtendedReport';

const Main = () => {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [days, setDays] = useState([]);
  const [archivedDays, setArchivedDays] = useState([]);
  const [currentDeposit, setCurrentDeposit] = useState(0);

  // Load data from localStorage
  useEffect(() => {
    const savedDays = localStorage.getItem('days');
    const savedArchivedDays = localStorage.getItem('archivedDays');
    const savedDeposit = localStorage.getItem('currentDeposit');

    if (savedDays) setDays(JSON.parse(savedDays));
    if (savedArchivedDays) setArchivedDays(JSON.parse(savedArchivedDays));
    if (savedDeposit) setCurrentDeposit(Number(savedDeposit));
  }, []);

  // Save data to localStorage
  useEffect(() => {
    localStorage.setItem('days', JSON.stringify(days));
    localStorage.setItem('archivedDays', JSON.stringify(archivedDays));
    localStorage.setItem('currentDeposit', currentDeposit.toString());
  }, [days, archivedDays, currentDeposit]);

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <nav className="bg-gray-800 shadow-lg">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between h-16">
            <div className="flex">
              <button
                onClick={() => setActiveSection('panel')}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  activeSection === 'panel'
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                Панель
              </button>
              <button
                onClick={() => setActiveSection('transactions')}
                className={`ml-4 px-3 py-2 rounded-md text-sm font-medium ${
                  activeSection === 'transactions'
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                Транзакции
              </button>
              <button
                onClick={() => setActiveSection('archive')}
                className={`ml-4 px-3 py-2 rounded-md text-sm font-medium ${
                  activeSection === 'archive'
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                Архив
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 px-4">
        {activeSection === 'panel' && (
          <div className="space-y-6">
            <DepositTracker
              days={days}
              setDays={setDays}
              currentDeposit={currentDeposit}
              setCurrentDeposit={setCurrentDeposit}
            />
            <ExtendedReport days={days} currentDeposit={currentDeposit} />
          </div>
        )}
        {activeSection === 'transactions' && (
          <Transactions
            days={days}
            setDays={setDays}
            setActiveSection={setActiveSection}
            setArchivedDays={setArchivedDays}
          />
        )}
        {activeSection === 'archive' && (
          <Archive
            archivedDays={archivedDays}
            setArchivedDays={setArchivedDays}
            days={days}
            setDays={setDays}
          />
        )}
      </main>
    </div>
  );
};

export default Main; 