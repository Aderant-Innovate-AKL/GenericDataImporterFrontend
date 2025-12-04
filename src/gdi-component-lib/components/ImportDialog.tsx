import { useState, useEffect, useCallback } from 'react';

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  CircularProgress,
  Typography,
} from '@mui/material';

import type {
  ExtractionContext,
  ApiConfig,
  ExtractionResult,
  OperationStatusResponse,
  FieldMappings,
} from '../types';
import ErrorDialog from './ErrorDialog';
import FileDropzone from './FileDropzone';
import LoadingOverlay from './LoadingOverlay';
import ResultsTable from './ResultsTable';
import SheetSelector from './SheetSelector';
import { ImportService } from '../services/importService';
import {
  inspectSheets,
  isSpreadsheetFile,
  type SheetInspectionResult,
} from '../utils/sheetInspector';

/** Dialog states for the import flow */
type DialogState =
  | 'idle' // No file selected
  | 'inspecting' // Checking file for sheets
  | 'selecting-sheet' // User selecting a sheet
  | 'extracting' // Calling API / processing
  | 'results' // Showing results
  | 'error'; // Error state

interface ImportDialogProps {
  open: boolean;
  file?: File;
  title?: string;
  context: ExtractionContext;
  apiConfig: ApiConfig;
  onClose: () => void;
  onSuccess?: (result: ExtractionResult, mappings?: FieldMappings) => void;
}

