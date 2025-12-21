import { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Separator } from '../ui/separator';
import { Tooltip, TooltipTrigger, TooltipContent } from '../ui/tooltip';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible';
import { 
  Plus, 
  ChevronLeft, 
  ChevronRight, 
  ChevronDown,
  ChevronUp,
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
  ArrowRight,
  MessageSquare,
  TrendingUp,
  TrendingDown,
  Clock,
  Bell,
  Send,
  BarChart3,
  X
} from 'lucide-react';
import { formatCurrency } from '../../lib/utils';

// Types for couples-centric data
interface Transaction {
  id: number;
  description: string;
  amount: number;
  date: string;
  paidBy: 'user' | 'partner';
  splitType: '50/50' | 'personal' | 'custom' | 'bill';
}

interface Comment {
  id: number;
  author: 'user' | 'partner';
  text: string;
  timestamp: string;
}

interface BudgetCategory {
  id: number;
  category: string;
  icon: React.ComponentType<{ className?: string }>;
  spent: number;
  budget: number;
  color: string;
  userSpent: number;
  partnerSpent: number;
  transactions: Transaction[];
  comments: Comment[];
  hasPartnerChanges: boolean;
  agreedByBoth: boolean;
}

// Mock Data with couples-centric enhancements
const MOCK_BUDGETS: BudgetCategory[] = [
  { 
    id: 1, 
    category: 'Groceries', 
    icon: ShoppingCart, 
    spent: 3250, 
    budget: 5000, 
    color: 'var(--theme-mint)',
    userSpent: 1800,
    partnerSpent: 1450,
    hasPartnerChanges: false,
    agreedByBoth: true,
    transactions: [
      { id: 1, description: 'ICA Maxi', amount: 892, date: '2024-12-18', paidBy: 'user', splitType: '50/50' },
      { id: 2, description: 'Coop Forum', amount: 456, date: '2024-12-15', paidBy: 'partner', splitType: '50/50' },
      { id: 3, description: 'Hemköp', amount: 234, date: '2024-12-12', paidBy: 'user', splitType: '50/50' },
    ],
    comments: [
      { id: 1, author: 'partner', text: 'Should we bulk buy more this month?', timestamp: '2 days ago' }
    ]
  },
  { 
    id: 2, 
    category: 'Dining Out', 
    icon: Utensils, 
    spent: 4250, 
    budget: 5000, 
    color: 'var(--theme-amber)',
    userSpent: 2100,
    partnerSpent: 2150,
    hasPartnerChanges: true, // Partner changed this budget
    agreedByBoth: true,
    transactions: [
      { id: 4, description: 'Restaurant Namu', amount: 1200, date: '2024-12-17', paidBy: 'partner', splitType: '50/50' },
      { id: 5, description: 'Bastard Burgers', amount: 380, date: '2024-12-14', paidBy: 'user', splitType: '50/50' },
      { id: 6, description: 'Deliveroo order', amount: 290, date: '2024-12-10', paidBy: 'user', splitType: 'personal' },
    ],
    comments: []
  },
  { 
    id: 3, 
    category: 'Transport', 
    icon: Car, 
    spent: 900, 
    budget: 2000, 
    color: 'var(--theme-cyan)',
    userSpent: 600,
    partnerSpent: 300,
    hasPartnerChanges: false,
    agreedByBoth: true,
    transactions: [
      { id: 7, description: 'SL monthly pass', amount: 450, date: '2024-12-01', paidBy: 'user', splitType: 'personal' },
      { id: 8, description: 'Taxi to airport', amount: 320, date: '2024-12-08', paidBy: 'partner', splitType: '50/50' },
    ],
    comments: []
  },
  { 
    id: 4, 
    category: 'Entertainment', 
    icon: Tv, 
    spent: 2760, 
    budget: 3000, 
    color: 'var(--theme-coral)',
    userSpent: 1200,
    partnerSpent: 1560,
    hasPartnerChanges: true,
    agreedByBoth: false, // Pending agreement
    transactions: [
      { id: 9, description: 'Concert tickets', amount: 1200, date: '2024-12-16', paidBy: 'partner', splitType: '50/50' },
      { id: 10, description: 'Cinema', amount: 340, date: '2024-12-13', paidBy: 'user', splitType: '50/50' },
    ],
    comments: [
      { id: 2, author: 'user', text: 'Can we increase this for the holidays?', timestamp: '1 day ago' },
      { id: 3, author: 'partner', text: 'Maybe by 500kr?', timestamp: '5 hours ago' }
    ]
  },
  { 
    id: 5, 
    category: 'Utilities', 
    icon: Zap, 
    spent: 3000, 
    budget: 3000, 
    color: 'var(--theme-yellow)',
    userSpent: 3000,
    partnerSpent: 0,
    hasPartnerChanges: false,
    agreedByBoth: true,
    transactions: [
      { id: 11, description: 'Electricity bill', amount: 1800, date: '2024-12-05', paidBy: 'user', splitType: 'bill' },
      { id: 12, description: 'Water bill', amount: 400, date: '2024-12-05', paidBy: 'user', splitType: 'bill' },
    ],
    comments: []
  },
  { 
    id: 6, 
    category: 'Subscriptions', 
    icon: CreditCard, 
    spent: 450, 
    budget: 750, 
    color: 'var(--theme-violet)',
    userSpent: 250,
    partnerSpent: 200,
    hasPartnerChanges: false,
    agreedByBoth: true,
    transactions: [
      { id: 13, description: 'Spotify Family', amount: 179, date: '2024-12-01', paidBy: 'user', splitType: '50/50' },
      { id: 14, description: 'Netflix', amount: 169, date: '2024-12-01', paidBy: 'partner', splitType: '50/50' },
    ],
    comments: []
  },
  { 
    id: 7, 
    category: 'Travel', 
    icon: Plane, 
    spent: 1200, 
    budget: 4000, 
    color: 'var(--theme-periwinkle)',
    userSpent: 600,
    partnerSpent: 600,
    hasPartnerChanges: false,
    agreedByBoth: true,
    transactions: [
      { id: 15, description: 'Flight booking deposit', amount: 1200, date: '2024-12-10', paidBy: 'user', splitType: '50/50' },
    ],
    comments: []
  },
  { 
    id: 8, 
    category: 'Healthcare', 
    icon: Heart, 
    spent: 800, 
    budget: 1500, 
    color: 'var(--theme-teal)',
    userSpent: 500,
    partnerSpent: 300,
    hasPartnerChanges: false,
    agreedByBoth: true,
    transactions: [
      { id: 16, description: 'Pharmacy', amount: 320, date: '2024-12-11', paidBy: 'user', splitType: 'personal' },
      { id: 17, description: 'Doctor visit', amount: 480, date: '2024-12-09', paidBy: 'partner', splitType: 'personal' },
    ],
    comments: []
  },
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
  const [expandedCategory, setExpandedCategory] = useState<number | null>(null);
  const [showMobileSummary, setShowMobileSummary] = useState(false);
  const [showSettlementDetails, setShowSettlementDetails] = useState(false);
  const [commentInputs, setCommentInputs] = useState<Record<number, string>>({});

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
  const pendingAgreements = MOCK_BUDGETS.filter(b => !b.agreedByBoth).length;
  const partnerChangesCount = MOCK_BUDGETS.filter(b => b.hasPartnerChanges).length;
  const daysLeftInMonth = 12;
  
  // Enhancement #7: Daily Burn Rate
  const dailyBurnRate = daysLeftInMonth > 0 ? Math.round(remaining / daysLeftInMonth) : 0;
  const isOnTrack = dailyBurnRate >= 0;

  // Enhancement #13: Check if it's month-end (last 5 days)
  const isMonthEnd = daysLeftInMonth <= 5;

  // Settlement data
  const userTotalPaid = MOCK_BUDGETS.reduce((acc, b) => acc + b.userSpent, 0);
  const partnerTotalPaid = MOCK_BUDGETS.reduce((acc, b) => acc + b.partnerSpent, 0);
  const settlementAmount = Math.abs(userTotalPaid - partnerTotalPaid) / 2;
  const userOwes = userTotalPaid < partnerTotalPaid;

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

  const getSplitTypeBadge = (splitType: string) => {
    const styles: Record<string, string> = {
      '50/50': 'bg-blue-100 text-blue-700',
      'personal': 'bg-gray-100 text-gray-700',
      'custom': 'bg-purple-100 text-purple-700',
      'bill': 'bg-orange-100 text-orange-700',
    };
    return styles[splitType] || styles['50/50'];
  };

  const overallStatus = overallProgress >= 90 
    ? { label: 'Over budget', color: 'text-[var(--theme-coral)]', dot: 'bg-[var(--theme-coral)]' }
    : overallProgress >= 80 
    ? { label: 'Near limit', color: 'text-[var(--theme-amber)]', dot: 'bg-[var(--theme-amber)]' }
    : { label: 'On track', color: 'text-[var(--theme-teal)]', dot: 'bg-[var(--theme-teal)]' };

  const handleAddComment = (budgetId: number) => {
    const text = commentInputs[budgetId]?.trim();
    if (!text) return;
    // In a real app, this would call an API
    console.log('Adding comment to budget:', budgetId, text);
    setCommentInputs(prev => ({ ...prev, [budgetId]: '' }));
  };

  // Enhancement #10: Mobile Summary Component
  const MobileSummaryHeader = () => (
    <div className="lg:hidden sticky top-0 z-10 bg-background border-b border-border">
      <button 
        onClick={() => setShowMobileSummary(!showMobileSummary)}
        className="w-full p-4 flex items-center justify-between"
      >
        <div className="flex items-center gap-4">
          <div className="text-left">
            <div className="text-lg font-semibold text-foreground">{formatCurrency(remaining)}</div>
            <div className="text-xs text-muted-foreground">remaining</div>
          </div>
          <div className={`status-dot`} style={{ backgroundColor: overallStatus.dot.includes('var') ? overallStatus.dot.replace('bg-[', '').replace(']', '') : undefined }} />
        </div>
        <div className="flex items-center gap-2">
          {partnerChangesCount > 0 && (
            <Badge variant="destructive" className="text-[10px]">
              {partnerChangesCount} updates
            </Badge>
          )}
          {showMobileSummary ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </div>
      </button>
      
      {showMobileSummary && (
        <div className="p-4 pt-0 space-y-4 border-t border-border/50">
          {/* Quick Stats */}
          <div className="grid grid-cols-4 gap-2 text-center">
            <div className="p-2 bg-muted/50 rounded-lg">
              <div className="text-xs text-muted-foreground">Budget</div>
              <div className="text-sm font-medium">{formatCurrency(totalBudget)}</div>
            </div>
            <div className="p-2 bg-muted/50 rounded-lg">
              <div className="text-xs text-muted-foreground">Spent</div>
              <div className="text-sm font-medium">{formatCurrency(totalSpent)}</div>
            </div>
            <div className="p-2 bg-muted/50 rounded-lg">
              <div className="text-xs text-muted-foreground">Daily</div>
              <div className={`text-sm font-medium ${isOnTrack ? 'text-[var(--theme-teal)]' : 'text-[var(--theme-coral)]'}`}>
                {formatCurrency(dailyBurnRate)}
              </div>
            </div>
            <div className="p-2 bg-muted/50 rounded-lg">
              <div className="text-xs text-muted-foreground">Days</div>
              <div className="text-sm font-medium">{daysLeftInMonth}</div>
            </div>
          </div>
          
          {/* Settlement */}
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2">
              <Avatar className="h-5 w-5">
                <AvatarFallback className={`text-[8px] text-white ${userOwes ? 'bg-[var(--theme-indigo)]' : 'bg-[var(--theme-teal)]'}`}>
                  {userOwes ? 'F' : 'E'}
                </AvatarFallback>
              </Avatar>
              <ArrowRight className="h-3 w-3 text-muted-foreground" />
              <Avatar className="h-5 w-5">
                <AvatarFallback className={`text-[8px] text-white ${userOwes ? 'bg-[var(--theme-teal)]' : 'bg-[var(--theme-indigo)]'}`}>
                  {userOwes ? 'E' : 'F'}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium">{formatCurrency(settlementAmount)}</span>
            </div>
            <Button variant="ghost" size="sm" className="text-xs text-[var(--theme-teal)]">
              Settle
            </Button>
          </div>
        </div>
      )}
    </div>
  );

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

              {/* Connected Status with Partner Changes Badge (#11) */}
              <div className="flex items-center gap-1.5 relative">
                <div className="flex -space-x-2">
                  <Avatar className="h-6 w-6 ring-2 ring-background">
                    <AvatarFallback className="bg-[var(--theme-indigo)] text-white text-[10px]">F</AvatarFallback>
                  </Avatar>
                  <Avatar className="h-6 w-6 ring-2 ring-background">
                    <AvatarFallback className="bg-[var(--theme-teal)] text-white text-[10px]">E</AvatarFallback>
                  </Avatar>
                </div>
                {partnerChangesCount > 0 && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="absolute -top-1 -right-1 h-4 w-4 bg-[var(--theme-coral)] rounded-full flex items-center justify-center">
                        <Bell className="h-2.5 w-2.5 text-white" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      Emma updated {partnerChangesCount} budget{partnerChangesCount > 1 ? 's' : ''}
                    </TooltipContent>
                  </Tooltip>
                )}
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

      {/* Enhancement #10: Mobile Collapsible Summary */}
      <MobileSummaryHeader />

      {/* Enhancement #13: Month-End Review CTA */}
      {isMonthEnd && (
        <div className="bg-gradient-to-r from-[var(--theme-indigo)] to-[var(--theme-teal)] text-white">
          <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5" />
              <div>
                <span className="font-medium">Month ending soon!</span>
                <span className="ml-2 opacity-90">{daysLeftInMonth} days left to review and settle</span>
              </div>
            </div>
            <Button variant="secondary" size="sm" className="gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Review & Settle
            </Button>
          </div>
        </div>
      )}

      {/* Main Content - Two Column Layout */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column - Summary Dashboard (40%) - Hidden on mobile via MobileSummaryHeader */}
          <aside className="hidden lg:block lg:col-span-5 space-y-6">
            
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
                    <span className={`status-dot`} style={{ backgroundColor: overallStatus.dot.includes('var') ? overallStatus.dot.replace('bg-[', '').replace(']', '') : undefined }} />
                    <span className={`text-sm font-medium`} style={{ color: overallStatus.color.includes('var') ? overallStatus.color.replace('text-[', '').replace(']', '') : undefined }}>
                      {overallStatus.label}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats Grid - Now with Daily Burn Rate (#7) */}
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
                  {/* Enhancement #7: Daily Burn Rate */}
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                      Daily Target
                      {isOnTrack ? (
                        <TrendingUp className="h-3 w-3 text-[var(--theme-teal)]" />
                      ) : (
                        <TrendingDown className="h-3 w-3 text-[var(--theme-coral)]" />
                      )}
                    </div>
                    <div className={`text-lg font-semibold ${isOnTrack ? 'text-[var(--theme-teal)]' : 'text-[var(--theme-coral)]'}`}>
                      {formatCurrency(dailyBurnRate)}/day
                    </div>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <div className="text-xs text-muted-foreground mb-1">Days Left</div>
                    <div className="text-lg font-semibold text-foreground">{daysLeftInMonth}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Enhanced Settlement Card (#4) */}
            <Card>
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Settlement
                </CardTitle>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-xs h-6 px-2"
                  onClick={() => setShowSettlementDetails(!showSettlementDetails)}
                >
                  {showSettlementDetails ? 'Hide' : 'Details'}
                </Button>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className={`text-[10px] text-white ${userOwes ? 'bg-[var(--theme-indigo)]' : 'bg-[var(--theme-teal)]'}`}>
                          {userOwes ? 'F' : 'E'}
                        </AvatarFallback>
                      </Avatar>
                      <ArrowRight className="h-3 w-3 text-muted-foreground" />
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className={`text-[10px] text-white ${userOwes ? 'bg-[var(--theme-teal)]' : 'bg-[var(--theme-indigo)]'}`}>
                          {userOwes ? 'E' : 'F'}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    <span className="text-sm font-medium text-foreground">{formatCurrency(settlementAmount)}</span>
                  </div>
                  <Button variant="ghost" size="sm" className="text-xs text-[var(--theme-teal)] hover:text-[var(--theme-teal)]">
                    Reconcile
                  </Button>
                </div>

                {/* Settlement Details Breakdown (#4) */}
                {showSettlementDetails && (
                  <div className="space-y-2 pt-2 border-t border-border">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-5 w-5">
                          <AvatarFallback className="bg-[var(--theme-indigo)] text-white text-[8px]">F</AvatarFallback>
                        </Avatar>
                        <span className="text-muted-foreground">Fredrik paid</span>
                      </div>
                      <span className="font-medium">{formatCurrency(userTotalPaid)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-5 w-5">
                          <AvatarFallback className="bg-[var(--theme-teal)] text-white text-[8px]">E</AvatarFallback>
                        </Avatar>
                        <span className="text-muted-foreground">Emma paid</span>
                      </div>
                      <span className="font-medium">{formatCurrency(partnerTotalPaid)}</span>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Difference</span>
                      <span className="font-medium">{formatCurrency(Math.abs(userTotalPaid - partnerTotalPaid))}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">50/50 Settlement</span>
                      <span className="font-semibold text-[var(--theme-teal)]">{formatCurrency(settlementAmount)}</span>
                    </div>
                    
                    {/* Monthly Trend */}
                    <div className="mt-3 p-2 bg-muted/30 rounded-lg">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <BarChart3 className="h-3 w-3" />
                        <span>Last 3 months avg: {formatCurrency(620)}</span>
                        <Badge variant="outline" className="text-[9px] px-1 py-0 h-4">
                          -5.6%
                        </Badge>
                      </div>
                    </div>
                  </div>
                )}
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
                  {pendingAgreements > 0 && (
                    <Badge 
                      variant="outline"
                      className="border-[var(--theme-violet)] text-[var(--theme-violet)] bg-[var(--theme-violet)]/10"
                    >
                      <MessageSquare className="h-3 w-3" />
                      {pendingAgreements} pending agreement
                    </Badge>
                  )}
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
                
                {/* Category List with Expandable Rows (#3) */}
                <div className="space-y-1">
                  {sortedBudgets.map((budget) => {
                    const progress = (budget.spent / budget.budget) * 100;
                    const status = getStatusInfo(budget.spent, budget.budget);
                    const Icon = budget.icon;
                    const StatusIcon = status.icon;
                    const isExpanded = expandedCategory === budget.id;

                    return (
                      <Collapsible key={budget.id} open={isExpanded} onOpenChange={() => setExpandedCategory(isExpanded ? null : budget.id)}>
                        <div 
                          className={`group rounded-lg transition-colors ${isExpanded ? 'bg-accent/30' : 'hover:bg-accent/50'}`}
                          onMouseEnter={() => setHoveredRow(budget.id)}
                          onMouseLeave={() => setHoveredRow(null)}
                        >
                          <CollapsibleTrigger className="w-full">
                            <div className="flex items-center gap-4 p-3 cursor-pointer">
                              {/* Category Icon with notification dot (#11) */}
                              <div className="relative">
                                <div 
                                  className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                                  style={{ 
                                    backgroundColor: `color-mix(in oklch, ${budget.color} 20%, transparent)`,
                                    color: budget.color 
                                  }}
                                >
                                  <Icon className="h-4 w-4" />
                                </div>
                                {budget.hasPartnerChanges && (
                                  <div className="absolute -top-1 -right-1 h-3 w-3 bg-[var(--theme-coral)] rounded-full border-2 border-background" />
                                )}
                              </div>

                              {/* Category Name */}
                              <div className="w-28 shrink-0 text-left">
                                <span className="text-sm font-medium text-foreground">{budget.category}</span>
                                {budget.comments.length > 0 && (
                                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                                    <MessageSquare className="h-2.5 w-2.5" />
                                    {budget.comments.length}
                                  </div>
                                )}
                              </div>

                              {/* Progress Bar - Enhanced for visibility */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
                                    <div 
                                      className={`h-full rounded-full transition-all duration-500 ${status.fill}`}
                                      style={{ width: `${Math.min(100, progress)}%` }}
                                    />
                                  </div>
                                  <span className="text-xs text-muted-foreground w-9 text-right shrink-0 font-medium">
                                    {Math.round(progress)}%
                                  </span>
                                </div>
                              </div>

                              {/* Amount - Compact stacked layout */}
                              <div className="text-right shrink-0 w-20">
                                <div className="text-sm font-medium text-foreground">{formatCurrency(budget.spent)}</div>
                                <div className="text-[10px] text-muted-foreground">of {formatCurrency(budget.budget)}</div>
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

                              {/* Action Icons */}
                              <div className="flex items-center gap-1 shrink-0">
                                {/* Quick Add Expense (#5) */}
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <button 
                                      className={`p-1.5 rounded transition-all ${
                                        hoveredRow === budget.id 
                                          ? 'opacity-100 hover:bg-accent text-[var(--theme-teal)]' 
                                          : 'opacity-0'
                                      }`}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        console.log('Quick add expense to:', budget.category);
                                      }}
                                      aria-label={`Add expense to ${budget.category}`}
                                    >
                                      <Plus className="h-3.5 w-3.5" />
                                    </button>
                                  </TooltipTrigger>
                                  <TooltipContent>Add expense</TooltipContent>
                                </Tooltip>
                                
                                {/* Edit Button */}
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <button 
                                      className={`p-1.5 rounded transition-all ${
                                        hoveredRow === budget.id 
                                          ? 'opacity-100 hover:bg-accent' 
                                          : 'opacity-0'
                                      }`}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        console.log('Edit budget:', budget.category);
                                      }}
                                      aria-label={`Edit ${budget.category} budget`}
                                    >
                                      <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                                    </button>
                                  </TooltipTrigger>
                                  <TooltipContent>Edit budget</TooltipContent>
                                </Tooltip>

                                {/* Expand indicator */}
                                <div className="p-1">
                                  {isExpanded ? (
                                    <ChevronUp className="h-4 w-4 text-muted-foreground" />
                                  ) : (
                                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                  )}
                                </div>
                              </div>
                            </div>
                          </CollapsibleTrigger>

                          {/* Expandable Content (#3 - Drilldown) */}
                          <CollapsibleContent>
                            <div className="px-3 pb-4 space-y-4">
                              <Separator />
                              
                              {/* Partner Breakdown */}
                              <div className="flex gap-4">
                                <div className="flex-1 p-3 bg-muted/30 rounded-lg">
                                  <div className="flex items-center gap-2 mb-1">
                                    <Avatar className="h-5 w-5">
                                      <AvatarFallback className="bg-[var(--theme-indigo)] text-white text-[8px]">F</AvatarFallback>
                                    </Avatar>
                                    <span className="text-xs text-muted-foreground">Fredrik</span>
                                  </div>
                                  <div className="text-sm font-semibold">{formatCurrency(budget.userSpent)}</div>
                                </div>
                                <div className="flex-1 p-3 bg-muted/30 rounded-lg">
                                  <div className="flex items-center gap-2 mb-1">
                                    <Avatar className="h-5 w-5">
                                      <AvatarFallback className="bg-[var(--theme-teal)] text-white text-[8px]">E</AvatarFallback>
                                    </Avatar>
                                    <span className="text-xs text-muted-foreground">Emma</span>
                                  </div>
                                  <div className="text-sm font-semibold">{formatCurrency(budget.partnerSpent)}</div>
                                </div>
                              </div>

                              {/* Top 3 Transactions */}
                              <div>
                                <div className="text-xs font-medium text-muted-foreground mb-2">Recent Transactions</div>
                                <div className="space-y-2">
                                  {budget.transactions.slice(0, 3).map((tx) => (
                                    <div key={tx.id} className="flex items-center justify-between p-2 bg-muted/20 rounded-lg">
                                      <div className="flex items-center gap-2">
                                        <Avatar className="h-5 w-5">
                                          <AvatarFallback className={`text-[8px] text-white ${tx.paidBy === 'user' ? 'bg-[var(--theme-indigo)]' : 'bg-[var(--theme-teal)]'}`}>
                                            {tx.paidBy === 'user' ? 'F' : 'E'}
                                          </AvatarFallback>
                                        </Avatar>
                                        <div>
                                          <div className="text-sm">{tx.description}</div>
                                          <div className="text-[10px] text-muted-foreground">{tx.date}</div>
                                        </div>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${getSplitTypeBadge(tx.splitType)}`}>
                                          {tx.splitType}
                                        </span>
                                        <span className="text-sm font-medium">{formatCurrency(tx.amount)}</span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                                <Button variant="ghost" size="sm" className="w-full mt-2 text-xs">
                                  View all transactions
                                </Button>
                              </div>

                              {/* Comment Thread (#12) */}
                              <div>
                                <div className="text-xs font-medium text-muted-foreground mb-2">
                                  Discussion ({budget.comments.length})
                                </div>
                                
                                {budget.comments.length > 0 ? (
                                  <div className="space-y-2 mb-3">
                                    {budget.comments.map((comment) => (
                                      <div key={comment.id} className={`flex gap-2 ${comment.author === 'user' ? '' : 'flex-row-reverse'}`}>
                                        <Avatar className="h-6 w-6 shrink-0">
                                          <AvatarFallback className={`text-[9px] text-white ${comment.author === 'user' ? 'bg-[var(--theme-indigo)]' : 'bg-[var(--theme-teal)]'}`}>
                                            {comment.author === 'user' ? 'F' : 'E'}
                                          </AvatarFallback>
                                        </Avatar>
                                        <div className={`flex-1 p-2 rounded-lg text-sm ${comment.author === 'user' ? 'bg-muted/50' : 'bg-[var(--theme-teal)]/10'}`}>
                                          <p>{comment.text}</p>
                                          <span className="text-[10px] text-muted-foreground">{comment.timestamp}</span>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <p className="text-xs text-muted-foreground mb-3">No comments yet. Start a discussion about this budget.</p>
                                )}
                                
                                {/* Add Comment Input */}
                                <div className="flex gap-2">
                                  <input
                                    type="text"
                                    placeholder="Add a comment..."
                                    value={commentInputs[budget.id] || ''}
                                    onChange={(e) => setCommentInputs(prev => ({ ...prev, [budget.id]: e.target.value }))}
                                    className="flex-1 text-sm px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') {
                                        handleAddComment(budget.id);
                                      }
                                    }}
                                  />
                                  <Button 
                                    size="sm" 
                                    onClick={() => handleAddComment(budget.id)}
                                    disabled={!commentInputs[budget.id]?.trim()}
                                  >
                                    <Send className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>

                              {/* Agreement Status */}
                              {!budget.agreedByBoth && (
                                <div className="flex items-center justify-between p-3 bg-[var(--theme-violet)]/10 rounded-lg border border-[var(--theme-violet)]/30">
                                  <div className="flex items-center gap-2">
                                    <AlertTriangle className="h-4 w-4 text-[var(--theme-violet)]" />
                                    <span className="text-sm text-[var(--theme-violet)]">Pending your agreement</span>
                                  </div>
                                  <div className="flex gap-2">
                                    <Button variant="outline" size="sm" className="h-7 text-xs">
                                      <X className="h-3 w-3 mr-1" />
                                      Decline
                                    </Button>
                                    <Button size="sm" className="h-7 text-xs bg-[var(--theme-violet)] hover:bg-[var(--theme-violet)]/90">
                                      <CheckCircle2 className="h-3 w-3 mr-1" />
                                      Agree
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </div>
                          </CollapsibleContent>
                        </div>
                      </Collapsible>
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
