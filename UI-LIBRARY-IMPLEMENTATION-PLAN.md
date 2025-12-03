# UI Library Implementation Plan

## Overview

A TypeScript React UI library that powers the Generic Data Importer front-end. This
library provides reusable, hackathon-ready components, services, and types to implement
the import workflow UI described in the full plan. It targets React 19, TypeScript 5.7+,
Vite, and MUI v7, with TanStack Query for async state and Axios for API calls.

- Package location: `ui/`
- Demo app consumes the library: `app/`
- No backend required for local dev; API client is optional and configurable

## Goals

- Deliver a tree-shakeable, documented UI library with core import workflow components
- Provide a clean service layer and shared types for API integration
- Include testing and example usage via the demo app
- Align visuals and interactions with confidence, compound extraction, and mapping rules

## Architecture Notes

- Use React 19 function components; avoid `React.FC`
- Styling via MUI `sx` prop only; no inline styles

0. ImportWorkflow (new) (`ui/src/components/ImportWorkflow.tsx`)

- Purpose: own the import state machine and heavy logic; coordinates steps and service
  calls.
- Responsibilities: sheet selection flow, operation initiation + polling, progress
  propagation, error routing, result handoff.
- Render: composes `ImportDialog` (visual wrapper) and specific step screens.
- TypeScript-first: strict types, camelCase data structures to match API conventions
- Library exports organized from `ui/src/index.ts`
- Components are composable and do not assume global state; services/hooks provide async
  data
- Avoid hard dependencies on backend; allow mock data for demo app
- Visual wrapper only (dialog shell, title, actions). Avoid heavy logic.
- Props: `open`, `onClose`, `title`, `children`, `footer`.
- The `ImportWorkflow` drives content; `ImportDialog` provides layout.

## Dependencies

- Peer dependencies: `react`, `react-dom`, `@mui/material`, `@emotion/react`,
  `@emotion/styled`
- Direct: `@tanstack/react-query`, `axios`
- Dev/test: `vitest`, `@testing-library/react`, `@testing-library/user-event`, `happy-dom`
  or `jsdom`, `typescript`

## Phase 1 — Setup

- Initialize package metadata in `ui/package.json`
- Ensure build configs: `tsconfig.json`, `tsconfig.build.json`
- Establish export surface in `ui/src/index.ts`
- Add base types folder `ui/src/types/`
- Configure lint/format and testing in root and `ui/`
- Verify demo app can import `ui` locally via workspaces

Deliverables:

- Updated `ui/package.json` with peer deps, build, and test scripts
- Build succeeds: `pnpm -w build` compiles `ui`

## Phase 2 — Types and Shared Interfaces

Create strongly-typed models aligned to the plan.

- Lazy-load XLSX via dynamic import to minimize baseline bundle size.
- Provide a pluggable adapter interface (`SheetMetadataReader`) so consumers can supply
  their own reader.
- Fallback: if adapter not provided and import fails, gracefully skip sheet metadata and
  proceed. Files:
- `ui/src/types/index.ts`
- `ui/src/types/api.ts`
- `ui/src/types/context.ts`
- `ui/src/types/results.ts`

Key types:

- File validation: `FileValidationResult`, `FileValidationError`
- `ui/src/state/selectors.ts` (co-located selector logic)
- Import errors: `ImportError`, `ErrorCode`
- API config: `ApiConfig`
- Operation progress: `OperationProgress`
- Extraction context: field definitions, required flags
- Extraction results: direct, compound, unmapped row structures, confidence
- Mapping state: `FieldMappings`, `DirectMappingEntry`, `CompoundMapping`
- Co-locate selector logic: `getAvailableFields`, `getConfirmButtonState`, and computed
  views near the reducer to avoid scattering.

Deliverables:

- Complete type definitions with camelCase fields matching full plan

## Phase 3 — Utilities and Services

Implement foundational utilities and the ImportService.

Files:

- Inline warnings on column headers for required fields that are unmapped (badge or subtle
  warning icon).
