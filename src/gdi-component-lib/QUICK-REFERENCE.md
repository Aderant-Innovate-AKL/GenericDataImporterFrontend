# Quick Reference: GDI Component Library

## Import Patterns

```typescript
// Components
import { ImportWorkflow, ResultsTable, CompoundCell } from 'src/gdi-component-lib';

// Services
import { ImportService, mockExtractWithPolling } from 'src/gdi-component-lib';
import type { ImportError } from 'src/gdi-component-lib';

// State Management
import {
  mappingReducer,
  buildInitialMappings,
  buildFinalOutput,
} from 'src/gdi-component-lib';

// Types
import type {
  ExtractionContext,
  ExtractionResult,
  CategorizedRow,
  CompoundExtraction,
  FieldDefinition,
  OperationStatusResponse,
} from 'src/gdi-component-lib';

// Utils
import { getConfidenceLevel, organizeColumns } from 'src/gdi-component-lib';
```

## Type Quick Reference

### ExtractionContext

```typescript
const context: ExtractionContext = {
  description: 'Monthly sales report from regional distributors',
  fields: [
    {
      field: 'transaction_date',
      description: 'Date of the transaction',
      dataType: 'date',
      required: true,
      examples: ['2024-01-15', 'Jan 15, 2024'],
    },
    {
      field: 'customer_name',
      description: 'Full name of the customer',
      required: true,
    },
  ],
};
```

### CategorizedRow

```typescript
const row: CategorizedRow = {
  direct: {
    Date: {
      sourceColumn: 'Date',
      targetField: 'transaction_date',
      value: '2024-01-15',
    },
  },
  compound: {
    'Customer Info': {
      sourceColumn: 'Customer Info',
      sourceValue: 'John Doe, john@example.com',
      extractions: [
        {
          targetField: 'customer_name',
          extractedValue: 'John Doe',
          confidence: { value: 9, level: 'high' },
          highlightStart: 0,
          highlightEnd: 8,
        },
        {
          targetField: 'email',
          extractedValue: 'john@example.com',
          confidence: { value: 10, level: 'high' },
          highlightStart: 10,
          highlightEnd: 27,
        },
      ],
    },
  },
  unmapped: {
    'Internal Notes': {
      sourceColumn: 'Internal Notes',
      value: 'VIP customer',
    },
  },
};
```

### OperationStatusResponse

```typescript
// Processing
const processing: OperationStatusResponse = {
  operationId: 'op_123',
  status: 'processing',
  progress: {
    phase: 'extraction',
    message: 'Extracting compound values...',
    percentComplete: 75,
  },
  startedAt: '2024-12-04T10:00:00Z',
};

// Completed
const completed: OperationStatusResponse<ExtractionResult> = {
  operationId: 'op_123',
  status: 'completed',
  result: extractionResult,
  completedAt: '2024-12-04T10:01:30Z',
  processingTimeMs: 90000,
};

// Failed
const failed: OperationStatusResponse = {
  operationId: 'op_123',
  status: 'failed',
  error: {
    code: 'EXTRACTION_ERROR',
    message: 'Failed to extract data',
    details: {
      /* ... */
    },
  },
  failedAt: '2024-12-04T10:01:00Z',
};
```

## Common Patterns

### Using ImportService

```typescript
import { ImportService } from 'src/gdi-component-lib';

const service = new ImportService({
  baseUrl: import.meta.env.UI_API_BASE_URL || 'http://localhost:8000',
  timeoutMs: 30000,
});

// With progress tracking
const result = await service.extractWithPolling(file, context, {
  sheetName: 'Sheet1', // optional
  onProgress: (status) => {
    if (status.status === 'processing') {
      console.log(`${status.progress.phase}: ${status.progress.percentComplete}%`);
    }
  },
});
```

### Using Mock Service (No Backend)

```typescript
import { mockExtractWithPolling } from 'src/gdi-component-lib';

const result = await mockExtractWithPolling(file, context, (status) => {
  console.log('Mock progress:', status);
});
```

### Field Mappings with Reducer

```typescript
import { useReducer } from 'react';
import { mappingReducer, buildInitialMappings } from 'src/gdi-component-lib';

function MyComponent({ result, context }) {
  const [mappings, dispatch] = useReducer(
    mappingReducer,
    buildInitialMappings(result, context)
  );

  const handleMappingChange = (sourceColumn: string, targetField: string | null) => {
    dispatch({
      type: 'UPDATE_DIRECT_MAPPING',
      payload: { sourceColumn, targetField }
    });
  };

  return (
    <MappingSelector
      value={mappings.direct[sourceColumn]?.targetField}
      fields={context.fields}
      onChange={(newTargetField) => handleMappingChange(sourceColumn, newTargetField)}
    />
  );
}
```

### Building Final Output

```typescript
import { buildFinalOutput } from 'src/gdi-component-lib';

const finalOutput = buildFinalOutput(result, mappings);

// finalOutput.items: Array of flattened objects
// [
//   { transaction_date: "2024-01-15", customer_name: "John Doe", email: "john@example.com" },
//   { transaction_date: "2024-01-16", customer_name: "Jane Smith", email: "jane@example.com" }
// ]

// Export as JSON
const json = JSON.stringify(finalOutput.items, null, 2);

// Export as CSV
const csv = convertToCSV(finalOutput.items);
```

