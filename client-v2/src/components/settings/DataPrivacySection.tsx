import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Download, Upload, BarChart, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export function DataPrivacySection() {
  const handleExportData = () => {
    toast.info('Data export feature coming soon!');
  };

  const handleImportData = () => {
    toast.info('Data import feature coming soon!');
  };

  const handleClearCache = () => {
    toast.info('Cache clearing feature coming soon!');
  };

  return (
    <div className="space-y-6">
      {/* Data Export */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Export Your Data
          </CardTitle>
          <CardDescription>
            Download all your expenses, budgets, and categories
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border bg-muted/50 p-4">
            <p className="text-sm text-muted-foreground">
              Export your data in JSON or CSV format for backup or analysis. This includes all expenses, budgets, categories, and settings.
            </p>
          </div>
          
          <div className="flex gap-3">
            <Button
              onClick={handleExportData}
              variant="outline"
              className="flex-1 gap-2"
              disabled
            >
              <Download className="h-4 w-4" />
              Export as JSON
            </Button>
            <Button
              onClick={handleExportData}
              variant="outline"
              className="flex-1 gap-2"
              disabled
            >
              <Download className="h-4 w-4" />
              Export as CSV
            </Button>
          </div>
          
          <p className="text-center text-xs text-muted-foreground">
            Coming Soon
          </p>
        </CardContent>
      </Card>

      {/* Data Import */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Import Data
          </CardTitle>
          <CardDescription>
            Import expenses from CSV or JSON files
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border bg-muted/50 p-4">
            <p className="text-sm text-muted-foreground">
              Import your expense data from other applications or restore from a previous backup.
            </p>
          </div>
          
          <Button
            onClick={handleImportData}
            variant="outline"
            className="w-full gap-2"
            disabled
          >
            <Upload className="h-4 w-4" />
            Import Data File
          </Button>
          
          <p className="text-center text-xs text-muted-foreground">
            Coming Soon
          </p>
        </CardContent>
      </Card>

      {/* Data Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart className="h-5 w-5" />
            Data Statistics
          </CardTitle>
          <CardDescription>
            Overview of your stored data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Total Expenses</p>
              <p className="text-sm font-medium">Coming Soon</p>
            </div>
          </div>
          
          <div className="rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Total Budgets</p>
              <p className="text-sm font-medium">Coming Soon</p>
            </div>
          </div>
          
          <div className="rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Total Categories</p>
              <p className="text-sm font-medium">Coming Soon</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Privacy & Cache */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trash2 className="h-5 w-5" />
            Privacy & Cache
          </CardTitle>
          <CardDescription>
            Clear local data and cache
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border bg-muted/50 p-4">
            <p className="text-sm text-muted-foreground">
              Clear your browser's local storage and cache. This won't delete your account data from the server.
            </p>
          </div>
          
          <Button
            onClick={handleClearCache}
            variant="outline"
            className="w-full gap-2"
            disabled
          >
            <Trash2 className="h-4 w-4" />
            Clear Local Cache
          </Button>
          
          <p className="text-center text-xs text-muted-foreground">
            Coming Soon
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
