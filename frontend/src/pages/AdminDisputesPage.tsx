import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Card, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Typography, Skeleton, TablePagination,
  TextField, MenuItem, Chip, InputAdornment,
} from '@mui/material';
import { Search, ChevronRight, AdminPanelSettings } from '@mui/icons-material';
import AppLayout from '../components/layout/AppLayout';
import PageHeader from '../components/common/PageHeader';
import StatusChip from '../components/common/StatusChip';
import EmptyState from '../components/common/EmptyState';
import { disputeService } from '../services/dispute.service';
import type { Dispute, DisputeStatus } from '../types';

const STATUSES = ['PENDING', 'UNDER_REVIEW', 'RESOLVED', 'REJECTED'];

const REASON_LABELS: Record<string, string> = {
  UNAUTHORISED: 'Unauthorised',
  DUPLICATE: 'Duplicate',
  INCORRECT_AMOUNT: 'Incorrect amount',
  SERVICE_NOT_RECEIVED: 'Not received',
  OTHER: 'Other',
};

const STATUS_COUNTS_CONFIG = [
  { status: 'PENDING', color: '#D97706', bg: '#FEF3C7' },
  { status: 'UNDER_REVIEW', color: '#7C3AED', bg: '#F5F3FF' },
  { status: 'RESOLVED', color: '#16A34A', bg: '#DCFCE7' },
  { status: 'REJECTED', color: '#DC2626', bg: '#FEE2E2' },
];

export default function AdminDisputesPage() {
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [allDisputes, setAllDisputes] = useState<Dispute[]>([]);
  const navigate = useNavigate();

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
        {STATUS_COUNTS_CONFIG.map(({ status: s, color, bg }) => (
          <Chip
            key={s}
            label={`${countByStatus(s)} ${s.charAt(0) + s.slice(1).toLowerCase().replace('_', ' ')}`}
            size="small"
            onClick={() => setStatus(status === s ? '' : s)}
            sx={{
              bgcolor: status === s ? color : bg,
              color: status === s ? '#fff' : color,
              fontWeight: 600,
              borderRadius: 6,
              cursor: 'pointer',
              border: `1px solid ${color}33`,
              transition: 'all 0.15s ease',
            }}
          />
        ))}
      </Box>

      {/* Filters */}
      <Card elevation={0} sx={{ mb: 3, p: 2.5 }}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          <TextField
            placeholder="Search by customer or merchant..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
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
          <TextField
            select
            label="Status"
            value={status}
            onChange={(e) => { setStatus(e.target.value); setPage(0); }}
            size="small"
            sx={{ minWidth: 180 }}
          >
            <MenuItem value="">All statuses</MenuItem>
            {STATUSES.map((s) => (
              <MenuItem key={s} value={s}>
                {s.charAt(0) + s.slice(1).toLowerCase().replace('_', ' ')}
              </MenuItem>
            ))}
          </TextField>
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
                    onClick={() => navigate(`/disputes/${d.id}`)}
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
            onPageChange={(_, p) => setPage(p)}
            onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value)); setPage(0); }}
            rowsPerPageOptions={[10, 20, 50]}
            sx={{ borderTop: '1px solid', borderColor: 'divider' }}
          />
        )}
      </Card>
    </AppLayout>
  );
}
