# Step 3 Recommendations: Complete Logic Redesign

## Executive Summary

The current `Step3Recommendations.tsx` implementation has a **critical conceptual flaw**: when a category is overspending, the system offers to "reduce by X kr" which **reduces the BUDGET amount** rather than helping users reduce their **actual spending**. This is counterproductive because:

1. Reducing the budget when you're already overspending **increases** the overspending percentage
2. It manipulates numbers rather than helping users change behavior
3. It creates confusion about what budgets vs. actual spending mean

This document provides a complete redesign of the recommendation logic, UI, and user experience.

---

## Part 1: Critical Issues in Current Implementation

### Issue 1: Backwards Overspending Logic

**Current behavior** (`@/client-v2/src/components/smart-budget/Step3Recommendations.tsx:299-321`):
```typescript
const applySuggestion = (categoryId: number, suggestedAmount: number, isFixed: boolean = true) => {
  // ...
  updateFixed(categoryId, suggestedAmount);  // ← REDUCES THE BUDGET
}
```

**Problem**: When user clicks "Apply" on an overspending alert:
- Budget: 5,000 kr → Actual: 7,500 kr (50% over)
- System suggests: "Reduce by 2,500 kr"
- After apply: Budget becomes 2,500 kr → Now 200% over budget!

**Root cause**: The system conflates "budget adjustment" with "spending reduction guidance."

### Issue 2: Confusing "Reduce by" Language

The UI shows "Reduce by: X kr" but this reduces the budget, not spending. Users expect:
- "Reduce by 2,500 kr" = "Spend 2,500 kr less next month"
- Reality: "Reduce by 2,500 kr" = "Lower your budget target by 2,500 kr"

### Issue 3: No Actionable Spending Guidance

The current system provides no:
- Specific tips on HOW to reduce spending in a category
- Historical context (is this a one-time spike or pattern?)
- Breakdown of what's driving the overspend
- Realistic reduction targets based on past behavior

### Issue 4: Risk of Data Modification Confusion

While the current implementation doesn't delete expenses, the "Apply" button pattern could confuse users into thinking they're modifying transaction data. The system must be crystal clear that:
- **Budgets** = Planning targets (can be adjusted)
- **Expenses** = Historical records (never modified by recommendations)

---

## Part 2: Redesigned Recommendation Philosophy

### Core Principles

1. **Budgets are targets, not reality** - Recommendations should help users set realistic targets AND provide guidance to meet them
2. **Never manipulate to hide problems** - Lowering a budget to match overspending hides the problem
3. **Actionable over informational** - Every insight should have a clear "what to do next"
4. **Data integrity is sacred** - Expense transactions are immutable historical records
5. **Behavioral guidance over number tweaking** - Help users change habits, not spreadsheets

### The Three Recommendation Types

| Scenario | Goal | Primary Action |
|----------|------|----------------|
| **Overspending** | Help user reduce actual spending | Behavioral tips + realistic reduction targets |
| **On Track** | Reinforce good behavior | Celebrate + show consistency metrics |
| **Underspending** | Optimize allocation | Suggest reallocation OR savings boost |

---

## Part 3: New Logic Architecture

### 3.1 Overspending Recommendations

#### When to Show
- `actualAmount > budgetAmount` AND `overagePercentage >= 10%`
- Only show for categories with 2+ months of data (to distinguish patterns from anomalies)

#### Data Structure
```typescript
interface OverspendingInsight {
  categoryId: number;
  categoryName: string;
  
  // Current month data
  budgetAmount: number;
  actualAmount: number;
  overageAmount: number;        // actualAmount - budgetAmount
  overagePercentage: number;
  
  // Historical context
  isRecurringPattern: boolean;  // Overspent 2+ of last 3 months?
  averageMonthlySpend: number;  // 3-month rolling average
  highestRecentSpend: number;   // Max of last 3 months
  lowestRecentSpend: number;    // Min of last 3 months
  
  // Recommendations
  realisticBudgetTarget: number;    // Based on historical average + 10% buffer
  suggestedSpendingReduction: number; // How much to cut from SPENDING
  reductionDifficulty: 'easy' | 'moderate' | 'challenging';
  
  // Actionable tips (category-specific)
  tips: SpendingTip[];
}

interface SpendingTip {
  id: string;
  text: string;
  potentialSavings?: number;  // Estimated monthly savings
  difficulty: 'easy' | 'moderate' | 'hard';
}
```

#### Algorithm: Calculate Realistic Targets

