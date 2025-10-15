import React, { useEffect, useMemo, useState } from 'react';
import {
  X,
  Sparkles,
  Calendar as CalendarIcon,
  UserCircle2,
  ChevronRight,
  ShoppingCart,
  Shirt,
  Home as HomeIcon,
  Car,
  Utensils,
  Film,
  Heart,
  Box,
  Tag,
  Zap,
} from 'lucide-react';
import axios from '../api/axios';
import formatCurrency from '../utils/formatCurrency';
import { useAuth } from '../context/AuthContext';
import { Button } from './ui/button';
import { cn } from '../lib/utils';

const STEPS = [
  {
    id: 1,
    title: 'The essentials',
    subtitle: 'Capture what happened and how much it cost.',
  },
  {
    id: 2,
    title: 'The logistics',
    subtitle: 'Categorise the expense, pick the date, and who covered it.',
  },
  {
    id: 3,
    title: 'The split',
    subtitle: 'Decide how to share this expense between the two of you.',
  },
];

const SPLIT_OPTIONS = [
  { value: '50/50', label: 'Split 50 / 50' },
  { value: 'personal', label: 'You Paid in Full' },
  { value: 'custom', label: 'Custom Split' },
];

const splitOptionStyles = {
  '50/50': {
    active:
      'bg-gradient-to-r from-emerald-500 via-emerald-500 to-emerald-600 shadow-emerald-500/25 focus-visible:ring-emerald-200 hover:from-emerald-500 hover:to-emerald-600',
    idle:
      'hover:border-emerald-200 hover:bg-emerald-50/70 hover:text-emerald-700 focus-visible:ring-emerald-200/60',
  },
  personal: {
    active:
      'bg-gradient-to-r from-indigo-500 via-indigo-500 to-indigo-600 shadow-indigo-500/25 focus-visible:ring-indigo-200 hover:from-indigo-500 hover:to-indigo-600',
    idle:
      'hover:border-indigo-200 hover:bg-indigo-50/70 hover:text-indigo-700 focus-visible:ring-indigo-200/60',
  },
  custom: {
    active:
      'bg-gradient-to-r from-sky-500 via-sky-500 to-sky-600 shadow-sky-500/25 focus-visible:ring-sky-200 hover:from-sky-500 hover:to-sky-600',
    idle:
      'hover:border-sky-200 hover:bg-sky-50/70 hover:text-sky-700 focus-visible:ring-sky-200/60',
  },
};

const quickAddPresets = [100, 250, 500, 1000];

const clampPercentage = (value) => {
  const numeric = Number.parseFloat(value);
  if (Number.isNaN(numeric)) return 0;
  return Math.min(100, Math.max(0, numeric));
};

const roundToFive = (value) => Math.round(clampPercentage(value) / 5) * 5;

const CATEGORY_ICON_MAP = {
  'shopping-cart': ShoppingCart,
  shoppingcart: ShoppingCart,
  'shopping cart': ShoppingCart,
  tshirt: Shirt,
  shirt: Shirt,
  home: HomeIcon,
  bolt: Zap,
  car: Car,
  utensils: Utensils,
  film: Film,
  heart: Heart,
  box: Box,
};

const resolveCategoryIcon = (name) => {
  if (!name) return Tag;
  const normalized = String(name).toLowerCase().replace(/\s+/g, '-');
  return CATEGORY_ICON_MAP[normalized] || Tag;
};