- On confirm press, highlight all unmet required fields and disable confirm with a tooltip
  explaining which fields need mapping.
- `ui/src/utils/fileValidator.ts`
- `ui/src/utils/sheetInspector.ts`
- `ui/src/services/importService.ts`
- `ui/src/utils/confidence.ts`
- `ui/src/utils/organize.ts` (column organization and helpers)

Tasks: Stack validation tests:

- Verify MUI v7 runs cleanly on React 19 (no experimental flags needed).
- Ensure Emotion style insertion works with Vite dev and build (no hydration/class
  flicker).
- Add a small test/demo page exercising MUI components with Vite HMR to catch regressions.
- FileValidator
  - `isBinaryFile(file)` per plan: chunk read, null byte and non-printable detection;
    spreadsheet exceptions
  - `validateFile(file, maxSize)` with error codes: `EMPTY_FILE`, `FILE_TOO_LARGE`,
    `BINARY_FILE`
- SheetInspector
  - Use lightweight XLSX reading to list sheets and metadata (hidden, row estimates)
- ImportService
  - Wrap endpoints: `POST /extract`, `GET /operations/{id}`, cancel, with polling
  - Provide `extractWithPolling(file, context, apiConfig, onProgress?)`
  - Handle error normalization and retryable flags
- Confidence utilities
  - `getConfidenceLevel(score)` → `high|good|medium|low|very-low`
  - `getConfidenceLabel(score)`
- Organize utilities
  - `organizeColumns(result)` → directMatches, compoundExtractions, unmatchedColumns
  - `getAllSourceColumns(result)`
  - `getAvailableFields(allFields, mappings, excludeColumn)`

Deliverables:

- Unit-tested utilities with edge cases (binary detection, confidence mapping)

## Phase 4 — Core Components

Implement core UI flow components.

Exports from `ui/src/index.ts`:

- Components: `FileDropzone`, `ImportDialog`, `SheetSelector`, `LoadingOverlay`,
  `ErrorDialog`, `ResultsTable`, `MappingSelector`, `CompoundCell`, `ColumnHeader`
- Hooks/services: `ImportService`
- Types

Details:

1. FileDropzone (`ui/src/components/FileDropzone.tsx`)

- Drag-and-drop and click-to-select
- Props: `maxFileSize`, `acceptsSpreadsheets`, `onFileSelected`, `onError`, `className`
- Client-side validation via `fileValidator`
- Visual states: default and drag-hover

2. ImportDialog (`ui/src/components/ImportDialog.tsx`)

- Manages workflow steps after file selection
- Props: `file`, `open`, `onClose`, `onSuccess`, `context`, `apiConfig`
- Internal states: sheet selection (if needed), loading overlay with progress, error
  dialog, results table
- Uses `ImportService.extractWithPolling`

3. SheetSelector (`ui/src/components/SheetSelector.tsx`)

- Shows available sheets with name, row count, hidden flag
- Callback `onSelect(sheetName)`

4. LoadingOverlay (`ui/src/components/LoadingOverlay.tsx`)

- Shows spinner, progress bar, phase label mapping, cancel button
- Props: `message`, `progress?: OperationProgress`, `onCancel?`
- Phase labels: parsing, discovery, extraction, mapping

5. ErrorDialog (`ui/src/components/ErrorDialog.tsx`)

- Renders error messages mapped by `ErrorCode`
- Actions: retry, select different file, dismiss based on error properties

6. ResultsTable (`ui/src/components/ResultsTable.tsx`)

- Table with three column groups: direct matches (editable), compound extractions
  (locked), unmatched
- Displays confidence: headers for direct columns; per-cell highlight for compound
- Manages state via reducer for mappings
- Props include: `result`, `context`, `onConfirm(finalMappings, compoundOverrides)`,
  `onCancel`

7. MappingSelector (`ui/src/components/MappingSelector.tsx`)

- Dropdown for selecting target field mapping per direct column
- Enforces uniqueness; disables in-use fields; includes `None`

