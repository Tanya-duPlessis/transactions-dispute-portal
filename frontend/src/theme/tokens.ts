// Design tokens — single source of truth for all colours
export const tokens = {
  // Primary — Apple blue
  primary: {
    main: '#0071E3',
    hover: '#0077ED',
    light: '#E8F1FF',
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

  // Light mode surfaces — Apple-inspired
  light: {
    background: '#F5F5F7',
    paper: '#FFFFFF',
    elevated: '#F5F5F7',
    border: '#D2D2D7',
    textPrimary: '#1D1D1F',
    textSecondary: '#6E6E73',
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
