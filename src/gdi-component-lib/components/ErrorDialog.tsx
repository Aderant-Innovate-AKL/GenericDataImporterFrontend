import { Alert, Box, Button, Stack } from '@mui/material';

interface ErrorDialogProps {
  message: string;
  onClose: () => void;
}

export default function ErrorDialog({ message, onClose }: ErrorDialogProps) {
  return (
    <Box sx={{ p: 2 }}>
      <Stack spacing={2}>
        <Alert severity="error">{message}</Alert>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button onClick={onClose}>Dismiss</Button>
        </Box>
      </Stack>
    </Box>
  );
}
