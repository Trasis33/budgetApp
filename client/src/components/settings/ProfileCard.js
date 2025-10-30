import React, { useState, useEffect } from 'react';
import { User, Mail, CheckCircle, AlertCircle } from 'lucide-react';
import axios from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import SettingsCard from './SettingsCard';

const ProfileCard = () => {
  const { user, updateUser } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || ''
      });
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear message when user starts typing
    if (message.text) {
      setMessage({ type: '', text: '' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.email.trim()) {
      setMessage({ type: 'error', text: 'Please fill in all fields' });
      return;
    }

    if (!formData.email.includes('@')) {
      setMessage({ type: 'error', text: 'Please enter a valid email address' });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await axios.put('/auth/profile', formData);
      updateUser(response.data);
      setMessage({ type: 'success', text: 'Profile updated successfully' });
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Error updating profile';
      setMessage({ type: 'error', text: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SettingsCard title="Profile Information">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* User Info Display */}
        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-emerald-100 text-emerald-600 p-2 rounded-xl">
              <User className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-900">Current Account</p>
              <p className="text-xs text-slate-600">User ID: {user?.id}</p>
            </div>
          </div>
        </div>

        {/* Name Input */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Full Name
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-100 focus:border-emerald-300 transition-colors"
              placeholder="Enter your full name"
              disabled={loading}
            />
          </div>
        </div>

        {/* Email Input */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-100 focus:border-emerald-300 transition-colors"
              placeholder="Enter your email address"
              disabled={loading}
            />
          </div>
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
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
            )}
            {message.text}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-emerald-600 text-white py-3 px-4 rounded-xl font-medium hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Updating...
            </>
          ) : (
            <>
              <CheckCircle className="w-4 h-4" />
              Save Changes
            </>
          )}
        </button>
      </form>
    </SettingsCard>
  );
};

export default ProfileCard;
