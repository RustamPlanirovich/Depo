import React, { useState } from 'react';
import Calendar from 'react-calendar';
// Remove the default light theme import and use only our custom styling
// import 'react-calendar/dist/Calendar.css';
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
      
      <div className="calendar-container dark-calendar">
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
      <style jsx global>{`
        /* Import override - force dark theme */
        .dark-calendar .react-calendar {
          background-color: #0f172a !important;
          color: white !important;
          border: 1px solid #1f2937 !important;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.5) !important;
        }
        
        /* Override calendar styles for dark theme */
        .calendar-container {
          --main-color: #0f172a;
          --main-bg-color: #0f172a;
          --main-font-color: #e2e8f0;
          --secondary-color: #2563eb;
          --secondary-font-color: white;
        }
        
        /* Calendar tile styles */
        .dark-calendar .react-calendar {
          background-color: #0f172a !important;
          color: #e2e8f0 !important;
          border: none !important;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.5);
        }
        
        .dark-calendar .react-calendar__tile {
          position: relative;
          padding-bottom: 24px;
          background-color: #1e293b !important;
          color: #e2e8f0 !important;
          margin: 1px;
        }
        
        .dark-calendar .react-calendar__tile--active {
          background-color: #2563eb !important;
          color: white !important;
        }
        
        .dark-calendar .react-calendar__tile:enabled:hover {
          background-color: #374151 !important;
        }
        
        .dark-calendar .react-calendar__month-view__days__day--weekend {
          color: #fb7185 !important;
        }
        
        .dark-calendar .react-calendar__tile--now {
          background-color: rgba(37, 99, 235, 0.25) !important;
        }
        
        .dark-calendar .goal-active {
          border-bottom: 3px solid #3b82f6 !important;
        }
        
        .dark-calendar .goal-completed {
          border-bottom: 3px solid #22c55e !important;
        }
        
        .dark-calendar .goal-failed {
          border-bottom: 3px solid #ef4444 !important;
        }
        
        /* Goal indicator styles */
        .dark-calendar .goal-indicator-container {
          position: absolute;
          bottom: 6px;
          left: 0;
          width: 100%;
          display: flex;
          justify-content: center;
        }
        
        .dark-calendar .goal-indicator {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background-color: #3b82f6;
        }
        
        /* Navigation buttons */
        .dark-calendar .react-calendar__navigation {
          background-color: #0f172a !important;
          padding: 8px;
          border-radius: 6px 6px 0 0;
          margin-bottom: 5px;
        }
        
        .dark-calendar .react-calendar__navigation button {
          color: #e2e8f0 !important;
          background: none !important;
        }
        
        .dark-calendar .react-calendar__navigation button:enabled:hover {
          background-color: #334155 !important;
        }
        
        /* Header (day names) */
        .dark-calendar .react-calendar__month-view__weekdays {
          background-color: #1e293b !important;
          border-radius: 4px;
          margin-bottom: 8px;
        }
        
        .dark-calendar .react-calendar__month-view__weekdays__weekday {
          color: #94a3b8 !important;
        }
        
        .dark-calendar .react-calendar__month-view__weekdays__weekday abbr {
          text-decoration: none;
          color: #94a3b8 !important;
        }
        
        /* Year and decade views */
        .dark-calendar .react-calendar__year-view__months__month,
        .dark-calendar .react-calendar__decade-view__years__year,
        .dark-calendar .react-calendar__century-view__decades__decade {
          background-color: #1e293b !important;
          color: #e2e8f0 !important;
          margin: 1px;
        }
        
        .dark-calendar .react-calendar__year-view__months__month:hover,
        .dark-calendar .react-calendar__decade-view__years__year:hover,
        .dark-calendar .react-calendar__century-view__decades__decade:hover {
          background-color: #374151 !important;
        }
        
        /* Overwrite default import */
        .dark-calendar .react-calendar__month-view__days {
          background-color: #0f172a !important;
        }
        
        .dark-calendar .react-calendar__month-view__days__day--neighboringMonth {
          color: #64748b !important;
          background-color: #0f172a !important;
        }
      `}</style>
    </div>
  );
};

export default GoalCalendar; 