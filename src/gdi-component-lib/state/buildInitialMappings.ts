import type {
  ExtractionResult,
  FieldMappings,
  DirectMappingEntry,
  ExtractionContext,
} from '../types';

/**
 * Builds initial field mappings from extraction result.
 * For categorized row structure, we extract all source columns from the first row.
 */
export function buildInitialMappings(
  result: ExtractionResult,
  context: ExtractionContext,
): FieldMappings {
  const direct: Record<string, DirectMappingEntry> = {};

  // Extract source columns from first row (categorized structure)
  if (result.data.length === 0) {
    return { direct: {}, compound: {} };
  }

  const firstRow = result.data[0];
  const sourceColumns = [
    ...Object.keys(firstRow.direct || {}),
    ...Object.keys(firstRow.compound || {}),
    ...Object.keys(firstRow.unmapped || {}),
  ];

  // Create lookup maps for field matching
  const fieldByName = new Map(
    context.fields.map((f) => [f.field.toLowerCase(), f.field]),
  );

  // Try to match source columns to target fields by name
  for (const col of sourceColumns) {
    const key = col.toLowerCase();
    const matchedField = fieldByName.get(key) || null;

    direct[col] = {
      sourceColumn: col,
      targetField: matchedField,
      isUserModified: false,
    };
  }

  return { direct, compound: {} };
}