8. CompoundCell (`ui/src/components/CompoundCell.tsx`)

- Shows original value with highlighted extracted segment
- Supports text selection and right-click context menu with actions: use selection, clear
  extraction
- Handles `isUserModified` (gray highlight) and confidence tooltip

9. ColumnHeader (`ui/src/components/ColumnHeader.tsx`)

- Header with confidence background for direct columns if not user-modified
- Uses confidence utilities

Deliverables:

- Component implementations aligned with plan visuals and behaviors
- Demo examples wired in `app/` consuming `ui`

## Phase 5 — State Management

Implement reducer and helpers for results mapping state.

Files:

- `ui/src/state/mappingReducer.ts`
- `ui/src/state/buildInitialMappings.ts`
- `ui/src/state/finalOutput.ts`

Tasks:

- Mapping reducer with actions: `SET_INITIAL`, `UPDATE_DIRECT_MAPPING`, `RESET`
- Track `isUserModified` and enforce unique field selection
- Build initial `FieldMappings` from `ExtractionResult`
- Build `FinalOutput` from `ExtractionResult`, direct mappings, and `compoundOverrides`
- `getConfirmButtonState(context, mappings)` to validate required fields mapped

Deliverables:

- Reducer unit tests (duplicate mapping prevention, user-modified handling)

## Phase 6 — Styling

- Use MUI components and `sx` prop exclusively
- Define confidence CSS variables within components or a shared style module
- Implement hover and selection interactions for `CompoundCell`
- Ensure accessibility: focus states, ARIA labels on interactive elements

Deliverables:

- Consistent, theme-aware styles per plan’s confidence colors and visuals

## Phase 7 — Testing

- Unit tests for utilities (file validation, confidence mapping, organizers)
- Component tests: `FileDropzone`, `ImportDialog` flow, `ResultsTable` mapping
  interactions, `CompoundCell` overrides
- Mock service responses for polling and progress updates
- Snapshot tests for key visual states where helpful

Commands:

- `pnpm -w test`
- `pnpm -w test:watch`

## Phase 8 — Documentation

- JSDoc on exported functions and components
- `ui/README.md` with usage examples
- Document API integration via `ImportService` and mock usage
- Showcase demo usage in `app/` with minimal wiring

Deliverables:

- Clear README with quick-start, props, and examples

## Phase 9 — Release and Packaging

- Ensure `ui` builds and type declarations are emitted
- Validate tree-shakeable exports and minimize bundle size
- Prepare versioning and changelog if publishing is desired
- Keep private packages optional; use environment variables if later needed

Deliverables:

- Built library artifacts and successful demo app integration

## Task Breakdown (Actionable Steps)

1. Setup `ui` package: peer deps, build scripts, exports
2. Implement types (`api`, `context`, `results`, `index`)
3. Implement utilities: file validator, sheet inspector, confidence, organize
4. Implement `ImportService` with polling
5. Implement core components (FileDropzone → ImportDialog → ResultsTable)
6. Implement mapping reducer and final output builder
7. Style components with MUI `sx` and confidence visuals
8. Write unit/component tests and run CI locally
9. Author README and demo integration in `app`
10. Build and verify consumption from `app`

## Acceptance Criteria

- Library compiles and exports all components/services/types from `ui/src/index.ts`
- Demo app can import and render the import workflow end-to-end with mock data
- File validation enforces size, binary detection, and error handling per plan
- Polling shows progress phases and supports cancel
- Results table enforces unique field mappings; compound highlights and overrides work
- Final output matches the plan’s simple JSON array of field values
- Tests cover core behaviors and pass under `pnpm test`

## Risks and Mitigations

- Backend not available: provide mock service responses and allow demo without server
- Excel metadata parsing: if SheetJS adds weight, gate behind optional import or lazy
  loading
- Large results rendering: consider virtualization later; initial scope uses standard
  tables

## Work Phasing Summary

- Week 1: Setup, types, utilities, ImportService
- Week 2: Core components, mapping state, styling
- Week 3: Testing, docs, demo integration, polish
