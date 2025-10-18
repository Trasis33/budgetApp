import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PiggyBank,
  Landmark,
  Sparkles,
  Target,
  TrendingUp,
  TrendingDown,
  Wallet,
  CalendarDays,
  ArrowRight,
  Plus,
  Pencil,
  LineChart as LineChartIcon,
  Loader2,
  X,
  Star
} from 'lucide-react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import axios from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useScope } from '../context/ScopeContext';
import formatCurrency from '../utils/formatCurrency';
import ContributionComposer from '../components/ContributionComposer';
import { Button } from '../components/ui/button';
import Pill from '../components/ui/pill';
import { cn } from '../lib/utils';

const cardBaseClasses =
  'relative rounded-3xl border border-slate-100 bg-white p-6 shadow-md transition-shadow hover:shadow-lg';
const sectionBannerClasses =
  'rounded-3xl bg-gradient-to-r from-emerald-100 via-white to-white px-6 py-5 border border-slate-100 flex flex-col gap-4 shadow-sm sm:flex-row sm:items-center sm:justify-between';
const periodOptions = [
  { value: '3months', label: 'Last 3 months' },
  { value: '6months', label: 'Last 6 months' },
  { value: '1year', label: 'Last 12 months' }
];
const periodLabels = periodOptions.reduce((acc, option) => {
  acc[option.value] = option.label;
  return acc;
}, {});
const categoryOptions = [
  { value: 'general', label: 'General' },
  { value: 'emergency', label: 'Emergency Fund' },
  { value: 'vacation', label: 'Vacation' },
  { value: 'house', label: 'House' },
  { value: 'car', label: 'Car' },
  { value: 'education', label: 'Education' },
  { value: 'retirement', label: 'Retirement' }
];

const createEmptyGoalForm = () => ({
  goal_name: '',
  target_amount: '',
  target_date: '',
  category: 'general'
});

const computeDateRange = (period) => {
  const now = new Date();
  const endDate = now.toISOString().split('T')[0];
  const monthsBack = period === '3months' ? 3 : period === '1year' ? 12 : 6;
  const start = new Date(now);
  start.setMonth(start.getMonth() - monthsBack);
  const startDate = start.toISOString().split('T')[0];
  return { startDate, endDate };
};

const extractScopedPayload = (payload, scope) => {
  if (!payload || typeof payload !== 'object') {
    return payload;
  }
  const scoped = payload.scopes?.[scope];
  if (scoped) {
    return scoped;
  }
  return payload;
};

const extractScopedGoals = (payload, scope) => {
  if (!payload || typeof payload !== 'object') {
    return Array.isArray(payload) ? payload : [];
  }
  const scoped = payload.scopes?.[scope];
  if (scoped?.goals) {
    return scoped.goals;
  }
  if (Array.isArray(payload.goals)) {
    return payload.goals;
  }
  if (Array.isArray(payload)) {
    return payload;
  }
  return [];
};

const formatMonthLabel = (value) => {
  if (!value) {
    return '';
  }
  const date = new Date(`${value}-01T00:00:00`);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return new Intl.DateTimeFormat('en-US', { month: 'short' }).format(date);
};

const formatMonthYear = (value) => {
  if (!value) {
    return '';
  }
  const date = new Date(`${value}-01T00:00:00`);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return new Intl.DateTimeFormat('en-US', { month: 'short', year: 'numeric' }).format(date);
};

const describeTargetDate = (targetDate) => {
  if (!targetDate) {
    return 'Open timeline';
  }
  const target = new Date(targetDate);
  if (Number.isNaN(target.getTime())) {
    return 'Date needs review';
  }
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);
  const diffInMs = target.getTime() - today.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  if (diffInDays < 0) {
    return 'Overdue';
  }
  if (diffInDays <= 7) {
    return 'Due this week';
  }
  const diffInMonths = Math.ceil(diffInDays / 30);
  if (diffInMonths <= 1) {
    return diffInMonths === 1 ? '1 month remaining' : 'Due next month';
  }
  return `${diffInMonths} months remaining`;
};

const formatTargetDate = (targetDate) => {
  if (!targetDate) {
    return null;
  }
  const date = new Date(targetDate);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(date);
};

const formatCategoryLabel = (category) => {
  if (!category) {
    return 'General';
  }
  return category
    .split(/[\s_-]+/)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ');
};

const getGoalProgress = (goal) => {
  const target = Number(goal.target_amount ?? 0);
  const current = Number(goal.current_amount ?? 0);
  if (!target || target <= 0) {
    return 0;
  }
  return Math.min(100, (current / target) * 100);
};

const getConfidenceBadge = (rate) => {
  if (rate >= 20) {
    return {
      tone: 'positive',
      label: 'High confidence',
      helper: 'You\'re pacing ahead of your target.'
    };
  }
  if (rate >= 10) {
    return {
      tone: 'warning',
      label: 'Steady progress',
      helper: 'Solid momentum - let\'s nudge it a bit higher.'
    };
  }
  return {
    tone: 'neutral',
    label: 'Needs attention',
    helper: 'Let\'s add one small habit to lift this rate.'
  };
};

const SavingsRateTooltip = ({ active, payload, label }) => {
  if (!active || !payload || payload.length === 0) {
    return null;
  }
  const value = payload[0].value;
  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs shadow-sm">
      <p className="font-medium text-slate-500">{formatMonthYear(label)}</p>
      <p className="mt-1 text-sm font-semibold text-slate-800">{Number(value).toFixed(1)}%</p>
    </div>
  );
};

