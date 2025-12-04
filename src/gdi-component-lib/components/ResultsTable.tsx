import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';

import type {
  ExtractionResult,
  ExtractionContext,
  CategorizedRow,
  FieldMappings,
} from '../types';
import ColumnHeader from './ColumnHeader';
import CompoundCell from './CompoundCell';
import MappingSelector from './MappingSelector';

interface ResultsTableProps {
  result: ExtractionResult;
  context: ExtractionContext;
  columnMappings: Record<string, string | null>;
  modifiedColumns: Set<string>;
  onMappingChange: (
    mappings: Record<string, string | null>,
    sourceColumn: string,
  ) => void;
  onConfirm?: (finalMappings: FieldMappings) => void;
  onCancel?: () => void;
}

/**
 * ResultsTable displays extraction results in a categorized structure:
 * - Direct mappings (simple column renames)
 * - Compound extractions (LLM-extracted values from compound columns)
 * - Unmapped columns (columns not mapped to any target field)
 */
export default function ResultsTable({
  result,
  context,
  columnMappings,
  modifiedColumns,
  onMappingChange,
}: ResultsTableProps) {
  const fields = context.fields;

  // Get initial row data for setting up state (must be before any hooks)
  const sampleRow: CategorizedRow | undefined = result?.data?.[0];
  const directColumns = Object.keys(sampleRow?.direct || {});
  const compoundColumns = Object.keys(sampleRow?.compound || {});
  const unmappedColumns = Object.keys(sampleRow?.unmapped || {});
  const hasAnyColumns =
    directColumns.length > 0 || compoundColumns.length > 0 || unmappedColumns.length > 0;

  const handleMappingChange = (sourceColumn: string, targetField: string | null) => {
    onMappingChange(
      {
        ...columnMappings,
        [sourceColumn]: targetField,
      },
      sourceColumn,
    );
  };

  // Helper to get confidence color based on score
  const getConfidenceColor = (confidence?: number): string | undefined => {
    if (confidence === undefined) return undefined;
    if (confidence >= 8) return 'success.light'; // High confidence: green
    if (confidence >= 5) return 'warning.light'; // Medium confidence: yellow/orange
    return 'error.light'; // Low confidence: red
  };

  // Get fields that are already mapped (to disable in other selectors)
  const mappedFields = new Set(
    Object.values(columnMappings).filter((v): v is string => v !== null),
  );

  // NOW we can do early returns after all hooks are set up
  if (!result?.data || result.data.length === 0) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="body1" color="text.secondary">
          No data to display
        </Typography>
      </Box>
    );
  }

  if (!hasAnyColumns) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="body1" color="error">
          No columns found in extraction result
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          The backend returned {result.data.length} row(s) but no column data.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ overflowX: 'auto', p: 2 }}>
      {/* Metadata summary */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2" gutterBottom>
          Extraction Summary
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Total rows:{' '}
          {result.metadata.rowsProcessed ||
            result.metadata.totalRows ||
            result.data.length}{' '}
          | Direct:{' '}
          {result.metadata.extractionSummary?.directMappings ||
            result.metadata.directMappings ||
            0}{' '}
          | Compound:{' '}
          {result.metadata.extractionSummary?.compoundExtractions ||
            result.metadata.compoundColumns ||
            0}{' '}
          | Unmapped:{' '}
          {result.metadata.extractionSummary?.unmappedColumns?.length ||
            result.metadata.unmappedColumns ||
            0}
        </Typography>
      </Box>

      <Table size="small" sx={{ minWidth: 650 }}>
        <TableHead>
          <TableRow>
            {/* Direct column headers */}
            {directColumns.map((col) => {
              const mapping = sampleRow?.direct[col];
              const isModified = modifiedColumns.has(col);
              const confidenceColor = !isModified
                ? getConfidenceColor(mapping?.confidence)
                : undefined;

              return (
                <TableCell
                  key={`direct-${col}`}
                  sx={{
                    bgcolor: confidenceColor || 'primary.lighter',
                    fontWeight: 'bold',
                    transition: 'background-color 0.3s ease',
                  }}
                >
                  <ColumnHeader title={col} />
                  <MappingSelector
                    value={columnMappings[col] || null}
                    fields={fields}
                    disabledFieldIds={Array.from(mappedFields).filter(
                      (f) => f !== columnMappings[col],
                    )}
                    onChange={(newTargetField) =>
                      handleMappingChange(col, newTargetField)
                    }
                  />
                </TableCell>
              );
            })}

            {/* Compound column headers */}
            {compoundColumns.map((col) => (
              <TableCell
                key={`compound-${col}`}
                sx={{ bgcolor: 'warning.lighter', fontWeight: 'bold' }}
              >
                <ColumnHeader title={col} />
                <Typography variant="caption" color="text.secondary">
                  (Compound)
                </Typography>
              </TableCell>
            ))}

            {/* Unmapped column headers */}
            {unmappedColumns.map((col) => (
              <TableCell
                key={`unmapped-${col}`}
                sx={{ bgcolor: 'action.hover', fontWeight: 'bold' }}
              >
                <ColumnHeader title={col} />
                <MappingSelector
                  value={columnMappings[col] || null}
                  fields={fields}
                  disabledFieldIds={Array.from(mappedFields).filter(
                    (f) => f !== columnMappings[col],
                  )}
                  onChange={(newTargetField) => handleMappingChange(col, newTargetField)}
                  label="Map to Field (Optional)"
                />
              </TableCell>
            ))}
          </TableRow>
        </TableHead>

        <TableBody>
          {result.data.map((row: CategorizedRow, idx: number) => (
            <TableRow key={idx} hover>
              {/* Direct cells */}
              {directColumns.map((col) => {
                const mapping = row.direct[col];
                return (
                  <TableCell key={`direct-${col}`}>
                    <Typography variant="body2">{mapping?.value ?? ''}</Typography>
                  </TableCell>
                );
              })}

              {/* Compound cells */}
              {compoundColumns.map((col) => {
                const compoundCol = row.compound[col];
                return (
                  <TableCell key={`compound-${col}`}>
                    {compoundCol && <CompoundCell column={compoundCol} />}
                  </TableCell>
                );
              })}

              {/* Unmapped cells */}
              {unmappedColumns.map((col) => {
                const unmapped = row.unmapped[col];
                return (
                  <TableCell key={`unmapped-${col}`} sx={{ color: 'text.disabled' }}>
                    <Typography variant="body2">{unmapped?.value ?? ''}</Typography>
                  </TableCell>
                );
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
}
