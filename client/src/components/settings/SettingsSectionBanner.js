import React from 'react';
import { Settings } from 'lucide-react';

const SettingsSectionBanner = () => {
  return (
    <div className="rounded-3xl bg-gradient-to-r from-emerald-100 via-white to-white px-6 py-5 mb-6 border border-slate-100 flex items-center gap-3 shadow-sm">
      <div className="bg-emerald-100 text-emerald-600 p-3 rounded-2xl">
        <Settings className="w-6 h-6" />
      </div>
      <div className="flex-1">
        <h1 className="text-2xl font-semibold text-slate-900 mb-1">
          Manage your account settings
        </h1>
        <p className="text-sm text-slate-600 leading-relaxed">
          Update your profile, manage categories, and configure your preferences
        </p>
      </div>
    </div>
  );
};

export default SettingsSectionBanner;