const AddExpenseModal = ({ open, onClose, expense = null, onSuccess }) => {
  const { user } = useAuth();
  const isEditMode = Boolean(expense);

  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [paidBy, setPaidBy] = useState('');
  const [splitType, setSplitType] = useState('50/50');
  const [splitRatio1, setSplitRatio1] = useState('50');
  const [splitRatio2, setSplitRatio2] = useState('50');

  const [categories, setCategories] = useState([]);
  const [users, setUsers] = useState([]);
  const [recent, setRecent] = useState([]);

  const [currentStep, setCurrentStep] = useState(1);
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [categorySearch, setCategorySearch] = useState('');

  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;

    const today = new Date().toISOString().split('T')[0];
    setCurrentStep(1);
    setShowAllCategories(false);
    setCategorySearch('');
    setErrors({});
    setFormError(null);

    if (isEditMode && expense) {
      setAmount(expense.amount != null ? String(expense.amount) : '');
      setDate(expense.date ? new Date(expense.date).toISOString().split('T')[0] : today);
      setDescription(expense.description || '');
      setCategoryId(expense.category_id != null ? String(expense.category_id) : '');
      setPaidBy(expense.paid_by_user_id != null ? String(expense.paid_by_user_id) : String(user?.id || ''));

      const normalizedSplit = (expense.split_type || '50/50').toLowerCase();
      if (normalizedSplit === 'custom') {
        const r1 = roundToFive(expense.split_ratio_user1 ?? 50);
        const r2 = 100 - r1;
        setSplitType('custom');
        setSplitRatio1(String(r1));
        setSplitRatio2(String(r2));
      } else if (['personal', 'personal_only'].includes(normalizedSplit)) {
        setSplitType('personal');
        const isCurrentUserPayer = String(expense.paid_by_user_id) === String(user?.id || '');
        setSplitRatio1(isCurrentUserPayer ? '100' : '0');
        setSplitRatio2(isCurrentUserPayer ? '0' : '100');
      } else {
        setSplitType('50/50');
        setSplitRatio1('50');
        setSplitRatio2('50');
      }
    } else {
      setAmount('');
      setDate(today);
      setDescription('');
      setCategoryId('');
      setPaidBy(String(user?.id || ''));
      setSplitType('50/50');
      setSplitRatio1('50');
      setSplitRatio2('50');
    }

    const fetchData = async () => {
      try {
        const [catRes, usersRes, recentRes] = await Promise.all([
          axios.get('/categories'),
          axios.get('/auth/users').catch(() => ({ data: [] })),
          axios.get('/expenses/recent').catch(() => ({ data: [] })),
        ]);

        setCategories(Array.isArray(catRes.data) ? catRes.data : []);
        const fetchedUsers = Array.isArray(usersRes.data) ? usersRes.data : [];
        if (fetchedUsers.length) {
          setUsers(fetchedUsers);
        } else if (user) {
          setUsers([user]);
        } else {
          setUsers([]);
        }
        setRecent(Array.isArray(recentRes.data) ? recentRes.data.slice(0, 5) : []);
      } catch (err) {
        console.error('Failed to load data for expense modal', err);
        if (user) {
          setUsers([user]);
        }
      }
    };

    fetchData();
  }, [open, expense, isEditMode, user]);

  useEffect(() => {
    if (!open) return;
    if (splitType === 'personal') {
      const currentUserId = String(user?.id || '');
      const isCurrentUserPayer = paidBy && currentUserId === paidBy;
      const nextRatio1 = isCurrentUserPayer ? '100' : '0';
      const nextRatio2 = isCurrentUserPayer ? '0' : '100';
      if (splitRatio1 !== nextRatio1 || splitRatio2 !== nextRatio2) {
        setSplitRatio1(nextRatio1);
        setSplitRatio2(nextRatio2);
      }
    } else if (splitType === '50/50') {
      if (splitRatio1 !== '50' || splitRatio2 !== '50') {
        setSplitRatio1('50');
        setSplitRatio2('50');
      }
    } else if (splitType === 'custom') {
      const hasEmptyRatio1 = splitRatio1 === '' || splitRatio1 == null;
      const hasEmptyRatio2 = splitRatio2 === '' || splitRatio2 == null;
      if (hasEmptyRatio1) setSplitRatio1('50');
      if (hasEmptyRatio2) setSplitRatio2('50');
      if (!hasEmptyRatio1 && !hasEmptyRatio2) {
        const clamped = clampPercentage(splitRatio1);
        const complement = 100 - clamped;
        if (Math.abs(clamped + clampPercentage(splitRatio2) - 100) > 0.001) {
          setSplitRatio1(String(clamped));
          setSplitRatio2(String(complement));
        }
      }
    }
  }, [open, splitType, paidBy, user, splitRatio1, splitRatio2]);

  const categoryResults = useMemo(() => {
    const list = Array.isArray(categories) ? categories : [];
    if (!categorySearch.trim()) return list;
    const query = categorySearch.trim().toLowerCase();
    return list.filter((category) => category.name?.toLowerCase().includes(query));
  }, [categories, categorySearch]);

  const popularCategories = useMemo(() => categoryResults.slice(0, showAllCategories ? categoryResults.length : 6), [categoryResults, showAllCategories]);

  const partner = useMemo(() => {
    if (!user || !users.length) return null;
    return users.find((u) => String(u.id) !== String(user.id)) || null;
  }, [users, user]);

  const numericAmount = Number.parseFloat(amount) || 0;
  const userRatio = useMemo(() => {
    if (!user) return 0;
    if (splitType === 'personal') {
      return String(user.id) === paidBy ? 100 : 0;
    }
    if (splitType === '50/50') return 50;
    return clampPercentage(splitRatio1);
  }, [user, splitType, paidBy, splitRatio1]);

  const partnerRatio = useMemo(() => {
    if (!partner) return 0;
    if (splitType === 'personal') return String(partner.id) === paidBy ? 100 : 0;
    if (splitType === '50/50') return 50;
    return 100 - clampPercentage(splitRatio1);
  }, [partner, splitType, paidBy, splitRatio1]);

  const clearFieldError = (field) => {
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const validateStep = (step) => {
    const stepErrors = {};
    if (step === 1) {
      const numeric = Number.parseFloat(amount);
      if (Number.isNaN(numeric) || numeric <= 0) {
        stepErrors.amount = 'Enter a positive amount.';
      }
      if (!description.trim()) {
        stepErrors.description = 'Add a short description so this stays clear later.';
      }
    } else if (step === 2) {
      if (!categoryId) {
        stepErrors.categoryId = 'Pick a category.';
      }
      if (!date || Number.isNaN(new Date(date).getTime())) {
        stepErrors.date = 'Choose a valid date.';
      }
      if (!paidBy) {
        stepErrors.paidBy = 'Who covered this expense?';
      }
    } else if (step === 3) {
      if (splitType === 'custom') {
        const r1 = clampPercentage(splitRatio1);
        const r2 = clampPercentage(splitRatio2);
        if (Number.isNaN(r1) || Number.isNaN(r2)) {
          stepErrors.split = 'Use valid percentages.';
        } else if (Math.abs(r1 + r2 - 100) > 0.001) {
          stepErrors.split = 'The split must add up to 100%.';
        }
      }
    }

    const fieldsByStep = {
      1: ['amount', 'description'],
      2: ['categoryId', 'date', 'paidBy'],
      3: ['split'],
    };

    setErrors((prev) => {
      const next = { ...prev };
      fieldsByStep[step].forEach((field) => {
        delete next[field];
      });
      return Object.keys(stepErrors).length ? { ...next, ...stepErrors } : next;
    });

    return Object.keys(stepErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(STEPS.length, prev + 1));
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(1, prev - 1));
  };

  const submitExpense = async () => {
    const numeric = Number.parseFloat(amount);
    const payload = {
      amount: numeric,
      date,
      description: description.trim(),
      category_id: Number.parseInt(categoryId, 10),
      paid_by_user_id: Number.parseInt(paidBy, 10),
      split_type: splitType,
      split_ratio_user1: splitType === 'custom' ? clampPercentage(splitRatio1) : null,
      split_ratio_user2: splitType === 'custom' ? clampPercentage(splitRatio2) : null,
    };

    setSubmitting(true);
    setFormError(null);
    try {
      let result;
      if (isEditMode) {
        result = await axios.put(`/expenses/${expense.id}`, payload);
      } else {
        result = await axios.post('/expenses', payload);
      }
      onSuccess?.(result.data);
      onClose?.();
    } catch (err) {
      console.error(`${isEditMode ? 'Update' : 'Add'} expense failed`, err);
      setFormError(err.response?.data?.message || `Failed to ${isEditMode ? 'update' : 'add'} expense`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async (event) => {
    event?.preventDefault();
    const step1Valid = validateStep(1);
    if (!step1Valid) {
      setCurrentStep(1);
      return;
    }
    const step2Valid = validateStep(2);
    if (!step2Valid) {
      setCurrentStep(2);
      return;
    }
    const step3Valid = validateStep(3);
    if (!step3Valid) {
      setCurrentStep(3);
      return;
    }
    await submitExpense();
  };

  const quickAdd = (increment) => {
    const current = Number.parseFloat(amount || '0') || 0;
    const next = current + increment;
    setAmount(next.toFixed(2));
    clearFieldError('amount');
  };

  const handleUseRecent = (recentExpense) => {
    const today = new Date().toISOString().split('T')[0];
    setAmount(recentExpense.amount != null ? String(recentExpense.amount) : '');
    setDate(recentExpense.date ? new Date(recentExpense.date).toISOString().split('T')[0] : today);
    setDescription(recentExpense.description || '');
    setCategoryId(recentExpense.category_id != null ? String(recentExpense.category_id) : '');
    setPaidBy(recentExpense.paid_by_user_id != null ? String(recentExpense.paid_by_user_id) : String(user?.id || ''));

    const normalizedSplit = (recentExpense.split_type || '50/50').toLowerCase();
    if (normalizedSplit === 'custom') {
      const r1 = roundToFive(recentExpense.split_ratio_user1 ?? 50);
      setSplitType('custom');
      setSplitRatio1(String(r1));
      setSplitRatio2(String(100 - r1));
    } else if (['personal', 'personal_only'].includes(normalizedSplit)) {
      setSplitType('personal');
      const isCurrentUserPayer = String(recentExpense.paid_by_user_id) === String(user?.id || '');
      setSplitRatio1(isCurrentUserPayer ? '100' : '0');
      setSplitRatio2(isCurrentUserPayer ? '0' : '100');
    } else {
      setSplitType('50/50');
      setSplitRatio1('50');
      setSplitRatio2('50');
    }

    setErrors({});
    setCurrentStep(1);
  };

  useEffect(() => {
    if (!open) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  const handleOverlayClick = (event) => {
    if (event.target !== event.currentTarget) return;
    onClose?.();
  };

  if (!open) return null;

  const amountInputClasses = cn(
    'w-full rounded-[28px] border px-6 py-5 text-center text-3xl font-semibold tracking-tight text-slate-900 shadow-sm transition focus-visible:outline-none focus-visible:ring-4',
    errors.amount
      ? 'border-rose-300 bg-white focus-visible:ring-rose-100'
      : 'border-emerald-100 bg-white/95 focus-visible:ring-emerald-100'
  );

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div
        className="modal-content w-full max-w-4xl border border-emerald-100/80 bg-gradient-to-br from-white via-emerald-50/30 to-white shadow-xl transition-all"
        style={{ borderRadius: '24px', padding: '28px' }}
      >
        <form onSubmit={handleSubmit}>
          <header className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-gradient-to-r from-emerald-100 to-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-700 shadow-sm">
                <Sparkles size={16} />
                {isEditMode ? 'Edit expense' : 'New expense'}
              </span>
              <h2 className="mt-3 text-3xl font-semibold text-slate-900">
                {isEditMode ? 'Refresh the details' : 'Log something new'}
              </h2>
              <p className="mt-2 max-w-xl text-sm text-slate-500">
                We’ll guide you through the details in three quick steps. You can jump back anytime before saving.
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              type="button"
              className="h-11 w-11 rounded-full border border-slate-100 text-slate-500 hover:text-slate-700"
              onClick={onClose}
              aria-label="Close add expense modal"
            >
              <X size={20} />
            </Button>
          </header>

          <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
            <div className="text-sm font-semibold text-slate-600">
              Step {currentStep} of {STEPS.length}
            </div>
            <div className="flex items-center gap-3">
              {STEPS.map((step) => {
                const isActive = step.id === currentStep;
                const isCompleted = currentStep > step.id;
                return (
                  <div key={step.id} className="flex items-center gap-3">
                    <div
                      className={cn(
                        'flex h-10 w-10 items-center justify-center rounded-full border transition shadow-sm',
                        isActive
                          ? 'border-emerald-300 bg-gradient-to-br from-emerald-100 via-white to-emerald-50 text-emerald-700 shadow-emerald-200/60'
                          : isCompleted
                          ? 'border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-white text-emerald-500'
                          : 'border-slate-200 bg-white text-slate-400'
                      )}
                    >
                      {step.id}
                    </div>
                    {step.id !== STEPS.length && (
                      <ChevronRight
                        size={18}
                        className={cn(
                          'text-slate-300 transition',
                          currentStep > step.id ? 'text-emerald-200' : ''
                        )}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <section className="mt-8 space-y-8">
            {currentStep === 1 && (
              <div className="space-y-6 animate-[fadeIn_0.2s_ease]">
                <div className="rounded-3xl border border-emerald-100/70 bg-gradient-to-br from-emerald-50/80 via-white to-white p-8 shadow-sm">
                  <label className="text-sm font-semibold text-emerald-600">What’s the total amount?</label>
                  <input
                    type="number"
                    step="1"
                    autoFocus
                    className={amountInputClasses}
                    placeholder="0.00"
                    value={amount}
                    onChange={(event) => {
                      setAmount(event.target.value);
                      clearFieldError('amount');
                    }}
                    inputMode="decimal"
                  />
                  {errors.amount && <p className="mt-2 text-sm text-rose-500">{errors.amount}</p>}
                  <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                    {quickAddPresets.map((preset) => (
                      <Button
                        key={preset}
                        type="button"
                        variant="pill"
                        onClick={() => quickAdd(preset)}
                        className="border-emerald-100/70 bg-white text-emerald-600 shadow-sm hover:border-emerald-200 hover:bg-emerald-50/70 hover:text-emerald-700"
                      >
                        +{formatCurrency(preset)}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="rounded-3xl border border-emerald-100/70 bg-gradient-to-br from-white via-emerald-50/50 to-white p-6 shadow-sm">
                  <label className="block text-sm font-semibold text-slate-700">
                    Add a short description
                    <span className="ml-1 text-xs font-normal text-slate-400">(e.g. “Groceries at Coop”)</span>
                  </label>
                  <input
                    type="text"
                    value={description}
                    onChange={(event) => {
                      setDescription(event.target.value);
                      clearFieldError('description');
                    }}
                    className={cn(
                      'mt-3 w-full rounded-2xl border border-emerald-100 bg-white/95 px-4 py-3 text-base text-slate-900 shadow-sm transition focus:border-emerald-400 focus:outline-none focus:ring-4 focus:ring-emerald-100',
                      errors.description ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-100' : ''
                    )}
                    placeholder="What was this for?"
                  />
                  {errors.description && <p className="mt-2 text-sm text-rose-500">{errors.description}</p>}
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-6 animate-[fadeIn_0.2s_ease]">
                <div className="rounded-3xl border border-emerald-100/70 bg-gradient-to-br from-emerald-50/70 via-white to-white p-6 shadow-sm">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-emerald-500">
                        Category
                      </p>
                      <h3 className="mt-1 text-lg font-semibold text-slate-900">Where should this live?</h3>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {popularCategories.length === 0 && (
                      <p className="text-sm text-slate-500">No categories found.</p>
                    )}
                    {popularCategories.map((category) => {
                      const selected = String(category.id) === categoryId;
                      const IconComponent = resolveCategoryIcon(category.icon);
                      return (
                        <Button
                          key={category.id}
                          type="button"
                          variant="pill"
                          className={cn(
                            'group inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold transition-colors duration-200',
                            selected
                              ? 'border-transparent bg-gradient-to-r from-emerald-500 via-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/25 hover:from-emerald-500 hover:to-emerald-600 focus-visible:ring-emerald-200'
                              : 'border-emerald-100/70 bg-white text-slate-700 hover:border-emerald-200 hover:bg-emerald-50/70 hover:text-emerald-700 focus-visible:ring-emerald-200/60'
                          )}
                          onClick={() => {
                            setCategoryId(String(category.id));
                            clearFieldError('categoryId');
                          }}
                        >
                          {IconComponent && <IconComponent className="h-4 w-4 opacity-90 transition group-hover:scale-110" aria-hidden="true" />}
                          <span>{category.name}</span>
                        </Button>
                      );
                    })}
                    {categoryResults.length > 6 && (
                      <Button
                        type="button"
                        variant="pill"
                        className="border-emerald-100/70 bg-white text-emerald-600 hover:border-emerald-200 hover:bg-emerald-50/70 hover:text-emerald-700"
                        onClick={() => setShowAllCategories((prev) => !prev)}
                      >
                        {showAllCategories ? 'Show popular' : 'More categories'}
                      </Button>
                    )}
                  </div>
                  {showAllCategories && (
                    <div className="mt-5 space-y-4 rounded-2xl border border-emerald-100/60 bg-gradient-to-br from-white via-emerald-50/60 to-white p-4 shadow-inner">
                      <div className="flex flex-wrap items-center gap-3">
                        <input
                          type="search"
                          value={categorySearch}
                          onChange={(event) => setCategorySearch(event.target.value)}
                          placeholder="Search categories"
                          className="w-full flex-1 rounded-xl border border-emerald-100 bg-white/90 px-4 py-2 text-sm text-slate-700 shadow-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                        />
                        <Button
                          type="button"
                          variant="pill"
                          className="border-emerald-100/70 bg-white text-emerald-600 hover:border-emerald-200 hover:bg-emerald-50/70 hover:text-emerald-700"
                          onClick={() => {
                            setShowAllCategories(false);
                            setCategorySearch('');
                          }}
                        >
                          Done
                        </Button>
                      </div>
                      <div className="max-h-48 space-y-2 overflow-y-auto pr-2">
                        {categoryResults.map((category) => {
                          const selected = String(category.id) === categoryId;
                          const IconComponent = resolveCategoryIcon(category.icon);
                          return (
                            <button
                              key={category.id}
                              type="button"
                              onClick={() => {
                                setCategoryId(String(category.id));
                                clearFieldError('categoryId');
                              }}
                              className={cn(
                                'flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left text-sm font-medium transition hover:border-emerald-200 hover:bg-white',
                                selected
                                  ? 'border-emerald-300 bg-white text-emerald-700 shadow-sm shadow-emerald-200/40'
                                  : 'border-transparent bg-white/70 text-slate-600 hover:text-emerald-700'
                              )}
                            >
                              <span className="flex items-center gap-2">
                                {IconComponent && <IconComponent className="h-4 w-4 text-emerald-500" aria-hidden="true" />}
                                {category.name}
                              </span>
                              <span className="text-xs text-slate-400">Select</span>
                            </button>
                          );
                        })}
                        {categoryResults.length === 0 && (
                          <p className="text-sm text-slate-500">No categories match that search.</p>
                        )}
                      </div>
                    </div>
                  )}
                  {errors.categoryId && <p className="mt-3 text-sm text-rose-500">{errors.categoryId}</p>}
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div className="rounded-3xl border border-emerald-100/70 bg-gradient-to-br from-white via-emerald-50/50 to-white p-6 shadow-sm">
                    <div className="flex items-center gap-2 text-sm font-semibold text-emerald-600">
                      <CalendarIcon size={18} className="text-emerald-500" />
                      When did this happen?
                    </div>
                    <input
                      type="date"
                      value={date}
                      onChange={(event) => {
                        setDate(event.target.value);
                        clearFieldError('date');
                      }}
                      className={cn(
                        'mt-4 w-full rounded-2xl border border-emerald-100 bg-white/95 px-4 py-3 text-base text-slate-900 shadow-sm transition focus:border-emerald-400 focus:outline-none focus:ring-4 focus:ring-emerald-100',
                        errors.date ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-100' : ''
                      )}
                      required
                    />
                    {errors.date && <p className="mt-3 text-sm text-rose-500">{errors.date}</p>}
                  </div>

                  <div className="rounded-3xl border border-indigo-100/70 bg-gradient-to-br from-white via-indigo-50/60 to-white p-6 shadow-sm">
                    <div className="flex items-center gap-2 text-sm font-semibold text-indigo-600">
                      <UserCircle2 size={18} className="text-indigo-500" />
                      Who paid upfront?
                    </div>
                    <div className="mt-4 flex flex-wrap gap-3">
                      {users.map((option) => {
                        const isSelected = String(option.id) === paidBy;
                        const label = user && String(option.id) === String(user.id)
                          ? 'You'
                          : option.name || option.email || 'Partner';
                        return (
                          <Button
                            key={option.id}
                            type="button"
                            variant="pill"
                            className={cn(
                              'inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold transition-colors duration-200',
                              isSelected
                                ? 'border-transparent text-white shadow-lg shadow-indigo-500/20 bg-gradient-to-r from-indigo-500 via-indigo-500 to-indigo-600 hover:from-indigo-500 hover:to-indigo-600 focus-visible:ring-indigo-200'
                                : 'border-indigo-100/70 bg-white text-slate-700 hover:border-indigo-200 hover:bg-indigo-50/60 hover:text-indigo-700 focus-visible:ring-indigo-200/60'
                            )}
                            onClick={() => {
                              setPaidBy(String(option.id));
                              clearFieldError('paidBy');
                            }}
                          >
                            {label}
                          </Button>
                        );
                      })}
                      {users.length === 0 && (
                        <p className="text-sm text-slate-500">No payer options available.</p>
                      )}
                    </div>
                    {errors.paidBy && <p className="mt-3 text-sm text-rose-500">{errors.paidBy}</p>}
                  </div>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-6 animate-[fadeIn_0.2s_ease]">
                <div className="rounded-3xl border border-emerald-100/70 bg-gradient-to-br from-white via-emerald-50/60 to-white p-6 shadow-sm">
                  <div className="flex flex-wrap items-center gap-3">
                    {SPLIT_OPTIONS.map((option) => {
                      const isSelected = option.value === splitType;
                      const styles = splitOptionStyles[option.value] || splitOptionStyles['50/50'];
                      return (
                        <Button
                          key={option.value}
                          type="button"
                          variant="pill"
                          className={cn(
                            'group inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold transition-colors duration-200',
                            isSelected
                              ? cn(
                                  'border-transparent text-white shadow-lg',
                                  styles.active
                                )
                              : cn(
                                  'border-slate-200 bg-white text-slate-700',
                                  styles.idle
                                )
                          )}
                          onClick={() => {
                            setSplitType(option.value);
                            clearFieldError('split');
                          }}
                        >
                          {option.label}
                        </Button>
                      );
                    })}
                  </div>
                  <p className="mt-4 text-sm text-slate-600">
                    We’ll calculate the amounts automatically. Adjust the split if it’s not an even share.
                  </p>
                  {splitType === 'custom' && (
                    <div className="mt-6 space-y-4 rounded-2xl border border-emerald-100/70 bg-gradient-to-br from-white via-emerald-50/70 to-white p-6 shadow-inner">
                      <label className="block text-sm font-semibold text-emerald-600">
                        Adjust the split (in steps of 5%)
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        step="5"
                        value={clampPercentage(splitRatio1)}
                        onChange={(event) => {
                          const value = Number.parseInt(event.target.value, 10);
                          setSplitRatio1(String(value));
                          setSplitRatio2(String(100 - value));
                          clearFieldError('split');
                        }}
                        className="w-full accent-emerald-500"
                      />
                      <div className="flex items-center justify-between text-sm font-semibold text-emerald-600">
                        <span>You · {clampPercentage(splitRatio1)}%</span>
                        <span>Partner · {100 - clampPercentage(splitRatio1)}%</span>
                      </div>
                    </div>
                  )}
                  {errors.split && <p className="mt-3 text-sm text-rose-500">{errors.split}</p>}
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div className="rounded-3xl border border-emerald-100/70 bg-gradient-to-br from-emerald-50/70 via-white to-white p-6 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600">Your share</p>
                    <h3 className="mt-2 text-2xl font-semibold text-slate-900">{formatCurrency(numericAmount * (userRatio / 100) || 0)}</h3>
                    <p className="mt-2 text-sm text-emerald-600">
                      {splitType === 'personal'
                        ? 'Covered in full by you.'
                        : `That’s ${userRatio}% of the total.`}
                    </p>
                  </div>
                  <div className="rounded-3xl border border-indigo-100/70 bg-gradient-to-br from-indigo-50/70 via-white to-white p-6 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">
                      {partner ? partner.name || partner.email || 'Partner' : 'Partner'}
                    </p>
                    <h3 className="mt-2 text-2xl font-semibold text-slate-900">
                      {formatCurrency(numericAmount * (partnerRatio / 100) || 0)}
                    </h3>
                    <p className="mt-2 text-sm text-indigo-600">
                      {splitType === 'personal'
                        ? 'No share for your partner this time.'
                        : `That’s ${partnerRatio}% of the total.`}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </section>

          {formError && (
            <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
              {formError}
            </div>
          )}

          <footer className="mt-8 flex flex-wrap items-center justify-between gap-3">
            <Button
              type="button"
              variant="pill"
              className="border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-100/70 hover:text-slate-800"
              onClick={onClose}
            >
              Cancel
            </Button>
            <div className="flex flex-wrap items-center gap-3">
              {currentStep > 1 && (
                <Button
                  type="button"
                  variant="pill"
                  className="border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-100/70 hover:text-slate-900"
                  onClick={handleBack}
                >
                  Back
                </Button>
              )}
              {currentStep < STEPS.length && (
                <Button
                  type="button"
                  variant="pill"
                  className="border-emerald-200 bg-gradient-to-r from-emerald-50 via-white to-emerald-100 text-emerald-700 hover:border-emerald-300 hover:bg-emerald-100/80"
                  onClick={handleNext}
                >
                  Next
                </Button>
              )}
              {currentStep === STEPS.length && (
                <Button
                  type="submit"
                  variant="pill"
                  className="border-transparent bg-gradient-to-r from-emerald-500 via-emerald-500 to-emerald-600 px-6 text-white shadow-lg shadow-emerald-500/30 hover:from-emerald-500 hover:to-emerald-600"
                  disabled={submitting}
                >
                  {submitting ? 'Saving…' : isEditMode ? 'Save changes' : 'Save expense'}
                </Button>
              )}
            </div>
          </footer>
        </form>

        {!isEditMode && recent.length > 0 && (
          <aside className="mt-6 space-y-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-500">Recent expenses</p>
              <p className="mt-1 text-sm text-slate-500">
                Reuse something similar to speed things up. We’ll prefill the fields for you.
              </p>
            </div>
            <div
              className="flex w-full gap-3 overflow-x-auto pb-2"
              style={{ WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none' }}
            >
              {recent.map((item) => (
                <div
                  key={item.id}
                  className="flex min-w-[200px] max-w-[240px] flex-col justify-between rounded-3xl border border-slate-200/70 bg-slate-50 p-4 shadow-sm transition hover:shadow-md hover:shadow-slate-200/80"
                >
                  <div className="space-y-1 text-left">
                    <h4 className="text-sm font-semibold text-slate-900 line-clamp-2">
                      {item.description}
                    </h4>
                    <p className="text-xs font-medium text-emerald-600">
                      {formatCurrency(Number.parseFloat(item.amount) || 0)}
                    </p>
                    <p className="text-xs text-slate-500">
                      {item.category_name || 'Uncategorised'}
                    </p>
                  </div>
                  <div className="mt-1 flex items-center justify-between text-xs text-slate-400">
                    <span>{item.date ? new Date(item.date).toLocaleDateString() : '—'}</span>
                    <Button
                      type="button"
                      variant="pill"
                      size="sm"
                      className="border-emerald-200 bg-white text-emerald-600 hover:border-emerald-300 hover:bg-emerald-50/80 hover:text-emerald-700"
                      onClick={() => handleUseRecent(item)}
                    >
                      Use this
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </aside>
        )}
      </div>
    </div>
  );
};

export default AddExpenseModal;
