# Generic Data Importer Component Library

A TypeScript/React component library for building data import workflows with AI-powered
field extraction.

## Overview

This library provides a complete UI implementation for the Generic Data Importer system,
matching the requirements outlined in the
[Full Implementation Plan](../../FULL-IMPLMENTATION-PLAN.md). It's designed to work with a
Python backend service that performs LLM-based data extraction.

**Key Features:**

- Async request-reply pattern with progress tracking
- Categorized row structure (direct, compound, unmapped columns)
- Confidence scoring for AI extractions
- User-editable field mappings
- Type-safe with full TypeScript support

## Architecture

This library is structured to mimic an external npm package within the demo application.
In production, it would be published as `@yourorg/gdi-component-lib`.

### Directory Structure

```
gdi-component-lib/
├── components/          # React UI components
│   ├── FileDropzone.tsx       # File upload component
│   ├── ImportDialog.tsx       # Main import modal
│   ├── ImportWorkflow.tsx     # Workflow orchestration
│   ├── SheetSelector.tsx      # Sheet selection for multi-sheet files
│   ├── LoadingOverlay.tsx     # Loading states with progress
│   ├── ErrorDialog.tsx        # Error display
│   ├── ResultsTable.tsx       # Categorized results display
│   ├── CompoundCell.tsx       # Compound extraction cell
│   ├── MappingSelector.tsx    # Field mapping dropdown
│   └── ColumnHeader.tsx       # Column header component
├── services/            # API client layer
│   ├── importService.ts       # Backend API client
│   └── importServiceMock.ts   # Mock service for development
├── state/              # State management
│   ├── mappingReducer.ts      # Field mapping reducer
│   ├── buildInitialMappings.ts # Initial mapping logic
│   ├── finalOutput.ts         # Final output builder
│   └── selectors.ts           # State selectors
├── types/              # TypeScript type definitions
│   ├── api.ts                 # API types (async operations)
│   ├── context.ts             # Extraction context types
│   ├── results.ts             # Categorized row structure
│   └── index.ts               # Type exports
├── utils/              # Utility functions
│   ├── confidence.ts          # Confidence score utilities
│   ├── organize.ts            # Column organization helpers
│   ├── fileValidator.ts       # File validation
│   └── sheetInspector.ts      # Sheet metadata inspection
└── index.ts            # Main library export
```

## Installation

```bash
# In production, install from npm:
npm install @yourorg/gdi-component-lib

# Or with pnpm:
pnpm add @yourorg/gdi-component-lib
```

**Peer Dependencies:**

- `react` >= 19.0.0
- `@mui/material` >= 7.0.0
- `@emotion/react` >= 11.0.0
- `@emotion/styled` >= 11.0.0
- `axios` >= 1.0.0

## Usage

### Basic Import Workflow

```tsx
import { ImportWorkflow, ImportService } from '@yourorg/gdi-component-lib';
import type { ExtractionContext, ExtractionResult } from '@yourorg/gdi-component-lib';

function App() {
  const [open, setOpen] = useState(false);

  const context: ExtractionContext = {
    description: 'Customer contact information for CRM import',
    fields: [
      {
        field: 'firstName',
        description: "Customer's first name",
        required: true,
      },
      {
        field: 'lastName',
        description: "Customer's last name",
        required: true,
      },
      {
        field: 'email',
        description: 'Email address',
      },
      {
        field: 'phone',
        description: 'Phone number',
      },
    ],
  };

  const handleSuccess = (result: ExtractionResult) => {
    console.log('Extraction complete:', result);
    // Process the categorized rows
  };

  return (
    <ImportWorkflow
      open={open}
      context={context}
      apiConfig={{ baseUrl: 'http://localhost:8000' }}
      onClose={() => setOpen(false)}
      onSuccess={handleSuccess}
    />
  );
}
```

### Using the API Client Directly

```tsx
import { ImportService } from '@yourorg/gdi-component-lib';
import type { ExtractionContext } from '@yourorg/gdi-component-lib';

const service = new ImportService({
  baseUrl: 'http://localhost:8000',
  timeoutMs: 30000,
});

async function performExtraction(file: File, context: ExtractionContext) {
  try {
    const result = await service.extractWithPolling(file, context, {
      onProgress: (status) => {
        if (status.status === 'processing') {
          console.log(`${status.progress.phase}: ${status.progress.percentComplete}%`);
        }
      },
    });

    console.log('Extraction complete:', result);
  } catch (error) {
    console.error('Extraction failed:', error);
  }
}
```

### Mock Service (Development)

For development without a backend:

```tsx
import { mockExtractWithPolling } from '@yourorg/gdi-component-lib';

const result = await mockExtractWithPolling(file, context, (status) => {
  console.log('Progress:', status);
});
```

## Data Structures

### Categorized Row Structure

The library uses a categorized row structure that separates columns by extraction type:

```typescript
interface CategorizedRow {
  // Direct mappings: simple column renames
  direct: Record<string, DirectMapping>;

  // Compound extractions: AI-extracted from compound columns
  compound: Record<string, CompoundColumn>;

  // Unmapped: columns not mapped to any target field
  unmapped: Record<string, UnmappedColumn>;
}
```

