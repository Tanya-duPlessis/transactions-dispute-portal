import { Chip } from '@mui/material';
import type { DisputeStatus } from '../../types';
import { tokens } from '../../theme/tokens';

const STATUS_CONFIG: Record<DisputeStatus, { label: string; color: string; bg: string }> = {
  PENDING: { label: 'Pending', color: tokens.status.pending, bg: tokens.status.pendingBg },
  UNDER_REVIEW: { label: 'Under Review', color: tokens.status.underReview, bg: tokens.status.underReviewBg },
  RESOLVED: { label: 'Resolved', color: tokens.status.resolved, bg: tokens.status.resolvedBg },
  REJECTED: { label: 'Rejected', color: tokens.status.rejected, bg: tokens.status.rejectedBg },
};

interface Props {
  status: DisputeStatus;
  size?: 'small' | 'medium';
}

export default function StatusChip({ status, size = 'small' }: Props) {
  const config = STATUS_CONFIG[status];
  return (
    <Chip
      label={config.label}
      size={size}
      sx={{
        bgcolor: config.bg,
        color: config.color,
        fontWeight: 600,
        borderRadius: 6,
        fontSize: size === 'small' ? '0.72rem' : '0.8rem',
        border: `1px solid ${config.color}33`,
        '& .MuiChip-label': { px: 1.5 },
      }}
    />
  );
}
