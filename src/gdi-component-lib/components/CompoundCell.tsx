import { Box, Tooltip, Typography, Chip } from '@mui/material';

import type { CompoundColumn, CompoundExtraction } from '../types';

interface CompoundCellProps {
  column: CompoundColumn;
  onOverride?: (targetField: string, newValue: string | number | null) => void;
}

/**
 * Displays a compound column cell with highlighted extractions.
 * Shows the original source value with highlighted segments for each extraction.
 * Supports right-click override (future enhancement).
 */
export default function CompoundCell({ column }: CompoundCellProps) {
  const sourceText = String(column.sourceValue ?? '');

  // Helper to get confidence color
  const getConfidenceColor = (score: number): string => {
    if (score >= 8) return 'success.light';
    if (score >= 5) return 'warning.light';
    return 'error.light';
  };

  // Helper to get confidence label
  const getConfidenceLabel = (score: number): string => {
    if (score >= 8) return `High confidence (${score}/10)`;
    if (score >= 5) return `Medium confidence (${score}/10)`;
    return `Low confidence (${score}/10)`;
  };

  return (
    <Box sx={{ p: 1 }}>
      {/* Source value with highlights */}
      <Box
        sx={{
          p: 1,
          bgcolor: 'background.paper',
          borderRadius: 1,
          mb: 1,
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Typography
          variant="body2"
          sx={{ fontFamily: 'monospace', fontSize: '0.875rem' }}
        >
          {sourceText}
        </Typography>
      </Box>

      {/* Extractions */}
      {column.extractions.map((extraction: CompoundExtraction, idx: number) => (
        <Box key={idx} sx={{ mb: 0.5 }}>
          <Tooltip
            title={getConfidenceLabel(extraction.confidence.value)}
            placement="top"
            arrow
          >
            <Chip
              label={`${extraction.targetField}: ${extraction.extractedValue ?? 'N/A'}`}
              size="small"
              sx={{
                bgcolor: extraction.isUserModified
                  ? 'action.hover'
                  : getConfidenceColor(extraction.confidence.value),
                '&:hover': { opacity: 0.8 },
              }}
            />
          </Tooltip>
        </Box>
      ))}
    </Box>
  );
}
