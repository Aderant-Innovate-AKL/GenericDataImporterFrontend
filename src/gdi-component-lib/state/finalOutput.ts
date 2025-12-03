import type {
  ExtractionResult,
  FinalOutput,
  FinalOutputItem,
  FieldMappings,
} from '../types';

/**
 * Builds the final output by applying user mappings to the categorized row structure.
 * For each row:
 * - Direct mappings: Use the mapped source column value for the target field
 * - Compound extractions: Use the extracted value for the target field
 * - Unmapped columns are ignored
 */
export function buildFinalOutput(
  result: ExtractionResult,
  mappings: FieldMappings,
): FinalOutput {
  const items: FinalOutputItem[] = [];

  for (const row of result.rows) {
    const item: FinalOutputItem = {};

    // Apply direct mappings
    for (const [sourceCol, entry] of Object.entries(mappings.direct)) {
      if (entry.targetField) {
        const directMapping = row.direct[sourceCol];
        if (directMapping) {
          item[entry.targetField] = directMapping.value;
        }
      }
    }

    // Apply compound extractions
    for (const compoundCol of Object.values(row.compound)) {
      // Each compound column can have multiple extractions
      for (const extraction of compoundCol.extractions) {
        // Use extracted value for the target field
        item[extraction.targetField] = extraction.extractedValue;
      }
    }

    items.push(item);
  }

  return {
    items,
    metadata: {
      exportedAt: new Date().toISOString(),
      totalItems: items.length,
    },
  };
}
