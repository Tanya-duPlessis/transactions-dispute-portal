import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
  AppBar,
  Box,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Avatar,
  Tooltip,
  Divider,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Menu as MenuIcon,
  ReceiptLong,
  Gavel,
  Logout,
  AdminPanelSettings,
  ChevronLeft,
} from '@mui/icons-material';
import { useAuthStore } from '../../store/authStore';
import { authService } from '../../services/auth.service';
import { useSnackbar } from 'notistack';

const DRAWER_WIDTH = 240;

const customerNav = [
  { label: 'Transactions', icon: <ReceiptLong />, path: '/transactions' },
  { label: 'My Disputes', icon: <Gavel />, path: '/disputes' },
];

const adminNav = [
  { label: 'All Disputes', icon: <AdminPanelSettings />, path: '/admin/disputes' },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [desktopOpen, setDesktopOpen] = useState(true);
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const { enqueueSnackbar } = useSnackbar();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const navItems = user?.role === 'ADMIN' ? adminNav : customerNav;

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch {
      // ignore logout errors
    }
    logout();
    navigate('/login');
    enqueueSnackbar('Logged out successfully', { variant: 'success' });
  };

  const drawerContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Toolbar sx={{ justifyContent: 'space-between', px: 2 }}>
        <Typography variant="h6" fontWeight={700} color="primary">
          DisputePortal
        </Typography>
        {!isMobile && (
          <IconButton size="small" onClick={() => setDesktopOpen(false)}>
            <ChevronLeft fontSize="small" />
          </IconButton>
        )}
      </Toolbar>
      <Divider />
      <List sx={{ flex: 1, pt: 1 }}>
        {navItems.map((item) => (
          <ListItemButton
            key={item.path}
            component={Link}
            to={item.path}
            selected={location.pathname === item.path}
            onClick={() => isMobile && setMobileOpen(false)}
            sx={{
              mx: 1,
              borderRadius: 2,
              mb: 0.5,
              '&.Mui-selected': {
                bgcolor: 'primary.main',
                color: 'primary.contrastText',
                '& .MuiListItemIcon-root': { color: 'primary.contrastText' },
                '&:hover': { bgcolor: 'primary.dark' },
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItemButton>
        ))}
      </List>
      <Divider />
      <Box sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
          <Avatar sx={{ bgcolor: 'primary.main', width: 36, height: 36, fontSize: 14 }}>
            {user?.name.charAt(0).toUpperCase()}
          </Avatar>
          <Box>
            <Typography variant="body2" fontWeight={600} noWrap>
              {user?.name}
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap>
              {user?.role}
            </Typography>
          </Box>
        </Box>
        <Tooltip title="Logout">
          <ListItemButton onClick={handleLogout} sx={{ borderRadius: 2, py: 0.75 }}>
            <ListItemIcon sx={{ minWidth: 36 }}>
              <Logout fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Logout" primaryTypographyProps={{ variant: 'body2' }} />
          </ListItemButton>
        </Tooltip>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <AppBar
        position="fixed"
        sx={{ zIndex: (t) => t.zIndex.drawer + 1, display: { md: 'none' } }}
      >
        <Toolbar>
          <IconButton color="inherit" edge="start" onClick={() => setMobileOpen(true)} sx={{ mr: 2 }}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" fontWeight={700} color="primary">
            DisputePortal
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Mobile drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{ display: { xs: 'block', md: 'none' }, '& .MuiDrawer-paper': { width: DRAWER_WIDTH } }}
      >
        {drawerContent}
      </Drawer>

      {/* Desktop drawer */}
      {desktopOpen ? (
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box' },
          }}
          open
        >
          {drawerContent}
        </Drawer>
      ) : (
        <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'flex-start', pt: 2, pl: 1 }}>
          <IconButton onClick={() => setDesktopOpen(true)}>
            <MenuIcon />
          </IconButton>
        </Box>
      )}

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          mt: { xs: 8, md: 0 },
          minHeight: '100vh',
          bgcolor: 'background.default',
          transition: 'margin 0.2s',
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
