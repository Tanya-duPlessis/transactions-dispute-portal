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
import { Visibility, VisibilityOff, AccountBalance } from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '../store/authStore';
import { authService } from '../services/auth.service';
import { useThemeMode } from '../theme/ThemeContext';
import { DarkMode, LightMode } from '@mui/icons-material';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginForm = z.infer<typeof loginSchema>;

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
      navigate(result.user.role === 'ADMIN' ? '/admin/disputes' : '/transactions', { replace: true });
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: { message?: string } } } })
        ?.response?.data?.error?.message;
      setError(msg || 'Login failed. Please try again.');
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
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        p: 2,
      }}
    >
      <Box sx={{ width: '100%', maxWidth: 440 }}>
        {/* Theme toggle — top right */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
          <IconButton onClick={toggleTheme} size="small">
            {mode === 'light' ? <DarkMode fontSize="small" /> : <LightMode fontSize="small" />}
          </IconButton>
        </Box>

        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 64,
              height: 64,
              borderRadius: 3,
              bgcolor: 'primary.main',
              mb: 2,
              boxShadow: '0 0 32px rgba(0, 168, 89, 0.4)',
            }}
          >
            <AccountBalance sx={{ fontSize: 32, color: 'white' }} />
          </Box>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Resolve
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Transaction dispute management
          </Typography>
        </Box>

        <Card>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Sign in to your account
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
              <TextField
                {...register('email')}
                label="Email address"
                type="email"
                fullWidth
                autoFocus
                autoComplete="email"
                value={emailValue || ''}
                InputLabelProps={{ shrink: !!emailValue }}
                error={!!errors.email}
                helperText={errors.email?.message}
                sx={{ mb: 2 }}
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
                      <IconButton onClick={() => setShowPassword((s) => !s)} edge="end">
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 3 }}
              />
              <Button
                type="submit"
                variant="contained"
                fullWidth
                size="large"
                disabled={isSubmitting}
                sx={{ mb: 1 }}
              >
                {isSubmitting ? 'Signing in...' : 'Sign in'}
              </Button>
            </Box>

            <Divider sx={{ my: 3 }}>
              <Typography variant="caption" color="text.secondary">
                Demo accounts
              </Typography>
            </Divider>

            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'center' }}>
              <Chip
                label="Customer 1"
                variant="outlined"
                size="small"
                onClick={() => fillDemo('customer1@demo.com')}
                sx={{ cursor: 'pointer' }}
              />
              <Chip
                label="Customer 2"
                variant="outlined"
                size="small"
                onClick={() => fillDemo('customer2@demo.com')}
                sx={{ cursor: 'pointer' }}
              />
              <Chip
                label="Admin"
                variant="outlined"
                size="small"
                onClick={() => fillDemo('admin@demo.com')}
                sx={{ cursor: 'pointer' }}
              />
            </Box>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: 'block', textAlign: 'center', mt: 1 }}
            >
              Click a demo account to auto-fill credentials
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}