const GoalPanel = ({
  goal,
  onLogContribution,
  onEditGoal,
  onDeleteGoal,
  isContributionOpen,
  onCloseContribution,
  onContributionSuccess,
  isEditing,
  editValues,
  onEditChange,
  onEditSubmit,
  onEditCancel,
  editError,
  editSubmitting,
  isPinned,
  canPin,
  onPinGoal,
  onUnpinGoal
}) => {
  const progressPercent = getGoalProgress(goal);
  const targetDateLabel = formatTargetDate(goal.target_date);
  const remaining = Math.max(
    0,
    Number(goal.target_amount ?? 0) - Number(goal.current_amount ?? 0)
  );
  const canContribute = remaining > 0;
  const showContribution = isContributionOpen && canContribute && !isEditing;
  const showEditForm = isEditing;
  const editorValues = editValues || createEmptyGoalForm();

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl border border-emerald-100 bg-emerald-50/80 p-5 shadow-inner transition-shadow',
        isPinned ? 'border-emerald-300 shadow-lg ring-2 ring-emerald-200 ring-offset-2 ring-offset-emerald-50/80' : ''
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="w-full">
          <div className="flex items-center gap-2 justify-between">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-emerald-600">
              {formatCategoryLabel(goal.category)}
            </p>
            {canPin && (
              <button
                type="button"
                onClick={() => (isPinned ? onUnpinGoal(goal) : onPinGoal(goal))}
                disabled={isEditing && !isPinned}
                className={cn(
                  'relative inline-flex h-8 w-8 items-center justify-center rounded-full border border-transparent transition-colors',
                  isPinned
                    ? 'border-amber-300 bg-amber-100 text-amber-600 hover:bg-amber-200'
                    : 'border-emerald-100 bg-white/80 text-emerald-400 hover:border-emerald-200 hover:bg-emerald-50/80'
                )}
                aria-label={isPinned ? 'Unpin goal' : 'Pin goal'}
              >
                <Star className={cn('h-4 w-4', isPinned ? 'fill-current' : '')} />
              </button>
            )}
          </div>
          <h4 className="mt-1 text-lg font-semibold text-emerald-900">{goal.goal_name}</h4>
          <p className="mt-3 text-sm text-emerald-700">
            Saved {formatCurrency(Number(goal.current_amount ?? 0))} of{' '}
            {formatCurrency(Number(goal.target_amount ?? 0))}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="pill"
            onClick={() =>
              showContribution ? onCloseContribution(goal) : onLogContribution(goal)
            }
            className="border-emerald-200 bg-white text-emerald-700 hover:border-emerald-300 hover:bg-emerald-100"
            disabled={!canContribute || isEditing}
          >
            {showContribution ? (
              <span className="flex items-center gap-2">
                <X className="h-4 w-4" />
                Close
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Log Contribution
              </span>
            )}
          </Button>
          <Button
            variant="pill"
            onClick={() => onEditGoal(goal)}
            className="border-emerald-200 bg-white text-emerald-700 hover:border-emerald-300 hover:bg-emerald-100"
            disabled={isEditing}
          >
            <Pencil className="mr-2 h-4 w-4" />
            {isEditing ? 'Editing...' : 'Edit Goal'}
          </Button>
        </div>
      </div>

      {showEditForm ? (
        <GoalForm
          mode="edit"
          values={editorValues}
          onChange={onEditChange}
          onSubmit={onEditSubmit}
          onCancel={() => onEditCancel(goal)}
          submitting={Boolean(editSubmitting)}
          error={editError}
          categories={categoryOptions}
          layout="inline"
          title={`Update ${goal.goal_name}`}
          contextLabel="Editing goal"
          submitLabel="Save changes"
          cancelLabel="Cancel edit"
        />
      ) : (
        <>
          <div className="mt-5">
            <div className="h-2 w-full rounded-full bg-white/70">
              <div
                className="h-2 rounded-full bg-emerald-500 transition-[width] duration-500 ease-out"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="mt-2 flex flex-wrap items-center justify-between text-xs font-medium text-emerald-700">
              <span>{progressPercent.toFixed(0)}% complete</span>
              <span>{describeTargetDate(goal.target_date)}</span>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between text-xs text-emerald-700">
            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4" />
              <span>{targetDateLabel || 'No date set'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Wallet className="h-4 w-4" />
              <span>Remaining {formatCurrency(remaining)}</span>
            </div>
          </div>

          <div className="mt-4 flex justify-end">
            <button
              type="button"
              onClick={() => onDeleteGoal(goal)}
              className="text-xs font-medium text-emerald-700 underline-offset-2 hover:text-emerald-900 hover:underline"
            >
              Remove goal
            </button>
          </div>

          {showContribution && (
            <div className="mt-5">
              <ContributionComposer
                goal={goal}
                onClose={() => onCloseContribution(goal)}
                onSuccess={(updatedGoal) => onContributionSuccess(updatedGoal)}
                capAmount={remaining}
                enforceCap={true}
                layout="inline"
                className="bg-emerald-50/80"
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};

const GoalForm = ({
  mode,
  values,
  onChange,
  onSubmit,
  onCancel,
  submitting,
  error,
  categories,
  layout = 'panel',
  title,
  contextLabel,
  submitLabel,
  cancelLabel,
  className
}) => {
  const contextText = contextLabel || (mode === 'edit' ? 'Update goal' : 'New goal');
  const headingText = title || (mode === 'edit' ? 'Polish the plan' : 'Let\'s outline a goal');
  const submitText = submitLabel || (mode === 'edit' ? 'Save goal' : 'Create goal');
  const cancelText = cancelLabel || 'Cancel';

  const containerClasses = cn(
    layout === 'inline'
      ? 'mt-5 space-y-4 rounded-2xl border border-emerald-200 bg-white px-5 py-5 shadow-sm'
      : 'mt-6 space-y-4 rounded-2xl border border-emerald-200 bg-emerald-50/60 p-5',
    className
  );

  const contextClasses =
    layout === 'inline'
      ? 'text-xs font-semibold uppercase tracking-[0.12em] text-slate-500'
      : 'text-xs font-semibold uppercase tracking-[0.12em] text-emerald-600';

  const cancelVariant = layout === 'inline' ? 'pill' : 'ghost';
  const cancelClasses =
    layout === 'inline'
      ? 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
      : 'text-emerald-600 hover:text-emerald-800';

  return (
    <form onSubmit={onSubmit} className={containerClasses}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className={contextClasses}>{contextText}</p>
          <h4 className="text-base font-semibold text-emerald-900">{headingText}</h4>
        </div>
        <Button
          type="button"
          variant={cancelVariant}
          onClick={onCancel}
          className={cancelClasses}
        >
          {cancelText}
        </Button>
      </div>

      {error && (
        <p className="rounded-2xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-600">
          {error}
        </p>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-emerald-600">
            Goal name
          </label>
          <input
            type="text"
            value={values.goal_name}
            onChange={(event) => onChange('goal_name', event.target.value)}
            placeholder="Emergency fund"
            className="w-full rounded-2xl border border-emerald-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
            required
          />
        </div>
        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-emerald-600">
            Target amount
          </label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={values.target_amount}
            onChange={(event) => onChange('target_amount', event.target.value)}
            placeholder="10000"
            className="w-full rounded-2xl border border-emerald-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
            required
          />
        </div>
        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-emerald-600">
            Target date
          </label>
          <input
            type="date"
            value={values.target_date}
            onChange={(event) => onChange('target_date', event.target.value)}
            className="w-full rounded-2xl border border-emerald-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
          />
        </div>
        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-emerald-600">
            Category
          </label>
          <select
            value={values.category}
            onChange={(event) => onChange('category', event.target.value)}
            className="w-full rounded-2xl border border-emerald-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
          >
            {categories.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <Button
          type="submit"
          disabled={submitting}
          className="bg-emerald-600 text-white hover:bg-emerald-700"
        >
          {submitting ? 'Saving...' : submitText}
        </Button>
      </div>
    </form>
  );
};

const SavingsRateCard = ({ data, timePeriodLabel, onCyclePeriod, onViewTransactions }) => {
  const summary = data?.summary;
  const averageRate = summary ? Number(summary.averageSavingsRate ?? 0) : 0;
  const totalSavings = summary ? Number(summary.totalSavings ?? 0) : 0;
  const trend = summary ? Number(summary.savingsRateTrend ?? 0) : 0;
  const monthlyData = data?.monthlyData ?? [];
  const targetRate = Number(data?.targetRate ?? 20);
  const badge = getConfidenceBadge(averageRate);
  const hasChartData = monthlyData.length > 0;

  const headlineCopy = hasChartData
    ? averageRate >= 20
      ? `You're saving an average of ${averageRate.toFixed(1)}% of your income. That's a fantastic cushion.`
      : `You're saving an average of ${averageRate.toFixed(1)}%. A few small tweaks could unlock even more momentum.`
    : 'We\'ll chart your savings rate as soon as we have at least one full month of data in this time range.';

  const trendLabel =
    trend > 0 ? `↗ +${trend.toFixed(1)} pts` : trend < 0 ? `↘ ${Math.abs(trend).toFixed(1)} pts` : '→ Steady';

  return (
    <div className={cardBaseClasses}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600">
              <Landmark className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Savings Rate Health</h2>
              <p className="text-xs font-medium uppercase tracking-[0.12em] text-slate-400">
                Timeframe: {timePeriodLabel}
              </p>
            </div>
          </div>
        </div>
        <Pill tone={badge.tone}>{badge.label}</Pill>
      </div>
      <p className="mt-4 text-sm leading-6 text-slate-600">{headlineCopy}</p>

      <div className="mt-6 h-[150px] w-full">
        {hasChartData ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={monthlyData}>
              <defs>
                <linearGradient id="savingsRateGradient" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="4 4" stroke="#e2e8f0" />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tickMargin={10}
                tickFormatter={formatMonthLabel}
                tick={{ fontSize: 11, fill: '#64748b' }}
              />
              <YAxis
                tickFormatter={(value) => `${value}%`}
                tick={{ fontSize: 10, fill: '#64748b' }}
                tickLine={false}
                axisLine={false}
                width={40}
                domain={[0, 100]}
              />
              <ReferenceLine
                y={targetRate}
                stroke="#f59e0b"
                strokeDasharray="6 6"
                label={{
                  position: 'top',
                  value: `Target ${targetRate}%`,
                  fill: '#f59e0b',
                  fontSize: 11
                }}
              />
              <Tooltip content={<SavingsRateTooltip />} />
              <Area
                type="monotone"
                dataKey="savingsRate"
                stroke="#6366f1"
                strokeWidth={2.5}
                fill="url(#savingsRateGradient)"
                dot={{ stroke: '#6366f1', fill: '#6366f1', r: 3 }}
                activeDot={{ r: 5 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 text-sm text-slate-500">
            We'll visualize your savings rate once new data comes in.
          </div>
        )}
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500">
            <span>Average rate</span>
            <Target className="h-4 w-4 text-indigo-500" />
          </div>
          <p className="mt-2 text-xl font-semibold text-slate-900">{averageRate.toFixed(1)}%</p>
          <p className="mt-1 text-xs text-slate-500">{badge.helper}</p>
        </div>
        <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500">
            <span>Total saved</span>
            <Wallet className="h-4 w-4 text-indigo-500" />
          </div>
          <p className="mt-2 text-xl font-semibold text-slate-900">{formatCurrency(totalSavings)}</p>
          <p className="mt-1 text-xs text-slate-500">
            {hasChartData
              ? `Across ${monthlyData.length} month${monthlyData.length === 1 ? '' : 's'} in view.`
              : 'Add income and expenses to start tracking.'}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500">
            <span>Trend direction</span>
            {trend >= 0 ? (
              <TrendingUp className="h-4 w-4 text-emerald-500" />
            ) : (
              <TrendingDown className="h-4 w-4 text-rose-500" />
            )}
          </div>
          <p className="mt-2 text-xl font-semibold text-slate-900">{trendLabel}</p>
          <p className="mt-1 text-xs text-slate-500">
            {trend > 0
              ? 'Momentum is improving.'
              : trend < 0
              ? 'Let\'s steady the ship this month.'
              : 'Holding steady month over month.'}
          </p>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <Button
          variant="pill"
          onClick={onCyclePeriod}
          className="border-indigo-200 text-indigo-600 hover:border-indigo-300 hover:bg-indigo-50"
        >
          <LineChartIcon className="mr-2 h-4 w-4" />
          Change Period · {timePeriodLabel}
        </Button>
        <Button
          variant="pill"
          onClick={onViewTransactions}
          className="border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50"
        >
          <ArrowRight className="mr-2 h-4 w-4" />
          View Transactions
        </Button>
      </div>
    </div>
  );
};

const SharedGoalsCard = ({
  goals,
  onAddGoalClick,
  onEditGoal,
  onLogContribution,
  onDeleteGoal,
  activeContributionGoalId,
  activeEditGoalId,
  editValues,
  editError,
  editSubmitting,
  onCloseContribution,
  onContributionSuccess,
  onEditChange,
  onEditSubmit,
  onEditCancel,
  canPin,
  onPinGoal,
  onUnpinGoal,
  pinnedGoalId,
  goalFormOpen,
  goalFormMode,
  goalFormValues,
  onGoalFormChange,
  onGoalFormSubmit,
  onGoalFormCancel,
  goalFormSubmitting,
  goalFormError
}) => (
  <div className={cardBaseClasses}>
    <div className="flex items-start justify-between gap-4">
      <div>
        <h3 className="text-lg font-semibold text-slate-900">Our Shared Goals</h3>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Here's a look at the progress we're making on the big things.
        </p>
      </div>
      <Button
        variant="pill"
        onClick={onAddGoalClick}
        className="border-emerald-200 text-emerald-600 hover:border-emerald-300 hover:bg-emerald-50"
      >
        <Plus className="mr-2 h-4 w-4" />
        Add New Goal
      </Button>
    </div>

    {goalFormOpen && (
      <GoalForm
        mode={goalFormMode}
        values={goalFormValues}
        onChange={onGoalFormChange}
        onSubmit={onGoalFormSubmit}
        onCancel={onGoalFormCancel}
        submitting={goalFormSubmitting}
        error={goalFormError}
        categories={categoryOptions}
      />
    )}

    <div className="mt-6 space-y-4">
      {goals.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-emerald-200 bg-emerald-50/60 p-6 text-center text-sm text-emerald-700">
          Add a goal to track progress together and unlock smart nudges when you need them.
        </div>
      ) : (
        goals.map((goal) => {
          const isContributionOpen = activeContributionGoalId === goal.id;
          const isEditingGoal = activeEditGoalId === goal.id;
          const isPinned = pinnedGoalId === goal.id;

          return (
            <GoalPanel
              key={goal.id}
              goal={goal}
              onLogContribution={onLogContribution}
              onEditGoal={onEditGoal}
              onDeleteGoal={onDeleteGoal}
              isContributionOpen={isContributionOpen}
              onCloseContribution={onCloseContribution}
              onContributionSuccess={onContributionSuccess}
              isEditing={isEditingGoal}
              editValues={isEditingGoal ? editValues : null}
              onEditChange={onEditChange}
              onEditSubmit={onEditSubmit}
              onEditCancel={onEditCancel}
              editError={isEditingGoal ? editError : null}
              editSubmitting={isEditingGoal ? editSubmitting : false}
              isPinned={isPinned}
              canPin={canPin}
              onPinGoal={onPinGoal}
              onUnpinGoal={onUnpinGoal}
            />
          );
        })
      )}
    </div>
  </div>
);

const SavingsOpportunityCard = ({ opportunity, onPrimary, onSecondary }) => (
  <div className={cn(cardBaseClasses, 'border-amber-100')}>
    <div className="flex items-start gap-4">
      <span className="rounded-2xl bg-amber-100 p-3 text-amber-600">
        <Sparkles className="h-5 w-5" />
      </span>
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">Savings Opportunity</h3>
        </div>
        <p className="mt-2 text-sm font-semibold text-amber-600">{opportunity.headline}</p>
        <p className="mt-3 text-sm leading-6 text-slate-600">{opportunity.message}</p>
        <span className="mt-4 inline-flex items-center gap-2 rounded-full bg-amber-100 px-3 py-1 text-sm font-medium text-amber-700">
          Potential impact: {opportunity.impact}
        </span>
        <div className="mt-5 flex flex-wrap gap-3">
          <Button
            variant="pill"
            onClick={onPrimary}
            className="border-amber-200 text-amber-700 hover:border-amber-300 hover:bg-amber-50"
          >
            <ArrowRight className="mr-2 h-4 w-4" />
            {opportunity.primaryActionLabel}
          </Button>
          <Button
            variant="pill"
            onClick={onSecondary}
            className="border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50"
          >
            <LineChartIcon className="mr-2 h-4 w-4" />
            {opportunity.secondaryActionLabel}
          </Button>
        </div>
      </div>
    </div>
  </div>
);

const LoadingGrid = () => (
  <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
    <div className={cn(cardBaseClasses, 'lg:col-span-2 bg-white/60 backdrop-blur-sm')}>
      <div className="flex items-center gap-3">
        <Loader2 className="h-5 w-5 animate-spin text-emerald-500" />
        <span className="text-sm font-semibold text-slate-600">Preparing your savings check-up…</span>
      </div>
      <div className="mt-6 grid gap-3 text-sm text-slate-500 sm:grid-cols-3">
        {['Checking goals', 'Charting your savings', 'Finding opportunities'].map((step) => (
          <div
            key={step}
            className="rounded-2xl border border-white/70 bg-white/80 px-4 py-3 shadow-inner"
          >
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
              <span>{step}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const EmptyState = ({ onAddGoal }) => (
  <div className={cn(cardBaseClasses, 'flex flex-col items-center justify-center gap-4 text-center')}>
    <span className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
      <Sparkles className="h-8 w-8" />
    </span>
    <h3 className="text-xl font-semibold text-slate-900">Let's create your first savings win</h3>
    <p className="max-w-md text-sm leading-6 text-slate-600">
      Add a goal or log a contribution to unlock personalized insights and celebrate progress together.
    </p>
    <Button onClick={onAddGoal} className="bg-emerald-600 text-white hover:bg-emerald-700">
      <Plus className="mr-2 h-4 w-4" />
      Add your first goal
    </Button>
  </div>
);

const Savings = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { scope } = useScope();
  const [timePeriod, setTimePeriod] = useState('6months');
  const [analysisState, setAnalysisState] = useState({
    loading: true,
    error: null,
    data: null
  });
  const [goalsState, setGoalsState] = useState({
    loading: true,
    error: null,
    list: []
  });
  const [activeContributionGoalId, setActiveContributionGoalId] = useState(null);
  const [goalFormOpen, setGoalFormOpen] = useState(false);
  const [goalFormMode, setGoalFormMode] = useState('create');
  const [goalFormValues, setGoalFormValues] = useState(createEmptyGoalForm);
  const [goalFormSubmitting, setGoalFormSubmitting] = useState(false);
  const [goalFormError, setGoalFormError] = useState(null);
  const [activeEditGoalId, setActiveEditGoalId] = useState(null);
  const [editGoalValues, setEditGoalValues] = useState(createEmptyGoalForm);
  const [editGoalError, setEditGoalError] = useState(null);
  const [editGoalSubmitting, setEditGoalSubmitting] = useState(false);
  const [pinnedGoalId, setPinnedGoalId] = useState(null);

  const fetchSavingsAnalysis = useCallback(async () => {
    if (!user) {
      return;
    }
    setAnalysisState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const { startDate, endDate } = computeDateRange(timePeriod);
      const response = await axios.get(
        `/analytics/savings-analysis/${startDate}/${endDate}`,
        { params: { scope } }
      );
      const scoped = extractScopedPayload(response.data, scope) || {};
      const summary = scoped.summary || {};
      const monthlyData = Array.isArray(scoped.monthlyData)
        ? scoped.monthlyData.map((item) => ({
            month: item.month,
            savingsRate: Number(item.savingsRate ?? item.savings_rate ?? 0),
            income: Number(item.income ?? 0),
            expenses: Number(item.expenses ?? 0),
            savings:
              item.savings !== undefined
                ? Number(item.savings)
                : Number(item.income ?? 0) - Number(item.expenses ?? 0)
          }))
        : [];

      setAnalysisState({
        loading: false,
        error: null,
        data: {
          summary: {
            averageSavingsRate: Number(summary.averageSavingsRate ?? 0),
            totalSavings: Number(summary.totalSavings ?? 0),
            savingsRateTrend: Number(summary.savingsRateTrend ?? summary.trend ?? 0),
            totalIncome: Number(summary.totalIncome ?? 0),
            totalExpenses: Number(summary.totalExpenses ?? 0),
            monthCount: Number(summary.monthCount ?? monthlyData.length ?? 0)
          },
          monthlyData,
          targetRate: Number(scoped.targetRate ?? 20)
        }
      });
    } catch (error) {
      console.error('Error fetching savings analysis:', error);
      setAnalysisState({
        loading: false,
        error: 'We couldn\'t load your savings analysis right now.',
        data: null
      });
    }
  }, [user, scope, timePeriod]);

  const fetchGoals = useCallback(async () => {
    if (!user) {
      return;
    }
    setGoalsState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const response = await axios.get('/savings/goals', { params: { scope } });
      const scopedGoals = extractScopedGoals(response.data, scope).map((goal) => ({
        ...goal,
        target_amount: Number(goal.target_amount ?? 0),
        current_amount: Number(goal.current_amount ?? 0),
        is_pinned: Boolean(goal.is_pinned)
      }));
      const pinned = scopedGoals.find((goal) => goal.is_pinned) || null;
      setGoalsState({
        loading: false,
        error: null,
        list: scopedGoals
      });
      setPinnedGoalId(pinned ? pinned.id : null);
    } catch (error) {
      console.error('Error fetching savings goals:', error);
      setGoalsState({
        loading: false,
        error: 'We couldn\'t load your savings goals just now.',
        list: []
      });
    }
  }, [user, scope]);

  useEffect(() => {
    if (!user) {
      return;
    }
    fetchSavingsAnalysis();
  }, [user, fetchSavingsAnalysis]);

  useEffect(() => {
    if (!user) {
      return;
    }
    fetchGoals();
  }, [user, fetchGoals]);

  const monthlyData = analysisState.data?.monthlyData ?? [];
  const summary = analysisState.data?.summary;
  const normalizedGoals = useMemo(() => goalsState.list, [goalsState.list]);
  const allowPinning = normalizedGoals.length > 2;

  const displayGoals = useMemo(() => {
    if (!allowPinning || !pinnedGoalId) {
      return normalizedGoals;
    }
    const pinned = normalizedGoals.find((goal) => goal.id === pinnedGoalId);
    if (!pinned) {
      return normalizedGoals;
    }
    const others = normalizedGoals.filter((goal) => goal.id !== pinnedGoalId);
    return [pinned, ...others];
  }, [allowPinning, normalizedGoals, pinnedGoalId]);

  useEffect(() => {
    if (pinnedGoalId && !normalizedGoals.some((goal) => goal.id === pinnedGoalId)) {
      setPinnedGoalId(null);
    }
  }, [normalizedGoals, pinnedGoalId]);

  const opportunity = useMemo(() => {
    const baseImpact = 50;
    if (!summary || monthlyData.length === 0) {
      const hasGoal = normalizedGoals.length > 0;
      return {
        headline: hasGoal ? 'Let\'s log your next win' : 'Unlock personalized guidance',
        message: hasGoal
          ? 'Record a quick contribution to start charting your savings progress and unlock tailored insights.'
          : 'Add a savings goal to surface smart suggestions tailored to your habits.',
        impact: `${formatCurrency(baseImpact)}/month`,
        primaryActionLabel: hasGoal ? 'Log Contribution' : 'Add a goal',
        secondaryActionLabel: 'See Spending'
      };
    }
    const trend = Number(summary.savingsRateTrend ?? 0);
    const averageRate = Number(summary.averageSavingsRate ?? 0);
    const months = Number(summary.monthCount ?? monthlyData.length ?? 1) || 1;
    const monthlyIncome = months > 0 ? Number(summary.totalIncome ?? 0) / months : 0;
    const impactValue = monthlyIncome
      ? Math.max(25, Math.round((monthlyIncome * 0.03) / 10) * 10)
      : baseImpact;
    const impact = `${formatCurrency(impactValue)}/month`;
    const leadGoal = normalizedGoals.find((goal) => goal.goal_name);

    if (trend < 0) {
      return {
        headline: 'Course-correct this month',
        message: `Your savings rate dipped by ${Math.abs(trend).toFixed(
          1
        )} points. A tiny trim to dining out could refill ${
          leadGoal ? leadGoal.goal_name : 'your top goal'
        } quickly.`,
        impact,
        primaryActionLabel: 'Adjust Budget',
        secondaryActionLabel: 'See Spending'
      };
    }
    if (averageRate >= 20) {
      return {
        headline: 'Ride the momentum',
        message: `You're averaging ${averageRate.toFixed(
          1
        )}%. Consider auto-moving ${formatCurrency(impactValue)} toward ${
          leadGoal ? leadGoal.goal_name : 'your highest priority'
        } to finish even sooner.`,
        impact,
        primaryActionLabel: 'Adjust Budget',
        secondaryActionLabel: 'See Spending'
      };
    }
    return {
      headline: 'Boost your cushion',
      message: `You're saving ${averageRate.toFixed(
        1
      )}% on average. One small tweak could lift you closer to that 20% target this quarter.`,
      impact,
      primaryActionLabel: 'Adjust Budget',
      secondaryActionLabel: 'See Spending'
    };
  }, [summary, monthlyData, normalizedGoals]);

  const handleCyclePeriod = () => {
    const order = periodOptions.map((option) => option.value);
    const currentIndex = order.indexOf(timePeriod);
    const nextPeriod = order[(currentIndex + 1) % order.length];
    setTimePeriod(nextPeriod);
  };

  const handleGoalFormChange = (field, value) => {
    setGoalFormValues((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleOpenCreateGoal = () => {
    setGoalFormMode('create');
    setGoalFormValues(createEmptyGoalForm());
    setGoalFormError(null);
    setActiveContributionGoalId(null);
    setActiveEditGoalId(null);
    setEditGoalError(null);
    setEditGoalSubmitting(false);
    setEditGoalValues(createEmptyGoalForm());
    setGoalFormOpen(true);
  };

  const handleOpenEditGoal = (goal) => {
    setGoalFormOpen(false);
    setGoalFormError(null);
    setActiveContributionGoalId(null);
    setActiveEditGoalId(goal.id);
    setEditGoalValues({
      goal_name: goal.goal_name || '',
      target_amount:
        goal.target_amount !== undefined && goal.target_amount !== null
          ? String(goal.target_amount)
          : '',
      target_date: goal.target_date ? goal.target_date.slice(0, 10) : '',
      category: goal.category || 'general'
    });
    setEditGoalError(null);
    setEditGoalSubmitting(false);
  };

  const handleGoalFormCancel = () => {
    setGoalFormOpen(false);
    setGoalFormError(null);
    setGoalFormValues(createEmptyGoalForm());
  };

  const handleGoalFormSubmit = async (event) => {
    event.preventDefault();
    if (!goalFormValues.goal_name.trim()) {
      setGoalFormError('Let\'s give this goal a name.');
      return;
    }
    const numericTarget = parseFloat(goalFormValues.target_amount);
    if (Number.isNaN(numericTarget) || numericTarget <= 0) {
      setGoalFormError('Target amount must be a positive number.');
      return;
    }
    const payload = {
      goal_name: goalFormValues.goal_name.trim(),
      target_amount: numericTarget,
      category: goalFormValues.category || 'general'
    };
    if (goalFormValues.target_date) {
      payload.target_date = goalFormValues.target_date;
    }
    setGoalFormSubmitting(true);
    setGoalFormError(null);
    try {
      await axios.post('/savings/goals', payload);
      await fetchGoals();
      await fetchSavingsAnalysis();
      handleGoalFormCancel();
    } catch (error) {
      console.error('Error saving goal:', error);
      setGoalFormError('We couldn\'t save that goal. Please try again.');
    } finally {
      setGoalFormSubmitting(false);
    }
  };

  const handleInlineEditChange = (field, value) => {
    setEditGoalValues((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleInlineEditCancel = () => {
    setActiveEditGoalId(null);
    setEditGoalError(null);
    setEditGoalSubmitting(false);
    setEditGoalValues(createEmptyGoalForm());
  };

  const handlePinGoal = async (goal) => {
    if (!goal || !allowPinning) {
      return;
    }
    const previousPinned = pinnedGoalId;
    setPinnedGoalId(goal.id);
    try {
      await axios.put(`/savings/goals/${goal.id}`, { is_pinned: true });
      await fetchGoals();
      await fetchSavingsAnalysis();
    } catch (error) {
      console.error('Error pinning goal:', error);
      setGoalsState((prev) => ({
        ...prev,
        error: 'Failed to pin goal. Please try again.'
      }));
      setPinnedGoalId(previousPinned);
    }
  };

  const handleUnpinGoal = async (goal) => {
    if (!goal) {
      return;
    }
    const wasPinned = pinnedGoalId;
    setPinnedGoalId((current) => (current === goal.id ? null : current));
    try {
      await axios.put(`/savings/goals/${goal.id}`, { is_pinned: false });
      await fetchGoals();
      await fetchSavingsAnalysis();
    } catch (error) {
      console.error('Error unpinning goal:', error);
      setGoalsState((prev) => ({
        ...prev,
        error: 'Failed to update pinned goal. Please try again.'
      }));
      setPinnedGoalId(wasPinned);
    }
  };

  const handleInlineEditSubmit = async (event) => {
    event.preventDefault();
    if (!activeEditGoalId) {
      return;
    }
    if (!editGoalValues.goal_name.trim()) {
      setEditGoalError('Let\'s give this goal a name.');
      return;
    }
    const numericTarget = parseFloat(editGoalValues.target_amount);
    if (Number.isNaN(numericTarget) || numericTarget <= 0) {
      setEditGoalError('Target amount must be a positive number.');
      return;
    }
    const payload = {
      goal_name: editGoalValues.goal_name.trim(),
      target_amount: numericTarget,
      category: editGoalValues.category || 'general'
    };
    if (editGoalValues.target_date) {
      payload.target_date = editGoalValues.target_date;
    }
    setEditGoalSubmitting(true);
    setEditGoalError(null);
    try {
      await axios.put(`/savings/goals/${activeEditGoalId}`, payload);
      await fetchGoals();
      await fetchSavingsAnalysis();
      handleInlineEditCancel();
    } catch (error) {
      console.error('Error updating goal:', error);
      setEditGoalError('We couldn\'t update that goal. Please try again.');
    } finally {
      setEditGoalSubmitting(false);
    }
  };

  const handleDeleteGoal = async (goal) => {
    const confirmed = window.confirm(
      `Remove "${goal.goal_name}"? Previous contributions stay logged.`
    );
    if (!confirmed) {
      return;
    }
    try {
      if (activeContributionGoalId === goal.id) {
        setActiveContributionGoalId(null);
      }
      if (activeEditGoalId === goal.id) {
        handleInlineEditCancel();
      }
      if (pinnedGoalId === goal.id) {
        setPinnedGoalId(null);
      }
      await axios.delete(`/savings/goals/${goal.id}`);
      await fetchGoals();
      await fetchSavingsAnalysis();
    } catch (error) {
      console.error('Error deleting goal:', error);
      setGoalsState((prev) => ({
        ...prev,
        error: 'Failed to delete goal. Please try again.'
      }));
    }
  };

  const handleOpenContribution = (goal) => {
    if (!goal) {
      return;
    }
    setGoalFormOpen(false);
    setGoalFormError(null);
    if (activeEditGoalId) {
      handleInlineEditCancel();
    }
    setActiveContributionGoalId(goal.id);
  };

  const handleCloseContribution = () => {
    setActiveContributionGoalId(null);
  };

  const handleContributionSuccess = (updatedGoal) => {
    if (!updatedGoal) {
      return;
    }
    const nextIsPinned =
      updatedGoal.is_pinned !== undefined ? Boolean(updatedGoal.is_pinned) : null;
    if (nextIsPinned === true) {
      setPinnedGoalId(updatedGoal.id);
    } else if (nextIsPinned === false && pinnedGoalId === updatedGoal.id) {
      setPinnedGoalId(null);
    }
    setGoalsState((prev) => ({
      ...prev,
      list: prev.list.map((goal) =>
        goal.id === updatedGoal.id
          ? {
              ...goal,
              ...updatedGoal,
              target_amount: Number(updatedGoal.target_amount ?? goal.target_amount ?? 0),
              current_amount: Number(updatedGoal.current_amount ?? goal.current_amount ?? 0),
              is_pinned:
                updatedGoal.is_pinned !== undefined
                  ? Boolean(updatedGoal.is_pinned)
                  : goal.is_pinned
            }
          : goal
      )
    }));
    handleCloseContribution();
    fetchSavingsAnalysis();
  };

  const handleOpportunityPrimary = () => {
    if (opportunity.primaryActionLabel === 'Add a goal') {
      handleOpenCreateGoal();
      return;
    }
    if (opportunity.primaryActionLabel === 'Log Contribution') {
      if (normalizedGoals.length > 0) {
        const goalWithCapacity = displayGoals.find(
          (goal) =>
            Number(goal.target_amount ?? 0) > Number(goal.current_amount ?? 0)
        );
        if (goalWithCapacity) {
          handleOpenContribution(goalWithCapacity);
        } else {
          handleOpenCreateGoal();
        }
      } else {
        handleOpenCreateGoal();
      }
      return;
    }
    navigate('/budget');
  };

  const handleOpportunitySecondary = () => {
    navigate('/expenses');
  };

  const handleViewTransactions = () => {
    navigate('/expenses');
  };

  const overallLoading = analysisState.loading || goalsState.loading;
  const hasAnyError = Boolean(analysisState.error || goalsState.error);
  const isEmpty =
    !overallLoading && !hasAnyError && monthlyData.length === 0 && normalizedGoals.length === 0;
  const errorMessage = analysisState.error || goalsState.error;

  const handleRetry = () => {
    fetchSavingsAnalysis();
    fetchGoals();
  };

  return (
    <div className="min-h-[calc(100vh-80px)] bg-slate-50/60">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <header className={sectionBannerClasses}>
          <div className="flex items-center gap-4">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
              <PiggyBank className="h-6 w-6" />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-emerald-600">
                Shared wins
              </p>
              <h1 className="text-2xl font-semibold text-slate-900">Your Savings Check-up</h1>
              <p className="text-sm text-slate-500">
                A supportive look at your savings habits, goals, and opportunities.
              </p>
            </div>
          </div>
        </header>

        {hasAnyError && (
          <div className="mt-6 rounded-3xl border border-rose-100 bg-rose-50/80 p-6 shadow-sm">
            <p className="text-sm font-medium text-rose-600">{errorMessage}</p>
            <Button
              variant="pill"
              onClick={handleRetry}
              className="mt-4 border-rose-200 text-rose-700 hover:border-rose-300 hover:bg-rose-100"
            >
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Retry
            </Button>
          </div>
        )}

        {overallLoading ? (
          <div className="mt-6">
            <LoadingGrid />
          </div>
        ) : isEmpty ? (
          <div className="mt-6">
            <EmptyState onAddGoal={handleOpenCreateGoal} />
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="lg:col-span-1">
              <SavingsRateCard
                data={analysisState.data}
                timePeriodLabel={periodLabels[timePeriod] || 'Last 6 months'}
                onCyclePeriod={handleCyclePeriod}
                onViewTransactions={handleViewTransactions}
              />
            </div>
            <div className="lg:col-span-1">
              <SharedGoalsCard
                goals={displayGoals}
                onAddGoalClick={handleOpenCreateGoal}
                onEditGoal={handleOpenEditGoal}
                onLogContribution={handleOpenContribution}
                onDeleteGoal={handleDeleteGoal}
                activeContributionGoalId={activeContributionGoalId}
                activeEditGoalId={activeEditGoalId}
                editValues={editGoalValues}
                editError={editGoalError}
                editSubmitting={editGoalSubmitting}
                onCloseContribution={handleCloseContribution}
                onContributionSuccess={handleContributionSuccess}
                onEditChange={handleInlineEditChange}
                onEditSubmit={handleInlineEditSubmit}
                onEditCancel={handleInlineEditCancel}
                canPin={allowPinning}
                onPinGoal={handlePinGoal}
                onUnpinGoal={handleUnpinGoal}
                pinnedGoalId={pinnedGoalId}
                goalFormOpen={goalFormOpen}
                goalFormMode={goalFormMode}
                goalFormValues={goalFormValues}
                onGoalFormChange={handleGoalFormChange}
                onGoalFormSubmit={handleGoalFormSubmit}
                onGoalFormCancel={handleGoalFormCancel}
                goalFormSubmitting={goalFormSubmitting}
                goalFormError={goalFormError}
              />
            </div>
            <div className="lg:col-span-2">
              <SavingsOpportunityCard
                opportunity={opportunity}
                onPrimary={handleOpportunityPrimary}
                onSecondary={handleOpportunitySecondary}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Savings;
