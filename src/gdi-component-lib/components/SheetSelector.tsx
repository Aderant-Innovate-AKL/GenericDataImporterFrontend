import { useState } from 'react';

import TableChartIcon from '@mui/icons-material/TableChart';
import {
  Box,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Radio,
  Button,
  Paper,
  Chip,
} from '@mui/material';

import type { SheetMetadata } from '../utils/sheetInspector';

export interface SheetSelectorProps {
  /** Available sheets with metadata */
  sheets: SheetMetadata[];
  /** Callback when sheet is selected and confirmed */
  onSelect: (sheetName: string) => void;
  /** Callback when selection is cancelled */
  onCancel?: () => void;
  /** Initially selected sheet (defaults to first visible sheet) */
  initialSelection?: string;
  /** Whether to show the cancel button */
  showCancel?: boolean;
}

export default function SheetSelector({
  sheets,
  onSelect,
  onCancel,
  initialSelection,
  showCancel = true,
}: SheetSelectorProps) {
  // Filter out hidden sheets for display
  const visibleSheets = sheets.filter((s) => !s.hidden);

  // Default to first visible sheet if no initial selection
  const [selectedSheet, setSelectedSheet] = useState<string>(
    initialSelection ?? visibleSheets[0]?.name ?? '',
  );

  const handleConfirm = () => {
    if (selectedSheet) {
      onSelect(selectedSheet);
    }
  };

  const formatRowCount = (count?: number): string => {
    if (count === undefined) return '';
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k rows`;
    }
    return `${count} rows`;
  };

  if (visibleSheets.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography color="text.secondary">No sheets found in this workbook.</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Select a sheet to import
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        This workbook contains {visibleSheets.length} sheet
        {visibleSheets.length !== 1 ? 's' : ''}. Please select which one to import.
      </Typography>

      <Paper sx={{ mb: 3, border: 1, borderColor: 'divider' }}>
        <List disablePadding>
          {visibleSheets.map((sheet, index) => (
            <ListItemButton
              key={sheet.name}
              selected={selectedSheet === sheet.name}
              onClick={() => setSelectedSheet(sheet.name)}
              divider={index < visibleSheets.length - 1}
              sx={{
                '&.Mui-selected': {
                  backgroundColor: 'action.selected',
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                <Radio
                  checked={selectedSheet === sheet.name}
                  value={sheet.name}
                  size="small"
                />
              </ListItemIcon>
              <ListItemIcon sx={{ minWidth: 40 }}>
                <TableChartIcon color="action" />
              </ListItemIcon>
              <ListItemText
                primary={sheet.name}
                secondary={
                  sheet.rowEstimate !== undefined || sheet.columnCount !== undefined
                    ? `${formatRowCount(sheet.rowEstimate)}${
                        sheet.columnCount ? ` • ${sheet.columnCount} columns` : ''
                      }`
                    : undefined
                }
              />
              {sheet.rowEstimate !== undefined && sheet.rowEstimate > 1000 && (
                <Chip
                  label="Large"
                  size="small"
                  color="warning"
                  variant="outlined"
                  sx={{ ml: 1 }}
                />
              )}
            </ListItemButton>
          ))}
        </List>
      </Paper>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
        {showCancel && onCancel && (
          <Button variant="outlined" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button variant="contained" onClick={handleConfirm} disabled={!selectedSheet}>
          Continue with "{selectedSheet}"
        </Button>
      </Box>
    </Box>
  );
}