```typescript
function calculateOverspendingRecommendation(
  categoryName: string,
  currentBudget: number,
  currentActual: number,
  historicalData: MonthlySpend[]  // Last 3-6 months
): OverspendingInsight {
  
  // 1. Calculate historical metrics
  const last3Months = historicalData.slice(-3);
  const averageSpend = last3Months.reduce((sum, m) => sum + m.amount, 0) / last3Months.length;
  const highestSpend = Math.max(...last3Months.map(m => m.amount));
  const lowestSpend = Math.min(...last3Months.map(m => m.amount));
  
  // 2. Determine if this is a pattern or anomaly
  const overspendingMonths = last3Months.filter(m => m.amount > m.budget).length;
  const isRecurringPattern = overspendingMonths >= 2;
  
  // 3. Calculate realistic budget target
  // If recurring pattern: suggest budget = average + 10% buffer
  // If anomaly: keep current budget, focus on behavior change
  let realisticBudgetTarget: number;
  if (isRecurringPattern) {
    realisticBudgetTarget = Math.round(averageSpend * 1.1);
  } else {
    realisticBudgetTarget = currentBudget; // Keep current, it's achievable
  }
  
  // 4. Calculate spending reduction target
  // Goal: Get actual spending down to budget level
  const suggestedSpendingReduction = currentActual - currentBudget;
  
  // 5. Assess difficulty based on variance
  const varianceFromAverage = (currentActual - averageSpend) / averageSpend;
  let reductionDifficulty: 'easy' | 'moderate' | 'challenging';
  if (varianceFromAverage < 0.15) {
    reductionDifficulty = 'easy';
  } else if (varianceFromAverage < 0.30) {
    reductionDifficulty = 'moderate';
  } else {
    reductionDifficulty = 'challenging';
  }
  
  // 6. Generate category-specific tips
  const tips = generateCategoryTips(categoryName, suggestedSpendingReduction);
  
  return {
    categoryId: /* from lookup */,
    categoryName,
    budgetAmount: currentBudget,
    actualAmount: currentActual,
    overageAmount: currentActual - currentBudget,
    overagePercentage: ((currentActual - currentBudget) / currentBudget) * 100,
    isRecurringPattern,
    averageMonthlySpend: averageSpend,
    highestRecentSpend: highestSpend,
    lowestRecentSpend: lowestSpend,
    realisticBudgetTarget,
    suggestedSpendingReduction,
    reductionDifficulty,
    tips
  };
}
```

#### Category-Specific Tips Generator

```typescript
const CATEGORY_TIPS: Record<string, SpendingTip[]> = {
  'groceries': [
    { id: 'meal-plan', text: 'Plan weekly meals before shopping to avoid impulse buys', difficulty: 'easy' },
    { id: 'store-brands', text: 'Switch to store brands for staples (saves ~20%)', difficulty: 'easy', potentialSavings: 500 },
    { id: 'bulk-buy', text: 'Buy non-perishables in bulk when on sale', difficulty: 'moderate' },
    { id: 'reduce-waste', text: 'Track expiration dates to reduce food waste', difficulty: 'moderate' },
  ],
  'dining out': [
    { id: 'lunch-prep', text: 'Bring lunch to work 3x per week', difficulty: 'moderate', potentialSavings: 800 },
    { id: 'coffee-home', text: 'Make coffee at home instead of buying', difficulty: 'easy', potentialSavings: 400 },
    { id: 'happy-hour', text: 'Choose happy hour specials over dinner prices', difficulty: 'easy' },
  ],
  'entertainment': [
    { id: 'streaming-audit', text: 'Audit streaming subscriptions - cancel unused ones', difficulty: 'easy', potentialSavings: 200 },
    { id: 'free-events', text: 'Look for free local events and activities', difficulty: 'easy' },
    { id: 'library', text: 'Use library for books, movies, and digital content', difficulty: 'easy' },
  ],
  'transportation': [
    { id: 'carpool', text: 'Carpool or use public transit 2x per week', difficulty: 'moderate', potentialSavings: 600 },
    { id: 'fuel-prices', text: 'Use apps to find cheapest fuel prices', difficulty: 'easy', potentialSavings: 200 },
    { id: 'maintenance', text: 'Keep up with maintenance to avoid costly repairs', difficulty: 'moderate' },
  ],
  // Default tips for any category
  'default': [
    { id: 'track-daily', text: 'Track spending daily to stay aware', difficulty: 'easy' },
    { id: 'wait-24h', text: 'Wait 24 hours before non-essential purchases', difficulty: 'easy' },
    { id: 'set-limit', text: 'Set a weekly spending limit and check progress', difficulty: 'moderate' },
  ]
};

function generateCategoryTips(categoryName: string, reductionTarget: number): SpendingTip[] {
  const normalizedName = categoryName.toLowerCase();
  const categoryTips = CATEGORY_TIPS[normalizedName] || CATEGORY_TIPS['default'];
  
  // Return top 3 tips, prioritizing those with potential savings >= 20% of reduction target
  return categoryTips
    .sort((a, b) => {
      const aRelevance = (a.potentialSavings || 0) >= reductionTarget * 0.2 ? 1 : 0;
      const bRelevance = (b.potentialSavings || 0) >= reductionTarget * 0.2 ? 1 : 0;
      return bRelevance - aRelevance;
    })
    .slice(0, 3);
}
```

