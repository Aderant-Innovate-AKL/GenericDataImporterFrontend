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
  onSuccess?: (result: ExtractionResult) => void;
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
        onSuccess?.(res);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Import failed');
        setDialogState('error');
      }
    },
    [apiConfig, context, onSuccess],
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
    }
  }, [open]);

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
            onConfirm={() => onClose()}
            onCancel={onClose}
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
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}
