import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Card, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Typography, Skeleton, TablePagination,
  TextField, MenuItem, Button,
} from '@mui/material';
import { Gavel, ChevronRight } from '@mui/icons-material';
import AppLayout from '../components/layout/AppLayout';
import PageHeader from '../components/common/PageHeader';
import StatusChip from '../components/common/StatusChip';
import EmptyState from '../components/common/EmptyState';
import { disputeService } from '../services/dispute.service';
import type { Dispute, DisputeStatus } from '../types';

const STATUSES = ['PENDING', 'UNDER_REVIEW', 'RESOLVED', 'REJECTED'];

const REASON_LABELS: Record<string, string> = {
  UNAUTHORISED: 'Unauthorised transaction',
  DUPLICATE: 'Duplicate charge',
  INCORRECT_AMOUNT: 'Incorrect amount',
  SERVICE_NOT_RECEIVED: 'Service not received',
  OTHER: 'Other',
};

export default function DisputesPage() {
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
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

  useEffect(() => { fetchDisputes(); }, [fetchDisputes]);

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' });

  const formatAmount = (amount: string) =>
    new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' }).format(Number(amount));

  return (
    <AppLayout>
      <PageHeader
        title="My Disputes"
        subtitle="Track the status of your submitted disputes"
      />

      {/* Filter */}
      <Card elevation={0} sx={{ mb: 3, p: 2.5 }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
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
                <TableCell>Merchant</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Reason</TableCell>
                <TableCell>Status</TableCell>
                <TableCell />
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 6 }).map((__, j) => (
                      <TableCell key={j}><Skeleton variant="text" width="80%" /></TableCell>
                    ))}
                  </TableRow>
                ))
              ) : disputes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} sx={{ border: 'none', p: 0 }}>
                    <EmptyState
                      icon={Gavel}
                      title="No disputes yet"
                      description="When you raise a dispute on a transaction it will appear here."
                      action={
                        <Button variant="outlined" size="small" onClick={() => navigate('/transactions')} sx={{ borderRadius: 2 }}>
                          View transactions
                        </Button>
                      }
                    />
                  </TableCell>
                </TableRow>
              ) : (
                disputes.map((d) => (
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
                      <Typography variant="body2" fontWeight={500}>
                        {d.transaction?.merchant || '—'}
                      </Typography>
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
