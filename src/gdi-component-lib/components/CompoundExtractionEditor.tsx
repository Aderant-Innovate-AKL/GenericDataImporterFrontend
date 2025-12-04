import { useState } from 'react';

import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import { Box, TextField, Typography, IconButton, Tooltip } from '@mui/material';

import type { CompoundExtraction } from '../types';

interface CompoundExtractionEditorProps {
  sourceValue: string | number | null;
  extraction: CompoundExtraction;
  onUpdate: (
    newValue: string | number | null,
    highlightStart?: number,
    highlightEnd?: number,
  ) => void;
}

/**
 * Allows user to edit a compound extraction value.
 * Shows the source text and allows re-highlighting the extracted portion.
 */
export default function CompoundExtractionEditor({
  sourceValue,
  extraction,
  onUpdate,
}: CompoundExtractionEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(String(extraction.extractedValue ?? ''));

  const sourceText = String(sourceValue ?? '');
  const hasHighlight =
    extraction.highlightStart !== undefined && extraction.highlightEnd !== undefined;

  const handleSave = () => {
    onUpdate(editValue);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(String(extraction.extractedValue ?? ''));
    setIsEditing(false);
  };

  // Get confidence color based on score
  const getConfidenceColor = (score?: number): string => {
    if (score === undefined) return 'action.hover';
    if (score >= 8) return 'success.light';
    if (score >= 5) return 'warning.light';
    return 'error.light';
  };

  // Render highlighted source text if available
  const renderHighlightedSource = () => {
    if (!hasHighlight) {
      return (
        <Typography
          variant="caption"
          sx={{ fontFamily: 'monospace', color: 'text.secondary' }}
        >
          {sourceText}
        </Typography>
      );
    }

    const before = sourceText.substring(0, extraction.highlightStart!);
    const highlighted = sourceText.substring(
      extraction.highlightStart!,
      extraction.highlightEnd!,
    );
    const after = sourceText.substring(extraction.highlightEnd!);

    return (
      <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>
        <span style={{ color: '#666' }}>{before}</span>
        <span
          style={{
            backgroundColor: extraction.isUserModified
              ? '#e3f2fd'
              : getConfidenceColor(extraction.confidence.value),
            fontWeight: 'bold',
            padding: '2px 4px',
            borderRadius: '2px',
          }}
        >
          {highlighted}
        </span>
        <span style={{ color: '#666' }}>{after}</span>
      </Typography>
    );
  };

  if (isEditing) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, p: 1 }}>
        <TextField
          size="small"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          fullWidth
          autoFocus
        />
        <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-end' }}>
          <IconButton size="small" onClick={handleSave} color="primary">
            <CheckIcon fontSize="small" />
          </IconButton>
          <IconButton size="small" onClick={handleCancel}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 1 }}>
      {/* Source text with highlight */}
      <Box
        sx={{
          p: 1,
          bgcolor: 'background.default',
          borderRadius: 1,
          mb: 1,
          fontSize: '0.75rem',
        }}
      >
        {renderHighlightedSource()}
      </Box>

      {/* Extracted value */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography
          variant="body2"
          sx={{
            flex: 1,
            bgcolor: extraction.isUserModified
              ? 'action.hover'
              : getConfidenceColor(extraction.confidence.value),
            p: 0.5,
            borderRadius: 1,
            fontSize: '0.875rem',
          }}
        >
          {extraction.extractedValue ?? 'N/A'}
        </Typography>
        <Tooltip title="Edit extraction">
          <IconButton size="small" onClick={() => setIsEditing(true)}>
            <EditIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );
}
