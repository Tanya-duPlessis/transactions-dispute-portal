import { Box, Typography } from '@mui/material';
import type { SvgIconComponent } from '@mui/icons-material';

interface Props {
  icon: SvgIconComponent;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export default function EmptyState({ icon: Icon, title, description, action }: Props) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        py: 10,
        px: 4,
        textAlign: 'center',
      }}
    >
      <Box
        sx={{
          width: 64,
          height: 64,
          borderRadius: 3,
          bgcolor: 'background.default',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mb: 3,
        }}
      >
        <Icon sx={{ fontSize: 32, color: 'text.secondary' }} />
      </Box>
      <Typography variant="h6" fontWeight={600} gutterBottom>
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 360, mb: action ? 3 : 0 }}>
        {description}
      </Typography>
      {action}
    </Box>
  );
}