### 3.2 On-Track Recommendations

#### When to Show
- `actualAmount <= budgetAmount * 1.1` AND `actualAmount >= budgetAmount * 0.7`
- Category has been on-track for 2+ consecutive months

#### Data Structure
```typescript
interface OnTrackInsight {
  categoryId: number;
  categoryName: string;
  budgetAmount: number;
  actualAmount: number;
  utilizationPercentage: number;  // (actual/budget) * 100
  consecutiveOnTrackMonths: number;
  trend: 'improving' | 'stable' | 'slightly_increasing';
  message: string;  // Celebratory/reinforcing message
}
```

#### Algorithm
```typescript
function calculateOnTrackRecommendation(
  categoryName: string,
  currentBudget: number,
  currentActual: number,
  historicalData: MonthlySpend[]
): OnTrackInsight | null {
  
  const utilizationPercentage = (currentActual / currentBudget) * 100;
  
  // Check if truly on-track (70-110% utilization)
  if (utilizationPercentage < 70 || utilizationPercentage > 110) {
    return null; // Not on-track
  }
  
  // Count consecutive on-track months
  let consecutiveOnTrackMonths = 0;
  for (let i = historicalData.length - 1; i >= 0; i--) {
    const month = historicalData[i];
    const monthUtil = (month.amount / month.budget) * 100;
    if (monthUtil >= 70 && monthUtil <= 110) {
      consecutiveOnTrackMonths++;
    } else {
      break;
    }
  }
  
  // Determine trend
  const last3 = historicalData.slice(-3);
  const trend = calculateTrend(last3);
  
  // Generate message
  const messages = {
    improving: `Great progress! Your ${categoryName} spending has been decreasing.`,
    stable: `Consistent budgeting! You've stayed on track for ${consecutiveOnTrackMonths} months.`,
    slightly_increasing: `Mostly on track, but spending is trending up slightly. Keep an eye on it.`
  };
  
  return {
    categoryId: /* from lookup */,
    categoryName,
    budgetAmount: currentBudget,
    actualAmount: currentActual,
    utilizationPercentage,
    consecutiveOnTrackMonths,
    trend,
    message: messages[trend]
  };
}
```

### 3.3 Underspending Recommendations

#### When to Show
- `actualAmount < budgetAmount * 0.7`
- Consistent underspending (2+ months)

#### Data Structure
```typescript
interface UnderspendingInsight {
  categoryId: number;
  categoryName: string;
  budgetAmount: number;
  actualAmount: number;
  unusedAmount: number;
  utilizationPercentage: number;
  
  // Recommendations
  recommendedAction: 'reallocate' | 'reduce_budget' | 'boost_savings';
  suggestedNewBudget: number;
  potentialReallocation: number;  // Amount that could go elsewhere
  