export default function ImportDialog({
  open,
  file: initialFile,
  title = 'Import Data',
  context,
  apiConfig,
  onClose,
  onSuccess,
}: ImportDialogProps) {
  const [file, setFile] = useState<File | undefined>(initialFile);
  const [dialogState, setDialogState] = useState<DialogState>('idle');
  const [progress, setProgress] = useState<
    OperationStatusResponse<ExtractionResult> | undefined
  >(undefined);
  const [error, setError] = useState<string | undefined>(undefined);
  const [result, setResult] = useState<ExtractionResult | undefined>(undefined);
  const [sheetInfo, setSheetInfo] = useState<SheetInspectionResult | undefined>(
    undefined,
  );
  const [columnMappings, setColumnMappings] = useState<Record<string, string | null>>({});
  const [modifiedColumns, setModifiedColumns] = useState<Set<string>>(new Set());

  /**
   * Start the extraction process with the API
   */
  const startExtraction = useCallback(
    async (fileToProcess: File, sheetName?: string) => {
      setDialogState('extracting');
      setProgress(undefined);
      const service = new ImportService(apiConfig);
      try {
        const res = await service.extractWithPolling(fileToProcess, context, {
          sheetName,
          onProgress: setProgress,
        });
        setResult(res);
        setDialogState('results');

        // Initialize column mappings from the result
        if (res.data && res.data.length > 0) {
          const sampleRow = res.data[0];
          const initial: Record<string, string | null> = {};
          Object.keys(sampleRow.direct || {}).forEach((col) => {
            initial[col] = sampleRow.direct[col]?.targetField || null;
          });
          Object.keys(sampleRow.unmapped || {}).forEach((col) => {
            initial[col] = null;
          });
          setColumnMappings(initial);
          setModifiedColumns(new Set()); // Reset modified columns
        }
        // Don't call onSuccess here - wait for user confirmation
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Import failed');
        setDialogState('error');
      }
    },
    [apiConfig, context],
  );

  /**
   * Handle file selection - inspect for sheets if needed
   */
  const handleFileSelected = useCallback(
    async (selectedFile: File) => {
      setFile(selectedFile);
      setError(undefined);
      setResult(undefined);
      setSheetInfo(undefined);

      // Check if this is a spreadsheet that might have multiple sheets
      if (isSpreadsheetFile(selectedFile)) {
        setDialogState('inspecting');
        try {
          const inspection = await inspectSheets(selectedFile);
          setSheetInfo(inspection);

          if (inspection.requiresSheetSelection) {
            // Multiple sheets - show selector
            setDialogState('selecting-sheet');
          } else {
            // Single sheet or no sheets found - proceed directly
            const sheetName = inspection.visibleSheets[0]?.name;
            await startExtraction(selectedFile, sheetName);
          }
        } catch (err) {
          // If inspection fails, try to proceed without sheet selection
          console.warn(
            'Sheet inspection failed, proceeding without sheet selection:',
            err,
          );
          await startExtraction(selectedFile);
        }
      } else {
        // Not a spreadsheet (CSV, etc.) - proceed directly
        await startExtraction(selectedFile);
      }
    },
    [startExtraction],
  );

  /**
   * Handle sheet selection from SheetSelector
   */
  const handleSheetSelected = useCallback(
    async (sheetName: string) => {
      if (file) {
        await startExtraction(file, sheetName);
      }
    },
    [file, startExtraction],
  );

  /**
   * Handle sheet selection cancellation
   */
  const handleSheetSelectionCancel = useCallback(() => {
    setFile(undefined);
    setSheetInfo(undefined);
    setDialogState('idle');
  }, []);

  // Auto-start when file is provided via props
  useEffect(() => {
    if (initialFile && open && dialogState === 'idle') {
      handleFileSelected(initialFile);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialFile, open]);

  // Reset state when dialog closes
  useEffect(() => {
    if (!open) {
      setFile(undefined);
      setDialogState('idle');
      setProgress(undefined);
      setError(undefined);
      setResult(undefined);
      setSheetInfo(undefined);
      setColumnMappings({});
      setModifiedColumns(new Set());
    }
  }, [open]);

  const handleConfirm = () => {
    if (result) {
      // Build FieldMappings from columnMappings
      const fieldMappings: FieldMappings = {
        direct: {},
        compound: {},
      };

      Object.entries(columnMappings).forEach(([sourceCol, targetField]) => {
        if (targetField) {
          fieldMappings.direct[sourceCol] = {
            sourceColumn: sourceCol,
            targetField,
            isUserModified: true,
          };
        }
      });

      onSuccess?.(result, fieldMappings);
      onClose();
    }
  };

  const handleCancel = () => {
    setResult(undefined);
    setProgress(undefined);
    setColumnMappings({});
    setModifiedColumns(new Set());
    setDialogState('idle');
    onClose();
  };

  const handleMappingChange = (
    newMappings: Record<string, string | null>,
    sourceColumn: string,
  ) => {
    setColumnMappings(newMappings);
    setModifiedColumns((prev) => new Set(prev).add(sourceColumn));
  };

  const renderContent = () => {
    switch (dialogState) {
      case 'idle':
        return (
          <FileDropzone
            onFileSelected={handleFileSelected}
            onError={(err) => {
              setError(err.message);
              setDialogState('error');
            }}
          />
        );

      case 'inspecting':
        return (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              py: 6,
            }}
          >
            <CircularProgress size={40} sx={{ mb: 2 }} />
            <Typography color="text.secondary">Inspecting workbook...</Typography>
          </Box>
        );

      case 'selecting-sheet':
        return sheetInfo ? (
          <SheetSelector
            sheets={sheetInfo.sheets}
            onSelect={handleSheetSelected}
            onCancel={handleSheetSelectionCancel}
          />
        ) : null;

      case 'extracting':
        return (
          <LoadingOverlay
            message={
              progress?.status === 'processing'
                ? progress.progress?.message
                : 'Starting extraction...'
            }
            progress={progress?.status === 'processing' ? progress.progress : undefined}
          />
        );

      case 'error':
        return error ? (
          <ErrorDialog
            message={error}
            onClose={() => {
              setError(undefined);
              setDialogState('idle');
              setFile(undefined);
            }}
          />
        ) : null;

      case 'results':
        return result ? (
          <ResultsTable
            result={result}
            context={context}
            columnMappings={columnMappings}
            modifiedColumns={modifiedColumns}
            onMappingChange={handleMappingChange}
            onConfirm={handleConfirm}
            onCancel={handleCancel}
          />
        ) : null;

      default:
        return null;
    }
  };

  // Generate dialog title based on state
  const getDialogTitle = () => {
    if (dialogState === 'selecting-sheet' && file) {
      return `Import: ${file.name}`;
    }
    if (file && dialogState !== 'idle') {
      return `${title}: ${file.name}`;
    }
    return title;
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="lg">
      <DialogTitle>{getDialogTitle()}</DialogTitle>
      <DialogContent sx={{ position: 'relative', minHeight: 300 }}>
        {renderContent()}
      </DialogContent>
      <DialogActions>
        {result && (
          <>
            <Button onClick={handleCancel} color="error">
              Cancel
            </Button>
            <Button onClick={handleConfirm} variant="contained" color="primary">
              Confirm & Import
            </Button>
          </>
        )}
        {!result && <Button onClick={onClose}>Close</Button>}
      </DialogActions>
    </Dialog>
  );
}
