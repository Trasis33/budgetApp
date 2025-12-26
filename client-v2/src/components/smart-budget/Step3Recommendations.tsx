import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Check } from 'lucide-react';
import { WizardState } from './types';
import { Category } from '../../types';
import { cn } from '@/lib/utils';

interface Step3Props {
  state: WizardState;
  categories: Category[];
  updateFixed: (catId: number, val: number) => void;
  updateVariable: (catId: number, val: number) => void;
  onBack: () => void;
  onSave: () => void;
}

export function Step3Recommendations({
  state,
  categories,
  updateFixed,
  updateVariable,
  onBack,
  onSave
}: Step3Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="h-full flex flex-col p-6 overflow-auto"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-medium text-slate-900">
          Budget Recommendations & Review
        </h2>
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
      </div>

      <div className="flex-1 overflow-auto">
        <p className="text-slate-600 mb-4">
          Review personalized insights based on your spending patterns.
        </p>

        <div className="text-slate-400 text-sm">
          Insights will be loaded here...
        </div>
      </div>

      <div className="flex gap-3 pt-4 border-t border-slate-200">
        <button
          onClick={onSave}
          className={cn(
            'flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium',
            'bg-indigo-600 text-white hover:bg-indigo-700 transition-colors'
          )}
        >
          <Check className="h-4 w-4" />
          Save Budget Plan
        </button>
      </div>
    </motion.div>
  );
}
