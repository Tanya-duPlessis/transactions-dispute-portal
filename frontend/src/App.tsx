import { lazy, Suspense, type ReactNode } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { CircularProgress, Box } from '@mui/material';
import { SnackbarProvider } from 'notistack';
import { useAuthStore } from './store/authStore';

const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const TransactionsPage = lazy(() => import('./pages/TransactionsPage'));
const DisputesPage = lazy(() => import('./pages/DisputesPage'));
const DisputeDetailPage = lazy(() => import('./pages/DisputeDetailPage'));
const AdminDisputesPage = lazy(() => import('./pages/AdminDisputesPage'));

const PageLoader = () => (
  <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
    <CircularProgress color="primary" />
  </Box>
);

const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

const AdminRoute = ({ children }: { children: ReactNode }) => {
  const user = useAuthStore((s) => s.user);
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'ADMIN') return <Navigate to="/transactions" replace />;
  return <>{children}</>;
};

export default function App() {
  return (
    <SnackbarProvider maxSnack={3} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/transactions"
            element={
              <ProtectedRoute>
                <TransactionsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/disputes"
            element={
              <ProtectedRoute>
                <DisputesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/disputes/:id"
            element={
              <ProtectedRoute>
                <DisputeDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/disputes"
            element={
              <AdminRoute>
                <AdminDisputesPage />
              </AdminRoute>
            }
          />
          <Route path="/" element={<Navigate to="/transactions" replace />} />
          <Route path="*" element={<Navigate to="/transactions" replace />} />
        </Routes>
      </Suspense>
    </SnackbarProvider>
  );
}
