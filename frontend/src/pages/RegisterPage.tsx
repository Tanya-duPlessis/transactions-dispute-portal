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
  Stack,
} from '@mui/material';
import { Visibility, VisibilityOff, DarkMode, LightMode } from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '../store/authStore';
import { authService } from '../services/auth.service';
import { useThemeMode } from '../theme/ThemeContext';

const registerSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Enter a valid email address'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();
  const { mode, toggleTheme } = useThemeMode();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>({ resolver: zodResolver(registerSchema) });

  const watchedFields = {
    name: watch('name', ''),
    email: watch('email', ''),
    password: watch('password', ''),
    confirmPassword: watch('confirmPassword', ''),
  };

  const onSubmit = async (data: RegisterForm) => {
    setError('');
    try {
      const result = await authService.register(data.email, data.password, data.name);
      setAuth(result.user, result.accessToken);
      navigate('/transactions', { replace: true });
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: { message?: string } } } })
        ?.response?.data?.error?.message;
      setError(msg || 'Could not create your account. Please try again.');
    }
  };

  const passwordStrength = () => {
    const p = watchedFields.password;
    if (!p) return null;
    if (p.length < 8) return { label: 'Too short', color: '#DC2626' };
    if (!/[A-Z]/.test(p) || !/[0-9]/.test(p)) return { label: 'Weak', color: '#D97706' };
    if (p.length >= 12) return { label: 'Strong', color: '#16A34A' };
    return { label: 'Good', color: '#2563EB' };
  };

  const strength = passwordStrength();

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
        py: 4,
      }}
    >
      {/* Theme toggle */}
      <Box sx={{ position: 'fixed', top: 20, right: 24 }}>
        <IconButton onClick={toggleTheme} size="small" sx={{ color: 'text.secondary' }}>
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
          {/* Gradient header */}
          <Box
            sx={{
              background: 'linear-gradient(135deg, #7C3AED 0%, #2563EB 50%, #0891B2 100%)',
              px: 4,
              py: 4,
              textAlign: 'center',
            }}
          >
            <Typography
              variant="h4"
              fontWeight={700}
              letterSpacing="-0.03em"
              sx={{ color: '#FFFFFF', mb: 0.5 }}
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
              Create your account
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
              <TextField
                {...register('name')}
                label="Full name"
                fullWidth
                autoFocus
                autoComplete="name"
                value={watchedFields.name || ''}
                InputLabelProps={{ shrink: !!watchedFields.name }}
                error={!!errors.name}
                helperText={errors.name?.message}
                sx={{ mb: 2.5 }}
              />
              <TextField
                {...register('email')}
                label="Email"
                type="email"
                fullWidth
                autoComplete="email"
                value={watchedFields.email || ''}
                InputLabelProps={{ shrink: !!watchedFields.email }}
                error={!!errors.email}
                helperText={errors.email?.message}
                sx={{ mb: 2.5 }}
              />
              <TextField
                {...register('password')}
                label="Password"
                type={showPassword ? 'text' : 'password'}
                fullWidth
                autoComplete="new-password"
                value={watchedFields.password || ''}
                InputLabelProps={{ shrink: !!watchedFields.password }}
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
                        {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: strength ? 1 : 2.5 }}
              />

              {/* Password strength indicator */}
              {strength && (
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2.5 }}>
                  <Box sx={{ flex: 1, height: 3, borderRadius: 2, bgcolor: 'divider', overflow: 'hidden' }}>
                    <Box
                      sx={{
                        height: '100%',
                        bgcolor: strength.color,
                        width:
                          strength.label === 'Too short' ? '25%' :
                          strength.label === 'Weak' ? '50%' :
                          strength.label === 'Good' ? '75%' : '100%',
                        transition: 'width 0.3s ease',
                        borderRadius: 2,
                      }}
                    />
                  </Box>
                  <Typography variant="caption" sx={{ color: strength.color, fontWeight: 600, minWidth: 50 }}>
                    {strength.label}
                  </Typography>
                </Stack>
              )}

              <TextField
                {...register('confirmPassword')}
                label="Confirm password"
                type={showConfirm ? 'text' : 'password'}
                fullWidth
                autoComplete="new-password"
                value={watchedFields.confirmPassword || ''}
                InputLabelProps={{ shrink: !!watchedFields.confirmPassword }}
                error={!!errors.confirmPassword}
                helperText={errors.confirmPassword?.message}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowConfirm((s) => !s)}
                        edge="end"
                        size="small"
                        tabIndex={-1}
                      >
                        {showConfirm ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
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
                  background: 'linear-gradient(135deg, #7C3AED 0%, #2563EB 100%)',
                  boxShadow: '0 4px 16px rgba(124, 58, 237, 0.35)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #6D28D9 0%, #1D4ED8 100%)',
                    boxShadow: '0 6px 20px rgba(124, 58, 237, 0.45)',
                  },
                }}
              >
                {isSubmitting ? 'Creating account...' : 'Create account'}
              </Button>
            </Box>

            <Stack direction="row" justifyContent="center" alignItems="center" spacing={0.5} sx={{ mt: 3 }}>
              <Typography variant="body2" color="text.secondary">
                Already have an account?
              </Typography>
              <Typography
                variant="body2"
                component={Link}
                to="/login"
                sx={{
                  color: '#2563EB',
                  fontWeight: 600,
                  textDecoration: 'none',
                  '&:hover': { textDecoration: 'underline' },
                }}
              >
                Sign in
              </Typography>
            </Stack>
          </Box>
        </Card>
      </Box>
    </Box>
  );
}