  // Context
  isConsistentPattern: boolean;
  averageUtilization: number;  // Over last 3 months
}
```

#### Algorithm
```typescript
function calculateUnderspendingRecommendation(
  categoryName: string,
  currentBudget: number,
  currentActual: number,
  historicalData: MonthlySpend[],
  overspendingCategories: OverspendingInsight[]
): UnderspendingInsight | null {
  
  const unusedAmount = currentBudget - currentActual;
  const utilizationPercentage = (currentActual / currentBudget) * 100;
  
  // Only show if significantly underutilized
  if (utilizationPercentage >= 70) {
    return null;
  }
  
  // Check if consistent pattern
  const last3 = historicalData.slice(-3);
  const avgUtilization = last3.reduce((sum, m) => {
    return sum + ((m.amount / m.budget) * 100);
  }, 0) / last3.length;
  const isConsistentPattern = avgUtilization < 75;
  
  // Determine recommended action
  let recommendedAction: 'reallocate' | 'reduce_budget' | 'boost_savings';
  if (overspendingCategories.length > 0) {
    recommendedAction = 'reallocate';
  } else if (isConsistentPattern) {
    recommendedAction = 'boost_savings';
  } else {
    recommendedAction = 'reduce_budget';
  }
  
  // Calculate suggested new budget (actual average + 15% buffer)
  const avgActual = last3.reduce((sum, m) => sum + m.amount, 0) / last3.length;
  const suggestedNewBudget = Math.round(avgActual * 1.15);
  const potentialReallocation = currentBudget - suggestedNewBudget;
  
  return {
    categoryId: /* from lookup */,
    categoryName,
    budgetAmount: currentBudget,
    actualAmount: currentActual,
    unusedAmount,
    utilizationPercentage,
    recommendedAction,
    suggestedNewBudget,
    potentialReallocation,
    isConsistentPattern,
    averageUtilization: avgUtilization
  };
}
```

---

## Part 4: UI/UX Redesign

### 4.1 Information Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  Budget Recommendations & Review                      [Back] │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 📊 Budget Health Summary                             │   │
│  │ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐    │   │
│  │ │ On Track│ │Overspent│ │  Under  │ │ Savings │    │   │
│  │ │    5    │ │    2    │ │    3    │ │  12.5%  │    │   │
│  │ └─────────┘ └─────────┘ └─────────┘ └─────────┘    │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 🔴 Attention Needed (2 categories)            [Help] │   │
│  │                                                       │   │
│  │ ┌─ Groceries ────────────────────────────────────┐   │   │
│  │ │ Budget: 5,000 kr  │  Actual: 7,500 kr          │   │   │
│  │ │ ████████████████████░░░░░░ 150% (+2,500 kr)    │   │   │
│  │ │                                                 │   │   │
│  │ │ 📈 Pattern: Overspent 3 of last 3 months       │   │   │
│  │ │ 📊 Your average: 6,800 kr/month                │   │   │
│  │ │                                                 │   │   │
│  │ │ 💡 Tips to reduce spending:                    │   │   │
│  │ │ • Plan weekly meals before shopping            │   │   │
│  │ │ • Switch to store brands (~500 kr/mo savings)  │   │   │
│  │ │                                                 │   │   │
│  │ │ ┌──────────────────────────────────────────┐   │   │   │
│  │ │ │ Recommended Actions:                      │   │   │   │
│  │ │ │ ○ Keep budget at 5,000 kr (challenging)   │   │   │   │
│  │ │ │ ● Adjust to 7,500 kr (matches average)    │   │   │   │
│  │ │ │ ○ Set realistic 6,000 kr (moderate)       │   │   │   │
│  │ │ └──────────────────────────────────────────┘   │   │   │
│  │ │                                    [Apply ▼]   │   │   │
│  │ └─────────────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 🟢 Opportunities (3 categories)                      │   │
│  │ ... (underspending cards with reallocation options)  │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ ✅ On Track (5 categories)                    [Show] │   │
│  │ Groceries, Transport, Entertainment...               │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  Budget Summary                                             │
│  Income: 45,000 kr │ Allocated: 42,500 kr │ Free: 2,500 kr │
├─────────────────────────────────────────────────────────────┤
│                                    [Save Budget Plan]       │
└─────────────────────────────────────────────────────────────┘
```

### 4.2 Overspending Card Component

