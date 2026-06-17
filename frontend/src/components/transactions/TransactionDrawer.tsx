import { useState, useEffect } from 'react';
import {
  Drawer, Box, Typography, Divider, Button, IconButton,
  Skeleton, Avatar, Stack, Tooltip,
} from '@mui/material';
import { Close, Gavel, ChevronRight, ContentCopy, Check } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import StatusChip from '../common/StatusChip';
import CategoryChip from '../common/CategoryChip';
import { disputeService } from '../../services/dispute.service';
import type { Transaction, Dispute, DisputeStatus, Category } from '../../types';
import { tokens } from '../../theme/tokens';
import { useTheme } from '@mui/material';

interface Props {
  transaction: Transaction | null;
  open: boolean;
  onClose: () => void;
  onRaiseDispute: (tx: Transaction) => void;
}

const REASON_LABELS: Record<string, string> = {
  UNAUTHORISED: 'Unauthorised transaction',
  DUPLICATE: 'Duplicate charge',
  INCORRECT_AMOUNT: 'Incorrect amount',
  SERVICE_NOT_RECEIVED: 'Service not received',
  OTHER: 'Other',
};

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1.25 }}>
      <Typography variant="body2" color="text.secondary">{label}</Typography>
      <Box sx={{ textAlign: 'right' }}>{value}</Box>
    </Box>
  );
}

