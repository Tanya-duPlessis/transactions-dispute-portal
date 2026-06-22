import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
  AppBar, Box, Toolbar, Typography, Button, Avatar,
  Menu, MenuItem, Divider, IconButton, Tooltip,
} from '@mui/material';
import { DarkMode, LightMode, KeyboardArrowDown } from '@mui/icons-material';
import { useAuthStore } from '../../store/authStore';
import { authService } from '../../services/auth.service';
import { useSnackbar } from 'notistack';
import { useThemeMode } from '../../theme/ThemeContext';

const customerNav = [
  { label: 'Transactions', path: '/transactions' },
  { label: 'My Disputes', path: '/disputes' },
];

const adminNav = [
  { label: 'All Disputes', path: '/admin/disputes' },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const { enqueueSnackbar } = useSnackbar();
  const { mode, toggleTheme } = useThemeMode();

  const navItems = user?.role === 'ADMIN' ? adminNav : customerNav;

  const handleLogout = async () => {
    setAnchorEl(null);
    try { await authService.logout(); } catch { /* ignore */ }
    logout();
    navigate('/login');
    enqueueSnackbar('Logged out successfully', { variant: 'success' });
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar position="sticky" elevation={0}>
        <Toolbar sx={{ gap: 1, px: { xs: 2, md: 4 } }}>
          {/* Logo + Wordmark */}
          <Box
            component={Link}
            to={navItems[0].path}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              textDecoration: 'none',
              mr: 3,
              flexShrink: 0,
            }}
          >
            <Box
              component="img"
              src="/logo.svg"
              alt="Resolve logo"
              sx={{ width: 28, height: 28 }}
            />
            <Typography
              variant="h6"
              color="primary"
              sx={{
                fontFamily: '"Space Grotesk", sans-serif',
                fontWeight: 700,
                letterSpacing: '-0.02em',
              }}
            >
              Resolve
            </Typography>
          </Box>

          {/* Nav links */}
          <Box sx={{ display: 'flex', gap: 0.5, flex: 1 }}>
            {navItems.map((item) => {
              const active = location.pathname === item.path;
              return (
                <Button
                  key={item.path}
                  component={Link}
                  to={item.path}
                  size="small"
                  sx={{
                    borderRadius: 2,
                    px: 2,
                    py: 0.75,
                    fontWeight: active ? 600 : 400,
                    color: active ? 'primary.main' : 'text.secondary',
                    bgcolor: active ? 'primary.light' : 'transparent',
                    '&:hover': {
                      bgcolor: 'action.hover',
                      color: 'text.primary',
                    },
                  }}
                >
                  {item.label}
                </Button>
              );
            })}
          </Box>

          {/* Right side actions */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Tooltip title={mode === 'light' ? 'Dark mode' : 'Light mode'}>
              <IconButton size="small" onClick={toggleTheme} sx={{ color: 'text.secondary' }}>
                {mode === 'light' ? <DarkMode fontSize="small" /> : <LightMode fontSize="small" />}
              </IconButton>
            </Tooltip>

            {/* User menu */}
            <Button
              size="small"
              onClick={(e) => setAnchorEl(e.currentTarget)}
              endIcon={<KeyboardArrowDown fontSize="small" />}
              sx={{
                borderRadius: 2,
                px: 1.5,
                gap: 1,
                color: 'text.primary',
                textTransform: 'none',
                '&:hover': { bgcolor: 'action.hover' },
              }}
            >
              <Avatar
                sx={{
                  width: 28,
                  height: 28,
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  bgcolor: 'primary.main',
                }}
              >
                {user?.name?.charAt(0).toUpperCase()}
              </Avatar>
              <Box sx={{ textAlign: 'left', display: { xs: 'none', sm: 'block' } }}>
                <Typography variant="body2" fontWeight={600} lineHeight={1.2}>
                  {user?.name}
                </Typography>
                <Typography variant="caption" color="text.secondary" lineHeight={1}>
                  {user?.role}
                </Typography>
              </Box>
            </Button>

            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={() => setAnchorEl(null)}
              PaperProps={{
                sx: { minWidth: 180, borderRadius: 3, mt: 0.5, boxShadow: '0 8px 32px rgba(0,0,0,0.12)' },
              }}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
              <Box sx={{ px: 2, py: 1.5 }}>
                <Typography variant="body2" fontWeight={600}>{user?.name}</Typography>
                <Typography variant="caption" color="text.secondary">{user?.email}</Typography>
              </Box>
              <Divider />
              <MenuItem
                onClick={handleLogout}
                sx={{ mt: 0.5, borderRadius: 1.5, mx: 0.5, color: 'error.main', fontSize: '0.875rem' }}
              >
                Sign out
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Page content */}
      <Box
        component="main"
        sx={{
          flex: 1,
          px: { xs: 2, md: 4 },
          py: 4,
          maxWidth: 1280,
          width: '100%',
          mx: 'auto',
          boxSizing: 'border-box',
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
