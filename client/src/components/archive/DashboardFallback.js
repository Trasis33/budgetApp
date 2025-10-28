import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

const DashboardFallback = ({ error, onRetry }) => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-lg p-6 text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
            <AlertCircle className="h-6 w-6 text-red-600" />
          </div>
          
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Dashboard Loading Issue
          </h3>
          
          <p className="text-sm text-gray-600 mb-4">
            {error || "There seems to be an issue loading the dashboard data. This might be due to missing data or API connectivity issues."}
          </p>
          
          <div className="space-y-3">
            <button
              onClick={onRetry}
              className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </button>
            
            <p className="text-xs text-gray-500">
              Make sure your backend server is running and accessible
            </p>
          </div>
        </div>
        
        <div className="mt-4 bg-blue-50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-blue-900 mb-2">Quick Troubleshooting:</h4>
          <ul className="text-xs text-blue-700 space-y-1">
            <li>• Check if backend server is running on port 5000</li>
            <li>• Verify database has sample data</li>
            <li>• Check browser console for API errors</li>
            <li>• Ensure user is logged in</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default DashboardFallback;