export default function TransactionDrawer({ transaction, open, onClose, onRaiseDispute }: Props) {
  const [dispute, setDispute] = useState<Dispute | null>(null);
  const [loadingDispute, setLoadingDispute] = useState(false);
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();
  const theme = useTheme();

  useEffect(() => {
    if (!transaction?.dispute?.id) { setDispute(null); return; }
    setLoadingDispute(true);
    disputeService.getById(transaction.dispute.id)
      .then(setDispute)
      .finally(() => setLoadingDispute(false));
  }, [transaction?.dispute?.id]);

  const copyRef = () => {
    if (!transaction) return;
    navigator.clipboard.writeText(transaction.reference);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatAmount = (amount: string) =>
    new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' }).format(Number(amount));

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString('en-ZA', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  const formatDateTime = (date: string) =>
    new Date(date).toLocaleString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  const getStatusColour = (status: DisputeStatus) => ({
    PENDING: tokens.status.pending,
    UNDER_REVIEW: tokens.status.underReview,
    RESOLVED: tokens.status.resolved,
    REJECTED: tokens.status.rejected,
  }[status]);

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: '100%', sm: 440 },
          bgcolor: 'background.paper',
          borderLeft: '1px solid',
          borderColor: 'divider',
          boxShadow: '-8px 0 32px rgba(0,0,0,0.12)',
        },
      }}
    >
      {!transaction ? null : (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          {/* Header */}
          <Box sx={{ px: 3, pt: 3, pb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Box>
                <Typography variant="h6" fontWeight={700} letterSpacing="-0.02em">
                  {transaction.merchant}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                  <Typography variant="caption" color="text.secondary" fontFamily="monospace">
                    {transaction.reference}
                  </Typography>
                  <Tooltip title={copied ? 'Copied!' : 'Copy reference'}>
                    <IconButton size="small" onClick={copyRef} sx={{ p: 0.25 }}>
                      {copied
                        ? <Check sx={{ fontSize: 14, color: 'success.main' }} />
                        : <ContentCopy sx={{ fontSize: 14, color: 'text.secondary' }} />}
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
              <IconButton size="small" onClick={onClose} sx={{ mt: -0.5 }}>
                <Close fontSize="small" />
              </IconButton>
            </Box>

            <Box sx={{ mt: 2.5, mb: 0.5 }}>
              <Typography variant="h4" fontWeight={700} color="primary" letterSpacing="-0.02em">
                {formatAmount(transaction.amount)}
              </Typography>
            </Box>
          </Box>

          <Divider />

          {/* Transaction details */}
          <Box sx={{ px: 3, py: 1, flex: 1, overflowY: 'auto' }}>
            <Typography variant="caption" color="text.secondary" fontWeight={600}
              sx={{ textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', mt: 2, mb: 0.5 }}>
              Transaction Details
            </Typography>

            <Box sx={{ bgcolor: 'background.default', borderRadius: 2, px: 2, mb: 3 }}>
              <DetailRow label="Date" value={
                <Typography variant="body2" fontWeight={500}>{formatDate(transaction.date)}</Typography>
              } />
              <Divider />
              <DetailRow label="Category" value={<CategoryChip category={transaction.category as Category} />} />
              <Divider />
              <DetailRow label="Description" value={
                <Typography variant="body2" fontWeight={500} sx={{ maxWidth: 200, textAlign: 'right' }}>
                  {transaction.description}
                </Typography>
              } />
              <Divider />
              <DetailRow label="Reference" value={
                <Typography variant="body2" fontWeight={500} fontFamily="monospace">
                  {transaction.reference}
                </Typography>
              } />
            </Box>

            {/* Dispute section */}
            {transaction.dispute ? (
              <>
                <Typography variant="caption" color="text.secondary" fontWeight={600}
                  sx={{ textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', mb: 0.5 }}>
                  Dispute
                </Typography>
                <Box sx={{ bgcolor: 'background.default', borderRadius: 2, px: 2, mb: 3 }}>
                  <DetailRow label="Status" value={<StatusChip status={transaction.dispute.status as DisputeStatus} />} />
                  {dispute && (
                    <>
                      <Divider />
                      <DetailRow label="Reason" value={
                        <Typography variant="body2" fontWeight={500} sx={{ maxWidth: 200, textAlign: 'right' }}>
                          {REASON_LABELS[dispute.reason] || dispute.reason}
                        </Typography>
                      } />
                    </>
                  )}
                </Box>

                {/* Audit timeline */}
                {loadingDispute ? (
                  <Stack spacing={1.5} sx={{ mb: 3 }}>
                    {[1, 2].map((i) => <Skeleton key={i} variant="rounded" height={60} sx={{ borderRadius: 2 }} />)}
                  </Stack>
                ) : dispute?.events && (
                  <>
                    <Typography variant="caption" color="text.secondary" fontWeight={600}
                      sx={{ textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', mb: 1.5 }}>
                      Timeline
                    </Typography>
                    <Stack spacing={0} sx={{ mb: 3 }}>
                      {dispute.events.map((event, i) => (
                        <Box key={event.id} sx={{ display: 'flex', gap: 1.5, position: 'relative' }}>
                          {i < dispute.events!.length - 1 && (
                            <Box sx={{ position: 'absolute', left: 15, top: 34, bottom: 0, width: 2, bgcolor: 'divider' }} />
                          )}
                          <Avatar sx={{
                            width: 32, height: 32, fontSize: '0.75rem', fontWeight: 700, mt: 0.25, flexShrink: 0, zIndex: 1,
                            bgcolor: event.actor?.role === 'ADMIN' ? '#7C3AED22' : '#2563EB22',
                            color: event.actor?.role === 'ADMIN' ? '#7C3AED' : '#2563EB',
                          }}>
                            {event.actor?.name?.charAt(0) || '?'}
                          </Avatar>
                          <Box sx={{ pb: 2.5, flex: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, flexWrap: 'wrap' }}>
                              <Typography variant="body2" fontWeight={600}>{event.actor?.name || 'System'}</Typography>
                              <Typography variant="caption" color="text.secondary">{formatDateTime(event.createdAt)}</Typography>
                            </Box>
                            <Typography variant="caption" sx={{
                              color: getStatusColour(event.toStatus as DisputeStatus),
                              fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', fontSize: '0.68rem',
                            }}>
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
                  </>
                )}
              </>
            ) : null}
          </Box>

          {/* Footer actions */}
          <Divider />
          <Box sx={{ px: 3, py: 2.5, display: 'flex', gap: 1.5 }}>
            {transaction.dispute ? (
              <Button
                variant="contained"
                fullWidth
                endIcon={<ChevronRight />}
                onClick={() => { navigate(`/disputes/${transaction.dispute!.id}`); onClose(); }}
                sx={{
                  borderRadius: 2,
                  background: 'linear-gradient(135deg, #2563EB 0%, #7C3AED 100%)',
                  boxShadow: 'none',
                  '&:hover': { boxShadow: 'none' },
                }}
              >
                View full dispute
              </Button>
            ) : (
              <Button
                variant="contained"
                fullWidth
                startIcon={<Gavel />}
                onClick={() => { onRaiseDispute(transaction); onClose(); }}
                sx={{
                  borderRadius: 2,
                  background: 'linear-gradient(135deg, #2563EB 0%, #7C3AED 100%)',
                  boxShadow: 'none',
                  '&:hover': { boxShadow: 'none' },
                }}
              >
                Raise a dispute
              </Button>
            )}
            <Button variant="outlined" onClick={onClose} sx={{ borderRadius: 2, borderColor: 'divider', color: 'text.secondary' }}>
              Close
            </Button>
          </Box>
        </Box>
      )}
    </Drawer>
  );
}
