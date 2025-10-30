import React from 'react';
import SettingsSectionBanner from '../components/settings/SettingsSectionBanner';
import ProfileCard from '../components/settings/ProfileCard';
import SecurityCard from '../components/settings/SecurityCard';
import CategoryManagementCard from '../components/settings/CategoryManagementCard';
import AccountActionsCard from '../components/settings/AccountActionsCard';

const Settings = () => {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Section Banner */}
        <SettingsSectionBanner />
        
        {/* Settings Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Profile Management */}
          <div className="lg:col-span-2">
            <ProfileCard />
          </div>
          
          {/* Security Settings */}
          <SecurityCard />
          
          {/* Category Management */}
          <CategoryManagementCard />
          
          {/* Account Actions */}
          <div className="lg:col-span-2">
            <AccountActionsCard />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
