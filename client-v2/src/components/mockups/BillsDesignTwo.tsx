import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { ArrowLeft, ArrowRight, Calendar as CalendarIcon, Wallet, Layers, Filter, CheckCircle2 } from 'lucide-react';
import { formatCurrency } from '../../lib/utils';
import { Checkbox } from '../ui/checkbox'; // Assuming shadcn checkbox
import { ScrollArea } from '../ui/scroll-area';

// Mock Data
const EVENTS = [
  { id: 1, day: 1, name: 'Netflix', amount: 14.99, type: 'subscription', logo: 'N', color: 'bg-red-600' },
  { id: 2, day: 5, name: 'Gym Membership', amount: 45.00, type: 'subscription', logo: 'G', color: 'bg-blue-600' },
  { id: 3, day: 10, name: 'ChatGPT Plus', amount: 20.00, type: 'subscription', logo: 'AI', color: 'bg-emerald-600' },
  { id: 4, day: 14, name: 'Spotify', amount: 15.99, type: 'subscription', logo: 'S', color: 'bg-green-500' },
  { id: 5, day: 15, name: 'Internet Bill', amount: 60.00, type: 'bill', logo: 'W', color: 'bg-blue-400' },
  { id: 6, day: 25, name: 'Mobile Plan', amount: 35.00, type: 'bill', logo: 'T', color: 'bg-pink-600' },
  { id: 7, day: 28, name: 'Rent', amount: 1200.00, type: 'bill', logo: 'R', color: 'bg-indigo-600' },
  { id: 8, day: 28, name: 'Insurance', amount: 120.00, type: 'bill', logo: 'I', color: 'bg-gray-600' },
  { id: 9, day: 30, name: 'Electricity', amount: 85.00, type: 'bill', logo: 'E', color: 'bg-yellow-500' },
];

export function BillsDesignTwo() {
  const currentDay = 12; // Mocking today is the 12th
  
  // Calculate stats
  const total = EVENTS.reduce((acc, e) => acc + e.amount, 0);
  const paid = EVENTS.filter(e => e.day < currentDay).reduce((acc, e) => acc + e.amount, 0);
  const remaining = total - paid;

  return (
    <div className="flex flex-col h-full bg-gray-50/50 dark:bg-black/20 p-6 space-y-6">
      
      {/* Header with Month Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" className="h-8 w-8 rounded-full">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="text-center">
            <h2 className="text-lg font-semibold">October 2025</h2>
            <p className="text-xs text-secondary-foreground">Total: {formatCurrency(total)}</p>
          </div>
          <Button variant="outline" size="icon" className="h-8 w-8 rounded-full">
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex gap-2">
            <Button variant="ghost" size="sm" className="gap-2 text-gray-500">
                <Filter className="w-4 h-4" />
                Filter
            </Button>
            <Button size="sm" className="bg-black text-white dark:bg-white dark:text-black hover:opacity-90">
                <Wallet className="w-4 h-4 mr-2" />
                Manage
            </Button>
        </div>
      </div>

      {/* Timeline Visualization */}
      <div className="relative">
        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gray-200 dark:bg-gray-800 -z-10 transform -translate-y-1/2"></div>
         {/* Progress Bar overlay */}
         <div 
            className="absolute top-1/2 left-0 h-0.5 bg-green-500 -z-10 transform -translate-y-1/2 transition-all duration-500"
            style={{ width: `${(currentDay / 30) * 100}%` }}
         ></div>

        <div className="flex justify-between items-center px-2 overflow-x-auto pb-4 pt-2 gap-4 hide-scrollbar">
            {/* Generate calendar days */}
            {[1, 5, 10, 15, 20, 25, 30].map((day) => {
               const hasEvent = EVENTS.some(e => e.day === day);
               const isPast = day < currentDay;
               
               return (
                <div key={day} className="flex flex-col items-center gap-2 min-w-[40px]">
                    <span className={`text-xs font-medium ${isPast ? 'text-gray-400' : 'text-gray-600'}`}>{day}</span>
                    <div className={`
                        w-3 h-3 rounded-full border-2 
                        ${day === currentDay ? 'bg-blue-600 border-blue-600 scale-125 ring-4 ring-blue-100' : 
                          hasEvent ? (isPast ? 'bg-green-500 border-green-500' : 'bg-white border-gray-300') : 
                          'bg-transparent border-gray-200'}
                    `}></div>
                </div>
               )
            })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Panel: Stats */}
        <div className="lg:col-span-1 space-y-4">
             <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 border-none shadow-sm">
                <CardContent className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-white/60 dark:bg-black/20 rounded-xl backdrop-blur-sm">
                            <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                        </div>
                        <div>
                            <p className="text-sm text-emerald-800 dark:text-emerald-400 font-medium">Paid so far</p>
                            <p className="text-2xl font-bold text-emerald-900 dark:text-emerald-300">{formatCurrency(paid)}</p>
                        </div>
                    </div>
                </CardContent>
             </Card>

             <Card className="bg-white dark:bg-gray-900 shadow-sm">
                <CardContent className="p-6">
                     <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-xl">
                            <Layers className="w-6 h-6 text-gray-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-medium">Remaining to pay</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{formatCurrency(remaining)}</p>
                        </div>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5 dark:bg-gray-800">
                        <div className="bg-gray-900 h-1.5 rounded-full dark:bg-gray-200" style={{ width: '45%' }}></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2 text-right">45% of monthly recurring</p>
                </CardContent>
             </Card>
        </div>

        {/* Right Panel: The Single Flow List */}
        <Card className="lg:col-span-2 border-none shadow-sm bg-white/50 backdrop-blur-sm">
            <CardHeader>
                <CardTitle>Timeline</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                <ScrollArea className="h-[500px] pr-4">
                <div className="space-y-1 p-4">
                    {EVENTS.sort((a,b) => a.day - b.day).map((event, index) => {
                        const isPast = event.day < currentDay;
                        const isToday = event.day === currentDay;

                        return (
                            <div key={event.id} className={`
                                group flex items-center justify-between p-3 rounded-xl transition-all
                                ${isToday ? 'bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100' : 'hover:bg-white dark:hover:bg-gray-800'}
                                ${isPast ? 'opacity-60 grayscale-[0.5]' : ''}
                            `}>
                                <div className="flex items-center gap-4">
                                     {/* Date Badge */}
                                    <div className={`
                                        flex flex-col items-center justify-center w-12 h-12 rounded-lg 
                                        ${isToday ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300'}
                                    `}>
                                        <span className="text-xs uppercase font-medium">Oct</span>
                                        <span className="text-lg font-bold leading-none">{event.day}</span>
                                    </div>

                                    {/* Event Info */}
                                    <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${event.color}`}>
                                            {event.logo}
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900 dark:text-gray-100">{event.name}</p>
                                            <div className="flex items-center gap-2">
                                                <span className={`text-[10px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded-sm ${
                                                    event.type === 'subscription' ? 'bg-purple-100 text-purple-700' : 'bg-orange-100 text-orange-700'
                                                }`}>
                                                    {event.type}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    <span className={`font-semibold ${isPast ? 'line-through text-gray-400' : 'text-gray-900 dark:text-white'}`}>
                                        {formatCurrency(event.amount)}
                                    </span>
                                    <Checkbox checked={isPast} disabled /> 
                                </div>
                            </div>
                        )
                    })}
                </div>
                </ScrollArea>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
