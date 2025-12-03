import { Box, Tooltip, Typography } from '@mui/material';

import type { ConfidenceScore } from '../types';

interface ColumnHeaderProps {
  title: string;
  confidence?: ConfidenceScore;
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
  const tooltipTitle = confidence
    ? `Confidence: ${confidence.level} (${confidence.value}/10)`
    : '';
  return (
    <Tooltip title={tooltipTitle} placement="top" arrow>
      <Box
        sx={{
          p: 1,
          bgcolor: bg,
          borderRadius: 1,
          '&:hover': { filter: 'brightness(0.98)' },
        }}
        role="columnheader"
        aria-label={confidence ? `${title} (${confidence.level})` : title}
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
