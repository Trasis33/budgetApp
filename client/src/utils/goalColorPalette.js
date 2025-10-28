const SCHEMES = [
  {
    id: 'emerald',
    surface: 'bg-emerald-50/80',
    border: 'border-emerald-200',
    ring: 'ring-2 ring-emerald-200 ring-offset-2 ring-offset-emerald-50/60 shadow-lg',
    heading: 'text-emerald-900',
    body: 'text-emerald-700',
    accent: 'text-emerald-600',
    icon: 'bg-emerald-100 text-emerald-600',
    progressTrack: 'bg-emerald-100/70',
    progressBar: 'bg-emerald-500',
    badge: 'bg-emerald-100 text-emerald-700',
    pin: {
      active: 'border-emerald-300 bg-emerald-100 text-emerald-600 hover:bg-emerald-200',
      inactive:
        'border-emerald-100 bg-white/80 text-emerald-400 hover:border-emerald-200 hover:bg-emerald-50/80'
    },
    quickButton:
      'border-emerald-200 text-emerald-600 hover:border-emerald-300 hover:bg-emerald-50/60',
    primaryButton: 'bg-emerald-600 hover:bg-emerald-700',
    pill: 'bg-emerald-100 text-emerald-700',
    metricCard: 'border-emerald-100 bg-emerald-50/70',
    focus: 'focus:border-emerald-400 focus:ring-emerald-100'
  },
  {
    id: 'teal',
    surface: 'bg-teal-50/80',
    border: 'border-teal-200',
    ring: 'ring-2 ring-teal-200 ring-offset-2 ring-offset-teal-50/60 shadow-lg',
    heading: 'text-teal-900',
    body: 'text-teal-700',
    accent: 'text-teal-600',
    icon: 'bg-teal-100 text-teal-600',
    progressTrack: 'bg-teal-100/70',
    progressBar: 'bg-teal-500',
    badge: 'bg-teal-100 text-teal-700',
    pin: {
      active: 'border-teal-300 bg-teal-100 text-teal-600 hover:bg-teal-200',
      inactive:
        'border-teal-100 bg-white/80 text-teal-400 hover:border-teal-200 hover:bg-teal-50/80'
    },
    quickButton: 'border-teal-200 text-teal-600 hover:border-teal-300 hover:bg-teal-50/60',
    primaryButton: 'bg-teal-600 hover:bg-teal-700',
    pill: 'bg-teal-100 text-teal-700',
    metricCard: 'border-teal-100 bg-teal-50/70',
    focus: 'focus:border-teal-400 focus:ring-teal-100'
  },
  {
    id: 'sky',
    surface: 'bg-sky-50/80',
    border: 'border-sky-200',
    ring: 'ring-2 ring-sky-200 ring-offset-2 ring-offset-sky-50/60 shadow-lg',
    heading: 'text-sky-900',
    body: 'text-sky-700',
    accent: 'text-sky-600',
    icon: 'bg-sky-100 text-sky-600',
    progressTrack: 'bg-sky-100/70',
    progressBar: 'bg-sky-500',
    badge: 'bg-sky-100 text-sky-700',
    pin: {
      active: 'border-sky-300 bg-sky-100 text-sky-600 hover:bg-sky-200',
      inactive:
        'border-sky-100 bg-white/80 text-sky-400 hover:border-sky-200 hover:bg-sky-50/80'
    },
    quickButton: 'border-sky-200 text-sky-600 hover:border-sky-300 hover:bg-sky-50/60',
    primaryButton: 'bg-sky-600 hover:bg-sky-700',
    pill: 'bg-sky-100 text-sky-700',
    metricCard: 'border-sky-100 bg-sky-50/70',
    focus: 'focus:border-sky-400 focus:ring-sky-100'
  },
  {
    id: 'indigo',
    surface: 'bg-indigo-50/80',
    border: 'border-indigo-200',
    ring: 'ring-2 ring-indigo-200 ring-offset-2 ring-offset-indigo-50/60 shadow-lg',
    heading: 'text-indigo-900',
    body: 'text-indigo-700',
    accent: 'text-indigo-600',
    icon: 'bg-indigo-100 text-indigo-600',
    progressTrack: 'bg-indigo-100/70',
    progressBar: 'bg-indigo-500',
    badge: 'bg-indigo-100 text-indigo-700',
    pin: {
      active: 'border-indigo-300 bg-indigo-100 text-indigo-600 hover:bg-indigo-200',
      inactive:
        'border-indigo-100 bg-white/80 text-indigo-400 hover:border-indigo-200 hover:bg-indigo-50/80'
    },
    quickButton:
      'border-indigo-200 text-indigo-600 hover:border-indigo-300 hover:bg-indigo-50/60',
    primaryButton: 'bg-indigo-600 hover:bg-indigo-700',
    pill: 'bg-indigo-100 text-indigo-700',
    metricCard: 'border-indigo-100 bg-indigo-50/70',
    focus: 'focus:border-indigo-400 focus:ring-indigo-100'
  },
  {
    id: 'violet',
    surface: 'bg-violet-50/80',
    border: 'border-violet-200',
    ring: 'ring-2 ring-violet-200 ring-offset-2 ring-offset-violet-50/60 shadow-lg',
    heading: 'text-violet-900',
    body: 'text-violet-700',
    accent: 'text-violet-600',
    icon: 'bg-violet-100 text-violet-600',
    progressTrack: 'bg-violet-100/70',
    progressBar: 'bg-violet-500',
    badge: 'bg-violet-100 text-violet-700',
    pin: {
      active: 'border-violet-300 bg-violet-100 text-violet-600 hover:bg-violet-200',
      inactive:
        'border-violet-100 bg-white/80 text-violet-400 hover:border-violet-200 hover:bg-violet-50/80'
    },
    quickButton:
      'border-violet-200 text-violet-600 hover:border-violet-300 hover:bg-violet-50/60',
    primaryButton: 'bg-violet-600 hover:bg-violet-700',
    pill: 'bg-violet-100 text-violet-700',
    metricCard: 'border-violet-100 bg-violet-50/70',
    focus: 'focus:border-violet-400 focus:ring-violet-100'
  },
  {
    id: 'amber',
    surface: 'bg-amber-50/80',
    border: 'border-amber-200',
    ring: 'ring-2 ring-amber-200 ring-offset-2 ring-offset-amber-50/60 shadow-lg',
    heading: 'text-amber-900',
    body: 'text-amber-700',
    accent: 'text-amber-600',
    icon: 'bg-amber-100 text-amber-600',
    progressTrack: 'bg-amber-100/70',
    progressBar: 'bg-amber-500',
    badge: 'bg-amber-100 text-amber-700',
    pin: {
      active: 'border-amber-300 bg-amber-100 text-amber-600 hover:bg-amber-200',
      inactive:
        'border-amber-100 bg-white/80 text-amber-400 hover:border-amber-200 hover:bg-amber-50/80'
    },
    quickButton:
      'border-amber-200 text-amber-600 hover:border-amber-300 hover:bg-amber-50/60',
    primaryButton: 'bg-amber-600 hover:bg-amber-700',
    pill: 'bg-amber-100 text-amber-700',
    metricCard: 'border-amber-100 bg-amber-50/70',
    focus: 'focus:border-amber-400 focus:ring-amber-100'
  },
  {
    id: 'rose',
    surface: 'bg-rose-50/80',
    border: 'border-rose-200',
    ring: 'ring-2 ring-rose-200 ring-offset-2 ring-offset-rose-50/60 shadow-lg',
    heading: 'text-rose-900',
    body: 'text-rose-700',
    accent: 'text-rose-600',
    icon: 'bg-rose-100 text-rose-600',
    progressTrack: 'bg-rose-100/70',
    progressBar: 'bg-rose-500',
    badge: 'bg-rose-100 text-rose-700',
    pin: {
      active: 'border-rose-300 bg-rose-100 text-rose-600 hover:bg-rose-200',
      inactive:
        'border-rose-100 bg-white/80 text-rose-400 hover:border-rose-200 hover:bg-rose-50/80'
    },
    quickButton:
      'border-rose-200 text-rose-600 hover:border-rose-300 hover:bg-rose-50/60',
    primaryButton: 'bg-rose-600 hover:bg-rose-700',
    pill: 'bg-rose-100 text-rose-700',
    metricCard: 'border-rose-100 bg-rose-50/70',
    focus: 'focus:border-rose-400 focus:ring-rose-100'
  },
  {
    id: 'slate',
    surface: 'bg-slate-50/80',
    border: 'border-slate-200',
    ring: 'ring-2 ring-slate-200 ring-offset-2 ring-offset-slate-50/60 shadow-lg',
    heading: 'text-slate-900',
    body: 'text-slate-700',
    accent: 'text-slate-600',
    icon: 'bg-slate-100 text-slate-600',
    progressTrack: 'bg-slate-100/70',
    progressBar: 'bg-slate-500',
    badge: 'bg-slate-100 text-slate-700',
    pin: {
      active: 'border-slate-300 bg-slate-100 text-slate-600 hover:bg-slate-200',
      inactive:
        'border-slate-100 bg-white/80 text-slate-400 hover:border-slate-200 hover:bg-slate-50/80'
    },
    quickButton:
      'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50/60',
    primaryButton: 'bg-slate-600 hover:bg-slate-700',
    pill: 'bg-slate-100 text-slate-700',
    metricCard: 'border-slate-100 bg-slate-50/70',
    focus: 'focus:border-slate-400 focus:ring-slate-100'
  }
];

export const GOAL_COLOR_SCHEMES = SCHEMES.map((scheme, index) => ({
  ...scheme,
  index
}));

export const getGoalColorScheme = (index = 0) =>
  GOAL_COLOR_SCHEMES[index % GOAL_COLOR_SCHEMES.length];

export const assignGoalColors = (goals = []) => {
  const mapping = {};
  goals.forEach((goal, position) => {
    const rawIndex =
      typeof goal?.color_index === 'number' && !Number.isNaN(goal.color_index)
        ? goal.color_index
        : position;
    const scheme = getGoalColorScheme(rawIndex);
    if (goal?.id != null) {
      mapping[goal.id] = scheme;
    }
  });
  return mapping;
};

export const deriveGoalColorIndex = (goal, fallbackIndex = 0) => {
  if (goal && typeof goal.color_index === 'number' && !Number.isNaN(goal.color_index)) {
    return goal.color_index;
  }
  return fallbackIndex;
};
