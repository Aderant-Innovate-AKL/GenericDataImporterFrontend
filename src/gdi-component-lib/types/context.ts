// Extraction context and field definition types matching section 1.2

// Field definition for the context schema
export interface FieldDefinition {
  field: string; // target field identifier
  description: string; // description to help LLM understand what to extract
  dataType?: 'string' | 'number' | 'date' | 'boolean'; // optional type hint
  required?: boolean; // whether this field must be filled
  examples?: string[]; // example values to help LLM
}

export interface ExtractionContext {
  description: string; // overall description of the data and its purpose
  fields: FieldDefinition[]; // array of fields to extract
  hints?: Record<string, unknown>; // optional domain-specific hints
}

export interface DirectMappingEntry {
  sourceColumn: string; // column name from the input sheet
  targetField: string | null; // null indicates "unmapped" or "None"
  isUserModified?: boolean; // set when user changes mapping
}

export interface CompoundMappingEntry {
  sourceColumns: string[]; // columns involved in extraction
  targetField: string; // field being extracted
  rule?: string; // optional extraction rule or pattern
  isUserModified?: boolean;
}

export interface FieldMappings {
  direct: Record<string, DirectMappingEntry>; // keyed by source column
  compound: Record<string, CompoundMappingEntry>; // keyed by target field
}

export interface ConfirmButtonState {
  enabled: boolean;
  unmetRequiredFields: string[]; // list of required field IDs not yet mapped
  tooltip?: string; // explanation of why button is disabled
}
