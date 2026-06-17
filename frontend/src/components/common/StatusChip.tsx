import { Chip, useTheme } from '@mui/material';
import type { DisputeStatus } from '../../types';
import { tokens } from '../../theme/tokens';

const STATUS_CONFIG: Record<DisputeStatus, { label: string; color: string; bg: string; darkBg: string }> = {
  PENDING:      { label: 'Pending',      color: tokens.status.pending,      bg: tokens.status.pendingBg,      darkBg: '#7A4E10' },
  UNDER_REVIEW: { label: 'Under Review', color: tokens.status.underReview,  bg: tokens.status.underReviewBg,  darkBg: '#2D3F6B' },
  RESOLVED:     { label: 'Resolved',     color: tokens.status.resolved,     bg: tokens.status.resolvedBg,     darkBg: '#1A4D35' },
  REJECTED:     { label: 'Rejected',     color: tokens.status.rejected,     bg: tokens.status.rejectedBg,     darkBg: '#5C1F1F' },
};

interface Props {
  status: DisputeStatus;
  size?: 'small' | 'medium';
}

export default function StatusChip({ status, size = 'small' }: Props) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const config = STATUS_CONFIG[status];

  return (
    <Chip
      label={config.label}
      size={size}
      sx={{
        bgcolor: isDark ? config.darkBg : config.bg,
        color: isDark ? '#E8EAF0' : config.color,
        fontWeight: 600,
        borderRadius: 6,
        fontSize: size === 'small' ? '0.72rem' : '0.8rem',
        border: 'none',
        '& .MuiChip-label': { px: 1.5 },
      }}
    />
  );
}
