import React from 'react';
import { 
  FiHome, 
  FiList, 
  FiTarget, 
  FiBarChart2, 
  FiArchive, 
  FiSettings, 
  FiDollarSign
} from 'react-icons/fi';

/**
 * Navigation component for switching between application sections with macOS style
 * @param {Object} props - Component props
 * @param {string} props.activeSection - Currently active section
 * @param {Function} props.setActiveSection - Function to change the active section
 * @param {Function} props.setMobileNavOpen - Function to close mobile navigation when item clicked
 */
const Navigation = ({ activeSection, setActiveSection, setMobileNavOpen }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: FiHome },
    { id: 'transactions', label: 'Transactions', icon: FiList },
    { id: 'goals', label: 'Goals', icon: FiTarget },
    { id: 'analytics', label: 'Analytics', icon: FiBarChart2 },
    { id: 'archive', label: 'Archive', icon: FiArchive },
    { id: 'settings', label: 'Settings', icon: FiSettings }
  ];

  // Handle navigation item click
  const handleNavClick = (sectionId) => {
    setActiveSection(sectionId);
    if (setMobileNavOpen) {
      setMobileNavOpen(false);
    }
  };

  return (
    <div className="h-full flex flex-col" style={{ backgroundColor: 'var(--color-sidebar)' }}>
      {/* App Title */}
      <div className="p-6 flex items-center">
        <FiDollarSign className="mr-2 text-2xl" style={{ color: 'var(--color-accent)' }} />
        <h1 className="text-lg font-medium">Deposit Tracker</h1>
      </div>
      
      {/* Navigation Items */}
      <div className="flex-1 px-3 py-4">
        <ul className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            
            return (
              <li key={item.id}>
                <button
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center px-4 py-3 rounded-lg transition-all duration-200 ${
                    isActive 
                      ? 'bg-opacity-15'
                      : 'hover:bg-opacity-10'
                  }`}
                  style={{ 
                    backgroundColor: isActive ? 'var(--color-accent)' : 'transparent',
                    color: isActive ? 'var(--color-accent)' : 'var(--color-text-primary)'
                  }}
                >
                  <Icon 
                    className={`mr-3 ${isActive ? 'text-xl' : 'text-lg'}`} 
                    style={{ color: isActive ? 'var(--color-accent)' : 'var(--color-text-secondary)' }}
                  />
                  <span className={`${isActive ? 'font-medium' : ''}`}>
                    {item.label}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
      
      {/* Footer */}
      <div className="p-4 text-xs text-center" style={{ color: 'var(--color-text-tertiary)' }}>
        <p>Deposit Tracker v1.0</p>
        <p className="mt-1">© 2023 Your Company</p>
      </div>
    </div>
  );
};

export default Navigation; 