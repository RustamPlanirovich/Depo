import React, { useState } from 'react';

/**
 * TransactionList component - displays a list of trading days
 */
const TransactionList = ({ days, startEditingDay, archiveDay, archiveTransaction, deleteDay, setActiveSection }) => {
  const [sortField, setSortField] = useState('day');
  const [sortDirection, setSortDirection] = useState('desc');
  const [expandedDay, setExpandedDay] = useState(null);
  
  // Handle sort
  const handleSort = (field) => {
    if (sortField === field) {
      // Toggle direction if clicking the same field
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new field and default to descending
      setSortField(field);
      setSortDirection('desc');
    }
  };
  
  // Toggle expanded day
  const toggleExpandDay = (index) => {
    if (expandedDay === index) {
      setExpandedDay(null);
    } else {
      setExpandedDay(index);
    }
  };
  
  // Format time
  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  // Edit individual transaction
  const handleEditTransaction = (e, dayIndex, transactionIndex) => {
    e.stopPropagation();
    startEditingDay(dayIndex, transactionIndex);
    setActiveSection('dashboard');
  };
  
  // Sort days
  const sortedDays = [...days].sort((a, b) => {
    let comparison = 0;
    
    switch (sortField) {
      case 'day':
        comparison = a.day - b.day;
        break;
      case 'date':
        comparison = new Date(a.date) - new Date(b.date);
        break;
      case 'percentage':
        comparison = a.percentage - b.percentage;
        break;
      case 'amount':
        comparison = a.amount - b.amount;
        break;
      case 'deposit':
        comparison = a.deposit - b.deposit;
        break;
      default:
        comparison = a.day - b.day;
    }
    
    return sortDirection === 'asc' ? comparison : -comparison;
  });
  
  return (
    <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
      <div className="p-4 border-b border-gray-700">
        <h2 className="text-xl font-semibold text-blue-300">Транзакции</h2>
      </div>
      
      {days.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full table-responsive">
            <thead>
              <tr className="bg-gray-700">
                <th 
                  className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('day')}
                >
                  <div className="flex items-center">
                    День
                    {sortField === 'day' && (
                      <span className="ml-1">
                        {sortDirection === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
                <th 
                  className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('date')}
                >
                  <div className="flex items-center">
                    Дата
                    {sortField === 'date' && (
                      <span className="ml-1">
                        {sortDirection === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
                <th 
                  className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('percentage')}
                >
                  <div className="flex items-center">
                    Процент
                    {sortField === 'percentage' && (
                      <span className="ml-1">
                        {sortDirection === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
                <th 
                  className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('amount')}
                >
                  <div className="flex items-center">
                    Сумма
                    {sortField === 'amount' && (
                      <span className="ml-1">
                        {sortDirection === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
                <th 
                  className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('deposit')}
                >
                  <div className="flex items-center">
                    Депозит
                    {sortField === 'deposit' && (
                      <span className="ml-1">
                        {sortDirection === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Действия
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {sortedDays.map((day, index) => (
                <React.Fragment key={index}>
                  <tr 
                    className={`hover:bg-gray-700 ${day.transactions && day.transactions.length > 1 ? 'cursor-pointer' : ''}`}
                    onClick={() => day.transactions && day.transactions.length > 1 ? toggleExpandDay(index) : null}
                  >
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="text-sm text-white">{day.day}</div>
                        {day.transactions && day.transactions.length > 1 && (
                          <div className="ml-2 px-2 py-0.5 bg-blue-900 rounded text-blue-300 text-xs">
                            {day.transactions.length}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm text-white">{day.date}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className={`text-sm font-medium ${day.percentage >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {day.percentage !== undefined ? day.percentage.toFixed(2) : '0.00'}%
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className={`text-sm font-medium ${day.amount >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        ${day.amount !== undefined ? day.amount.toFixed(2) : '0.00'}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm text-white">${day.deposit !== undefined ? day.deposit.toFixed(2) : '0.00'}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            startEditingDay(index);
                            setActiveSection('dashboard');
                          }}
                          className="text-blue-400 hover:text-blue-300"
                          title="Редактировать день"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                          </svg>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            archiveDay(index);
                          }}
                          className="text-yellow-400 hover:text-yellow-300"
                          title="Архивировать день"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M4 3a2 2 0 100 4h12a2 2 0 100-4H4z" />
                            <path fillRule="evenodd" d="M3 8h14v7a2 2 0 01-2 2H5a2 2 0 01-2-2V8zm5 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" clipRule="evenodd" />
                          </svg>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteDay(index);
                          }}
                          className="text-red-400 hover:text-red-300"
                          title="Удалить день"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                  
                  {/* Expanded transactions */}
                  {expandedDay === index && day.transactions && day.transactions.length > 1 && (
                    <tr className="bg-gray-900">
                      <td colSpan="6" className="px-4 py-2">
                        <div className="text-xs text-gray-400 mb-2">Транзакции за день:</div>
                        <div className="space-y-2">
                          {day.transactions.map((transaction, tIndex) => (
                            <div key={tIndex} className="flex flex-col px-3 py-2 bg-gray-800 rounded">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                  <div className="text-gray-400">{tIndex + 1}.</div>
                                  <div className="text-gray-200">
                                    {formatTime(transaction.timestamp)}
                                  </div>
                                  <div className={`${transaction.percentage >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                    {transaction.percentage !== undefined ? transaction.percentage.toFixed(2) : '0.00'}%
                                  </div>
                                  <div className={`${transaction.amount >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                    ${transaction.amount !== undefined ? transaction.amount.toFixed(2) : '0.00'}
                                  </div>
                                </div>
                                <div className="flex space-x-1">
                                  <button
                                    onClick={(e) => handleEditTransaction(e, index, tIndex)}
                                    className="text-blue-400 hover:text-blue-300 p-1"
                                    title="Редактировать транзакцию"
                                  >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                    </svg>
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      archiveTransaction(index, tIndex);
                                    }}
                                    className="text-yellow-400 hover:text-yellow-300 p-1"
                                    title="Архивировать транзакцию"
                                  >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                      <path d="M4 3a2 2 0 100 4h12a2 2 0 100-4H4z" />
                                      <path fillRule="evenodd" d="M3 8h14v7a2 2 0 01-2 2H5a2 2 0 01-2-2V8zm5 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" clipRule="evenodd" />
                                    </svg>
                                  </button>
                                </div>
                              </div>
                              {transaction.description && (
                                <div className="mt-2 text-gray-400 text-sm border-t border-gray-700 pt-2">
                                  {transaction.description}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="p-6 text-center">
          <p className="text-gray-400">Нет записей о транзакциях</p>
          <button
            onClick={() => setActiveSection('dashboard')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Добавить первый день
          </button>
        </div>
      )}
    </div>
  );
};

export default TransactionList; 