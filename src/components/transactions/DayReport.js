import React, { useRef } from 'react';
import html2canvas from 'html2canvas';

const DayReport = ({ day, onClose }) => {
  const reportRef = useRef(null);

  // Safe number formatting
  const formatNumber = (value) => {
    if (value === undefined || value === null) return '0.00';
    return Number(value).toFixed(2);
  };

  const copyToClipboard = async () => {
    try {
      const canvas = await html2canvas(reportRef.current, {
        backgroundColor: '#1F2937', // bg-gray-800
        scale: 2, // Увеличиваем качество
      });
      
      canvas.toBlob(async (blob) => {
        try {
          await navigator.clipboard.write([
            new ClipboardItem({
              'image/png': blob
            })
          ]);
          alert('Отчет скопирован в буфер обмена!');
        } catch (err) {
          console.error('Ошибка при копировании в буфер:', err);
          // Fallback: открываем изображение в новом окне
          const url = canvas.toDataURL();
          window.open(url);
        }
      }, 'image/png');
    } catch (err) {
      console.error('Ошибка при создании изображения:', err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-lg max-w-2xl w-full">
        {/* Контент для скриншота */}
        <div ref={reportRef} className="p-6">
          <div className="text-xl font-bold text-blue-300 mb-4">
            Отчет за {day.date || 'Неизвестная дата'}
          </div>
          
          {/* Основная информация */}
          <div className="space-y-4">
            <div className="bg-gray-700 rounded p-4">
              <div className="text-gray-400 text-sm">Итог дня</div>
              <div className="text-2xl font-bold text-white">
                {(day.percentage || 0) > 0 ? '+' : ''}{formatNumber(day.percentage)}%
              </div>
              <div className="text-gray-300">
                ${formatNumber(day.amount)}
              </div>
            </div>

            {/* Транзакции */}
            <div className="space-y-2">
              {day.transactions?.map((transaction, index) => (
                <div key={index} className="bg-gray-700 rounded p-3 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="text-gray-400">
                      {transaction.type === 'withdraw' ? (
                        <span className="text-red-400 font-bold">-</span>
                      ) : transaction.type === 'deposit' ? (
                        <span className="text-green-400 font-bold">+</span>
                      ) : (transaction.percentage || 0) > 0 ? (
                        <span className="text-green-400 font-bold">$</span>
                      ) : (
                        <span className="text-red-400 font-bold">$</span>
                      )}
                    </div>
                    <div className="text-gray-300">
                      ${formatNumber(transaction.amount)}
                    </div>
                    <div className={`${
                      (transaction.percentage || 0) >= 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {(transaction.percentage || 0) > 0 ? '+' : ''}{formatNumber(transaction.percentage)}%
                    </div>
                  </div>
                  <div className="text-gray-400 text-sm">
                    {transaction.timestamp ? new Date(transaction.timestamp).toLocaleTimeString() : '--:--'}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Водяной знак */}
          <div className="mt-4 text-center text-gray-500 text-sm">
            Created with Depo
          </div>
        </div>

        {/* Кнопки управления (не включаются в скриншот) */}
        <div className="border-t border-gray-700 p-4 flex justify-end space-x-3">
          <button
            onClick={copyToClipboard}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
          >
            Скопировать
          </button>
          <button
            onClick={onClose}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded"
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
};

export default DayReport; 