import axios, { AxiosInstance } from 'axios';

import type {
  ApiConfig,
  StartExtractResponse,
  OperationStatusResponse,
  CancelOperationResponse,
  ErrorCode,
} from '../types';
import type { ExtractionResult, ExtractionContext } from '../types';

/**
 * ImportService wraps backend API endpoints for the async import workflow.
 *
 * Async Request-Reply Pattern:
 * 1. POST /extract: Initiates extraction, returns operation_id
 * 2. GET /operations/{id}: Poll for status and result
 * 3. POST /operations/{id}/cancel: Cancel operation (optional)
 *
 * Use `extractWithPolling` for a complete extraction workflow with progress tracking.
 */
export class ImportService {
  private client: AxiosInstance;
  private activeCancelers: Map<string, AbortController> = new Map();

  constructor(config: ApiConfig) {
    this.client = axios.create({
      baseURL: config.baseUrl,
      headers: config.headers,
      timeout: config.timeoutMs ?? 30000,
    });
  }

  /**
   * POST /extract - Initiates an extraction operation
   * @param file The file to upload
   * @param context The extraction context (description + field definitions)
   * @param sheetName Optional sheet name for multi-sheet files
   * @returns StartExtractResponse with operation_id
   */
  async startExtract(
    file: File,
    context: ExtractionContext,
    sheetName?: string,
  ): Promise<StartExtractResponse> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('context', JSON.stringify(context));
    if (sheetName) {
      formData.append('sheet_name', sheetName);
    }

    const { data } = await this.client.post<StartExtractResponse>('/extract', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  }

  /**
   * GET /operations/{id} - Get operation status and result
   * @param operationId Operation identifier
   * @param signal Optional abort signal for cancellation
   * @returns OperationStatusResponse (union type based on status)
   */
  async getOperationStatus(
    operationId: string,
    signal?: AbortSignal,
  ): Promise<OperationStatusResponse<ExtractionResult>> {
    const { data } = await this.client.get<OperationStatusResponse<ExtractionResult>>(
      `/operations/${operationId}`,
      { signal },
    );
    return data;
  }

  /**
   * POST /operations/{id}/cancel - Cancel a running operation
   * @param operationId Operation identifier
   * @returns CancelOperationResponse
   */
  async cancelOperation(operationId: string): Promise<CancelOperationResponse> {
    const { data } = await this.client.post<CancelOperationResponse>(
      `/operations/${operationId}/cancel`,
    );
    // Also abort any active polling
    this.abortPolling(operationId);
    return data;
  }

  /**
   * Abort client-side polling for an operation
   */
  private abortPolling(operationId: string): void {
    const controller = this.activeCancelers.get(operationId);
    if (controller) {
      controller.abort();
      this.activeCancelers.delete(operationId);
    }
  }

  /**
   * Complete extraction workflow with polling
   * @param file File to process
   * @param context Extraction context
   * @param options Optional configuration
   * @returns ExtractionResult when complete
   * @throws ImportError on failure
   */
  async extractWithPolling(
    file: File,
    context: ExtractionContext,
    options?: {
      sheetName?: string;
      onProgress?: (status: OperationStatusResponse<ExtractionResult>) => void;
      pollIntervalMs?: number;
      maxPollIntervalMs?: number;
    },
  ): Promise<ExtractionResult> {
    const pollIntervalMs = options?.pollIntervalMs ?? 500;
    const maxPollIntervalMs = options?.maxPollIntervalMs ?? 2000;

    try {
      // Step 1: Initiate extraction
      const initResponse = await this.startExtract(file, context, options?.sheetName);
      const operationId = initResponse.operationId;

      // Set up abort controller for polling
      const abortController = new AbortController();
      this.activeCancelers.set(operationId, abortController);

      // Step 2: Poll for completion with exponential backoff
      let currentInterval = pollIntervalMs;

      while (true) {
        const status = await this.getOperationStatus(operationId, abortController.signal);

        // Notify progress callback
        options?.onProgress?.(status);

        // Check terminal states
        if (status.status === 'completed') {
          this.activeCancelers.delete(operationId);
          return status.result;
        }

        if (status.status === 'failed') {
          this.activeCancelers.delete(operationId);
          throw this.createImportError(
            status.error.code,
            status.error.message,
            status.error.details,
          );
        }

        if (status.status === 'cancelled') {
          this.activeCancelers.delete(operationId);
          throw this.createImportError('OPERATION_NOT_FOUND', 'Operation was cancelled');
        }

        // Continue polling for 'pending' or 'processing' states
        await this.delay(currentInterval);
        currentInterval = Math.min(currentInterval + 500, maxPollIntervalMs);
      }
    } catch (error) {
      // Normalize error to ImportError format
      if (axios.isAxiosError(error)) {
        const apiError = error.response?.data;
        if (apiError?.error) {
          throw this.createImportError(
            apiError.error.code,
            apiError.error.message,
            apiError.error.details,
          );
        }
        throw this.createImportError('NETWORK_ERROR', error.message);
      }
      // Re-throw if already an ImportError
      if (this.isImportError(error)) {
        throw error;
      }
      throw this.createImportError(
        'UNKNOWN_ERROR',
        'An unexpected error occurred',
        error,
      );
    }
  }

  /**
   * Helper to create ImportError objects
   */
  private createImportError(
    code: ErrorCode,
    message: string,
    details?: unknown,
  ): ImportError {
    return { code, message, details, timestamp: new Date().toISOString() };
  }

  /**
   * Type guard for ImportError
   */
  private isImportError(error: unknown): error is ImportError {
    return (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      'message' in error &&
      'timestamp' in error
    );
  }

  /**
   * Delay helper for polling
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

/**
 * ImportError type for unified error handling
 */
export interface ImportError {
  code: ErrorCode;
  message: string;
  details?: unknown;
  timestamp: string;
}
