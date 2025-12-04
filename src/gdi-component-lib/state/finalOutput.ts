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
 * - Compound extractions: Use the extracted value for the target field (or user override)
 * - Unmapped columns are ignored
 */
export function buildFinalOutput(
  result: ExtractionResult,
  mappings: FieldMappings,
  compoundOverrides?: Record<
    number,
    Record<string, Record<string, string | number | null>>
  >,
): FinalOutput {
  const items: FinalOutputItem[] = [];

  result.data.forEach((row, rowIndex) => {
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
    for (const [sourceColumn, compoundCol] of Object.entries(row.compound)) {
      // Each compound column can have multiple extractions
      for (const extraction of compoundCol.extractions) {
        // Check if user has overridden this extraction for this row
        const overrideValue =
          compoundOverrides?.[rowIndex]?.[sourceColumn]?.[extraction.targetField];

        // Use override if available, otherwise use extracted value
        item[extraction.targetField] =
          overrideValue !== undefined ? overrideValue : extraction.extractedValue;
      }
    }

    items.push(item);
  });

  return {
    items,
    metadata: {
      exportedAt: new Date().toISOString(),
      totalItems: items.length,
    },
  };
}
