import React from 'react';
import { 
  FiHome, 
  FiList, 
  FiTarget, 
  FiBarChart2, 
  FiArchive, 
  FiSettings, 
  FiDollarSign,
  FiChevronLeft,
  FiChevronRight,
  FiMenu
} from 'react-icons/fi';

/**
 * Navigation component for switching between application sections with macOS style
 * @param {Object} props - Component props
 * @param {string} props.activeSection - Currently active section
 * @param {Function} props.setActiveSection - Function to change the active section
 * @param {Function} props.setMobileNavOpen - Function to close mobile navigation when item clicked
 * @param {boolean} props.sidebarCollapsed - Whether the sidebar is collapsed
 * @param {Function} props.setSidebarCollapsed - Function to toggle sidebar collapsed state
 */
const Navigation = ({ 
  activeSection, 
  setActiveSection, 
  setMobileNavOpen, 
  sidebarCollapsed, 
  setSidebarCollapsed 
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Панель', icon: FiHome },
    { id: 'transactions', label: 'Транзакции', icon: FiList },
    { id: 'goals', label: 'Цели', icon: FiTarget },
    { id: 'analytics', label: 'Аналитика', icon: FiBarChart2 },
    { id: 'archive', label: 'Архив', icon: FiArchive },
    { id: 'settings', label: 'Настройки', icon: FiSettings }
  ];

  // Handle navigation item click
  const handleNavClick = (sectionId) => {
    setActiveSection(sectionId);
    if (setMobileNavOpen) {
      setMobileNavOpen(false);
    }
  };

  // Toggle sidebar collapsed state
  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div 
      className="h-full flex flex-col transition-all duration-300"
      style={{ 
        backgroundColor: 'var(--color-sidebar)',
        width: sidebarCollapsed ? '64px' : '240px'
      }}
    >
      {/* App Title */}
      <div className={`p-4 flex items-center ${sidebarCollapsed ? 'justify-center' : ''}`}>
        <FiDollarSign className="text-2xl" style={{ color: 'var(--color-accent)' }} />
        {!sidebarCollapsed && (
          <h1 className="ml-2 text-lg font-medium">Трекер депозита</h1>
        )}
      </div>
      
      {/* Collapse Toggle for collapsed state - visible at top when collapsed */}
      {sidebarCollapsed && (
        <div className="px-2 pb-4 flex justify-center">
          <button
            onClick={toggleSidebar}
            className="w-10 h-10 rounded-lg flex items-center justify-center transition-colors shadow-lg"
            style={{ 
              backgroundColor: 'var(--color-accent)',
              color: 'white',
              border: '2px solid var(--color-bg-tertiary)'
            }}
            aria-label="Развернуть меню"
            title="Развернуть меню"
          >
            <FiChevronRight className="text-xl" />
          </button>
        </div>
      )}
      
      {/* Navigation Items */}
      <div className="flex-1 px-2 py-4">
        <ul className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            
            return (
              <li key={item.id}>
                <button
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center px-3 py-3 rounded-lg transition-all duration-200 ${
                    isActive 
                      ? 'bg-opacity-15'
                      : 'hover:bg-opacity-10'
                  } ${sidebarCollapsed ? 'justify-center' : ''}`}
                  style={{ 
                    backgroundColor: isActive ? 'var(--color-accent)' : 'transparent',
                    color: isActive ? 'white' : 'var(--color-text-primary)'
                  }}
                  title={sidebarCollapsed ? item.label : ''}
                >
                  <Icon 
                    className={isActive ? 'text-xl' : 'text-lg'} 
                    style={{ color: isActive ? 'white' : 'var(--color-text-secondary)' }}
                  />
                  {!sidebarCollapsed && (
                    <span className={`ml-3 ${isActive ? 'font-medium' : ''}`}>
                      {item.label}
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
      
      {/* Collapse Toggle for expanded state - at bottom when expanded */}
      {!sidebarCollapsed && (
        <div className="p-4 flex justify-center">
          <button
            onClick={toggleSidebar}
            className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
            style={{ 
              backgroundColor: 'var(--color-bg-tertiary)',
              color: 'var(--color-text-secondary)'
            }}
            aria-label="Свернуть меню"
            title="Свернуть меню"
          >
            <FiChevronLeft />
          </button>
        </div>
      )}
      
      {/* Footer */}
      {!sidebarCollapsed && (
        <div className="p-4 text-xs text-center" style={{ color: 'var(--color-text-tertiary)' }}>
          <p>Трекер депозита v1.0</p>
          <p className="mt-1">© 2023 Ваша Компания</p>
        </div>
      )}
    </div>
  );
};

export default Navigation; 