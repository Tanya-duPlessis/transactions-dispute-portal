// Design tokens — single source of truth for all colours
export const tokens = {
  // Primary — muted steel blue (trustworthy, financial)
  primary: {
    main: '#2F5D8C',
    hover: '#244A70',
    light: '#EAF1F8',
    contrastText: '#FFFFFF',
  },

  // Accent 1 — teal (interactions, links, focus)
  teal: {
    main: '#2C7A7B',
    light: '#E6F4F4',
  },

  // Accent 2 — indigo (charts, special tags, insights)
  indigo: {
    main: '#4C51BF',
    light: '#EEF2FF',
  },

  // Status — desaturated for premium feel
  status: {
    resolved: '#2E7D5C',
    resolvedBg: '#E8F5EE',
    pending: '#C28B2C',
    pendingBg: '#FDF5E6',
    rejected: '#C24141',
    rejectedBg: '#FDEAEA',
    underReview: '#3B6EA5',
    underReviewBg: '#EAF1FA',
  },

  // Light mode surfaces
  light: {
    background: '#F6F8FB',
    paper: '#FFFFFF',
    elevated: '#F1F5F9',
    border: '#E5EAF0',
    textPrimary: '#1F2937',
    textSecondary: '#6B7280',
  },

  // Dark mode surfaces
  dark: {
    background: '#0D1117',
    paper: '#161B22',
    elevated: '#1C2333',
    border: '#30363D',
    textPrimary: '#E6EDF3',
    textSecondary: '#8B949E',
  },
};
