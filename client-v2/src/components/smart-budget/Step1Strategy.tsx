import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ChevronRight, User, Users } from 'lucide-react';
import { StrategyType, STRATEGIES } from './types';
import { cn } from '@/lib/utils';
import { Button } from '../ui/button';

interface Step1Props {
  income: number;
  userIncome: number;
  partnerIncome: number;
  setUserIncome: (val: number) => void;
  setPartnerIncome: (val: number) => void;
  userName: string;
  partnerName: string;
  hasPartner: boolean;
  selectedStrategy: StrategyType;
  setStrategy: (val: StrategyType) => void;
  onNext: () => void;
  onCancel: () => void;
}

export function Step1Strategy({
  income,
  userIncome,
  partnerIncome,
  setUserIncome,
  setPartnerIncome,
  userName,
  partnerName,
  hasPartner,
  selectedStrategy,
  setStrategy,
  onNext,
  onCancel
}: Step1Props) {
  
  const handleUserIncomeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '');
    setUserIncome(val ? parseInt(val) : 0);
  };

  const handlePartnerIncomeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '');
    setPartnerIncome(val ? parseInt(val) : 0);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('sv-SE').format(num);
  };

  const quickAddUser = (amount: number) => {
    setUserIncome(userIncome + amount);
  };

  const quickAddPartner = (amount: number) => {
    setPartnerIncome(partnerIncome + amount);
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
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
                <div className="p-2 rounded-full bg-card border border-border hover:bg-muted transition-colors">
                    <ArrowLeft className="h-5 w-5" />
                </div>
                <span className="font-medium hidden sm:inline">Cancel</span>
            </button>
            <div className="text-center">
                <h1 className="text-lg font-display font-semibold text-foreground">Smart Budget Setup</h1>
                <p className="text-xs text-muted-foreground">Step 1 of 2</p>
            </div>
            <div className="w-20"></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Column: Income */}
            <div className="lg:col-span-5 space-y-4">
                {/* Combined Total Display */}
                <div className="bg-card rounded-2xl shadow-sm border border-border p-6 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[oklch(var(--theme-teal))] to-[oklch(var(--theme-teal)/0.7)]"></div>
                    <div className="text-center space-y-2">
                        <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wide">Combined Monthly Income</label>
                        <div className="flex items-center justify-center gap-2">
                            <span className="text-2xl text-muted-foreground/50 font-light">kr</span>
                            <span className="text-3xl sm:text-4xl font-display font-bold text-foreground">{formatNumber(income)}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">Net (after tax)</p>
                    </div>
                </div>

                {/* Individual Income Fields */}
                <div className="space-y-3">
                    {/* Your Income */}
                    <div className="bg-card rounded-xl shadow-sm border border-border p-5 relative overflow-hidden">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-8 h-8 rounded-full bg-[oklch(var(--theme-indigo)/0.15)] flex items-center justify-center">
                                <User className="h-4 w-4 text-[oklch(var(--theme-indigo))]" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-foreground">{userName}</label>
                                <p className="text-xs text-muted-foreground">Your monthly net income</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-lg text-muted-foreground/50 font-light">kr</span>
                            <input 
                                type="text" 
                                value={formatNumber(userIncome)} 
                                onChange={handleUserIncomeChange}
                                className="flex-1 text-2xl font-display font-bold text-foreground placeholder:text-muted-foreground/30 focus:outline-none bg-transparent p-0 m-0"
                                autoFocus
                            />
                        </div>
                        <div className="flex gap-2 mt-3 flex-wrap">
                            {[1000, 5000, 10000].map(amount => (
                                <button 
                                    key={amount}
                                    onClick={() => quickAddUser(amount)}
                                    className="px-2.5 py-1 rounded-full bg-muted border border-border text-xs font-medium text-muted-foreground hover:bg-muted/80 transition-colors"
                                >
                                    +{formatNumber(amount)}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Partner Income */}
                    {hasPartner && (
                        <div className="bg-card rounded-xl shadow-sm border border-border p-5 relative overflow-hidden">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-8 h-8 rounded-full bg-[oklch(var(--theme-coral)/0.15)] flex items-center justify-center">
                                    <Users className="h-4 w-4 text-[oklch(var(--theme-coral))]" />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-foreground">{partnerName}</label>
                                    <p className="text-xs text-muted-foreground">Partner's monthly net income</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-lg text-muted-foreground/50 font-light">kr</span>
                                <input 
                                    type="text" 
                                    value={formatNumber(partnerIncome)} 
                                    onChange={handlePartnerIncomeChange}
                                    className="flex-1 text-2xl font-display font-bold text-foreground placeholder:text-muted-foreground/30 focus:outline-none bg-transparent p-0 m-0"
                                />
                            </div>
                            <div className="flex gap-2 mt-3 flex-wrap">
                                {[1000, 5000, 10000].map(amount => (
                                    <button 
                                        key={amount}
                                        onClick={() => quickAddPartner(amount)}
                                        className="px-2.5 py-1 rounded-full bg-muted border border-border text-xs font-medium text-muted-foreground hover:bg-muted/80 transition-colors"
                                    >
                                        +{formatNumber(amount)}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-3">
                    <p className="text-sm text-muted-foreground text-center leading-relaxed max-w-sm mx-auto">
                        {hasPartner 
                            ? "Your combined income will be the foundation for your shared budget."
                            : "Set your income in Settings → Profile to pre-fill this value."}
                    </p>
                </div>
            </div>

            {/* Right Column: Strategy */}
            <div className="lg:col-span-7 space-y-4">
                <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Choose a Strategy</label>
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
                                    ? "bg-card border-[oklch(var(--theme-teal))] shadow-lg shadow-[oklch(var(--theme-teal)/0.1)] translate-y-[-2px]" 
                                    : "bg-card border-border hover:border-border/80 hover:shadow-md opacity-90 hover:opacity-100"
                            )}
                        >
                            {strategy.id === 'balanced' && (
                                <div className="absolute -top-3 right-4 bg-[oklch(var(--theme-teal))] text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                                    RECOMMENDED
                                </div>
                            )}
                            
                            <div className="flex items-start gap-4">
                                <div className={cn(
                                    "w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0 transition-colors",
                                    isSelected ? "bg-[oklch(var(--theme-teal)/0.1)]" : "bg-muted group-hover:bg-muted/80"
                                )}>
                                    {strategy.icon}
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-base font-bold text-foreground mb-1">{strategy.name}</h3>
                                    <p className="text-sm text-muted-foreground mb-3">{strategy.description}</p>
                                    
                                    {/* Visual Bar */}
                                    <div className="flex h-2 w-full rounded-full overflow-hidden bg-muted">
                                        <div className="bg-foreground" style={{ width: `${strategy.distribution.needs * 100}%` }} title="Needs" />
                                        <div className="bg-muted-foreground" style={{ width: `${strategy.distribution.wants * 100}%` }} title="Wants" />
                                        <div className={cn(
                                            "transition-colors",
                                            strategy.id === 'balanced' ? "bg-[oklch(var(--theme-teal))]" : 
                                            strategy.id === 'saver' ? "bg-[oklch(var(--theme-teal))]" : "bg-[oklch(var(--theme-indigo))]"
                                        )} style={{ width: `${strategy.distribution.savings * 100}%` }} title="Savings" />
                                    </div>
                                    <div className="flex justify-between text-[10px] text-muted-foreground mt-1.5 font-medium">
                                        <span>{strategy.distribution.needs * 100}% Needs</span>
                                        <span>{strategy.distribution.wants * 100}% Wants</span>
                                        <span className={cn(
                                            strategy.id === 'balanced' ? "text-[oklch(var(--theme-teal))]" : 
                                            strategy.id === 'saver' ? "text-[oklch(var(--theme-teal))]" : "text-[oklch(var(--theme-indigo))]"
                                        )}>{strategy.distribution.savings * 100}% Savings</span>
                                    </div>
                                </div>
                            </div>
                        </button>
                    );
                })}

                <div className="pt-4">
                    <Button 
                        onClick={onNext}
                        variant="teal"
                        className="w-full py-4 h-auto rounded-xl font-semibold shadow-xl shadow-[oklch(var(--theme-teal)/0.15)] hover:shadow-[oklch(var(--theme-teal)/0.25)] hover:translate-y-[-2px] transition-all flex items-center justify-center gap-2 text-lg"
                    >
                        Continue to Details
                        <ChevronRight className="h-5 w-5" />
                    </Button>
                </div>
            </div>

        </div>
      </div>
    </motion.div>
  );
}