**Example:**

```typescript
{
  direct: {
    "First Name": {
      sourceColumn: "First Name",
      targetField: "firstName",
      value: "John"
    }
  },
  compound: {
    "Contact Info": {
      sourceColumn: "Contact Info",
      sourceValue: "john@example.com | +1-555-0100",
      extractions: [
        {
          targetField: "email",
          extractedValue: "john@example.com",
          confidence: { value: 9, level: "high" },
          highlightStart: 0,
          highlightEnd: 19
        },
        {
          targetField: "phone",
          extractedValue: "+1-555-0100",
          confidence: { value: 8, level: "high" },
          highlightStart: 22,
          highlightEnd: 34
        }
      ]
    }
  },
  unmapped: {
    "Notes": {
      sourceColumn: "Notes",
      value: "Some internal comment"
    }
  }
}
```

### Confidence Scores

LLM extractions include confidence scores (1-10):

- **High (8-10)**: Strong match, clear pattern
- **Medium (5-7)**: Reasonable inference with some ambiguity
- **Low (1-4)**: Weak match, user verification recommended

```typescript
interface ConfidenceScore {
  value: number; // 1-10
  level: 'high' | 'medium' | 'low';
}
```

## API Pattern

The library implements an async request-reply pattern:

1. **POST /extract** → Returns `operationId`
2. **Poll GET /operations/{id}** → Get status and progress
3. **Result when status = 'completed'**

### Operation States

- `pending`: Operation queued
- `processing`: Actively extracting (with progress)
- `completed`: Success, result available
- `failed`: Error occurred
- `cancelled`: User cancelled

### Progress Phases

During `processing` status:

- `parsing`: File being parsed
- `discovery`: Identifying column mappings
- `extraction`: Extracting from compound columns
- `mapping`: Finalizing mappings

## Components

### ImportWorkflow

Main orchestrator component.

**Props:**

```typescript
{
  open: boolean;
  context: ExtractionContext;
  file?: File;
  apiConfig?: ApiConfig;
  title?: string;
  onClose: () => void;
  onSuccess?: (result: ExtractionResult) => void;
  onProgress?: (status: OperationStatusResponse) => void;
}
```

### ResultsTable

Displays categorized extraction results with column organization.

**Props:**

```typescript
{
  result: ExtractionResult;
  context: ExtractionContext;
  onConfirm?: (finalMappings, compoundOverrides) => void;
  onCancel?: () => void;
}
```

### CompoundCell

Displays a compound column with multiple extractions and confidence indicators.

**Props:**

```typescript
{
  column: CompoundColumn;
  onOverride?: (targetField: string, newValue: string | number | null) => void;
}
```

## State Management

### Mapping Reducer

Manages field mappings with support for direct and compound mappings:

```typescript
import { useReducer } from 'react';
import { mappingReducer, buildInitialMappings } from '@yourorg/gdi-component-lib';

const [mappings, dispatch] = useReducer(
  mappingReducer,
  buildInitialMappings(result, context),
);

// Update a direct mapping
dispatch({
  type: 'UPDATE_DIRECT_MAPPING',
  payload: { sourceColumn: 'First Name', targetField: 'firstName' },
});
```

### Final Output

Build final output from mappings:

```typescript
import { buildFinalOutput } from '@yourorg/gdi-component-lib';

const finalOutput = buildFinalOutput(result, mappings);
// Returns: { items: FinalOutputItem[], metadata: {...} }
```

## Utilities

### Confidence Utilities

```typescript
import { getConfidenceLevel, getConfidenceColor } from '@yourorg/gdi-component-lib';

const level = getConfidenceLevel(8); // 'high'
const color = getConfidenceColor(8); // 'success'
```

### Column Organization

```typescript
import { organizeColumns, getAllSourceColumns } from '@yourorg/gdi-component-lib';

const { directColumns, compoundColumns, unmappedColumns } = organizeColumns(result);
const allColumns = getAllSourceColumns(result);
```

### File Validation

```typescript
import { validateFile } from '@yourorg/gdi-component-lib';

const validation = validateFile(file);
if (!validation.ok) {
  console.error(validation.error.message);
}
```

## TypeScript Support

The library is fully typed with comprehensive TypeScript definitions. All types are
exported for use in consuming applications:

```typescript
import type {
  ExtractionContext,
  ExtractionResult,
  CategorizedRow,
  CompoundExtraction,
  ConfidenceScore,
  OperationStatusResponse,
  // ... and many more
} from '@yourorg/gdi-component-lib';
```

## Testing

Run tests:

```bash
pnpm test
```

Component tests are located in `components/__tests__/`.

## Backend Integration

This library is designed to work with the Python backend service described in the
[Full Implementation Plan](../../FULL-IMPLMENTATION-PLAN.md).

**Required Backend Endpoints:**

- `POST /extract`: Initiate extraction
- `GET /operations/{id}`: Get operation status
- `POST /operations/{id}/cancel`: Cancel operation

See the implementation plan for full API specifications.

## License

MIT
