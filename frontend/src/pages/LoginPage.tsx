import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  InputAdornment,
  IconButton,
  Divider,
  Chip,
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
        px: 2,
        background:
          mode === 'dark'
            ? 'linear-gradient(145deg, #0A0F1E 0%, #0D1B3E 50%, #0A1628 100%)'
            : 'linear-gradient(145deg, #0F2850 0%, #1A4480 40%, #0F3460 100%)',
      }}
    >
      {/* Theme toggle */}
      <Box sx={{ position: 'fixed', top: 20, right: 24 }}>
        <IconButton
          onClick={toggleTheme}
          size="small"
          sx={{ color: 'rgba(255,255,255,0.7)', '&:hover': { color: '#fff' } }}
        >
          {mode === 'light' ? <DarkMode fontSize="small" /> : <LightMode fontSize="small" />}
        </IconButton>
      </Box>

      {/* Wordmark above card */}
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography
          variant="h3"
          fontWeight={700}
          letterSpacing="-0.03em"
          sx={{ color: '#FFFFFF', mb: 0.5 }}
        >
          Resolve
        </Typography>
        <Typography
          variant="body2"
          sx={{ color: 'rgba(255,255,255,0.65)', letterSpacing: '0.02em' }}
        >
          Transaction Dispute Portal
        </Typography>
      </Box>

      {/* Card */}
      <Card
        elevation={0}
        sx={{
          width: '100%',
          maxWidth: 420,
          borderRadius: 4,
          border: 'none',
          boxShadow: '0 24px 64px rgba(0,0,0,0.35)',
          bgcolor: mode === 'dark' ? '#161B22' : '#FFFFFF',
        }}
      >
        <CardContent sx={{ p: 4 }}>
          <Typography
            variant="h6"
            fontWeight={600}
            sx={{ mb: 3, color: 'text.primary', letterSpacing: '-0.01em' }}
          >
            Sign in to your account
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
                boxShadow: '0 4px 16px rgba(0, 113, 227, 0.4)',
                '&:hover': {
                  boxShadow: '0 6px 20px rgba(0, 113, 227, 0.5)',
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

          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
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
                    borderColor: 'primary.main',
                    color: 'primary.main',
                    bgcolor: 'transparent',
                  },
                }}
              />
            ))}
          </Box>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: 'block', textAlign: 'center', mt: 1.5 }}
          >
            Click to auto-fill credentials
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