### Confidence Utilities

```typescript
import { getConfidenceLevel, getConfidenceColor, getConfidenceLabel } from 'src/gdi-component-lib';

const score = 8;
const level = getConfidenceLevel(score);  // 'high'
const color = getConfidenceColor(score);  // 'success'
const label = getConfidenceLabel(score);  // 'High confidence (8/10)'

// Use in UI
<Chip
  label={extraction.extractedValue}
  color={getConfidenceColor(extraction.confidence.value)}
  title={getConfidenceLabel(extraction.confidence.value)}
/>
```

### Organizing Columns

```typescript
import { organizeColumns, getAllSourceColumns } from 'src/gdi-component-lib';

const { directColumns, compoundColumns, unmappedColumns } = organizeColumns(result);

// directColumns: ["Date", "Product", "Quantity"]
// compoundColumns: ["Customer Info", "Order Reference"]
// unmappedColumns: ["Internal Notes"]

const allColumns = getAllSourceColumns(result);
// ["Date", "Product", "Quantity", "Customer Info", "Order Reference", "Internal Notes"]
```

## Component Usage

### ImportWorkflow (Complete Flow)

```typescript
import { ImportWorkflow } from 'src/gdi-component-lib';

<ImportWorkflow
  open={isDialogOpen}
  context={extractionContext}
  apiConfig={{ baseUrl: 'http://localhost:8000' }}
  title="Import Customer Data"
  onClose={() => setIsDialogOpen(false)}
  onSuccess={(result) => {
    console.log('Import successful:', result);
    // Process result...
  }}
  onProgress={(status) => {
    if (status.status === 'processing') {
      setProgress(status.progress.percentComplete);
    }
  }}
/>
```

### ResultsTable (Display Results)

```typescript
import { ResultsTable } from 'src/gdi-component-lib';

<ResultsTable
  result={extractionResult}
  context={extractionContext}
  onConfirm={(finalMappings, overrides) => {
    // User confirmed mappings
    console.log('Final mappings:', finalMappings);
  }}
  onCancel={() => {
    // User cancelled
  }}
/>
```

### CompoundCell (Individual Cell)

```typescript
import { CompoundCell } from 'src/gdi-component-lib';

<CompoundCell
  column={row.compound["Customer Info"]}
  onOverride={(targetField, newValue) => {
    // User manually corrected an extraction
    console.log(`Override ${targetField} with ${newValue}`);
  }}
/>
```

## Error Handling

```typescript
import type { ImportError } from 'src/gdi-component-lib';

try {
  const result = await service.extractWithPolling(file, context);
} catch (error) {
  const importError = error as ImportError;

  switch (importError.code) {
    case 'PARSE_ERROR':
      console.error('Failed to parse file:', importError.message);
      break;
    case 'UNSUPPORTED_FORMAT':
      console.error('File format not supported');
      break;
    case 'EXTRACTION_ERROR':
      console.error('LLM extraction failed:', importError.details);
      break;
    case 'NETWORK_ERROR':
      console.error('Network error, please retry');
      break;
    default:
      console.error('Unknown error:', importError.message);
  }
}
```

## Configuration

### Environment Variables

```bash
# .env.development
UI_API_BASE_URL=http://localhost:8000
```

### ApiConfig

```typescript
const apiConfig: ApiConfig = {
  baseUrl: import.meta.env.UI_API_BASE_URL || 'http://localhost:8000',
  headers: {
    Authorization: `Bearer ${token}`,
    'X-Custom-Header': 'value',
  },
  timeoutMs: 30000, // 30 seconds
};
```

## Testing

### Mock Data

```typescript
import { mockExtractWithPolling } from 'src/gdi-component-lib';

// Returns realistic mock data:
// - 3 rows with direct/compound/unmapped columns
// - Varied confidence scores (3-10)
// - Realistic extraction patterns
const result = await mockExtractWithPolling(file, context);
```

### Test Utilities

```typescript
import { getConfirmButtonState } from 'src/gdi-component-lib';

const buttonState = getConfirmButtonState(context, mappings);
// { enabled: true/false, unmetRequiredFields: [...], tooltip: "..." }
```

## Migration from Old Version

### Field Definitions

```typescript
// OLD
fields: [{ id: 'firstName', label: 'First Name', required: true }];

// NEW
fields: [
  {
    field: 'firstName',
    description: "Customer's first name",
    required: true,
  },
];
```

### Confidence Scores

```typescript
// OLD (0-1 scale)
confidence: { score: 0.85, level: "good" }

// NEW (1-10 scale)
confidence: { value: 9, level: "high" }
```

### Row Structure

```typescript
// OLD
row.direct['Column Name']?.value;

// NEW
row.direct['Column Name']?.value; // Same!

// But compound changed:
// OLD: row.compound["fieldId"]?.extracted
// NEW: row.compound["sourceColumn"]?.extractions[0]?.extractedValue
```
