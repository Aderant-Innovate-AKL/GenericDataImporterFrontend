import { useState } from 'react';

import type {
  ExtractionContext,
  ApiConfig,
  ExtractionResult,
  OperationProgress,
} from '../types';
import ImportDialog from './ImportDialog';

export interface ImportWorkflowProps {
  open: boolean;
  title?: string;
  file?: File;
  context: ExtractionContext;
  apiConfig?: ApiConfig;
  onClose: () => void;
  onSuccess?: (result: ExtractionResult) => void;
  onProgress?: (p: OperationProgress) => void;
}

/**
 * ImportWorkflow
 * Owns the high-level import state and coordinates ImportDialog rendering.
 * Visual wrapper responsibilities are delegated to ImportDialog.
 */
export default function ImportWorkflow({
  open,
  title,
  file: initialFile,
  context,
  apiConfig,
  onClose,
  onSuccess,
}: ImportWorkflowProps) {
  const [file, setFile] = useState<File | undefined>(initialFile);

  return (
    <ImportDialog
      open={open}
      file={file as File}
      context={context}
      apiConfig={apiConfig as ApiConfig}
      onClose={onClose}
      onSuccess={(res) => {
        onSuccess?.(res);
        // Optionally reset file after success
        setFile(undefined);
      }}
      title={title}
    />
  );
}
