import React, { useState } from 'react';
import { LogOut, AlertTriangle, CheckCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import SettingsCard from './SettingsCard';

const AccountActionsCard = () => {
  const { logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleLogout = async () => {
    try {
      setLoading(true);
      // Note: You might want to call a logout API endpoint here
      // await axios.post('/auth/logout');
      logout();
    } catch (err) {
      console.error('Logout error:', err);
      setMessage({ type: 'error', text: 'Error logging out' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SettingsCard title="Account Actions">
      <div className="space-y-4">
        {/* Logout Section */}
        <div className="bg-rose-50 rounded-2xl p-4 border border-rose-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-rose-100 text-rose-600 p-2 rounded-xl">
              <LogOut className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-900">Sign Out</p>
              <p className="text-xs text-slate-600">Sign out of your account on this device</p>
            </div>
          </div>
          
          <button
            onClick={handleLogout}
            disabled={loading}
            className="w-full bg-rose-600 text-white py-3 px-4 rounded-xl font-medium hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Signing out...
              </>
            ) : (
              <>
                <LogOut className="w-4 h-4" />
                Sign Out
              </>
            )}
          </button>
        </div>

        {/* Message Display */}
        {message.text && (
          <div className={`flex items-center gap-2 p-3 rounded-xl text-sm ${
            message.type === 'success' 
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
              : 'bg-rose-50 text-rose-700 border border-rose-100'
          }`}>
            {message.type === 'success' ? (
              <CheckCircle className="w-4 h-4 flex-shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            )}
            {message.text}
          </div>
        )}

        {/* Additional Actions (Future Enhancement) */}
        <div className="border-t border-slate-100 pt-4">
          <h4 className="text-sm font-medium text-slate-700 mb-3">Additional Options</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100 opacity-60">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-4 h-4 text-slate-400" />
                <div>
                  <p className="text-sm font-medium text-slate-700">Delete Account</p>
                  <p className="text-xs text-slate-500">Permanently delete your account and data</p>
                </div>
              </div>
              <span className="text-xs text-slate-500 bg-slate-200 px-2 py-1 rounded-full">
                Coming Soon
              </span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100 opacity-60">
              <div className="flex items-center gap-3">
                <LogOut className="w-4 h-4 text-slate-400" />
                <div>
                  <p className="text-sm font-medium text-slate-700">Export Data</p>
                  <p className="text-xs text-slate-500">Download all your data in JSON format</p>
                </div>
              </div>
              <span className="text-xs text-slate-500 bg-slate-200 px-2 py-1 rounded-full">
                Coming Soon
              </span>
            </div>
          </div>
        </div>

        {/* Account Info */}
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
          <p className="text-xs text-slate-600 text-center">
            Need help? Contact support or check our documentation for assistance with account management.
          </p>
        </div>
      </div>
    </SettingsCard>
  );
};

export default AccountActionsCard;
