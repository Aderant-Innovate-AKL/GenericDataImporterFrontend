import { useCallback, useState } from 'react';

import { Box, Typography, Button } from '@mui/material';

import { validateFile } from '../utils/fileValidator';

/**
 * FileDropzone component
 * Drag-and-drop and click-to-select file input with client-side validation.
 */
interface FileDropzoneProps {
  maxFileSize?: number;
  acceptsSpreadsheets?: boolean;
  onFileSelected?: (file: File) => void;
  onError?: (error: { code: string; message: string }) => void;
  className?: string;
}

export default function FileDropzone({
  maxFileSize = 10 * 1024 * 1024,
  acceptsSpreadsheets = true,
  onFileSelected,
  onError,
  className,
}: FileDropzoneProps) {
  const [isHover, setHover] = useState(false);

  const handleFiles = useCallback(
    async (files: FileList | null) => {
      const file = files && files[0];
      if (!file) return;
      const result = await validateFile(file, maxFileSize, acceptsSpreadsheets);
      if (!result.ok) {
        onError?.(result.error!);
        return;
      }
      onFileSelected?.(file);
    },
    [maxFileSize, acceptsSpreadsheets, onFileSelected, onError],
  );

  return (
    <Box
      className={className}
      sx={{
        border: '2px dashed',
        borderColor: isHover ? 'primary.main' : 'divider',
        borderRadius: 2,
        p: 3,
        bgcolor: isHover ? 'action.hover' : 'background.paper',
        textAlign: 'center',
        transition: 'background-color 120ms ease',
        outline: 'none',
        '&:focus-visible': {
          boxShadow: (theme) => `0 0 0 3px ${theme.palette.primary.main}`,
        },
        '&:hover': {
          borderColor: 'primary.main',
        },
      }}
      role="button"
      aria-label="File dropzone"
      tabIndex={0}
      onDragOver={(e) => {
        e.preventDefault();
        setHover(true);
      }}
      onDragLeave={() => setHover(false)}
      onDrop={(e) => {
        e.preventDefault();
        setHover(false);
        handleFiles(e.dataTransfer.files);
      }}
    >
      <Typography variant="body1" sx={{ mb: 2 }}>
        Drag & drop a file here or select
      </Typography>
      <Button variant="contained" component="label" aria-label="Choose file">
        Choose File
        <input hidden type="file" onChange={(e) => handleFiles(e.target.files)} />
      </Button>
      <Typography
        variant="caption"
        sx={{ display: 'block', mt: 1, color: 'text.secondary' }}
      >
        Max size: {Math.round(maxFileSize / (1024 * 1024))}MB
      </Typography>
    </Box>
  );
}
