import { useState } from 'react';

import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';

import type {
  ExtractionContext,
  ApiConfig,
  ExtractionResult,
  OperationStatusResponse,
} from '../types';
import ErrorDialog from './ErrorDialog';
import LoadingOverlay from './LoadingOverlay';
import ResultsTable from './ResultsTable';
import SheetSelector from './SheetSelector';
import { ImportService } from '../services/importService';

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
  file,
  title = 'Import Data',
  context,
  apiConfig,
  onClose,
  onSuccess,
}: ImportDialogProps) {
  const [progress, setProgress] = useState<
    OperationStatusResponse<ExtractionResult> | undefined
  >(undefined);
  const [error, setError] = useState<string | undefined>(undefined);
  const [result, setResult] = useState<ExtractionResult | undefined>(undefined);
  const [selectingSheet, setSelectingSheet] = useState<boolean>(false);

  const start = async () => {
    if (!file) return;
    setError(undefined);
    const service = new ImportService(apiConfig);
    try {
      const res = await service.extractWithPolling(file, context, {
        onProgress: setProgress,
      });
      setResult(res);
      onSuccess?.(res);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Import failed');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="lg">
      <DialogTitle>{title}</DialogTitle>
      <DialogContent sx={{ position: 'relative' }}>
        {progress && !result && (
          <LoadingOverlay
            message={
              progress.status === 'processing' ? progress.progress?.message : undefined
            }
            progress={progress.status === 'processing' ? progress.progress : undefined}
          />
        )}
        {error && <ErrorDialog message={error} onClose={() => setError(undefined)} />}
        {!progress && !result && selectingSheet && (
          <SheetSelector context={context} onSelect={() => setSelectingSheet(false)} />
        )}
        {result && (
          <ResultsTable
            result={result}
            context={context}
            onConfirm={() => onClose()}
            onCancel={onClose}
          />
        )}
      </DialogContent>
      <DialogActions>
        {!result && (
          <Button onClick={start} variant="contained" disabled={!file}>
            Start Import
          </Button>
        )}
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}
