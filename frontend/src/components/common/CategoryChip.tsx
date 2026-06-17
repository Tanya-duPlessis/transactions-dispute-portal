import { Chip } from '@mui/material';
import type { Category } from '../../types';

const CATEGORY_CONFIG: Record<Category, { label: string; color: string; bg: string }> = {
  FOOD:          { label: 'Food',          color: '#D97706', bg: '#FEF3C7' },
  TRANSPORT:     { label: 'Transport',     color: '#2563EB', bg: '#EFF6FF' },
  SHOPPING:      { label: 'Shopping',      color: '#7C3AED', bg: '#F5F3FF' },
  ENTERTAINMENT: { label: 'Entertainment', color: '#0891B2', bg: '#ECFEFF' },
  UTILITIES:     { label: 'Utilities',     color: '#16A34A', bg: '#DCFCE7' },
  OTHER:         { label: 'Other',         color: '#6B7280', bg: '#F3F4F6' },
};

interface Props {
  category: Category;
}

export default function CategoryChip({ category }: Props) {
  const config = CATEGORY_CONFIG[category];
  return (
    <Chip
      label={config.label}
      size="small"
      sx={{
        bgcolor: config.bg,
        color: config.color,
        fontWeight: 600,
        borderRadius: 6,
        fontSize: '0.72rem',
        border: `1px solid ${config.color}33`,
        '& .MuiChip-label': { px: 1.5 },
      }}
    />
  );
}
