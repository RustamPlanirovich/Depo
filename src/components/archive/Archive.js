import React, { useState } from 'react';

/**
 * Archive component - displays and manages archived trading days
 */
const Archive = ({
  archivedDays,
  restoreFromArchive,
  deleteFromArchive,
  clearArchive
}) => {
  const [sortField, setSortField] = useState('day');
  const [sortDirection, setSortDirection] = useState('desc');
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  
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
  
  // Sort archived days
  const sortedArchivedDays = [...archivedDays].sort((a, b) => {
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
  
  // Handle clear archive confirmation
  const handleClearArchiveClick = () => {
    setShowClearConfirm(true);
  };
  
  // Handle clear archive confirm
  const handleClearArchiveConfirm = () => {
    clearArchive();
    setShowClearConfirm(false);
  };
  
  return (
    <div>
      <h1 className="text-3xl font-bold text-blue-300 mb-6">Архив</h1>
      
      <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        <div className="p-4 border-b border-gray-700 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-blue-300">Архивированные дни</h2>
          
          {archivedDays.length > 0 && (
            <button
              onClick={handleClearArchiveClick}
              className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
            >
              Очистить архив
            </button>
          )}
        </div>
        
        {archivedDays.length > 0 ? (
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
                {sortedArchivedDays.map((day, index) => (
                  <tr key={index} className="hover:bg-gray-700">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm text-white">{day.day}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm text-white">{day.date}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className={`text-sm font-medium ${day.percentage >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {day.percentage.toFixed(2)}%
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className={`text-sm font-medium ${day.amount >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        ${day.amount.toFixed(2)}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm text-white">${day.deposit.toFixed(2)}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => restoreFromArchive(index)}
                          className="text-blue-400 hover:text-blue-300"
                          title="Восстановить из архива"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M7.707 3.293a1 1 0 010 1.414L5.414 7H11a7 7 0 017 7v2a1 1 0 11-2 0v-2a5 5 0 00-5-5H5.414l2.293 2.293a1 1 0 11-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </button>
                        <button
                          onClick={() => deleteFromArchive(index)}
                          className="text-red-400 hover:text-red-300"
                          title="Удалить из архива"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-6 text-center">
            <p className="text-gray-400">Архив пуст</p>
          </div>
        )}
      </div>
      
      {/* Clear Archive Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg max-w-md w-full">
            <h3 className="text-xl font-medium mb-4 text-red-400">Подтверждение очистки архива</h3>
            
            <p className="text-white mb-6">
              Вы уверены, что хотите очистить весь архив? Эта операция не может быть отменена.
            </p>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600"
              >
                Отмена
              </button>
              
              <button
                onClick={handleClearArchiveConfirm}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Да, очистить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Archive; 