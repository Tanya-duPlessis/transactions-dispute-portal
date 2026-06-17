import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box, Card, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Typography, Skeleton, TablePagination,
  TextField, Chip, InputAdornment, Button, useTheme,
} from '@mui/material';
import { Search, ChevronRight, AdminPanelSettings } from '@mui/icons-material';
import { tokens } from '../theme/tokens';
import AppLayout from '../components/layout/AppLayout';
import PageHeader from '../components/common/PageHeader';
import StatusChip from '../components/common/StatusChip';
import EmptyState from '../components/common/EmptyState';
import { disputeService } from '../services/dispute.service';
import type { Dispute, DisputeStatus } from '../types';

const REASON_LABELS: Record<string, string> = {
  UNAUTHORISED: 'Unauthorised',
  DUPLICATE: 'Duplicate',
  INCORRECT_AMOUNT: 'Incorrect amount',
  SERVICE_NOT_RECEIVED: 'Not received',
  OTHER: 'Other',
};

const STATUS_COUNTS_CONFIG = [
  { status: 'PENDING',      label: 'Pending',      color: tokens.status.pending,      bg: tokens.status.pendingBg,      darkBg: '#7A4E10' },
  { status: 'UNDER_REVIEW', label: 'Under review',  color: tokens.status.underReview,  bg: tokens.status.underReviewBg,  darkBg: '#2D3F6B' },
  { status: 'RESOLVED',     label: 'Resolved',     color: tokens.status.resolved,     bg: tokens.status.resolvedBg,     darkBg: '#1A4D35' },
  { status: 'REJECTED',     label: 'Rejected',     color: tokens.status.rejected,     bg: tokens.status.rejectedBg,     darkBg: '#5C1F1F' },
];

export default function AdminDisputesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [allDisputes, setAllDisputes] = useState<Dispute[]>([]);
  const navigate = useNavigate();

  const page = parseInt(searchParams.get('page') || '0');
  const rowsPerPage = parseInt(searchParams.get('limit') || '20');
  const status = searchParams.get('status') || '';
  const search = searchParams.get('search') || '';

  const setParam = (key: string, value: string) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (value) next.set(key, value); else next.delete(key);
      if (key !== 'page') next.delete('page');
      return next;
    });
  };

  const fetchDisputes = useCallback(async () => {
    setLoading(true);
    try {
      const result = await disputeService.list({
        page: page + 1,
        limit: rowsPerPage,
        status: status || undefined,
      });
      setDisputes(result.data);
      setTotal(result.total);
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, status]);

  // Fetch all for summary counts
  useEffect(() => {
    disputeService.list({ limit: 100 }).then((r) => setAllDisputes(r.data));
  }, []);

  useEffect(() => { fetchDisputes(); }, [fetchDisputes]);

  const countByStatus = (s: string) => allDisputes.filter((d) => d.status === s).length;

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' });

  const formatAmount = (amount: string) =>
    new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' }).format(Number(amount));

  const filtered = search
    ? disputes.filter(
        (d) =>
          d.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
          d.transaction?.merchant?.toLowerCase().includes(search.toLowerCase()),
      )
    : disputes;

  return (
    <AppLayout>
      <PageHeader
        title="All Disputes"
        subtitle="Review and manage disputes across all customers"
      />

      {/* Summary chips */}
      <Box sx={{ display: 'flex', gap: 1.5, mb: 3, flexWrap: 'wrap' }}>
        {STATUS_COUNTS_CONFIG.map(({ status: s, label, color, bg, darkBg }) => {
          const isActive = status === s;
          return (
            <Chip
              key={s}
              label={`${countByStatus(s)} ${label}`}
              size="small"
              onClick={() => setParam('status', isActive ? '' : s)}
              sx={{
                bgcolor: isActive ? color : (isDark ? darkBg : bg),
                color: isActive ? '#fff' : (isDark ? '#E8EAF0' : color),
                fontWeight: 600,
                borderRadius: 6,
                cursor: 'pointer',
                border: 'none',
                transition: 'all 0.15s ease',
                boxShadow: isActive ? `0 2px 8px ${color}44` : 'none',
              }}
            />
          );
        })}
      </Box>

      {/* Search + clear */}
      <Card elevation={0} sx={{ mb: 3, p: 2.5 }}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          <TextField
            placeholder="Search by customer or merchant..."
            value={search}
            onChange={(e) => setParam('search', e.target.value)}
            size="small"
            sx={{ minWidth: 280 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search fontSize="small" sx={{ color: 'text.secondary' }} />
                </InputAdornment>
              ),
            }}
          />
          {(search || status) && (
            <Button
              size="small"
              variant="text"
              onClick={() => setSearchParams({})}
              sx={{ color: 'text.secondary', borderRadius: 2 }}
            >
              Clear filters
            </Button>
          )}
        </Box>
      </Card>

      <Card elevation={0}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Customer</TableCell>
                <TableCell>Merchant</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Reason</TableCell>
                <TableCell>Status</TableCell>
                <TableCell />
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 7 }).map((__, j) => (
                      <TableCell key={j}><Skeleton variant="text" width="80%" /></TableCell>
                    ))}
                  </TableRow>
                ))
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} sx={{ border: 'none', p: 0 }}>
                    <EmptyState
                      icon={AdminPanelSettings}
                      title="No disputes found"
                      description="There are no disputes matching your current filters."
                    />
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((d) => (
                  <TableRow
                    key={d.id}
                    hover
                    onClick={() => navigate(`/disputes/${d.id}`, { state: { from: 'admin' } })}
                    sx={{ cursor: 'pointer', '&:last-child td': { border: 0 } }}
                  >
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">{formatDate(d.createdAt)}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={500}>{d.user?.name || '—'}</Typography>
                      <Typography variant="caption" color="text.secondary">{d.user?.email}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{d.transaction?.merchant || '—'}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>
                        {d.transaction ? formatAmount(d.transaction.amount) : '—'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{REASON_LABELS[d.reason] || d.reason}</Typography>
                    </TableCell>
                    <TableCell>
                      <StatusChip status={d.status as DisputeStatus} />
                    </TableCell>
                    <TableCell align="right">
                      <ChevronRight fontSize="small" sx={{ color: 'text.secondary' }} />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        {!loading && disputes.length > 0 && (
          <TablePagination
            component="div"
            count={total}
            page={page}
            rowsPerPage={rowsPerPage}
            onPageChange={(_, p) => setParam('page', String(p))}
            onRowsPerPageChange={(e) => setParam('limit', e.target.value)}
            rowsPerPageOptions={[10, 20, 50]}
            sx={{ borderTop: '1px solid', borderColor: 'divider' }}
          />
        )}
      </Card>
    </AppLayout>
  );
}
