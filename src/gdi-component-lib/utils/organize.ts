import type { ExtractionResult, CategorizedRow } from '../types';

/**
 * Organizes source columns from categorized row structure into categories.
 */
export function organizeColumns(result: ExtractionResult): {
  directColumns: string[];
  compoundColumns: string[];
  unmappedColumns: string[];
} {
  if (result.rows.length === 0) {
    return { directColumns: [], compoundColumns: [], unmappedColumns: [] };
  }

  const firstRow: CategorizedRow = result.rows[0];

  return {
    directColumns: Object.keys(firstRow.direct || {}).sort(),
    compoundColumns: Object.keys(firstRow.compound || {}).sort(),
    unmappedColumns: Object.keys(firstRow.unmapped || {}).sort(),
  };
}

export function getAllSourceColumns(result: ExtractionResult): string[] {
  if (result.rows.length === 0) return [];

  const firstRow: CategorizedRow = result.rows[0];
  const allColumns = [
    ...Object.keys(firstRow.direct || {}),
    ...Object.keys(firstRow.compound || {}),
    ...Object.keys(firstRow.unmapped || {}),
  ];

  return Array.from(new Set(allColumns)).sort();
}

export function getAvailableFields(
  allFields: { field: string }[],
  mappings: { direct: Record<string, { targetField: string | null }> },
  excludeColumn?: string,
): { field: string }[] {
  const used = new Set<string>();
  Object.entries(mappings.direct).forEach(([col, entry]) => {
    if (excludeColumn && col === excludeColumn) return;
    if (entry.targetField) used.add(entry.targetField);
  });
  return allFields.filter((f) => !used.has(f.field));
}
