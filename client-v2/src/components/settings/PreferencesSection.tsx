import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { Sliders, Moon, Sun, Globe, DollarSign, Bell } from 'lucide-react';

export function PreferencesSection() {
  const [preferences, setPreferences] = useState({
    theme: 'system',
    budgetAlerts: {
      at80Percent: true,
      onExceed: true
    }
  });

  return (
    <div className="space-y-6">
      {/* Appearance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Moon className="h-5 w-5" />
            Appearance
          </CardTitle>
          <CardDescription>
            Customize the look and feel of the app
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border bg-muted/50 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Sun className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Theme</p>
                  <p className="text-xs text-muted-foreground">Light, Dark, or System</p>
                </div>
              </div>
              <span className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
                Coming Soon
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Localization */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Localization
          </CardTitle>
          <CardDescription>
            Language and regional settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="rounded-lg border bg-muted/50 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <DollarSign className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Currency</p>
                    <p className="text-xs text-muted-foreground">Currently: SEK (Swedish Krona)</p>
                  </div>
                </div>
                <span className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
                  Fixed
                </span>
              </div>
            </div>

            <div className="rounded-lg border bg-muted/50 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Globe className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Language</p>
                    <p className="text-xs text-muted-foreground">Currently: English</p>
                  </div>
                </div>
                <span className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
                  Coming Soon
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Budget Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Budget Alerts
          </CardTitle>
          <CardDescription>
            Configure when you receive budget notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label htmlFor="alert-80">Alert at 80% budget</Label>
              <p className="text-xs text-muted-foreground">
                Get notified when you reach 80% of your budget
              </p>
            </div>
            <Switch
              id="alert-80"
              checked={preferences.budgetAlerts.at80Percent}
              onCheckedChange={(checked) => 
                setPreferences(prev => ({
                  ...prev,
                  budgetAlerts: { ...prev.budgetAlerts, at80Percent: checked }
                }))
              }
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label htmlFor="alert-exceed">Alert when exceeding budget</Label>
              <p className="text-xs text-muted-foreground">
                Get notified when you exceed your budget limit
              </p>
            </div>
            <Switch
              id="alert-exceed"
              checked={preferences.budgetAlerts.onExceed}
              onCheckedChange={(checked) => 
                setPreferences(prev => ({
                  ...prev,
                  budgetAlerts: { ...prev.budgetAlerts, onExceed: checked }
                }))
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Expense Defaults */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sliders className="h-5 w-5" />
            Expense Defaults
          </CardTitle>
          <CardDescription>
            Default settings for new expenses
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border bg-muted/50 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Default Split Type</p>
                <p className="text-xs text-muted-foreground">Set default expense split ratio</p>
              </div>
              <span className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
                Coming Soon
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
