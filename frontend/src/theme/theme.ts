import { createTheme, type PaletteMode } from '@mui/material/styles';
import { tokens } from './tokens';

export const buildTheme = (mode: PaletteMode) => {
  const isDark = mode === 'dark';
  const surface = isDark ? tokens.dark : tokens.light;

  return createTheme({
    palette: {
      mode,
      primary: {
        main: tokens.primary.main,
        light: tokens.primary.light,
        dark: tokens.primary.hover,
        contrastText: tokens.primary.contrastText,
      },
      secondary: {
        main: tokens.teal.main,
        light: tokens.teal.light,
        contrastText: '#FFFFFF',
      },
      background: {
        default: surface.background,
        paper: surface.paper,
      },
      text: {
        primary: surface.textPrimary,
        secondary: surface.textSecondary,
      },
      divider: surface.border,
      error: { main: tokens.status.rejected },
      warning: { main: tokens.status.pending },
      success: { main: tokens.status.resolved },
      info: { main: tokens.status.underReview },
    },

    typography: {
      fontFamily: '"Inter", "Plus Jakarta Sans", "Roboto", "Helvetica", sans-serif',
      h1: { fontWeight: 700, letterSpacing: '-0.025em', lineHeight: 1.2 },
      h2: { fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.25 },
      h3: { fontWeight: 600, letterSpacing: '-0.015em', lineHeight: 1.3 },
      h4: { fontWeight: 600, letterSpacing: '-0.01em' },
      h5: { fontWeight: 600 },
      h6: { fontWeight: 600 },
      body1: { lineHeight: 1.65 },
      body2: { lineHeight: 1.6 },
      button: { fontWeight: 600, letterSpacing: '0.01em', textTransform: 'none' },
      caption: { letterSpacing: '0.02em' },
    },

    shape: { borderRadius: 10 },

    shadows: [
      'none',
      isDark
        ? '0 1px 3px rgba(0,0,0,0.4)'
        : '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
      isDark
        ? '0 2px 6px rgba(0,0,0,0.4)'
        : '0 4px 6px rgba(0,0,0,0.05), 0 2px 4px rgba(0,0,0,0.04)',
      isDark
        ? '0 4px 12px rgba(0,0,0,0.5)'
        : '0 10px 15px rgba(0,0,0,0.06), 0 4px 6px rgba(0,0,0,0.04)',
      ...Array(21).fill('none'),
    ] as import('@mui/material/styles').Shadows,

    components: {
      MuiCssBaseline: {
        styleOverrides: {
          '@import': "url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap')",
          body: {
            scrollbarWidth: 'thin',
            scrollbarColor: `${surface.border} transparent`,
          },
        },
      },

      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 10,
            padding: '8px 20px',
            fontWeight: 600,
          },
          containedPrimary: {
            background: tokens.primary.main,
            boxShadow: 'none',
            '&:hover': {
              background: tokens.primary.hover,
              boxShadow: '0 4px 12px rgba(47, 93, 140, 0.3)',
            },
          },
          outlinedPrimary: {
            borderColor: tokens.primary.main,
            '&:hover': {
              background: tokens.primary.light,
              borderColor: tokens.primary.hover,
            },
          },
        },
      },

      MuiCard: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            border: `1px solid ${surface.border}`,
            borderRadius: 12,
            boxShadow: isDark
              ? '0 1px 3px rgba(0,0,0,0.4)'
              : '0 1px 3px rgba(0,0,0,0.06)',
            transition: 'box-shadow 0.2s ease, border-color 0.2s ease',
            '&:hover': {
              borderColor: tokens.primary.main,
              boxShadow: isDark
                ? '0 4px 12px rgba(0,0,0,0.5)'
                : '0 4px 12px rgba(47,93,140,0.1)',
            },
          },
        },
      },

      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            border: `1px solid ${surface.border}`,
          },
        },
      },

      MuiTableCell: {
        styleOverrides: {
          head: {
            backgroundColor: isDark ? tokens.dark.elevated : tokens.light.elevated,
            fontWeight: 600,
            color: surface.textSecondary,
            fontSize: '0.7rem',
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            borderBottom: `2px solid ${surface.border}`,
          },
          body: {
            borderBottom: `1px solid ${surface.border}`,
          },
        },
      },

      MuiTableRow: {
        styleOverrides: {
          root: {
            '&:hover': {
              backgroundColor: isDark ? tokens.dark.elevated : tokens.light.elevated,
              cursor: 'pointer',
            },
          },
        },
      },

      MuiChip: {
        styleOverrides: {
          root: {
            fontWeight: 600,
            borderRadius: 6,
            fontSize: '0.75rem',
          },
        },
      },

      MuiTextField: {
        defaultProps: { variant: 'outlined' },
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: 8,
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: tokens.primary.main,
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: tokens.primary.main,
                borderWidth: 2,
              },
            },
          },
        },
      },

      MuiDataGrid: {
        styleOverrides: {
          root: {
            border: `1px solid ${surface.border}`,
            borderRadius: 12,
            '& .MuiDataGrid-columnHeaders': {
              backgroundColor: isDark ? tokens.dark.elevated : tokens.light.elevated,
              borderBottom: `2px solid ${surface.border}`,
            },
            '& .MuiDataGrid-columnHeaderTitle': {
              fontWeight: 600,
              fontSize: '0.7rem',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: surface.textSecondary,
            },
            '& .MuiDataGrid-row:hover': {
              backgroundColor: isDark ? tokens.dark.elevated : tokens.light.elevated,
              cursor: 'pointer',
            },
            '& .MuiDataGrid-cell': {
              borderBottom: `1px solid ${surface.border}`,
            },
            '& .MuiDataGrid-footerContainer': {
              borderTop: `1px solid ${surface.border}`,
            },
          },
        },
      },

      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            backgroundColor: surface.paper,
            borderBottom: `1px solid ${surface.border}`,
            boxShadow: 'none',
            color: surface.textPrimary,
          },
        },
      },

      MuiDrawer: {
        styleOverrides: {
          paper: {
            backgroundColor: surface.paper,
            borderRight: `1px solid ${surface.border}`,
            boxShadow: 'none',
          },
        },
      },

      MuiDivider: {
        styleOverrides: {
          root: { borderColor: surface.border },
        },
      },

      MuiAlert: {
        styleOverrides: {
          root: { borderRadius: 8 },
        },
      },

      MuiTooltip: {
        styleOverrides: {
          tooltip: { borderRadius: 6, fontSize: '0.75rem' },
        },
      },
    },
  });
};
