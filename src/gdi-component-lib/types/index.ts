// Type exports for the GDI component library

// API types
export type {
  ApiConfig,
  ErrorCode,
  ApiError,
  OperationStatus,
  OperationPhase,
  OperationProgress,
  StartExtractResponse,
  OperationStatusProcessing,
  OperationStatusCompleted,
  OperationStatusFailed,
  OperationStatusCancelled,
  OperationStatusResponse,
  CancelOperationResponse,
} from './api';

// Context and mapping types
export type {
  FieldDefinition,
  ExtractionContext,
  DirectMappingEntry,
  CompoundMappingEntry,
  FieldMappings,
  ConfirmButtonState,
} from './context';

// Result types
export type {
  ConfidenceScore,
  DirectMapping,
  CompoundExtraction,
  CompoundColumn,
  UnmappedColumn,
  CategorizedRow,
  ExtractionMetadata,
  ExtractionResult,
  FinalOutputItem,
  FinalOutput,
} from './results';

// File validation types
export interface FileValidationError {
  code: 'EMPTY_FILE' | 'FILE_TOO_LARGE' | 'BINARY_FILE' | 'UNSUPPORTED_FORMAT';
  message: string;
}

export interface FileValidationResult {
  ok: boolean;
  error?: FileValidationError;
  size?: number;
}
