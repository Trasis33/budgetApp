import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Plus, Calendar, CreditCard, Zap, Tv, Music, Wifi, Home, Shield, Smartphone } from 'lucide-react';
import { formatCurrency } from '../../lib/utils'; // Assuming this exists based on Dashboard
import { Badge } from '../ui/badge'; // Hypothetical or I'll use standard div if not sure

// Mock Data for the Design
const MOCK_BILLS = [
  { id: 1, name: 'Rent', amount: 1200, dueDay: 28, category: 'Housing', icon: Home, paid: false },
  { id: 2, name: 'Electricity', amount: 85, dueDay: 30, category: 'Utilities', icon: Zap, paid: false },
  { id: 3, name: 'Car Insurance', amount: 120, dueDay: 28, category: 'Insurance', icon: Shield, paid: true },
];

const MOCK_SUBS = [
  { id: 4, name: 'Spotify', amount: 15.99, dueDay: 14, category: 'Entertainment', icon: Music },
  { id: 5, name: 'Netflix', amount: 14.99, dueDay: 1, category: 'Entertainment', icon: Tv },
  { id: 6, name: 'Internet', amount: 60, dueDay: 15, category: 'Utilities', icon: Wifi },
  { id: 7, name: 'ChatGPT Plus', amount: 20, dueDay: 10, category: 'AI Tools', icon: Smartphone },
];

export function BillsDesignOne() {
  const totalBills = MOCK_BILLS.reduce((acc, item) => acc + item.amount, 0);
  const totalSubs = MOCK_SUBS.reduce((acc, item) => acc + item.amount, 0);

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">Recurring Expenses</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your monthly bills and subscriptions</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2">
            <Calendar className="w-4 h-4" />
            Calendar View
          </Button>
          <Button className="gap-2 bg-primary text-primary-foreground">
            <Plus className="w-4 h-4" />
            Add Recurring
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-100 dark:border-blue-900">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Total Monthly Fixed</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{formatCurrency(totalBills + totalSubs)}</p>
            </div>
            <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400">
              <CreditCard className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-500">Bills (End of Month)</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">{formatCurrency(totalBills)}</p>
            </div>
            <div className="h-10 w-10 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center text-orange-600">
              <Home className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-500">Subscriptions</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">{formatCurrency(totalSubs)}</p>
            </div>
            <div className="h-10 w-10 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center text-purple-600">
              <Zap className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Areas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Bills Column */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-orange-500"></span>
              Monthly Bills
            </h2>
            <span className="text-sm text-gray-500">Due end of month</span>
          </div>

          <div className="space-y-3">
            {MOCK_BILLS.map((bill) => (
              <Card key={bill.id} className="hover:shadow-md transition-shadow group cursor-pointer border-l-4 border-l-orange-500/50">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="h-10 w-10 rounded-lg bg-orange-50 dark:bg-orange-950/30 flex items-center justify-center text-orange-600 text-lg">
                    <bill.icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 dark:text-gray-100 group-hover:text-primary transition-colors">{bill.name}</h3>
                    <p className="text-xs text-gray-500">Due {bill.dueDay}th</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900 dark:text-gray-100">{formatCurrency(bill.amount)}</p>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${bill.paid ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                      {bill.paid ? 'Paid' : 'Pending'}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
            
             <Button variant="ghost" className="w-full text-orange-600 hover:text-orange-700 hover:bg-orange-50 dark:hover:bg-orange-900/20 border-dashed border border-orange-200">
                <Plus className="w-4 h-4 mr-2" />
                Add Housing or Utility
             </Button>
          </div>
        </div>

        {/* Subscriptions Column */}
        <div className="space-y-4">
           <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-purple-500"></span>
              Subscriptions
            </h2>
            <span className="text-sm text-gray-500">Rolling renewal</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {MOCK_SUBS.map((sub) => (
               <Card key={sub.id} className="hover:shadow-md transition-shadow cursor-pointer relative overflow-hidden">
                <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-purple-100/50 to-transparent -mr-8 -mt-8 rounded-full pointer-events-none"></div>
                <CardContent className="p-4 flex flex-col gap-3">
                  <div className="flex justify-between items-start">
                    <div className="h-10 w-10 rounded-xl bg-purple-50 dark:bg-purple-950/30 flex items-center justify-center text-purple-600">
                      <sub.icon className="w-5 h-5" />
                    </div>
                    <p className="font-semibold text-gray-900 dark:text-gray-100">{formatCurrency(sub.amount)}</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-sm text-gray-900 dark:text-gray-100">{sub.name}</h3>
                    <p className="text-xs text-gray-500">Renews on {sub.dueDay}th</p>
                  </div>
                </CardContent>
              </Card>
            ))}
             <Button variant="ghost" className="h-full min-h-[100px] flex flex-col gap-2 text-purple-600 hover:text-purple-700 hover:bg-purple-50 dark:hover:bg-purple-900/20 border-dashed border border-purple-200">
                <Plus className="w-6 h-6" />
                Add Service
             </Button>
          </div>
        </div>

      </div>
    </div>
  );
}

// Fallback for Badge if not present in project
function BadgeFallback({ children, className }: { children: React.ReactNode, className?: string }) {
    return <span className={`text-xs px-2 py-1 rounded-full ${className}`}>{children}</span>
}
