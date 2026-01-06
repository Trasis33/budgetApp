import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

import { User, Shield, Users, Tag, Sliders, Database, Settings as SettingsIcon } from 'lucide-react';
import { ProfileSection } from './settings/ProfileSection';
import { SecuritySection } from './settings/SecuritySection';
import { PartnerSection } from './settings/PartnerSection';
import { AccountActionsSection } from './settings/AccountActionsSection';
import { CategoryManagementSection } from './settings/CategoryManagementSection';
import { PreferencesSection } from './settings/PreferencesSection';
import { DataPrivacySection } from './settings/DataPrivacySection';
import { RecurringBillsSection } from './settings/RecurringBillsSection';

interface SettingsProps {
  onNavigate?: (view: string) => void;
}

export function Settings({}: SettingsProps = {}) {
  const [activeTab, setActiveTab] = useState('profile');

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-5xl px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[oklch(var(--theme-indigo)/0.1)]">
              <SettingsIcon className="h-6 w-6 text-[oklch(var(--theme-indigo))]" />
            </div>
            <div>
              <h1 className="text-2xl font-display font-semibold tracking-tight">Settings</h1>
              <p className="text-sm text-muted-foreground">
                Manage your account, preferences, and app settings
              </p>
            </div>
          </div>
        </div>

        {/* Settings Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-7 gap-2">
            <TabsTrigger value="profile" className="gap-2">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Profile</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="gap-2">
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">Security</span>
            </TabsTrigger>
            <TabsTrigger value="partner" className="gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Partner</span>
            </TabsTrigger>
            <TabsTrigger value="categories" className="gap-2">
              <Tag className="h-4 w-4" />
              <span className="hidden sm:inline">Categories</span>
            </TabsTrigger>
            <TabsTrigger value="preferences" className="gap-2">
              <Sliders className="h-4 w-4" />
              <span className="hidden sm:inline">Preferences</span>
            </TabsTrigger>
            <TabsTrigger value="data" className="gap-2">
              <Database className="h-4 w-4" />
              <span className="hidden sm:inline">Data</span>
            </TabsTrigger>
            <TabsTrigger value="account" className="gap-2">
              <SettingsIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Account</span>
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <ProfileSection />
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6">
            <SecuritySection />
          </TabsContent>

          {/* Partner Tab */}
          <TabsContent value="partner" className="space-y-6">
            <PartnerSection />
          </TabsContent>

          {/* Categories & Bills Tab */}
          <TabsContent value="categories" className="space-y-6">
            <CategoryManagementSection />
            <RecurringBillsSection />
          </TabsContent>

          {/* Preferences Tab */}
          <TabsContent value="preferences" className="space-y-6">
            <PreferencesSection />
          </TabsContent>

          {/* Data & Privacy Tab */}
          <TabsContent value="data" className="space-y-6">
            <DataPrivacySection />
          </TabsContent>

          {/* Account Actions Tab */}
          <TabsContent value="account" className="space-y-6">
            <AccountActionsSection />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