```tsx
interface OverspendingCardProps {
  insight: OverspendingInsight;
  onAdjustBudget: (categoryId: number, newAmount: number) => void;
}

function OverspendingCard({ insight, onAdjustBudget }: OverspendingCardProps) {
  const [selectedOption, setSelectedOption] = useState<'keep' | 'realistic' | 'average'>('realistic');
  
  const options = [
    {
      id: 'keep',
      label: `Keep at ${formatCurrency(insight.budgetAmount)}`,
      description: 'Challenging - requires significant spending cuts',
      amount: insight.budgetAmount,
      difficulty: 'challenging' as const
    },
    {
      id: 'realistic',
      label: `Adjust to ${formatCurrency(insight.realisticBudgetTarget)}`,
      description: 'Moderate - based on your average + buffer',
      amount: insight.realisticBudgetTarget,
      difficulty: 'moderate' as const
    },
    {
      id: 'average',
      label: `Match average ${formatCurrency(insight.averageMonthlySpend)}`,
      description: 'Easy - reflects your actual spending pattern',
      amount: Math.round(insight.averageMonthlySpend),
      difficulty: 'easy' as const
    }
  ];
  
  return (
    <Card className="border-l-4 border-l-red-500">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>{insight.categoryName}</CardTitle>
            <CardDescription>
              Budget: {formatCurrency(insight.budgetAmount)} • 
              Actual: {formatCurrency(insight.actualAmount)}
            </CardDescription>
          </div>
          <Badge variant="destructive">
            +{insight.overagePercentage.toFixed(0)}% over
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Progress bar showing overspend */}
        <OverspendProgressBar 
          budget={insight.budgetAmount} 
          actual={insight.actualAmount} 
        />
        
        {/* Historical context */}
        <div className="bg-slate-50 rounded-lg p-3 space-y-1 text-sm">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-slate-500" />
            <span>
              {insight.isRecurringPattern 
                ? `Pattern: Overspent ${/* count */} of last 3 months`
                : 'This appears to be a one-time spike'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <BarChart className="h-4 w-4 text-slate-500" />
            <span>Your 3-month average: {formatCurrency(insight.averageMonthlySpend)}</span>
          </div>
        </div>
        
        {/* Spending tips */}
        <div>
          <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-amber-500" />
            Tips to reduce spending:
          </h4>
          <ul className="space-y-1">
            {insight.tips.map(tip => (
              <li key={tip.id} className="text-sm text-slate-600 flex items-start gap-2">
                <span>•</span>
                <span>
                  {tip.text}
                  {tip.potentialSavings && (
                    <span className="text-emerald-600 ml-1">
                      (~{formatCurrency(tip.potentialSavings)}/mo savings)
                    </span>
                  )}
                </span>
              </li>
            ))}
          </ul>
        </div>
        
        {/* Budget adjustment options */}
        <div className="border rounded-lg p-3">
          <h4 className="text-sm font-medium mb-3">Adjust your budget target:</h4>
          <RadioGroup value={selectedOption} onValueChange={setSelectedOption}>
            {options.map(option => (
              <div key={option.id} className="flex items-center space-x-2">
                <RadioGroupItem value={option.id} id={option.id} />
                <Label htmlFor={option.id} className="flex-1 cursor-pointer">
                  <span className="font-medium">{option.label}</span>
                  <span className="text-xs text-slate-500 block">{option.description}</span>
                </Label>
                <DifficultyBadge difficulty={option.difficulty} />
              </div>
            ))}
          </RadioGroup>
        </div>
      </CardContent>
      
      <CardFooter>
        <Button 
          onClick={() => {
            const selected = options.find(o => o.id === selectedOption);
            if (selected) {
              onAdjustBudget(insight.categoryId, selected.amount);
            }
          }}
          className="w-full"
        >
          Apply Budget Adjustment
        </Button>
      </CardFooter>
    </Card>
  );
}
```

### 4.3 Clear Data Integrity Messaging

Add a persistent banner at the top of Step 3:

```tsx
<Alert className="mb-4 bg-blue-50 border-blue-200">
  <Info className="h-4 w-4 text-blue-600" />
  <AlertTitle className="text-blue-800">About these recommendations</AlertTitle>
  <AlertDescription className="text-blue-700">
    These suggestions help you set realistic budget targets. Your expense history 
    and transaction records are never modified. Only your budget allocations can 
    be adjusted here.
  </AlertDescription>
</Alert>
```

### 4.4 Underspending Card with Reallocation

