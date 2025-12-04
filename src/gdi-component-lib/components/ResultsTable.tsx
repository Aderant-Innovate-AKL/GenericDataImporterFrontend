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
import CompoundExtractionEditor from './CompoundExtractionEditor';
import MappingSelector from './MappingSelector';

interface ResultsTableProps {
  result: ExtractionResult;
  context: ExtractionContext;
  columnMappings: Record<string, string | null>;
  modifiedColumns: Set<string>;
  compoundOverrides: Record<
    number,
    Record<string, Record<string, string | number | null>>
  >;
  onMappingChange: (
    mappings: Record<string, string | null>,
    sourceColumn: string,
  ) => void;
  onCompoundOverride: (
    rowIndex: number,
    sourceColumn: string,
    targetField: string,
    newValue: string | number | null,
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
  compoundOverrides,
  onMappingChange,
  onCompoundOverride,
}: ResultsTableProps) {
  const fields = context.fields;

  // Get initial row data for setting up state (must be before any hooks)
  const sampleRow: CategorizedRow | undefined = result?.data?.[0];
  const directColumns = Object.keys(sampleRow?.direct || {});
  const compoundColumns = Object.keys(sampleRow?.compound || {});
  const unmappedColumns = Object.keys(sampleRow?.unmapped || {});

  // Parse compound columns to get individual extraction fields
  // For each compound column, we'll show one column per extraction
  const compoundExtractionColumns: { sourceColumn: string; targetField: string }[] = [];
  compoundColumns.forEach((sourceCol) => {
    const compoundCol = sampleRow?.compound[sourceCol];
    if (compoundCol) {
      compoundCol.extractions.forEach((extraction) => {
        compoundExtractionColumns.push({
          sourceColumn: sourceCol,
          targetField: extraction.targetField,
        });
      });
    }
  });

  const hasAnyColumns =
    directColumns.length > 0 ||
    compoundExtractionColumns.length > 0 ||
    unmappedColumns.length > 0;

  const handleMappingChange = (sourceColumn: string, targetField: string | null) => {
    // If selecting a field that's already mapped, deselect it from the other column
    const newMappings = { ...columnMappings };

    if (targetField) {
      // Find and clear any other column that has this target field
      Object.keys(newMappings).forEach((col) => {
        if (col !== sourceColumn && newMappings[col] === targetField) {
          newMappings[col] = null;
        }
      });
    }

    // Set the new mapping
    newMappings[sourceColumn] = targetField;

    onMappingChange(newMappings, sourceColumn);
  };

  // Helper to get confidence color based on score
  const getConfidenceColor = (confidence?: number): string | undefined => {
    if (confidence === undefined) return undefined;
    if (confidence >= 8) return 'success.light'; // High confidence: green
    if (confidence >= 5) return 'warning.light'; // Medium confidence: yellow/orange
    return 'error.light'; // Low confidence: red
  };

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
                    disabledFieldIds={[]}
                    onChange={(newTargetField) =>
                      handleMappingChange(col, newTargetField)
                    }
                  />
                </TableCell>
              );
            })}

            {/* Compound extraction columns - one column per extraction */}
            {compoundExtractionColumns.map(({ sourceColumn, targetField }) => {
              // Check if ANY row has been modified for this extraction
              const isModified = Object.values(compoundOverrides).some(
                (rowOverrides) => rowOverrides[sourceColumn]?.[targetField] !== undefined,
              );

              // Get confidence from first row
              const firstRowCompound = sampleRow?.compound[sourceColumn];
              const extraction = firstRowCompound?.extractions.find(
                (e) => e.targetField === targetField,
              );
              const confidenceColor =
                !isModified && extraction?.confidence?.value
                  ? getConfidenceColor(extraction.confidence.value)
                  : undefined;

              return (
                <TableCell
                  key={`compound-${sourceColumn}-${targetField}`}
                  sx={{
                    bgcolor: confidenceColor || 'warning.lighter',
                    fontWeight: 'bold',
                    transition: 'background-color 0.3s ease',
                  }}
                >
                  <ColumnHeader title={`${sourceColumn}`} />
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: 'block' }}
                  >
                    → {targetField}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    (Compound)
                  </Typography>
                </TableCell>
              );
            })}

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
                  disabledFieldIds={[]}
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
              {/* Direct cells - show value from the mapped source column */}
              {directColumns.map((col) => {
                // Get the target field this column is mapped to
                const targetField = columnMappings[col];

                // Find which source column has data for this target field
                let displayValue: string | number | null = '';

                if (targetField) {
                  // Look through all direct columns to find one that maps to this target field
                  const sourceCol = Object.keys(row.direct).find(
                    (key) => columnMappings[key] === targetField,
                  );

                  if (sourceCol && row.direct[sourceCol]) {
                    displayValue = row.direct[sourceCol].value;
                  }
                }

                return (
                  <TableCell key={`direct-${col}`}>
                    <Typography variant="body2">{displayValue ?? ''}</Typography>
                  </TableCell>
                );
              })}

              {/* Compound extraction cells - one cell per extraction */}
              {compoundExtractionColumns.map(({ sourceColumn, targetField }) => {
                const compoundCol = row.compound[sourceColumn];
                const extraction = compoundCol?.extractions.find(
                  (e) => e.targetField === targetField,
                );

                if (!extraction) {
                  return (
                    <TableCell key={`compound-${sourceColumn}-${targetField}-${idx}`} />
                  );
                }

                // Check if user has overridden this value for this specific row
                const overrideValue =
                  compoundOverrides[idx]?.[sourceColumn]?.[targetField];
                const displayExtraction =
                  overrideValue !== undefined
                    ? {
                        ...extraction,
                        extractedValue: overrideValue,
                        isUserModified: true,
                      }
                    : extraction;

                return (
                  <TableCell key={`compound-${sourceColumn}-${targetField}-${idx}`}>
                    <CompoundExtractionEditor
                      sourceValue={compoundCol.sourceValue}
                      extraction={displayExtraction}
                      onUpdate={(newValue) =>
                        onCompoundOverride(idx, sourceColumn, targetField, newValue)
                      }
                    />
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
