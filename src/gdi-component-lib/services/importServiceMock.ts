import type {
  ExtractionContext,
  ExtractionResult,
  OperationStatusResponse,
} from '../types';

/**
 * Mock implementation of the extraction service for testing and development.
 * Simulates the async request-reply pattern with realistic progress updates.
 */

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function mockExtractWithPolling(
  file: File,
  _context: ExtractionContext,
  onProgress?: (status: OperationStatusResponse<ExtractionResult>) => void,
): Promise<ExtractionResult> {
  const operationId = `mock-op-${Date.now()}`;

  // Simulate parsing phase
  await delay(300);
  onProgress?.({
    operationId,
    status: 'processing',
    progress: {
      phase: 'parsing',
      message: 'Parsing file...',
      percentComplete: 25,
    },
    startedAt: new Date().toISOString(),
  });

  // Simulate discovery phase
  await delay(400);
  onProgress?.({
    operationId,
    status: 'processing',
    progress: {
      phase: 'discovery',
      message: 'Identifying column mappings...',
      percentComplete: 50,
    },
    startedAt: new Date().toISOString(),
  });

  // Simulate extraction phase
  await delay(500);
  onProgress?.({
    operationId,
    status: 'processing',
    progress: {
      phase: 'extraction',
      message: 'Extracting compound values...',
      percentComplete: 75,
    },
    startedAt: new Date().toISOString(),
  });

  // Simulate mapping phase
  await delay(300);
  onProgress?.({
    operationId,
    status: 'processing',
    progress: {
      phase: 'mapping',
      message: 'Finalizing mappings...',
      percentComplete: 90,
    },
    startedAt: new Date().toISOString(),
  });

  // Return mock result with categorized row structure
  const mockResult: ExtractionResult = {
    source: {
      filename: file.name,
      sheetName: 'Sheet1',
      totalRows: 3,
    },
    rows: [
      {
        direct: {
          'First Name': {
            sourceColumn: 'First Name',
            targetField: 'firstName',
            value: 'John',
          },
          'Last Name': {
            sourceColumn: 'Last Name',
            targetField: 'lastName',
            value: 'Doe',
          },
        },
        compound: {
          'Contact Info': {
            sourceColumn: 'Contact Info',
            sourceValue: 'john.doe@example.com | +1-555-0100',
            extractions: [
              {
                targetField: 'email',
                extractedValue: 'john.doe@example.com',
                confidence: { value: 9, level: 'high' },
                highlightStart: 0,
                highlightEnd: 21,
              },
              {
                targetField: 'phone',
                extractedValue: '+1-555-0100',
                confidence: { value: 8, level: 'high' },
                highlightStart: 24,
                highlightEnd: 36,
              },
            ],
          },
        },
        unmapped: {
          Notes: {
            sourceColumn: 'Notes',
            value: 'Some internal note',
          },
        },
      },
      {
        direct: {
          'First Name': {
            sourceColumn: 'First Name',
            targetField: 'firstName',
            value: 'Jane',
          },
          'Last Name': {
            sourceColumn: 'Last Name',
            targetField: 'lastName',
            value: 'Smith',
          },
        },
        compound: {
          'Contact Info': {
            sourceColumn: 'Contact Info',
            sourceValue: 'jane.smith@example.com | +1-555-0200',
            extractions: [
              {
                targetField: 'email',
                extractedValue: 'jane.smith@example.com',
                confidence: { value: 10, level: 'high' },
                highlightStart: 0,
                highlightEnd: 22,
              },
              {
                targetField: 'phone',
                extractedValue: '+1-555-0200',
                confidence: { value: 7, level: 'medium' },
                highlightStart: 25,
                highlightEnd: 37,
              },
            ],
          },
        },
        unmapped: {
          Notes: {
            sourceColumn: 'Notes',
            value: 'VIP customer',
          },
        },
      },
      {
        direct: {
          'First Name': {
            sourceColumn: 'First Name',
            targetField: 'firstName',
            value: 'Bob',
          },
          'Last Name': {
            sourceColumn: 'Last Name',
            targetField: 'lastName',
            value: 'Johnson',
          },
        },
        compound: {
          'Contact Info': {
            sourceColumn: 'Contact Info',
            sourceValue: 'bob.j@example.com',
            extractions: [
              {
                targetField: 'email',
                extractedValue: 'bob.j@example.com',
                confidence: { value: 9, level: 'high' },
                highlightStart: 0,
                highlightEnd: 17,
              },
              {
                targetField: 'phone',
                extractedValue: null,
                confidence: { value: 3, level: 'low' },
              },
            ],
          },
        },
        unmapped: {
          Notes: {
            sourceColumn: 'Notes',
            value: null,
          },
        },
      },
    ],
    metadata: {
      totalRows: 3,
      directMappings: 2,
      compoundColumns: 1,
      unmappedColumns: 1,
      averageConfidence: 7.7,
    },
  };

  await delay(200);
  return mockResult;
}
