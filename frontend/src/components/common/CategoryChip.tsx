import { Chip, useTheme } from '@mui/material';
import type { Category } from '../../types';

const CATEGORY_CONFIG: Record<Category, { label: string; color: string; bg: string; darkBg: string }> = {
  FOOD:          { label: 'Food',          color: '#D97706', bg: '#FEF3C7', darkBg: '#7A4E10' },
  TRANSPORT:     { label: 'Transport',     color: '#2563EB', bg: '#EFF6FF', darkBg: '#1E3A6B' },
  SHOPPING:      { label: 'Shopping',      color: '#7C3AED', bg: '#F5F3FF', darkBg: '#3B1F6B' },
  ENTERTAINMENT: { label: 'Entertainment', color: '#0891B2', bg: '#ECFEFF', darkBg: '#0D4A5C' },
  UTILITIES:     { label: 'Utilities',     color: '#16A34A', bg: '#DCFCE7', darkBg: '#1A4D35' },
  OTHER:         { label: 'Other',         color: '#6B7280', bg: '#F3F4F6', darkBg: '#374151' },
};

interface Props {
  category: Category;
}

export default function CategoryChip({ category }: Props) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const config = CATEGORY_CONFIG[category];

  return (
    <Chip
      label={config.label}
      size="small"
      sx={{
        bgcolor: isDark ? config.darkBg : config.bg,
        color: isDark ? '#E8EAF0' : config.color,
        fontWeight: 600,
        borderRadius: 6,
        fontSize: '0.72rem',
        border: isDark ? 'none' : `1px solid ${config.color}33`,
        '& .MuiChip-label': { px: 1.5 },
      }}
    />
  );
}
