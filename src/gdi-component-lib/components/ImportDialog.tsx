import { useState, useEffect } from 'react';

import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';

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
  const [progress, setProgress] = useState<
    OperationStatusResponse<ExtractionResult> | undefined
  >(undefined);
  const [error, setError] = useState<string | undefined>(undefined);
  const [result, setResult] = useState<ExtractionResult | undefined>(undefined);
  const [selectingSheet, setSelectingSheet] = useState<boolean>(false);

  // Auto-start import when file is provided
  useEffect(() => {
    if (initialFile && open && !result && !progress) {
      setFile(initialFile);
      // Start import automatically
      const autoStart = async () => {
        const service = new ImportService(apiConfig);
        try {
          const res = await service.extractWithPolling(initialFile, context, {
            onProgress: setProgress,
          });
          setResult(res);
          onSuccess?.(res);
        } catch (err: unknown) {
          setError(err instanceof Error ? err.message : 'Import failed');
        }
      };
      autoStart();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialFile, open]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="lg">
      <DialogTitle>{title}</DialogTitle>
      <DialogContent sx={{ position: 'relative', minHeight: 300 }}>
        {!file && !progress && !result && (
          <FileDropzone
            onFileSelected={(f) => setFile(f)}
            onError={(err) => setError(err.message)}
          />
        )}
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
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}
