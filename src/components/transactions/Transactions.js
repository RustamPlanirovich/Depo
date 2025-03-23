import React from 'react';
import TransactionList from './TransactionList';
import TransactionsSummary from './TransactionsSummary';

/**
 * Transactions component - Container for transactions list and summary
 */
const Transactions = ({
  days,
  leverage,
  startEditingDay,
  archiveDay,
  deleteDay,
  initialDeposit,
  deposit,
  setActiveSection
}) => {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Транзакции</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Transactions Summary */}
        <div>
          <TransactionsSummary 
            days={days}
            initialDeposit={initialDeposit}
            deposit={deposit}
            leverage={leverage}
          />
        </div>
        
        {/* Transactions List */}
        <div className="lg:col-span-2">
          {days.length > 0 ? (
            <TransactionList
              days={days}
              startEditingDay={startEditingDay}
              archiveDay={archiveDay}
              deleteDay={deleteDay}
              setActiveSection={setActiveSection}
            />
          ) : (
            <div className="bg-gray-800 rounded-lg p-6 shadow-lg text-center">
              <p className="text-xl text-gray-400 mb-6">У вас пока нет транзакций</p>
              <button
                onClick={() => setActiveSection('dashboard')}
                className="px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors"
              >
                Добавить транзакцию
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Transactions; 