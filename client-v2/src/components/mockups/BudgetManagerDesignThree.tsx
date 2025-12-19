import { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Separator } from '../ui/separator';
import { Tooltip, TooltipTrigger, TooltipContent } from '../ui/tooltip';
import { 
  Plus, 
  ChevronLeft, 
  ChevronRight, 
  AlertTriangle,
  CheckCircle2,
  Pencil,
  ShoppingCart,
  Utensils,
  Car,
  Tv,
  Zap,
  CreditCard,
  Plane,
  Heart,
  ArrowRight
} from 'lucide-react';
import { formatCurrency } from '../../lib/utils';

// Mock Data following the design specs
const MOCK_BUDGETS = [
  { id: 1, category: 'Groceries', icon: ShoppingCart, spent: 3250, budget: 5000, color: 'var(--theme-mint)' },
  { id: 2, category: 'Dining Out', icon: Utensils, spent: 4250, budget: 5000, color: 'var(--theme-amber)' },
  { id: 3, category: 'Transport', icon: Car, spent: 900, budget: 2000, color: 'var(--theme-cyan)' },
  { id: 4, category: 'Entertainment', icon: Tv, spent: 2760, budget: 3000, color: 'var(--theme-coral)' },
  { id: 5, category: 'Utilities', icon: Zap, spent: 3000, budget: 3000, color: 'var(--theme-yellow)' },
  { id: 6, category: 'Subscriptions', icon: CreditCard, spent: 450, budget: 750, color: 'var(--theme-violet)' },
  { id: 7, category: 'Travel', icon: Plane, spent: 1200, budget: 4000, color: 'var(--theme-periwinkle)' },
  { id: 8, category: 'Healthcare', icon: Heart, spent: 800, budget: 1500, color: 'var(--theme-teal)' },
];

const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

type ScopeType = 'shared' | 'mine' | 'partner';

interface BudgetManagerDesignThreeProps {
  onNavigate?: (view: string) => void;
}