```tsx
function UnderspendingCard({ insight, overspendingCategories, onAdjustBudget, onReallocate }) {
  return (
    <Card className="border-l-4 border-l-emerald-500">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>{insight.categoryName}</CardTitle>
            <CardDescription>
              Budget: {formatCurrency(insight.budgetAmount)} • 
              Used: {formatCurrency(insight.actualAmount)}
            </CardDescription>
          </div>
          <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">
            {insight.utilizationPercentage.toFixed(0)}% used
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="text-sm text-slate-600">
          <span className="font-medium text-emerald-600">
            {formatCurrency(insight.unusedAmount)} unused
          </span>
          {' '}this month
        </div>
        
        {insight.recommendedAction === 'reallocate' && overspendingCategories.length > 0 && (
          <div className="bg-amber-50 rounded-lg p-3">
            <p className="text-sm text-amber-800 mb-2">
              Consider reallocating to categories that need more budget:
            </p>
            <div className="space-y-2">
              {overspendingCategories.slice(0, 2).map(cat => (
                <Button
                  key={cat.categoryId}
                  variant="outline"
                  size="sm"
                  className="w-full justify-between"
                  onClick={() => onReallocate(insight.categoryId, cat.categoryId, insight.potentialReallocation)}
                >
                  <span>Move to {cat.categoryName}</span>
                  <span className="text-emerald-600">+{formatCurrency(insight.potentialReallocation)}</span>
                </Button>
              ))}
            </div>
          </div>
        )}
        
        {insight.recommendedAction === 'boost_savings' && (
          <div className="bg-blue-50 rounded-lg p-3">
            <p className="text-sm text-blue-800">
              All categories are on track! Consider moving {formatCurrency(insight.potentialReallocation)} to savings.
            </p>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex gap-2">
        <Button 
          variant="outline"
          onClick={() => onAdjustBudget(insight.categoryId, insight.suggestedNewBudget)}
          className="flex-1"
        >
          Reduce to {formatCurrency(insight.suggestedNewBudget)}
        </Button>
      </CardFooter>
    </Card>
  );
}
```

---

## Part 5: Specific Logic Flows

### 5.1 Overspending Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    OVERSPENDING DETECTED                     │
│                  (actual > budget by ≥10%)                   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│              CHECK HISTORICAL PATTERN                        │
│         (Has user overspent 2+ of last 3 months?)           │
└─────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┴───────────────┐
              ▼                               ▼
┌─────────────────────────┐     ┌─────────────────────────┐
│   RECURRING PATTERN     │     │    ONE-TIME SPIKE       │
│   (Chronic overspend)   │     │    (Anomaly)            │
└─────────────────────────┘     └─────────────────────────┘
              │                               │
              ▼                               ▼
