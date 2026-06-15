import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#00A859',
      light: '#33BA77',
      dark: '#007540',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#0D6EFD',
      light: '#3D8EFD',
      dark: '#0A4DB0',
      contrastText: '#ffffff',
    },
    background: {
      default: '#0A0F1E',
      paper: '#111827',
    },
    text: {
      primary: '#F1F5F9',
      secondary: '#94A3B8',
    },
    divider: '#1E293B',
    error: { main: '#EF4444' },
    warning: { main: '#F59E0B' },
    info: { main: '#3B82F6' },
    success: { main: '#10B981' },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontWeight: 700, letterSpacing: '-0.02em' },
    h2: { fontWeight: 700, letterSpacing: '-0.01em' },
    h3: { fontWeight: 600, letterSpacing: '-0.01em' },
    h4: { fontWeight: 600 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
    body1: { lineHeight: 1.6 },
    button: { fontWeight: 600, letterSpacing: '0.02em' },
  },
  shape: {
    borderRadius: 10,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
          padding: '8px 20px',
        },
        containedPrimary: {
          boxShadow: '0 0 20px rgba(0, 168, 89, 0.25)',
          '&:hover': {
            boxShadow: '0 0 28px rgba(0, 168, 89, 0.4)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          border: '1px solid #1E293B',
          borderRadius: 12,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          border: '1px solid #1E293B',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          backgroundColor: '#0D1520',
          fontWeight: 600,
          color: '#94A3B8',
          textTransform: 'uppercase',
          fontSize: '0.75rem',
          letterSpacing: '0.05em',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          borderRadius: 6,
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: 'outlined',
      },
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
          },
        },
      },
    },
    MuiDataGrid: {
      styleOverrides: {
        root: {
          border: '1px solid #1E293B',
          borderRadius: 12,
          '& .MuiDataGrid-columnHeaders': {
            backgroundColor: '#0D1520',
            borderBottom: '1px solid #1E293B',
          },
          '& .MuiDataGrid-row:hover': {
            backgroundColor: '#1E293B',
            cursor: 'pointer',
          },
          '& .MuiDataGrid-cell': {
            borderBottom: '1px solid #1E293B',
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: '#111827',
          borderBottom: '1px solid #1E293B',
          boxShadow: 'none',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#111827',
          borderRight: '1px solid #1E293B',
        },
      },
    },
  },
});
