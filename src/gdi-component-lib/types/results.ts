// Extraction results and confidence types matching the categorized row structure

// Confidence score (1-10 from LLM)
export interface ConfidenceScore {
  value: number; // 1-10
  level: 'high' | 'medium' | 'low'; // derived from value
}

// Direct mapping: simple column rename
export interface DirectMapping {
  sourceColumn: string;
  targetField: string;
  value: string | number | null;
  confidence?: number; // 1-10 from backend
}

// Compound extraction: one extraction from a compound column
export interface CompoundExtraction {
  targetField: string;
  extractedValue: string | number | null;
  confidence: ConfidenceScore;
  highlightStart?: number; // for UI highlighting within source value
  highlightEnd?: number;
  isUserModified?: boolean;
}

// Compound column with multiple extractions
export interface CompoundColumn {
  sourceColumn: string;
  sourceValue: string | number | null;
  extractions: CompoundExtraction[];
}

// Unmapped column (not mapped to any target field)
export interface UnmappedColumn {
  sourceColumn: string;
  value: string | number | null;
}

// Categorized row structure from GET /operations/{id} completed response
export interface CategorizedRow {
  direct: Record<string, DirectMapping>; // keyed by source column
  compound: Record<string, CompoundColumn>; // keyed by source column
  unmapped: Record<string, UnmappedColumn>; // keyed by source column
}

// Extraction metadata from completed response
export interface ExtractionMetadata {
  sourceFile?: string;
  rowsProcessed?: number;
  extractionSummary?: {
    directMappings: number;
    compoundExtractions: number;
    unmappedColumns: string[];
    unmappedFields: string[];
    llmCalls?: number;
    processingTimeMs?: number;
    averageConfidence?: number;
  };
  // Legacy fields for backward compatibility
  totalRows?: number;
  directMappings?: number;
  compoundColumns?: number;
  unmappedColumns?: number;
  averageConfidence?: number;
}

// Complete extraction result from GET /operations/{id} when status = 'completed'
export interface ExtractionResult {
  source?: {
    filename: string;
    sheetName?: string;
    totalRows: number;
  };
  data: CategorizedRow[]; // Backend returns 'data' not 'rows'
  metadata: ExtractionMetadata;
}

// Final output item for export (flattened row with target field values)
export interface FinalOutputItem {
  [targetFieldId: string]: string | number | null;
}

// Final output for export
export interface FinalOutput {
  items: FinalOutputItem[];
  metadata?: {
    exportedAt: string;
    totalItems: number;
  };
}
