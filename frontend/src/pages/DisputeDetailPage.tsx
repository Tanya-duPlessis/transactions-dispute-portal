import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Card, CardContent, Typography, Skeleton, Button,
  Divider, Stack, Avatar, TextField, MenuItem,
} from '@mui/material';
import { ArrowBack, CheckCircle, RadioButtonUnchecked } from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import AppLayout from '../components/layout/AppLayout';
import StatusChip from '../components/common/StatusChip';
import CategoryChip from '../components/common/CategoryChip';
import { disputeService } from '../services/dispute.service';
import { useAuthStore } from '../store/authStore';
import type { Dispute, DisputeStatus, Category } from '../types';
import { tokens } from '../theme/tokens';

const VALID_TRANSITIONS: Record<DisputeStatus, DisputeStatus[]> = {
  PENDING: ['UNDER_REVIEW'],
  UNDER_REVIEW: ['RESOLVED', 'REJECTED'],
  RESOLVED: [],
  REJECTED: [],
};

const REASON_LABELS: Record<string, string> = {
  UNAUTHORISED: 'Unauthorised transaction',
  DUPLICATE: 'Duplicate charge',
  INCORRECT_AMOUNT: 'Incorrect amount',
  SERVICE_NOT_RECEIVED: 'Service not received',
  OTHER: 'Other',
};

const STATUS_STEPS: DisputeStatus[] = ['PENDING', 'UNDER_REVIEW', 'RESOLVED'];

