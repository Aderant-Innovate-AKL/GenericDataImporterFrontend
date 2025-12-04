import { useEffect, useState } from 'react';

import type {
  ExtractionContext,
  ApiConfig,
  ExtractionResult,
  OperationProgress,
  FieldMappings,
} from '../types';
import ImportDialog from './ImportDialog';

export interface ImportWorkflowProps {
  open: boolean;
  title?: string;
  file?: File;
  context: ExtractionContext;
  apiConfig?: ApiConfig;
  onClose: () => void;
  onSuccess?: (result: ExtractionResult, mappings?: FieldMappings) => void;
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

  useEffect(() => {
    if (initialFile) {
      setFile(initialFile);
    }
  }, [initialFile]);

  return (
    <ImportDialog
      open={open}
      file={file as File}
      context={context}
      apiConfig={apiConfig as ApiConfig}
      onClose={onClose}
      onSuccess={(res, mappings) => {
        onSuccess?.(res, mappings);
        setFile(undefined);
      }}
      title={title}
    />
  );
}
