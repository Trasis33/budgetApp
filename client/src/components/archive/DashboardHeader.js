import React from 'react';
import { Link } from 'react-router-dom';
import { RiAddLine, RiBarChartLine, RiSettingsLine } from 'react-icons/ri';
import { format } from 'date-fns';
import { useExpenseModal } from '../context/ExpenseModalContext';

const DashboardHeader = ({ title = "Dashboard", onRefresh, lastUpdated, showControls = true }) => {
  const currentMonth = format(new Date(), 'MMMM yyyy');
  const { openAddModal } = useExpenseModal();
  
  return (
    <div className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
            <p className="text-sm text-gray-600 mt-1">
              {currentMonth} • Last updated: {lastUpdated || format(new Date(), 'HH:mm:ss')}
            </p>
          </div>
          
          {showControls && (
            <div className="flex items-center space-x-3">
              {onRefresh && (
                <button
                  onClick={onRefresh}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <RiBarChartLine className="w-4 h-4 mr-2" />
                  Refresh
                </button>
              )}
              
              <button
                type="button"
                onClick={() => openAddModal()}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <RiAddLine className="w-4 h-4 mr-2" />
                Add Expense
              </button>
              
              <Link
                to="/settings"
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <RiSettingsLine className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;
