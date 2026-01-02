import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, AlertTriangle, Check, TrendingUp, Lightbulb } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { optimizationService, AnalysisResponse } from '@/api/services/optimizationService';
import { categoryService } from '@/api/services/categoryService';
import { budgetService } from '@/api/services/budgetService';
import { OverspendingCard } from './smart-budget/OverspendingCard';
import { UnderspendingCard } from './smart-budget/UnderspendingCard';
import { OnTrackSummary } from './smart-budget/OnTrackSummary';
import { DataIntegrityBanner } from './smart-budget/DataIntegrityBanner';
import { useScope } from '@/context/ScopeContext';
import { Category } from '@/types';

interface OverspendingInsight {
    type: 'overspending';
    categoryId: number;
    categoryName: string;
    categoryColor: string;
    budgetAmount: number;
    actualAmount: number;
    overageAmount: number;
    overagePercentage: number;
    isRecurringPattern: boolean;
    averageMonthlySpend: number;
    highestRecentSpend: number;
    lowestRecentSpend: number;
    realisticBudgetTarget: number;
    suggestedSpendingReduction: number;
    reductionDifficulty: 'easy' | 'moderate' | 'challenging';
    tips: Array<{
        id: string;
        text: string;
        potentialSavings?: number;
        difficulty: 'easy' | 'moderate' | 'hard';
    }>;
}

interface UnderspendingInsight {
    type: 'underspending';
    categoryId: number;
    categoryName: string;
    categoryColor: string;
    budgetAmount: number;
    actualAmount: number;
    unusedAmount: number;
    utilizationPercentage: number;
    recommendedAction: 'reallocate' | 'reduce_budget' | 'boost_savings';
    suggestedNewBudget: number;
    potentialReallocation: number;
    isConsistentPattern: boolean;
    averageUtilization: number;
}

interface OnTrackInsight {
    type: 'on_track';
    categoryId: number;
    categoryName: string;
    categoryColor: string;
    budgetAmount: number;
    actualAmount: number;
    utilizationPercentage: number;
    consecutiveOnTrackMonths: number;
    trend: 'improving' | 'stable' | 'slightly_increasing';
    message: string;
}

interface StructuredInsights {
    overspending: Array<Omit<OverspendingInsight, 'categoryId' | 'categoryColor'>>;
    underspending: Array<Omit<UnderspendingInsight, 'categoryId' | 'categoryColor'>>;
    onTrack: Array<Omit<OnTrackInsight, 'categoryId' | 'categoryColor'>>;
}

interface BudgetInsightsPageProps {
    onNavigate?: (view: string) => void;
}

