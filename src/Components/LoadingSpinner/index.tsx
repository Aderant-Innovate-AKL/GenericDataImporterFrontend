import { Box, CircularProgress } from '@mui/material';

/**
 * Loading Spinner Component
 * Displays a centered loading spinner
 */
interface LoadingSpinnerProps {
  size?: number;
  fullScreen?: boolean;
}

export default function LoadingSpinner({
  size = 40,
  fullScreen = false,
}: LoadingSpinnerProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: fullScreen ? '100vh' : '200px',
      }}
      data-testid="loading-spinner"
    >
      <CircularProgress size={size} />
    </Box>
  );
}
