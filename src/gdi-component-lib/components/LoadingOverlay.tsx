import {
  Box,
  CircularProgress,
  LinearProgress,
  Typography,
  Button,
  Stack,
} from '@mui/material';

import type { OperationProgress } from '../types';

interface LoadingOverlayProps {
  message?: string;
  progress?: OperationProgress;
  onCancel?: () => void;
}

export default function LoadingOverlay({
  message,
  progress,
  onCancel,
}: LoadingOverlayProps) {
  const percent = progress?.percentComplete ?? undefined;
  const label = progress?.phase ?? 'loading';
  return (
    <Box
      sx={{
        position: 'absolute',
        inset: 0,
        bgcolor: 'rgba(255,255,255,0.85)',
        backdropFilter: 'blur(1px)',
      }}
      role="status"
      aria-live="polite"
    >
      <Stack
        sx={{ height: '100%' }}
        alignItems="center"
        justifyContent="center"
        spacing={2}
      >
        <CircularProgress />
        <Typography variant="body1" aria-label="loading-message">
          {message ?? 'Loading...'}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Phase: {label}
        </Typography>
        {typeof percent === 'number' && (
          <LinearProgress variant="determinate" value={percent} sx={{ width: 300 }} />
        )}
        {onCancel && (
          <Button variant="text" color="inherit" onClick={onCancel} sx={{ mt: 1 }}>
            Cancel
          </Button>
        )}
      </Stack>
    </Box>
  );
}
