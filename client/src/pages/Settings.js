import React, { useState } from 'react';
import axios from '../api/axios';
import { useAuth } from '../context/AuthContext';

const Settings = () => {
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleLogout = async () => {
    try {
      setLoading(true);
      await axios.post('/auth/logout');
      logout();
    } catch (err) {
      console.error('Logout error:', err);
      setMessage('Error logging out');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
      
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Account Settings</h2>
        
        <div className="space-y-4">
          <div>
            <h3 className="font-medium text-gray-900">User Information</h3>
            <p className="text-gray-600 mt-1">
              Logged in as: {user?.email || 'User'}
            </p>
          </div>
          
          <div>
            <h3 className="font-medium text-gray-900">Logout</h3>
            <p className="text-gray-600 mt-1 mb-3">
              Sign out of your account
            </p>
            <button
              onClick={handleLogout}
              disabled={loading}
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 disabled:opacity-50"
            >
              {loading ? 'Logging out...' : 'Logout'}
            </button>
            {message && (
              <p className="text-red-600 text-sm mt-2">{message}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