export function BudgetInsightsPage({ onNavigate }: BudgetInsightsPageProps) {
    const navigate = useNavigate();
    const { currentScope } = useScope();
    const [optimizationData, setOptimizationData] = useState<(AnalysisResponse & { structuredInsights?: StructuredInsights }) | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [categories, setCategories] = useState<Category[]>([]);
    const isMounted = useRef(true);

    const [overspendingInsights, setOverspendingInsights] = useState<OverspendingInsight[]>([]);
    const [underspendingInsights, setUnderspendingInsights] = useState<UnderspendingInsight[]>([]);
    const [onTrackInsights, setOnTrackInsights] = useState<OnTrackInsight[]>([]);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('sv-SE', { style: 'currency', currency: 'SEK' }).format(amount);
    };

    useEffect(() => {
        isMounted.current = true;
        return () => {
            isMounted.current = false;
        };
    }, []);

    // Load categories
    useEffect(() => {
        const loadCategories = async () => {
            try {
                const cats = await categoryService.getCategories();
                if (isMounted.current) {
                    setCategories(cats);
                }
            } catch (error) {
                console.error('[BudgetInsights] Failed to load categories:', error);
            }
        };
        loadCategories();
    }, []);

    // Load optimization data
    useEffect(() => {
        const loadOptimizationData = async () => {
            console.log('[BudgetInsights] Fetching optimization data from API...');
            setIsLoading(true);

            try {
                // Get current month's budgets to pass as proposed budgets
                const now = new Date();
                const budgets = await budgetService.getBudgets(now.getMonth() + 1, now.getFullYear());

                const proposedBudgets: Record<number, number> = {};
                budgets.forEach((b: { category_id: number; amount: number | string }) => {
                    proposedBudgets[b.category_id] = typeof b.amount === 'number' ? b.amount : Number(b.amount);
                });

                console.log('[BudgetInsights] Using current budgets:', proposedBudgets);
                console.log('[BudgetInsights] Using scope:', currentScope);

                const data = await optimizationService.getAnalysis(proposedBudgets, currentScope);
                console.log('[BudgetInsights] Optimization API response:', data);

                if (!isMounted.current) {
                    console.warn('[BudgetInsights] Component unmounted, skipping state update');
                    return;
                }

                setOptimizationData(data);

                console.log('[BudgetInsights] Data loaded successfully:');
                console.log('  - Budget variances:', data.budgetVariances?.length || 0);
                console.log('  - Patterns:', Object.keys(data.patterns || {}).length);

            } catch (error) {
                console.error('[BudgetInsights] Failed to load optimization data:', error);
                if (isMounted.current) {
                    toast.error(`Failed to load insights: ${error instanceof Error ? error.message : 'Unknown error'}`);
                }
            } finally {
                if (isMounted.current) {
                    setIsLoading(false);
                }
            }
        };

        loadOptimizationData();
    }, [currentScope]);

    // Process recommendations from backend
    useEffect(() => {
        if (!optimizationData?.structuredInsights || categories.length === 0) {
            console.log('[BudgetInsights] No structured insights or categories yet');
            return;
        }

        const { overspending, underspending, onTrack } = optimizationData.structuredInsights;

        const enrichedOverspending = overspending.map(insight => {
            const category = categories.find(c => c.name.trim().toLowerCase() === insight.categoryName.trim().toLowerCase());
            return {
                ...insight,
                categoryId: category?.id || 0,
                categoryColor: category?.color || 'amber'
            };
        });

        const enrichedUnderspending = underspending.map(insight => {
            const category = categories.find(c => c.name.trim().toLowerCase() === insight.categoryName.trim().toLowerCase());
            return {
                ...insight,
                categoryId: category?.id || 0,
                categoryColor: category?.color || 'teal'
            };
        });

        const enrichedOnTrack = onTrack.map(insight => {
            const category = categories.find(c => c.name.trim().toLowerCase() === insight.categoryName.trim().toLowerCase());
            return {
                ...insight,
                categoryId: category?.id || 0,
                categoryColor: category?.color || 'emerald'
            };
        });

        setOverspendingInsights(enrichedOverspending);
        setUnderspendingInsights(enrichedUnderspending);
        setOnTrackInsights(enrichedOnTrack);

        console.log('[BudgetInsights] Backend recommendations loaded:', {
            overspending: enrichedOverspending.length,
            underspending: enrichedUnderspending.length,
            onTrack: enrichedOnTrack.length
        });
    }, [optimizationData, categories]);

    const handleBack = () => {
        if (onNavigate) {
            onNavigate('dashboard');
        }
        navigate('/dashboard');
    };

    const handleAdjustBudget = async (categoryId: number, newAmount: number) => {
        try {
            const now = new Date();
            await budgetService.createOrUpdateBudget({
                category_id: categoryId,
                amount: newAmount,
                month: now.getMonth() + 1,
                year: now.getFullYear()
            });
            toast.success('Budget adjusted successfully');

            // Reload data to reflect changes
            window.location.reload();
        } catch (error) {
            console.error('[BudgetInsights] Failed to adjust budget:', error);
            toast.error('Failed to adjust budget');
        }
    };

    const handleReallocate = async (fromCategoryId: number, toCategoryId: number, amount: number) => {
        try {
            const now = new Date();
            const budgets = await budgetService.getBudgets(now.getMonth() + 1, now.getFullYear());

            const fromBudget = budgets.find((b: { category_id: number }) => b.category_id === fromCategoryId);
            const toBudget = budgets.find((b: { category_id: number }) => b.category_id === toCategoryId);

            if (fromBudget) {
                const fromAmount = typeof fromBudget.amount === 'number' ? fromBudget.amount : Number(fromBudget.amount);
                await budgetService.createOrUpdateBudget({
                    category_id: fromCategoryId,
                    amount: fromAmount - amount,
                    month: now.getMonth() + 1,
                    year: now.getFullYear()
                });
            }

            if (toBudget) {
                const toAmount = typeof toBudget.amount === 'number' ? toBudget.amount : Number(toBudget.amount);
                await budgetService.createOrUpdateBudget({
                    category_id: toCategoryId,
                    amount: toAmount + amount,
                    month: now.getMonth() + 1,
                    year: now.getFullYear()
                });
            }

            toast.success('Budget reallocated successfully');
            window.location.reload();
        } catch (error) {
            console.error('[BudgetInsights] Failed to reallocate budget:', error);
            toast.error('Failed to reallocate budget');
        }
    };

    const hasInsights = overspendingInsights.length > 0 || underspendingInsights.length > 0 || onTrackInsights.length > 0;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="max-w-4xl mx-auto"
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <Lightbulb className="h-6 w-6 text-amber-500" />
                        Budget Insights
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">
                        Recommendations based on your spending history
                    </p>
                </div>
                <button
                    onClick={handleBack}
                    className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Dashboard
                </button>
            </div>

            <DataIntegrityBanner />

            {/* Loading State */}
            {isLoading && (
                <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
                    <div className="animate-pulse flex flex-col items-center gap-4">
                        <div className="w-12 h-12 bg-slate-200 rounded-full"></div>
                        <div className="h-4 w-48 bg-slate-200 rounded"></div>
                        <div className="h-3 w-32 bg-slate-100 rounded"></div>
                    </div>
                    <p className="text-slate-500 mt-4">Analyzing your spending patterns...</p>
                </div>
            )}

            {/* Empty State */}
            {!isLoading && !hasInsights && (
                <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
                    <div className="flex justify-center mb-4">
                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
                            <TrendingUp className="h-8 w-8 text-slate-400" />
                        </div>
                    </div>
                    <h2 className="text-lg font-semibold text-slate-900 mb-2">
                        Not enough data yet
                    </h2>
                    <p className="text-slate-500 mb-6 max-w-md mx-auto">
                        Complete a few monthly budgets to see spending insights. We need at least 2 months of data to provide meaningful recommendations.
                    </p>
                    <button
                        onClick={handleBack}
                        className="px-6 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
                    >
                        Return to Dashboard
                    </button>
                </div>
            )}

            {/* Insights Content */}
            {!isLoading && hasInsights && (
                <div className="space-y-6">
                    {/* Overspending Section */}
                    {overspendingInsights.length > 0 && (
                        <div className="bg-white rounded-xl border border-slate-200 p-6">
                            <h2 className="text-lg font-semibold text-red-600 mb-4 flex items-center gap-2">
                                <AlertTriangle className="h-5 w-5" />
                                Attention Needed ({overspendingInsights.length} {overspendingInsights.length === 1 ? 'category' : 'categories'})
                            </h2>
                            <div className="space-y-4">
                                {overspendingInsights.map((insight) => (
                                    <OverspendingCard
                                        key={insight.categoryId}
                                        insight={insight}
                                        onAdjustBudget={handleAdjustBudget}
                                        formatCurrency={formatCurrency}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Underspending Section */}
                    {underspendingInsights.length > 0 && (
                        <div className="bg-white rounded-xl border border-slate-200 p-6">
                            <h2 className="text-lg font-semibold text-emerald-600 mb-4 flex items-center gap-2">
                                <Check className="h-5 w-5" />
                                Opportunities ({underspendingInsights.length} {underspendingInsights.length === 1 ? 'category' : 'categories'})
                            </h2>
                            <div className="space-y-4">
                                {underspendingInsights.map((insight) => (
                                    <UnderspendingCard
                                        key={insight.categoryId}
                                        insight={insight}
                                        overspendingCategories={overspendingInsights}
                                        onAdjustBudget={handleAdjustBudget}
                                        onReallocate={handleReallocate}
                                        formatCurrency={formatCurrency}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* On Track Section */}
                    {onTrackInsights.length > 0 && (
                        <div className="bg-white rounded-xl border border-slate-200 p-6">
                            <OnTrackSummary
                                insights={onTrackInsights}
                                formatCurrency={formatCurrency}
                            />
                        </div>
                    )}

                    {/* Quick Stats Summary */}
                    <div className="bg-slate-50 rounded-xl border border-slate-200 p-6">
                        <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-4">
                            Quick Summary
                        </h3>
                        <div className="grid grid-cols-3 gap-4 text-center">
                            <div className={cn(
                                "p-4 rounded-lg",
                                overspendingInsights.length > 0 ? "bg-red-50" : "bg-slate-100"
                            )}>
                                <div className={cn(
                                    "text-2xl font-bold",
                                    overspendingInsights.length > 0 ? "text-red-600" : "text-slate-400"
                                )}>
                                    {overspendingInsights.length}
                                </div>
                                <div className="text-xs text-slate-500 mt-1">Over Budget</div>
                            </div>
                            <div className={cn(
                                "p-4 rounded-lg",
                                underspendingInsights.length > 0 ? "bg-emerald-50" : "bg-slate-100"
                            )}>
                                <div className={cn(
                                    "text-2xl font-bold",
                                    underspendingInsights.length > 0 ? "text-emerald-600" : "text-slate-400"
                                )}>
                                    {underspendingInsights.length}
                                </div>
                                <div className="text-xs text-slate-500 mt-1">Under Budget</div>
                            </div>
                            <div className="p-4 rounded-lg bg-blue-50">
                                <div className="text-2xl font-bold text-blue-600">
                                    {onTrackInsights.length}
                                </div>
                                <div className="text-xs text-slate-500 mt-1">On Track</div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </motion.div>
    );
}
