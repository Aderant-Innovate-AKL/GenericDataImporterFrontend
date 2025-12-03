import { Box, Tooltip, Typography } from '@mui/material';

import type { ConfidenceInfo } from '../types';

interface ColumnHeaderProps {
  title: string;
  confidence?: ConfidenceInfo;
  isUserModified?: boolean;
}

export default function ColumnHeader({
  title,
  confidence,
  isUserModified,
}: ColumnHeaderProps) {
  const bg =
    !isUserModified && confidence
      ? confidenceBackground(confidence.level)
      : 'background.paper';
  return (
    <Tooltip title={confidence?.label ?? ''} placement="top" arrow>
      <Box
        sx={{
          p: 1,
          bgcolor: bg,
          borderRadius: 1,
          '&:hover': { filter: 'brightness(0.98)' },
        }}
        role="columnheader"
        aria-label={confidence ? `${title} (${confidence.label})` : title}
      >
        <Typography variant="subtitle2">{title}</Typography>
      </Box>
    </Tooltip>
  );
}

function confidenceBackground(level?: string) {
  switch (level) {
    case 'high':
      return 'success.light';
    case 'good':
      return 'success.main';
    case 'medium':
      return 'warning.light';
    case 'low':
      return 'warning.main';
    case 'very-low':
      return 'error.light';
    default:
      return 'background.paper';
  }
}