export function BudgetManagerDesignThree({ onNavigate: _onNavigate }: BudgetManagerDesignThreeProps) {
  const [selectedMonth, setSelectedMonth] = useState(11); // December (0-indexed)
  const [selectedYear, setSelectedYear] = useState(2024);
  const [scope, setScope] = useState<ScopeType>('shared');
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);

  // Calculations
  const totalBudget = MOCK_BUDGETS.reduce((acc, b) => acc + b.budget, 0);
  const totalSpent = MOCK_BUDGETS.reduce((acc, b) => acc + b.spent, 0);
  const remaining = totalBudget - totalSpent;
  const overallProgress = (totalSpent / totalBudget) * 100;
  
  const nearLimitCount = MOCK_BUDGETS.filter(b => {
    const progress = (b.spent / b.budget) * 100;
    return progress >= 80 && progress < 100;
  }).length;
  
  const overBudgetCount = MOCK_BUDGETS.filter(b => b.spent >= b.budget).length;
  const daysLeftInMonth = 12; // Mock value

  // Sort budgets: at-risk first, then by progress descending
  const sortedBudgets = [...MOCK_BUDGETS].sort((a, b) => {
    const progressA = (a.spent / a.budget) * 100;
    const progressB = (b.spent / b.budget) * 100;
    const isAtRiskA = progressA >= 80;
    const isAtRiskB = progressB >= 80;
    if (isAtRiskA && !isAtRiskB) return -1;
    if (!isAtRiskA && isAtRiskB) return 1;
    return progressB - progressA;
  });

  const handlePrevMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear(selectedYear - 1);
    } else {
      setSelectedMonth(selectedMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear(selectedYear + 1);
    } else {
      setSelectedMonth(selectedMonth + 1);
    }
  };

  const getStatusInfo = (spent: number, budget: number) => {
    const progress = (spent / budget) * 100;
    if (progress >= 100) return { 
      variant: 'secondary' as const, 
      label: 'Complete', 
      fill: 'bg-muted-foreground',
      icon: CheckCircle2
    };
    if (progress >= 90) return { 
      variant: 'destructive' as const, 
      label: 'Critical', 
      fill: 'bg-[var(--theme-coral)]',
      icon: AlertTriangle
    };
    if (progress >= 80) return { 
      variant: 'outline' as const, 
      label: 'Near limit', 
      fill: 'bg-[var(--theme-amber)]',
      icon: AlertTriangle
    };
    return { 
      variant: 'outline' as const, 
      label: 'On track', 
      fill: 'bg-[var(--theme-teal)]',
      icon: null
    };
  };

  const overallStatus = overallProgress >= 90 
    ? { label: 'Over budget', color: 'text-[var(--theme-coral)]', dot: 'bg-[var(--theme-coral)]' }
    : overallProgress >= 80 
    ? { label: 'Near limit', color: 'text-[var(--theme-amber)]', dot: 'bg-[var(--theme-amber)]' }
    : { label: 'On track', color: 'text-[var(--theme-teal)]', dot: 'bg-[var(--theme-teal)]' };

  return (
    <div className="min-h-screen bg-background">
      {/* Streamlined Header */}
      <header className="border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            {/* Left: Title & Date */}
            <div className="flex items-center gap-6">
              <h1 className="text-xl font-medium text-foreground">Budget Manager</h1>
              
              {/* Compact Date Picker */}
              <div className="flex items-center gap-1 text-sm">
                <button 
                  onClick={handlePrevMonth}
                  className="p-1 hover:bg-accent rounded transition-colors"
                  aria-label="Previous month"
                >
                  <ChevronLeft className="h-4 w-4 text-muted-foreground" />
                </button>
                <span className="px-2 py-1 font-medium text-foreground">
                  {MONTHS[selectedMonth]} {selectedYear}
                </span>
                <button 
                  onClick={handleNextMonth}
                  className="p-1 hover:bg-accent rounded transition-colors"
                  aria-label="Next month"
                >
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </button>
              </div>
            </div>

            {/* Right: Scope Tabs + Partner + Add Button */}
            <div className="flex items-center gap-4">
              {/* Inline Scope Tabs */}
              <div className="flex items-center gap-1 text-sm bg-muted rounded-lg p-1">
                {(['shared', 'mine', 'partner'] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => setScope(s)}
                    className={`px-3 py-1.5 rounded-md transition-colors capitalize ${
                      scope === s
                        ? 'text-foreground bg-card shadow-sm font-medium'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {s === 'shared' ? 'Shared' : s === 'mine' ? 'Mine' : "Partner's"}
                  </button>
                ))}
              </div>

              {/* Connected Status */}
              <div className="flex items-center gap-1.5">
                <div className="flex -space-x-2">
                  <Avatar className="h-6 w-6 ring-2 ring-background">
                    <AvatarFallback className="bg-[var(--theme-indigo)] text-white text-[10px]">F</AvatarFallback>
                  </Avatar>
                  <Avatar className="h-6 w-6 ring-2 ring-background">
                    <AvatarFallback className="bg-[var(--theme-teal)] text-white text-[10px]">E</AvatarFallback>
                  </Avatar>
                </div>
                <CheckCircle2 className="h-3.5 w-3.5 text-[var(--theme-teal)]" />
              </div>

              {/* Add Budget Button */}
              <Button size="sm" variant="outline" className="gap-1.5 text-sm">
                <Plus className="h-4 w-4" />
                Add Budget
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - Two Column Layout */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column - Summary Dashboard (40%) */}
          <aside className="lg:col-span-5 space-y-6">
            
            {/* Month At A Glance Card */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Month at a Glance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Large Remaining Amount */}
                <div>
                  <div className="text-4xl font-semibold text-foreground tracking-tight">
                    {formatCurrency(remaining)}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    remaining of {formatCurrency(totalBudget)}
                  </p>
                </div>

                {/* Overall Progress Bar */}
                <div className="space-y-2">
                  <div className="progress-bar">
                    <div 
                      className={`progress-fill ${
                        overallProgress >= 90 ? 'bg-[var(--theme-coral)]' : 
                        overallProgress >= 80 ? 'bg-[var(--theme-amber)]' : 'bg-[var(--theme-teal)]'
                      }`}
                      style={{ width: `${Math.min(100, overallProgress)}%` }}
                    />
                  </div>
                  {/* Status */}
                  <div className="flex items-center gap-2">
                    <span className={`status-dot ${overallStatus.dot.replace('bg-', 'bg-')}`} 
                          style={{ backgroundColor: overallStatus.dot.includes('var') ? overallStatus.dot.replace('bg-[', '').replace(']', '') : undefined }} />
                    <span className={`text-sm font-medium`} style={{ color: overallStatus.color.includes('var') ? overallStatus.color.replace('text-[', '').replace(']', '') : undefined }}>
                      {overallStatus.label}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats Grid */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Quick Stats
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <div className="text-xs text-muted-foreground mb-1">Total Budget</div>
                    <div className="text-lg font-semibold text-foreground">{formatCurrency(totalBudget)}</div>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <div className="text-xs text-muted-foreground mb-1">Total Spent</div>
                    <div className="text-lg font-semibold text-foreground">{formatCurrency(totalSpent)}</div>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <div className="text-xs text-muted-foreground mb-1">Categories</div>
                    <div className="text-lg font-semibold text-foreground">{MOCK_BUDGETS.length} active</div>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <div className="text-xs text-muted-foreground mb-1">Days Left</div>
                    <div className="text-lg font-semibold text-foreground">{daysLeftInMonth}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Settlement Mini Card */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Settlement
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="bg-[var(--theme-indigo)] text-white text-[10px]">F</AvatarFallback>
                      </Avatar>
                      <ArrowRight className="h-3 w-3 text-muted-foreground" />
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="bg-[var(--theme-teal)] text-white text-[10px]">E</AvatarFallback>
                      </Avatar>
                    </div>
                    <span className="text-sm font-medium text-foreground">kr 585</span>
                  </div>
                  <Button variant="ghost" size="sm" className="text-xs text-[var(--theme-teal)] hover:text-[var(--theme-teal)]">
                    Reconcile
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Alerts Section */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Alerts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  <Badge 
                    variant={nearLimitCount > 0 ? 'outline' : 'secondary'}
                    className={nearLimitCount > 0 ? 'border-[var(--theme-amber)] text-[var(--theme-amber)] bg-[var(--theme-amber)]/10' : ''}
                  >
                    <AlertTriangle className="h-3 w-3" />
                    {nearLimitCount} near limit
                  </Badge>
                  <Badge 
                    variant={overBudgetCount > 0 ? 'destructive' : 'secondary'}
                  >
                    {overBudgetCount > 0 ? (
                      <AlertTriangle className="h-3 w-3" />
                    ) : (
                      <CheckCircle2 className="h-3 w-3" />
                    )}
                    {overBudgetCount} over budget
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </aside>

          {/* Right Column - Category List (60%) */}
          <section className="lg:col-span-7">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  All Categories
                </CardTitle>
                <select className="text-xs text-muted-foreground bg-transparent border-0 focus:ring-0 cursor-pointer">
                  <option value="risk">At Risk First</option>
                  <option value="alpha">Alphabetical</option>
                  <option value="spend">Highest Spend</option>
                </select>
              </CardHeader>
              <CardContent className="pt-0">
                <Separator className="mb-4" />
                
                {/* Category List */}
                <div className="space-y-1">
                  {sortedBudgets.map((budget) => {
                    const progress = (budget.spent / budget.budget) * 100;
                    const status = getStatusInfo(budget.spent, budget.budget);
                    const Icon = budget.icon;
                    const StatusIcon = status.icon;

                    return (
                      <div 
                        key={budget.id}
                        className="group flex items-center gap-4 p-3 -mx-3 rounded-lg hover:bg-accent/50 transition-colors cursor-pointer"
                        onMouseEnter={() => setHoveredRow(budget.id)}
                        onMouseLeave={() => setHoveredRow(null)}
                      >
                        {/* Category Icon */}
                        <div 
                          className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                          style={{ 
                            backgroundColor: `color-mix(in oklch, ${budget.color} 20%, transparent)`,
                            color: budget.color 
                          }}
                        >
                          <Icon className="h-4 w-4" />
                        </div>

                        {/* Category Name */}
                        <div className="w-28 shrink-0">
                          <span className="text-sm font-medium text-foreground">{budget.category}</span>
                        </div>

                        {/* Progress Bar */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3">
                            <div className="flex-1 progress-bar">
                              <div 
                                className={`progress-fill ${status.fill}`}
                                style={{ width: `${Math.min(100, progress)}%` }}
                              />
                            </div>
                            <span className="text-xs text-muted-foreground w-10 text-right shrink-0">
                              {Math.round(progress)}%
                            </span>
                          </div>
                        </div>

                        {/* Amount */}
                        <div className="text-right shrink-0 w-32">
                          <span className="text-sm text-muted-foreground">
                            {formatCurrency(budget.spent)} / {formatCurrency(budget.budget)}
                          </span>
                        </div>

                        {/* Status Badge */}
                        <div className="shrink-0 w-24">
                          <Badge 
                            variant={status.variant}
                            className={`text-[10px] ${
                              status.label === 'Near limit' ? 'border-[var(--theme-amber)] text-[var(--theme-amber)] bg-[var(--theme-amber)]/10' :
                              status.label === 'On track' ? 'border-[var(--theme-teal)] text-[var(--theme-teal)] bg-[var(--theme-teal)]/10' :
                              ''
                            }`}
                          >
                            {StatusIcon && <StatusIcon className="h-2.5 w-2.5" />}
                            {status.label}
                          </Badge>
                        </div>

                        {/* Edit Icon (appears on hover) */}
                        <div className="w-8 shrink-0">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button 
                                className={`p-1.5 rounded transition-all ${
                                  hoveredRow === budget.id 
                                    ? 'opacity-100 hover:bg-accent' 
                                    : 'opacity-0'
                                }`}
                                aria-label={`Edit ${budget.category} budget`}
                              >
                                <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent>
                              Edit budget
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </section>
        </div>
      </main>
    </div>
  );
}
