// API-related types matching the async request-reply pattern

export interface ApiConfig {
  baseUrl: string;
  headers?: Record<string, string>;
  timeoutMs?: number;
}

// Error codes from section 1.6
export type ErrorCode =
  | 'PARSE_ERROR'
  | 'UNSUPPORTED_FORMAT'
  | 'INVALID_SCHEMA'
  | 'LLM_ERROR'
  | 'EXTRACTION_ERROR'
  | 'VALIDATION_ERROR'
  | 'OPERATION_NOT_FOUND'
  | 'OPERATION_EXPIRED'
  | 'NETWORK_ERROR'
  | 'UNKNOWN_ERROR';

export interface ApiError {
  success: false;
  error: {
    code: ErrorCode;
    message: string;
    details?: unknown;
    timestamp: string;
  };
}

// Operation statuses from the state machine
export type OperationStatus =
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'cancelled';

// Progress phases during processing
export type OperationPhase = 'parsing' | 'discovery' | 'extraction' | 'mapping';

export interface OperationProgress {
  phase: OperationPhase;
  message: string;
  percentComplete: number; // 0-100
}

// POST /extract response (202 Accepted)
export interface StartExtractResponse {
  operationId: string;
  status: OperationStatus;
  createdAt: string;
  estimatedCompletionTime?: string;
}

// GET /operations/{id} response - processing state
export interface OperationStatusProcessing {
  operationId: string;
  status: 'processing';
  progress: OperationProgress;
  startedAt: string;
  estimatedCompletionTime?: string;
}

// GET /operations/{id} response - completed state
export interface OperationStatusCompleted<T = unknown> {
  operationId: string;
  status: 'completed';
  result: T;
  completedAt: string;
  processingTimeMs: number;
}

// GET /operations/{id} response - failed state
export interface OperationStatusFailed {
  operationId: string;
  status: 'failed';
  error: {
    code: ErrorCode;
    message: string;
    details?: unknown;
  };
  failedAt: string;
}

// GET /operations/{id} response - cancelled state
export interface OperationStatusCancelled {
  operationId: string;
  status: 'cancelled';
  message: string;
  cancelledAt: string;
}

// Union type for all operation status responses
export type OperationStatusResponse<T = unknown> =
  | { operationId: string; status: 'pending'; createdAt: string }
  | OperationStatusProcessing
  | OperationStatusCompleted<T>
  | OperationStatusFailed
  | OperationStatusCancelled;

// POST /operations/{id}/cancel response
export interface CancelOperationResponse {
  operationId: string;
  status: 'cancelled';
  message: string;
  cancelledAt: string;
}
