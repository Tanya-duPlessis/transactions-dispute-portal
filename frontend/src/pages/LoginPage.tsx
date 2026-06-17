import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Box,
  Card,
  TextField,
  Button,
  Typography,
  Alert,
  InputAdornment,
  IconButton,
  Divider,
  Chip,
  Stack,
} from '@mui/material';
import { Visibility, VisibilityOff, DarkMode, LightMode } from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '../store/authStore';
import { authService } from '../services/auth.service';
import { useThemeMode } from '../theme/ThemeContext';

const loginSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginForm = z.infer<typeof loginSchema>;

const DEMO_ACCOUNTS = [
  { label: 'Customer 1', email: 'customer1@demo.com' },
  { label: 'Customer 2', email: 'customer2@demo.com' },
  { label: 'Admin', email: 'admin@demo.com' },
];

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();
  const { mode, toggleTheme } = useThemeMode();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) });

  const emailValue = watch('email', '');
  const passwordValue = watch('password', '');

  const onSubmit = async (data: LoginForm) => {
    setError('');
    try {
      const result = await authService.login(data.email, data.password);
      setAuth(result.user, result.accessToken);
      navigate(result.user.role === 'ADMIN' ? '/admin/disputes' : '/transactions', {
        replace: true,
      });
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: { message?: string } } } })
        ?.response?.data?.error?.message;
      setError(msg || 'Your email or password is incorrect.');
    }
  };

  const fillDemo = (email: string) => {
    setValue('email', email);
    setValue('password', 'password123');
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        px: 2,
      }}
    >
      {/* Theme toggle */}
      <Box sx={{ position: 'fixed', top: 20, right: 24 }}>
        <IconButton
          onClick={toggleTheme}
          size="small"
          sx={{ color: 'text.secondary' }}
        >
          {mode === 'light' ? <DarkMode fontSize="small" /> : <LightMode fontSize="small" />}
        </IconButton>
      </Box>

      <Box sx={{ width: '100%', maxWidth: 420 }}>
        <Card
          elevation={0}
          sx={{
            borderRadius: 4,
            overflow: 'hidden',
            boxShadow: mode === 'light'
              ? '0 4px 32px rgba(0,0,0,0.10)'
              : '0 4px 32px rgba(0,0,0,0.4)',
          }}
        >
          {/* Colourful header band */}
          <Box
            sx={{
              background: 'linear-gradient(135deg, #2563EB 0%, #7C3AED 50%, #0891B2 100%)',
              px: 4,
              py: 4,
              textAlign: 'center',
            }}
          >
            <Typography
              variant="h4"
              sx={{
                color: '#FFFFFF',
                mb: 0.5,
                fontFamily: '"Space Grotesk", sans-serif',
                fontWeight: 700,
                letterSpacing: '-0.02em',
              }}
            >
              Resolve
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: 'rgba(255,255,255,0.8)', letterSpacing: '0.02em' }}
            >
              Transaction Dispute Portal
            </Typography>
          </Box>

          {/* Form body */}
          <Box sx={{ px: 4, py: 4, bgcolor: 'background.paper' }}>
            <Typography
              variant="h6"
              fontWeight={600}
              sx={{ mb: 3, letterSpacing: '-0.01em' }}
            >
              Sign in to continue
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
              <TextField
                {...register('email')}
                label="Email"
                type="email"
                fullWidth
                autoFocus
                autoComplete="email"
                value={emailValue || ''}
                InputLabelProps={{ shrink: !!emailValue }}
                error={!!errors.email}
                helperText={errors.email?.message}
                sx={{ mb: 2.5 }}
              />
              <TextField
                {...register('password')}
                label="Password"
                type={showPassword ? 'text' : 'password'}
                fullWidth
                autoComplete="current-password"
                value={passwordValue || ''}
                InputLabelProps={{ shrink: !!passwordValue }}
                error={!!errors.password}
                helperText={errors.password?.message}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword((s) => !s)}
                        edge="end"
                        size="small"
                        tabIndex={-1}
                      >
                        {showPassword ? (
                          <VisibilityOff fontSize="small" />
                        ) : (
                          <Visibility fontSize="small" />
                        )}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 4 }}
              />

              <Button
                type="submit"
                variant="contained"
                fullWidth
                size="large"
                disabled={isSubmitting}
                sx={{
                  borderRadius: 3,
                  py: 1.5,
                  fontSize: '1rem',
                  fontWeight: 600,
                  background: 'linear-gradient(135deg, #2563EB 0%, #7C3AED 100%)',
                  boxShadow: '0 4px 16px rgba(124, 58, 237, 0.35)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #1D4ED8 0%, #6D28D9 100%)',
                    boxShadow: '0 6px 20px rgba(124, 58, 237, 0.45)',
                  },
                }}
              >
                {isSubmitting ? 'Signing in...' : 'Sign in'}
              </Button>
            </Box>

            <Divider sx={{ my: 3 }}>
              <Typography variant="caption" color="text.secondary">
                Demo accounts
              </Typography>
            </Divider>

            <Stack direction="row" spacing={1} justifyContent="center">
              {DEMO_ACCOUNTS.map((account) => (
                <Chip
                  key={account.email}
                  label={account.label}
                  variant="outlined"
                  size="small"
                  onClick={() => fillDemo(account.email)}
                  sx={{
                    cursor: 'pointer',
                    borderRadius: 2,
                    fontSize: '0.75rem',
                    borderColor: 'divider',
                    '&:hover': {
                      borderColor: '#7C3AED',
                      color: '#7C3AED',
                      bgcolor: '#F5F3FF',
                    },
                  }}
                />
              ))}
            </Stack>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: 'block', textAlign: 'center', mt: 1.5 }}
            >
              Click to auto-fill credentials
            </Typography>

            <Stack direction="row" justifyContent="center" alignItems="center" spacing={0.5} sx={{ mt: 3 }}>
              <Typography variant="body2" color="text.secondary">
                Don't have an account?
              </Typography>
              <Typography
                variant="body2"
                component={Link}
                to="/register"
                sx={{
                  color: '#2563EB',
                  fontWeight: 600,
                  textDecoration: 'none',
                  '&:hover': { textDecoration: 'underline' },
                }}
              >
                Create account
              </Typography>
            </Stack>
          </Box>
        </Card>
      </Box>
    </Box>
  );
}
