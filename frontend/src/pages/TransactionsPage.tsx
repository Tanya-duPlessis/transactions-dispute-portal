import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Box, Card, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, TextField, MenuItem, Button,
  Typography, Skeleton, TablePagination, InputAdornment,
  IconButton, Tooltip, Chip,
} from '@mui/material';
import { Search, FilterAlt, ClearAll, Gavel, ChevronRight } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout';
import PageHeader from '../components/common/PageHeader';
import StatusChip from '../components/common/StatusChip';
import CategoryChip from '../components/common/CategoryChip';
import EmptyState from '../components/common/EmptyState';
import DisputeModal from '../components/disputes/DisputeModal';
import { transactionService } from '../services/transaction.service';
import type { Transaction, Category, DisputeStatus } from '../types';

const CATEGORIES = ['FOOD', 'TRANSPORT', 'SHOPPING', 'ENTERTAINMENT', 'UTILITIES', 'OTHER'];

export default function TransactionsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [total, setTotal] = useState(0);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [disputeModalOpen, setDisputeModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // All filter state lives in the URL
  const page = parseInt(searchParams.get('page') || '0');
  const rowsPerPage = parseInt(searchParams.get('limit') || '20');
  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || '';
  const dateFrom = searchParams.get('dateFrom') || '';
  const dateTo = searchParams.get('dateTo') || '';

  const setParam = (key: string, value: string) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (value) next.set(key, value); else next.delete(key);
      if (key !== 'page') next.delete('page');
      return next;
    });
  };

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    try {
      const result = await transactionService.list({
        page: page + 1,
        limit: rowsPerPage,
        search: search || undefined,
        category: category || undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
      });
      setTransactions(result.data);
      setTotal(result.total);
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, search, category, dateFrom, dateTo]);

  useEffect(() => { fetchTransactions(); }, [fetchTransactions]);

  const handleClearFilters = () => setSearchParams({});

  const hasFilters = search || category || dateFrom || dateTo;

  const formatAmount = (amount: string) =>
    new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' }).format(Number(amount));

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <AppLayout>
      <PageHeader
        title="Transactions"
        subtitle="View and manage your recent transactions"
      />

      {/* Filters */}
      <Card elevation={0} sx={{ mb: 3, p: 2.5 }}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          <TextField
            placeholder="Search merchant..."
            value={search}
            onChange={(e) => setParam('search', e.target.value)}
            size="small"
            sx={{ minWidth: 220 }}
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
            label="Category"
            value={category}
            onChange={(e) => setParam('category', e.target.value)}
            size="small"
            sx={{ minWidth: 160 }}
          >
            <MenuItem value="">All categories</MenuItem>
            {CATEGORIES.map((c) => (
              <MenuItem key={c} value={c}>{c.charAt(0) + c.slice(1).toLowerCase()}</MenuItem>
            ))}
          </TextField>
          <TextField
            label="From"
            type="date"
            value={dateFrom}
            onChange={(e) => setParam('dateFrom', e.target.value)}
            size="small"
            InputLabelProps={{ shrink: true }}
            sx={{ minWidth: 150 }}
          />
          <TextField
            label="To"
            type="date"
            value={dateTo}
            onChange={(e) => setParam('dateTo', e.target.value)}
            size="small"
            InputLabelProps={{ shrink: true }}
            sx={{ minWidth: 150 }}
          />
          {hasFilters && (
            <Tooltip title="Clear all filters">
              <IconButton size="small" onClick={handleClearFilters} sx={{ color: 'text.secondary' }}>
                <ClearAll fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          {hasFilters && (
            <Chip
              icon={<FilterAlt sx={{ fontSize: '14px !important' }} />}
              label={`${total} result${total !== 1 ? 's' : ''}`}
              size="small"
              sx={{ bgcolor: 'primary.light', color: 'primary.main', fontWeight: 600 }}
            />
          )}
        </Box>
      </Card>

      {/* Table */}
      <Card elevation={0}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Merchant</TableCell>
                <TableCell>Category</TableCell>
                <TableCell align="right">Amount</TableCell>
                <TableCell>Dispute</TableCell>
                <TableCell align="right">Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 6 }).map((__, j) => (
                      <TableCell key={j}><Skeleton variant="text" width="80%" /></TableCell>
                    ))}
                  </TableRow>
                ))
              ) : transactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} sx={{ border: 'none', p: 0 }}>
                    <EmptyState
                      icon={FilterAlt}
                      title="No transactions found"
                      description={hasFilters ? 'Try adjusting your filters.' : 'Your transactions will appear here.'}
                      action={hasFilters ? (
                        <Button variant="outlined" size="small" onClick={handleClearFilters} sx={{ borderRadius: 2 }}>
                          Clear filters
                        </Button>
                      ) : undefined}
                    />
                  </TableCell>
                </TableRow>
              ) : (
                transactions.map((tx) => (
                  <TableRow key={tx.id} hover sx={{ '&:last-child td': { border: 0 } }}>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">{formatDate(tx.date)}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={500}>{tx.merchant}</Typography>
                    </TableCell>
                    <TableCell>
                      <CategoryChip category={tx.category as Category} />
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" fontWeight={600}>{formatAmount(tx.amount)}</Typography>
                    </TableCell>
                    <TableCell>
                      {tx.dispute ? (
                        <Tooltip title="View dispute details">
                          <Box
                            onClick={() => navigate(`/disputes/${tx.dispute!.id}`)}
                            sx={{ display: 'inline-flex', cursor: 'pointer' }}
                          >
                            <StatusChip status={tx.dispute.status as DisputeStatus} />
                          </Box>
                        </Tooltip>
                      ) : (
                        <Typography variant="caption" color="text.secondary">—</Typography>
                      )}
                    </TableCell>
                    <TableCell align="right">
                      {tx.dispute ? (
                        <Tooltip title="View dispute details">
                          <Button
                            size="small"
                            variant="text"
                            endIcon={<ChevronRight sx={{ fontSize: '16px !important' }} />}
                            onClick={() => navigate(`/disputes/${tx.dispute!.id}`)}
                            sx={{
                              borderRadius: 2,
                              fontSize: '0.75rem',
                              py: 0.5,
                              color: 'text.secondary',
                              '&:hover': { color: 'primary.main', bgcolor: 'transparent' },
                            }}
                          >
                            View dispute
                          </Button>
                        </Tooltip>
                      ) : (
                        <Tooltip title="Raise a dispute">
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<Gavel sx={{ fontSize: '14px !important' }} />}
                            onClick={() => setSelectedTransaction(tx) || setDisputeModalOpen(true)}
                            sx={{
                              borderRadius: 2,
                              fontSize: '0.75rem',
                              py: 0.5,
                              borderColor: 'divider',
                              color: 'text.secondary',
                              '&:hover': { borderColor: 'primary.main', color: 'primary.main' },
                            }}
                          >
                            Dispute
                          </Button>
                        </Tooltip>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        {!loading && transactions.length > 0 && (
          <TablePagination
            component="div"
            count={total}
            page={page}
            rowsPerPage={rowsPerPage}
            onPageChange={(_, p) => setParam('page', String(p))}
            onRowsPerPageChange={(e) => { setParam('limit', e.target.value); }}
            rowsPerPageOptions={[10, 20, 50]}
            sx={{ borderTop: '1px solid', borderColor: 'divider' }}
          />
        )}
      </Card>

      <DisputeModal
        open={disputeModalOpen}
        transaction={selectedTransaction}
        onClose={() => setDisputeModalOpen(false)}
        onSuccess={() => { setDisputeModalOpen(false); fetchTransactions(); }}
      />
    </AppLayout>
  );
}