┌─────────────────────────┐     ┌─────────────────────────┐
│ PRIMARY: Adjust budget  │     │ PRIMARY: Keep budget    │
│ to realistic level      │     │ (it's achievable)       │
│                         │     │                         │
│ SECONDARY: Provide tips │     │ SECONDARY: Investigate  │
│ to reduce spending      │     │ what caused the spike   │
└─────────────────────────┘     └─────────────────────────┘
              │                               │
              └───────────────┬───────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    PRESENT OPTIONS                           │
│                                                              │
│  Option A: Keep current budget (challenging)                 │
│  Option B: Adjust to realistic target (moderate)             │
│  Option C: Match historical average (easy)                   │
│                                                              │
│  + Category-specific spending reduction tips                 │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    USER SELECTS OPTION                       │
│                                                              │
│  → Update budget allocation in wizard state                  │
│  → Show confirmation with new budget amount                  │
│  → Recalculate totals and unallocated amount                │
│  → Mark as "adjusted" (prevent re-showing)                   │
└─────────────────────────────────────────────────────────────┘
```

### 5.2 Underspending Flow

```
┌─────────────────────────────────────────────────────────────┐
│                   UNDERSPENDING DETECTED                     │
│                  (actual < budget by ≥30%)                   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│              CHECK FOR OVERSPENDING ELSEWHERE                │
│         (Are there categories that need more budget?)        │
└─────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┴───────────────┐
              ▼                               ▼
┌─────────────────────────┐     ┌─────────────────────────┐
│  OVERSPENDING EXISTS    │     │  ALL CATEGORIES OK      │
└─────────────────────────┘     └─────────────────────────┘
              │                               │
              ▼                               ▼
┌─────────────────────────┐     ┌─────────────────────────┐
│ RECOMMEND: Reallocate   │     │ RECOMMEND: Boost        │
│ unused funds to needy   │     │ savings or reduce       │
│ categories              │     │ budget                  │
└─────────────────────────┘     └─────────────────────────┘
              │                               │
              ▼                               ▼
┌─────────────────────────┐     ┌─────────────────────────┐
│ Show reallocation       │     │ Show options:           │
│ buttons for each        │     │ • Reduce budget         │
│ overspending category   │     │ • Move to savings       │
└─────────────────────────┘     └─────────────────────────┘
```

### 5.3 On-Track Flow

```
┌─────────────────────────────────────────────────────────────┐
│                      ON-TRACK DETECTED                       │
│               (actual within 70-110% of budget)              │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│              COUNT CONSECUTIVE ON-TRACK MONTHS               │
└─────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┼───────────────┐
              ▼               ▼               ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│   1 MONTH       │ │   2-3 MONTHS    │ │   4+ MONTHS     │
│   (New)         │ │   (Building)    │ │   (Established) │
└─────────────────┘ └─────────────────┘ └─────────────────┘
              │               │               │
              ▼               ▼               ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│ "Good start!"   │ │ "Building       │ │ "Excellent      │
│                 │ │ consistency!"   │ │ discipline!"    │
└─────────────────┘ └─────────────────┘ └─────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│              COLLAPSE INTO SUMMARY SECTION                   │
│         (Don't clutter UI with things that are fine)         │
│                                                              │
│  "5 categories on track: Groceries, Transport, ..."          │
│  [Expand to see details]                                     │
└─────────────────────────────────────────────────────────────┘
```

---

## Part 6: Trend Tracking & Display

### 6.1 Trend Calculation

```typescript
interface TrendAnalysis {
  direction: 'increasing' | 'decreasing' | 'stable';
  percentageChange: number;  // Month-over-month average change
  confidence: number;        // 0-100, based on data consistency
  projection: number;        // Projected next month spend
  volatility: 'low' | 'medium' | 'high';
}

function analyzeTrend(monthlyData: MonthlySpend[]): TrendAnalysis {
  if (monthlyData.length < 3) {
    return {
      direction: 'stable',
      percentageChange: 0,
      confidence: 0,
      projection: monthlyData[monthlyData.length - 1]?.amount || 0,
      volatility: 'high'
    };
  }
  
  // Calculate month-over-month changes
  const changes: number[] = [];
  for (let i = 1; i < monthlyData.length; i++) {
    const prev = monthlyData[i - 1].amount;
    const curr = monthlyData[i].amount;
    if (prev > 0) {
      changes.push(((curr - prev) / prev) * 100);
    }
  }
  
  // Average change
  const avgChange = changes.reduce((a, b) => a + b, 0) / changes.length;
  
  // Determine direction
  let direction: 'increasing' | 'decreasing' | 'stable';
  if (avgChange > 5) {
    direction = 'increasing';
  } else if (avgChange < -5) {
    direction = 'decreasing';
  } else {
    direction = 'stable';
  }
  
  // Calculate volatility (standard deviation of changes)
  const variance = changes.reduce((sum, c) => sum + Math.pow(c - avgChange, 2), 0) / changes.length;
  const stdDev = Math.sqrt(variance);
  let volatility: 'low' | 'medium' | 'high';
  if (stdDev < 10) {
    volatility = 'low';
  } else if (stdDev < 25) {
    volatility = 'medium';
  } else {
    volatility = 'high';
  }
  
  // Confidence based on data points and consistency
  const dataPointScore = Math.min(monthlyData.length / 6, 1) * 50;  // Max 50 for 6+ months
  const consistencyScore = (1 - Math.min(stdDev / 50, 1)) * 50;     // Max 50 for low variance
  const confidence = Math.round(dataPointScore + consistencyScore);
  
  // Simple linear projection
  const lastAmount = monthlyData[monthlyData.length - 1].amount;
  const projection = Math.round(lastAmount * (1 + avgChange / 100));
  
  return {
    direction,
    percentageChange: Math.round(avgChange * 10) / 10,
    confidence,
    projection,
    volatility
  };
}
```

### 6.2 Trend Display Component

```tsx
function TrendInsightCard({ categoryName, trend, monthlyData }: TrendInsightProps) {
  const trendColors = {
    increasing: { bg: 'bg-rose-50', border: 'border-rose-200', text: 'text-rose-700', icon: TrendingUp },
    decreasing: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', icon: TrendingDown },
    stable: { bg: 'bg-slate-50', border: 'border-slate-200', text: 'text-slate-700', icon: Minus }
  };
  
  const colors = trendColors[trend.direction];
  const Icon = colors.icon;
  
  return (
    <Card className={cn('border-l-4', colors.border)}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-base">{categoryName}</CardTitle>
          <div className={cn('flex items-center gap-1 text-sm font-medium', colors.text)}>
            <Icon className="h-4 w-4" />
            {trend.direction === 'stable' ? 'Stable' : `${Math.abs(trend.percentageChange)}%`}
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Mini sparkline chart */}
        <div className="h-16 mb-3">
          <TrendSparkline 
            data={monthlyData} 
            trend={trend.direction}
            showProjection={trend.confidence > 60}
            projectedValue={trend.projection}
          />
        </div>
        
        {/* Trend interpretation */}
        <div className="text-sm text-slate-600">
          {trend.direction === 'increasing' && (
            <p>
              Spending has been <span className="text-rose-600 font-medium">increasing</span> by 
              ~{Math.abs(trend.percentageChange)}% per month. 
              {trend.confidence > 60 && ` Projected next month: ${formatCurrency(trend.projection)}`}
            </p>
          )}
          {trend.direction === 'decreasing' && (
            <p>
              Great progress! Spending has been <span className="text-emerald-600 font-medium">decreasing</span> by 
              ~{Math.abs(trend.percentageChange)}% per month.
            </p>
          )}
          {trend.direction === 'stable' && (
            <p>
              Spending has been <span className="font-medium">consistent</span> over the past few months.
            </p>
          )}
        </div>
        
        {/* Confidence indicator */}
        <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
          <span>Confidence:</span>
          <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-indigo-500 rounded-full"
              style={{ width: `${trend.confidence}%` }}
            />
          </div>
          <span>{trend.confidence}%</span>
        </div>
      </CardContent>
    </Card>
  );
}
```

---

## Part 7: Edge Cases & Error Handling

### 7.1 Edge Cases

| Scenario | Handling |
|----------|----------|
| **No historical data** | Show simplified view without trends/patterns. Message: "We need 2-3 months of data to provide personalized insights." |
| **All categories on-track** | Celebratory message + savings optimization suggestions |
| **All categories overspending** | Priority-sorted list + global "Your budget may be too tight" warning |
| **Zero budget set** | Skip category in recommendations (can't calculate overage %) |
| **Negative actual (refunds)** | Treat as 0 spending for that category |
| **Very high overage (>200%)** | Cap display at 200%, add "significantly over" language |
| **Category deleted mid-month** | Use historical name, mark as "(deleted)" |

### 7.2 Error States

```tsx
// API fetch failure
<Alert variant="destructive">
  <AlertCircle className="h-4 w-4" />
  <AlertTitle>Unable to load recommendations</AlertTitle>
  <AlertDescription>
    We couldn't analyze your spending patterns. You can still save your budget manually.
    <Button variant="link" onClick={retry}>Try again</Button>
  </AlertDescription>
</Alert>

// Partial data
<Alert>
  <Info className="h-4 w-4" />
  <AlertTitle>Limited data available</AlertTitle>
  <AlertDescription>
    Some recommendations may be less accurate due to limited spending history.
  </AlertDescription>
</Alert>
```

---

## Part 8: Implementation Checklist

### Phase 1: Core Logic Refactor
- [ ] Create new `RecommendationEngine.ts` with algorithms from Part 3
- [ ] Add `SpendingTip` data structure and category-specific tips
- [ ] Implement `calculateOverspendingRecommendation()`
- [ ] Implement `calculateUnderspendingRecommendation()`
- [ ] Implement `calculateOnTrackRecommendation()`
- [ ] Add trend analysis functions

### Phase 2: UI Components
- [ ] Create `OverspendingCard` component with radio options
- [ ] Create `UnderspendingCard` component with reallocation
- [ ] Create `OnTrackSummary` collapsible component
- [ ] Create `TrendInsightCard` with sparkline
- [ ] Add data integrity banner

### Phase 3: State Management
- [ ] Update `applySuggestion` to handle multiple option types
- [ ] Add reallocation logic between categories
- [ ] Track which recommendations have been acted upon
- [ ] Ensure budget-only modifications (never expenses)

### Phase 4: Testing
- [ ] Unit tests for recommendation algorithms
- [ ] Unit tests for trend calculations
- [ ] Integration tests for apply/reallocation flows
- [ ] E2E test for complete wizard flow
- [ ] Edge case tests (no data, all overspending, etc.)

### Phase 5: Polish
- [ ] Loading skeletons for each section
- [ ] Empty states with helpful messaging
- [ ] Accessibility audit (ARIA labels, keyboard nav)
- [ ] Responsive design verification

---

## Summary

The redesigned Step 3 Recommendations transforms from a confusing "budget manipulation" tool into a **genuine spending guidance system** that:

1. **Helps users understand** their spending patterns through historical context
2. **Provides actionable tips** specific to each category
3. **Offers realistic options** instead of one-size-fits-all suggestions
4. **Maintains data integrity** by clearly separating budgets from expenses
5. **Celebrates success** when users are on track
6. **Enables smart reallocation** of unused budget funds

The key philosophical shift: **We help users set realistic targets AND provide guidance to meet them**, rather than manipulating numbers to hide problems.
