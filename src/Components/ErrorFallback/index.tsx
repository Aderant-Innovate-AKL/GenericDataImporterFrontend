import { Box, Typography } from '@mui/material';

/**
 * ErrorBoundary Fallback Component
 * This component is displayed when an error occurs in the component tree
 *
 * TODO: Enhance this with better error reporting and recovery options
 */
interface ErrorFallbackProps {
  error: Error;
  resetError?: () => void;
}

export default function ErrorFallback({ error }: ErrorFallbackProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        p: 3,
      }}
      data-testid="error-fallback"
    >
      <Typography variant="h4" component="h1" gutterBottom color="error">
        Oops! Something went wrong
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
        We're sorry for the inconvenience. Please try refreshing the page.
      </Typography>
      {process.env.NODE_ENV === 'development' && (
        <Box
          sx={{
            mt: 2,
            p: 2,
            bgcolor: 'grey.100',
            borderRadius: 1,
            maxWidth: '600px',
            overflow: 'auto',
          }}
        >
          <Typography variant="caption" component="pre" sx={{ whiteSpace: 'pre-wrap' }}>
            {error.message}
          </Typography>
        </Box>
      )}
    </Box>
  );
}