export default function DisputeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const user = useAuthStore((s) => s.user);
  const isAdmin = user?.role === 'ADMIN';
  const [dispute, setDispute] = useState<Dispute | null>(null);
  const [loading, setLoading] = useState(true);
  const [newStatus, setNewStatus] = useState('');
  const [note, setNote] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (!id) return;
    disputeService.getById(id).then((d) => { setDispute(d); setLoading(false); });
  }, [id]);

  const handleUpdateStatus = async () => {
    if (!dispute || !newStatus || !note.trim()) return;
    setUpdating(true);
    try {
      const updated = await disputeService.updateStatus(dispute.id, newStatus, note);
      setDispute((prev) => prev ? { ...prev, status: updated.status } : prev);
      enqueueSnackbar('Dispute status updated', { variant: 'success' });
      setNewStatus('');
      setNote('');
      // Refresh full dispute to get new event
      const refreshed = await disputeService.getById(dispute.id);
      setDispute(refreshed);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: { message?: string } } } })
        ?.response?.data?.error?.message;
      enqueueSnackbar(msg || 'Failed to update status', { variant: 'error' });
    } finally {
      setUpdating(false);
    }
  };

  const validNextStatuses = dispute ? VALID_TRANSITIONS[dispute.status as DisputeStatus] : [];

  const formatAmount = (amount: string) =>
    new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' }).format(Number(amount));

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString('en-ZA', { day: 'numeric', month: 'long', year: 'numeric' });

  const formatDateTime = (date: string) =>
    new Date(date).toLocaleString('en-ZA', {
      day: 'numeric', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });

  const getStatusColour = (status: DisputeStatus) => {
    const map: Record<DisputeStatus, string> = {
      PENDING: tokens.status.pending,
      UNDER_REVIEW: tokens.status.underReview,
      RESOLVED: tokens.status.resolved,
      REJECTED: tokens.status.rejected,
    };
    return map[status];
  };

  return (
    <AppLayout>
      <Button
        startIcon={<ArrowBack />}
        onClick={() => navigate(-1)}
        variant="text"
        sx={{ mb: 3, color: 'text.secondary', borderRadius: 2, pl: 0 }}
      >
        Back to disputes
      </Button>

      {loading ? (
        <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
          <Skeleton variant="rounded" width="100%" height={200} sx={{ borderRadius: 3 }} />
          <Skeleton variant="rounded" width="100%" height={300} sx={{ borderRadius: 3 }} />
        </Box>
      ) : !dispute ? (
        <Typography color="text.secondary">Dispute not found.</Typography>
      ) : (
        <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', lg: 'row' } }}>
          {/* Left column */}
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Transaction card */}
            <Card elevation={0}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="overline" color="text.secondary" fontWeight={600}>
                  Transaction
                </Typography>
                <Box sx={{ mt: 1.5, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h5" fontWeight={700} letterSpacing="-0.02em">
                      {dispute.transaction?.merchant}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                      {dispute.transaction ? formatDate(dispute.transaction.date) : ''}
                    </Typography>
                    {dispute.transaction && (
                      <Box sx={{ mt: 1.5 }}>
                        <CategoryChip category={dispute.transaction.category as Category} />
                      </Box>
                    )}
                  </Box>
                  <Typography variant="h5" fontWeight={700} color="primary">
                    {dispute.transaction ? formatAmount(dispute.transaction.amount) : ''}
                  </Typography>
                </Box>
              </CardContent>
            </Card>

            {/* Dispute details card */}
            <Card elevation={0}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="overline" color="text.secondary" fontWeight={600}>
                    Dispute Details
                  </Typography>
                  <StatusChip status={dispute.status as DisputeStatus} size="medium" />
                </Box>
                <Divider sx={{ mb: 2.5 }} />
                <Stack spacing={2.5}>
                  <Box>
                    <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      Reason
                    </Typography>
                    <Typography variant="body1" fontWeight={500} sx={{ mt: 0.5 }}>
                      {REASON_LABELS[dispute.reason] || dispute.reason}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      Description
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 0.5, lineHeight: 1.7, color: 'text.secondary' }}>
                      {dispute.description}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      Submitted
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 0.5 }}>
                      {formatDate(dispute.createdAt)}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Box>

          {/* Right column — audit timeline */}
          <Box sx={{ width: { xs: '100%', lg: 360 } }}>
            <Card elevation={0} sx={{ position: { lg: 'sticky' }, top: { lg: 24 } }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="overline" color="text.secondary" fontWeight={600} sx={{ mb: 2.5, display: 'block' }}>
                  Timeline
                </Typography>

                {/* Progress steps for non-rejected */}
                {dispute.status !== 'REJECTED' && (
                  <Box sx={{ mb: 3 }}>
                    {STATUS_STEPS.map((step, i) => {
                      const reached = STATUS_STEPS.indexOf(dispute.status as DisputeStatus) >= i;
                      return (
                        <Box key={step} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: i < STATUS_STEPS.length - 1 ? 0 : 0 }}>
                          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            {reached ? (
                              <CheckCircle sx={{ color: getStatusColour(step), fontSize: 20 }} />
                            ) : (
                              <RadioButtonUnchecked sx={{ color: 'divider', fontSize: 20 }} />
                            )}
                            {i < STATUS_STEPS.length - 1 && (
                              <Box sx={{ width: 2, height: 24, bgcolor: reached ? getStatusColour(step) : 'divider', my: 0.5, borderRadius: 1 }} />
                            )}
                          </Box>
                          <Typography variant="body2" fontWeight={reached ? 600 : 400} color={reached ? 'text.primary' : 'text.secondary'}>
                            {step.charAt(0) + step.slice(1).toLowerCase().replace('_', ' ')}
                          </Typography>
                        </Box>
                      );
                    })}
                  </Box>
                )}

                <Divider sx={{ mb: 2.5 }} />

                {/* Admin status update form */}
                {isAdmin && validNextStatuses.length > 0 && (
                  <Box sx={{ mb: 3, p: 2.5, bgcolor: 'background.default', borderRadius: 2 }}>
                    <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', mb: 2 }}>
                      Update Status
                    </Typography>
                    <TextField
                      select
                      label="New status"
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value)}
                      size="small"
                      fullWidth
                      sx={{ mb: 2 }}
                    >
                      {validNextStatuses.map((s) => (
                        <MenuItem key={s} value={s}>
                          {s.charAt(0) + s.slice(1).toLowerCase().replace('_', ' ')}
                        </MenuItem>
                      ))}
                    </TextField>
                    <TextField
                      label="Resolution note"
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      multiline
                      rows={3}
                      fullWidth
                      size="small"
                      placeholder="Add a note explaining this status change..."
                      sx={{ mb: 2 }}
                    />
                    <Button
                      variant="contained"
                      fullWidth
                      disabled={!newStatus || !note.trim() || updating}
                      onClick={handleUpdateStatus}
                      sx={{
                        borderRadius: 2,
                        background: 'linear-gradient(135deg, #2563EB 0%, #7C3AED 100%)',
                        boxShadow: 'none',
                        '&:hover': { boxShadow: 'none' },
                      }}
                    >
                      {updating ? 'Updating...' : 'Update status'}
                    </Button>
                  </Box>
                )}

                {/* Audit events */}
                <Stack spacing={2.5}>
                  {(dispute.events || []).map((event, i) => (
                    <Box key={event.id} sx={{ display: 'flex', gap: 1.5 }}>
                      <Avatar
                        sx={{
                          width: 32,
                          height: 32,
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          bgcolor: i === 0 ? '#2563EB22' : '#7C3AED22',
                          color: i === 0 ? '#2563EB' : '#7C3AED',
                          flexShrink: 0,
                        }}
                      >
                        {event.actor?.name?.charAt(0) || '?'}
                      </Avatar>
                      <Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                          <Typography variant="body2" fontWeight={600}>
                            {event.actor?.name || 'System'}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {formatDateTime(event.createdAt)}
                          </Typography>
                        </Box>
                        <Typography variant="caption" sx={{ color: getStatusColour(event.toStatus as DisputeStatus), fontWeight: 600 }}>
                          {event.toStatus.replace('_', ' ')}
                        </Typography>
                        {event.note && (
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, lineHeight: 1.6 }}>
                            {event.note}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  ))}
                </Stack>
              </CardContent>
            </Card>
          </Box>
        </Box>
      )}
    </AppLayout>
  );
}
