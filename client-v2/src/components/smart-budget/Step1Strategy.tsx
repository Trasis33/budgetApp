import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ChevronRight } from 'lucide-react';
import { StrategyType, STRATEGIES } from './types';
import { cn } from '@/lib/utils';

interface Step1Props {
  income: number;
  setIncome: (val: number) => void;
  selectedStrategy: StrategyType;
  setStrategy: (val: StrategyType) => void;
  onNext: () => void;
  onCancel: () => void;
}

export function Step1Strategy({
  income,
  setIncome,
  selectedStrategy,
  setStrategy,
  onNext,
  onCancel
}: Step1Props) {
  
  const handleIncomeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Remove non-numeric chars
    const val = e.target.value.replace(/\D/g, '');
    setIncome(val ? parseInt(val) : 0);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('sv-SE', { groupingSeparator: ' ' }).format(num);
  };

  const quickAdd = (amount: number) => {
    setIncome(income + amount);
  };

  return (
    <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="flex-1 overflow-y-auto p-4 md:p-8"
    >
      <div className="max-w-5xl mx-auto h-full flex flex-col">
        
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
            <button 
                onClick={onCancel}
                className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors"
            >
                <div className="p-2 rounded-full bg-white border border-slate-200 hover:bg-slate-50 transition-colors">
                    <ArrowLeft className="h-5 w-5" />
                </div>
                <span className="font-medium hidden sm:inline">Cancel</span>
            </button>
            <div className="text-center">
                <h1 className="text-lg font-semibold text-slate-900">Smart Budget Setup</h1>
                <p className="text-xs text-slate-500">Step 1 of 2</p>
            </div>
            <div className="w-20"></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Column: Income */}
            <div className="lg:col-span-5 space-y-6">
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 md:p-10 flex flex-col justify-center min-h-[300px] relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-blue-500 to-indigo-500"></div>
                    
                    <div className="text-center space-y-6">
                        <div className="space-y-2">
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Combined Monthly Income</label>
                            <p className="text-xs text-slate-400">Net (after tax)</p>
                        </div>

                        <div className="flex items-center justify-center gap-2">
                            <span className="text-3xl sm:text-4xl text-slate-300 font-light">kr</span>
                            <input 
                                type="text" 
                                value={formatNumber(income)} 
                                onChange={handleIncomeChange}
                                className="w-full max-w-[280px] text-4xl sm:text-5xl md:text-6xl font-bold text-slate-900 placeholder:text-slate-200 focus:outline-none bg-transparent text-center p-0 m-0"
                                autoFocus
                            />
                        </div>

                        <div className="flex justify-center gap-2 pt-2 flex-wrap">
                            {[500, 1000, 5000].map(amount => (
                                <button 
                                    key={amount}
                                    onClick={() => quickAdd(amount)}
                                    className="px-3 py-1.5 rounded-full bg-slate-50 border border-slate-100 text-xs font-medium text-slate-500 hover:bg-slate-100 transition-colors"
                                >
                                    +{formatNumber(amount)}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="p-4">
                    <p className="text-sm text-slate-500 text-center leading-relaxed max-w-sm mx-auto">
                        This amount will be the foundation for your shared budget. We'll help you split it between fixed bills and flexible spending.
                    </p>
                </div>
            </div>

            {/* Right Column: Strategy */}
            <div className="lg:col-span-7 space-y-4">
                <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Choose a Strategy</label>
                </div>

                {STRATEGIES.map((strategy) => {
                    const isSelected = selectedStrategy === strategy.id;
                    return (
                        <button
                            key={strategy.id}
                            onClick={() => setStrategy(strategy.id)}
                            className={cn(
                                "w-full text-left group relative rounded-2xl p-5 transition-all border-2",
                                isSelected 
                                    ? "bg-white border-indigo-600 shadow-lg shadow-indigo-500/10 translate-y-[-2px]" 
                                    : "bg-white border-slate-200 hover:border-slate-300 hover:shadow-md opacity-90 hover:opacity-100"
                            )}
                        >
                            {strategy.id === 'balanced' && (
                                <div className="absolute -top-3 right-4 bg-indigo-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                                    RECOMMENDED
                                </div>
                            )}
                            
                            <div className="flex items-start gap-4">
                                <div className={cn(
                                    "w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0 transition-colors",
                                    isSelected ? "bg-indigo-50" : "bg-slate-50 group-hover:bg-slate-100"
                                )}>
                                    {strategy.icon}
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-base font-bold text-slate-900 mb-1">{strategy.name}</h3>
                                    <p className="text-sm text-slate-500 mb-3">{strategy.description}</p>
                                    
                                    {/* Visual Bar */}
                                    <div className="flex h-2 w-full rounded-full overflow-hidden bg-slate-100">
                                        <div className="bg-slate-800" style={{ width: `${strategy.distribution.needs * 100}%` }} title="Needs" />
                                        <div className="bg-slate-400" style={{ width: `${strategy.distribution.wants * 100}%` }} title="Wants" />
                                        <div className={cn(
                                            "transition-colors",
                                            strategy.id === 'balanced' ? "bg-indigo-500" : 
                                            strategy.id === 'saver' ? "bg-green-500" : "bg-purple-500"
                                        )} style={{ width: `${strategy.distribution.savings * 100}%` }} title="Savings" />
                                    </div>
                                    <div className="flex justify-between text-[10px] text-slate-400 mt-1.5 font-medium">
                                        <span>{strategy.distribution.needs * 100}% Needs</span>
                                        <span>{strategy.distribution.wants * 100}% Wants</span>
                                        <span className={cn(
                                            strategy.id === 'balanced' ? "text-indigo-600" : 
                                            strategy.id === 'saver' ? "text-green-600" : "text-purple-600"
                                        )}>{strategy.distribution.savings * 100}% Savings</span>
                                    </div>
                                </div>
                            </div>
                        </button>
                    );
                })}

                <div className="pt-4">
                    <button 
                        onClick={onNext}
                        className="w-full py-4 bg-slate-900 text-white rounded-xl font-semibold shadow-xl shadow-slate-900/10 hover:shadow-slate-900/20 hover:translate-y-[-2px] transition-all flex items-center justify-center gap-2 text-lg"
                    >
                        Continue to Details
                        <ChevronRight className="h-5 w-5" />
                    </button>
                </div>
            </div>

        </div>
      </div>
    </motion.div>
  );
}
