import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  RiDashboardLine, 
  RiWallet3Line,
  RiMoneyDollarCircleLine, 
  RiCalendarCheckLine,
  RiRefreshLine,
  RiHandCoinLine,
  RiBarChartLine,
  RiSettings4Line
} from 'react-icons/ri';

const Sidebar = () => {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = (currentDate.getMonth() + 1).toString().padStart(2, '0');

  return (
    <div className="h-full flex flex-col py-6 px-4">
      <div className="flex items-center justify-center mb-8">
        <h2 className="text-xl font-bold text-primary-600">Expense Tracker</h2>
      </div>
      
      <nav className="flex-1 space-y-2">
        <NavLink
          to="/"
          className={({ isActive }) =>
            `flex items-center px-4 py-2 text-gray-700 rounded-lg hover:bg-gray-100 ${isActive ? 'bg-gray-100' : ''}`
          }
        >
          <RiDashboardLine className="w-5 h-5 mr-2" />
          <span>Dashboard</span>
        </NavLink>

        <NavLink
          to="/budget"
          className={({ isActive }) =>
            `flex items-center px-4 py-2 text-gray-700 rounded-lg hover:bg-gray-100 ${isActive ? 'bg-gray-100' : ''}`
          }
        >
          <RiWallet3Line className="w-5 h-5 mr-2" />
          <span>Budget</span>
        </NavLink>
        
        <NavLink
          to="/analytics"
          className={({ isActive }) =>
            `flex items-center px-4 py-2 text-gray-700 rounded-lg hover:bg-gray-100 ${isActive ? 'bg-gray-100' : ''}`
          }
        >
          <RiBarChartLine className="w-5 h-5 mr-2" />
          <span>Analytics</span>
        </NavLink>
        
        <NavLink
          to="/expenses"
          className={({ isActive }) =>
            `flex items-center px-4 py-2 text-gray-700 rounded-lg hover:bg-gray-100 ${isActive ? 'bg-gray-100' : ''}`
          }
        >
          <RiMoneyDollarCircleLine className="w-5 h-5 mr-2" />
          <span>Expenses</span>
        </NavLink>
        
        <NavLink
          to={`/monthly/${currentYear}/${currentMonth}`}
          className={({ isActive }) =>
            `flex items-center px-4 py-2 text-gray-700 rounded-lg hover:bg-gray-100 ${isActive ? 'bg-gray-100' : ''}`
          }
        >
          <RiCalendarCheckLine className="w-5 h-5 mr-2" />
          <span>Monthly Statement</span>
        </NavLink>
        
        <NavLink
          to="/recurring"
          className={({ isActive }) =>
            `flex items-center px-4 py-2 text-gray-700 rounded-lg hover:bg-gray-100 ${isActive ? 'bg-gray-100' : ''}`
          }
        >
          <RiRefreshLine className="w-5 h-5 mr-2" />
          <span>Recurring Bills</span>
        </NavLink>

        <NavLink
          to="/bill-splitter"
          className={({ isActive }) =>
            `flex items-center px-4 py-2 text-gray-700 rounded-lg hover:bg-gray-100 ${isActive ? 'bg-gray-100' : ''}`
          }
        >
          <RiHandCoinLine className="w-5 h-5 mr-2" />
          <span>Bill Splitter</span>
        </NavLink>
        
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `flex items-center px-4 py-2 text-gray-700 rounded-lg hover:bg-gray-100 ${isActive ? 'bg-gray-100' : ''}`
          }
        >
          <RiSettings4Line className="w-5 h-5 mr-2" />
          <span>Settings</span>
        </NavLink>
      </nav>
      
      <div className="mt-auto pt-4 border-t border-gray-200">
        <div className="text-xs text-gray-500 text-center">
          <p>© {currentYear} Expense Tracker</p>
          <p className="mt-1">v1.0.0</p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
