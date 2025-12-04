import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';

import type { ExtractionResult, ExtractionContext, CategorizedRow } from '../types';
import ColumnHeader from './ColumnHeader';
import CompoundCell from './CompoundCell';
import MappingSelector from './MappingSelector';

interface ResultsTableProps {
  result: ExtractionResult;
  context: ExtractionContext;
  onConfirm?: (finalMappings?: unknown, compoundOverrides?: unknown) => void;
  onCancel?: () => void;
}

/**
 * ResultsTable displays extraction results in a categorized structure:
 * - Direct mappings (simple column renames)
 * - Compound extractions (LLM-extracted values from compound columns)
 * - Unmapped columns (columns not mapped to any target field)
 */
export default function ResultsTable({ result, context }: ResultsTableProps) {
  const fields = context.fields;

  // Extract all unique source column names from first row
  if (!result?.rows || result.rows.length === 0) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="body1" color="text.secondary">
          No data to display
        </Typography>
      </Box>
    );
  }

  const sampleRow: CategorizedRow = result.rows[0];

  const directColumns = Object.keys(sampleRow.direct || {});
  const compoundColumns = Object.keys(sampleRow.compound || {});
  const unmappedColumns = Object.keys(sampleRow.unmapped || {});

  return (
    <Box sx={{ overflowX: 'auto', p: 2 }}>
      {/* Metadata summary */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2" gutterBottom>
          Extraction Summary
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Total rows: {result.metadata.totalRows} | Direct:{' '}
          {result.metadata.directMappings} | Compound: {result.metadata.compoundColumns} |
          Unmapped: {result.metadata.unmappedColumns}
        </Typography>
      </Box>

      <Table size="small" sx={{ minWidth: 650 }}>
        <TableHead>
          <TableRow>
            {/* Direct column headers */}
            {directColumns.map((col) => (
              <TableCell
                key={`direct-${col}`}
                sx={{ bgcolor: 'primary.lighter', fontWeight: 'bold' }}
              >
                <ColumnHeader title={col} />
                <MappingSelector
                  value={sampleRow.direct[col]?.targetField || null}
                  fields={fields}
                  onChange={() => {}}
                />
              </TableCell>
            ))}

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
                <Typography variant="caption" color="text.secondary">
                  (Unmapped)
                </Typography>
              </TableCell>
            ))}
          </TableRow>
        </TableHead>

        <TableBody>
          {result.rows.map((row: CategorizedRow, idx: number) => (
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
