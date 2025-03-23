import React, { useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { getGoalsForDate } from '../../utils/goals';

/**
 * GoalCalendar component - displays goals on a calendar and allows date selection
 */
const GoalCalendar = ({ 
  goals, 
  setNewGoalDeadline, 
  setShowGoalForm, 
  setNewGoalTimeLimit 
}) => {
  const [date, setDate] = useState(new Date());
  const [tooltipContent, setTooltipContent] = useState('');
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [showTooltip, setShowTooltip] = useState(false);
  
  // Handle date click in the calendar
  const handleDateClick = (value) => {
    setDate(value);
    
    // Format the date to ISO string and extract the date part (YYYY-MM-DD)
    const formattedDate = value.toISOString().split('T')[0];
    
    // Set the new goal deadline
    setNewGoalDeadline(formattedDate);
    
    // Enable time limit since we've selected a deadline
    setNewGoalTimeLimit(true);
    
    // Show the goal form
    setShowGoalForm(true);
  };
  
  // Determine tile class name based on goals
  const getTileClassName = ({ date, view }) => {
    // Only show in month view
    if (view !== 'month') return null;
    
    const formattedDate = date.toISOString().split('T')[0];
    const goalsForDate = getGoalsForDate(goals, formattedDate);
    
    if (goalsForDate.length === 0) return null;
    
    // Check if any goals are completed or failed
    const hasCompleted = goalsForDate.some(goal => goal.completed);
    const hasFailed = goalsForDate.some(goal => {
      const deadlineDate = new Date(goal.deadline);
      const today = new Date();
      return !goal.completed && deadlineDate < today;
    });
    const hasActive = goalsForDate.some(goal => {
      const deadlineDate = new Date(goal.deadline);
      const today = new Date();
      return !goal.completed && deadlineDate >= today;
    });
    
    if (hasCompleted && !hasFailed && !hasActive) return 'goal-completed';
    if (hasFailed) return 'goal-failed';
    return 'goal-active';
  };
  
  // Show tooltip with goal names on hover
  const handleTileMouseOver = (e, date) => {
    const formattedDate = date.toISOString().split('T')[0];
    const goalsForDate = getGoalsForDate(goals, formattedDate);
    
    if (goalsForDate.length > 0) {
      const names = goalsForDate.map(goal => {
        const status = goal.completed 
          ? '✅ ' 
          : (new Date(goal.deadline) < new Date() ? '❌ ' : '⏳ ');
        return `${status}${goal.name}`;
      }).join('\n');
      
      setTooltipContent(names);
      setTooltipPosition({ x: e.clientX + 10, y: e.clientY + 10 });
      setShowTooltip(true);
    }
  };
  
  const handleTileMouseOut = () => {
    setShowTooltip(false);
  };
  
  return (
    <div className="bg-gray-800 p-5 rounded border border-gray-700 mb-4">
      <h2 className="text-lg font-medium mb-4 text-green-300">Календарь целей</h2>
      
      <p className="mb-4 text-gray-300 text-sm">
        Нажмите на дату, чтобы создать цель с дедлайном на этот день.
      </p>
      
      <div className="calendar-container">
        <Calendar
          onChange={handleDateClick}
          value={date}
          tileClassName={getTileClassName}
          tileContent={({ date, view }) => {
            if (view !== 'month') return null;
            
            const formattedDate = date.toISOString().split('T')[0];
            const goalsForDate = getGoalsForDate(goals, formattedDate);
            
            if (goalsForDate.length > 0) {
              return (
                <div className="goal-indicator-container"
                  onMouseOver={(e) => handleTileMouseOver(e, date)}
                  onMouseOut={handleTileMouseOut}
                >
                  <div className="goal-indicator"></div>
                </div>
              );
            }
            
            return null;
          }}
        />
      </div>
      
      {/* Tooltip */}
      {showTooltip && (
        <div 
          className="tooltip" 
          style={{ 
            position: 'fixed', 
            left: tooltipPosition.x, 
            top: tooltipPosition.y,
            background: '#1e293b',
            padding: '8px',
            borderRadius: '4px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
            zIndex: 1000,
            whiteSpace: 'pre-line',
            color: '#e2e8f0',
            fontSize: '12px',
            maxWidth: '250px'
          }}
        >
          {tooltipContent}
        </div>
      )}
      
      {/* Custom styles for calendar */}
      <style jsx>{`
        /* Override calendar styles for dark theme */
        .calendar-container {
          --main-color: #1e293b;
          --main-bg-color: #1e293b;
          --main-font-color: #e2e8f0;
          --secondary-color: #3b82f6;
          --secondary-font-color: white;
        }
        
        /* Calendar tile styles */
        :global(.react-calendar) {
          background-color: #1e293b;
          color: #e2e8f0;
          border: none;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
        }
        
        :global(.react-calendar__tile) {
          position: relative;
          padding-bottom: 24px;
        }
        
        :global(.react-calendar__tile--active) {
          background-color: #3b82f6;
          color: white;
        }
        
        :global(.react-calendar__tile:enabled:hover) {
          background-color: #4b5563;
        }
        
        :global(.react-calendar__month-view__days__day--weekend) {
          color: #fb7185;
        }
        
        :global(.react-calendar__tile--now) {
          background-color: rgba(59, 130, 246, 0.2);
        }
        
        :global(.goal-active) {
          border-bottom: 3px solid #3b82f6;
        }
        
        :global(.goal-completed) {
          border-bottom: 3px solid #22c55e;
        }
        
        :global(.goal-failed) {
          border-bottom: 3px solid #ef4444;
        }
        
        /* Goal indicator styles */
        :global(.goal-indicator-container) {
          position: absolute;
          bottom: 6px;
          left: 0;
          width: 100%;
          display: flex;
          justify-content: center;
        }
        
        :global(.goal-indicator) {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background-color: #3b82f6;
        }
        
        /* Navigation buttons */
        :global(.react-calendar__navigation button) {
          color: #e2e8f0;
        }
        
        :global(.react-calendar__navigation button:enabled:hover) {
          background-color: #4b5563;
        }
        
        /* Header (day names) */
        :global(.react-calendar__month-view__weekdays__weekday) {
          color: #9ca3af;
        }
        
        :global(.react-calendar__month-view__weekdays__weekday abbr) {
          text-decoration: none;
        }
      `}</style>
    </div>
  );
};

export default GoalCalendar; 