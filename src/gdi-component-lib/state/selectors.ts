import type { ExtractionContext, FieldMappings, ConfirmButtonState } from '../types';

/**
 * Compute confirm button state: enabled only when all required fields are mapped.
 * Returns unmet required field IDs and an optional tooltip message.
 */
export function getConfirmButtonState(
  context: ExtractionContext,
  mappings: FieldMappings,
): ConfirmButtonState {
  const requiredFields = context.fields.filter((f) => f.required).map((f) => f.field);
  const mappedFields = new Set<string>();

  // Collect mapped fields from direct mappings
  Object.values(mappings.direct).forEach((entry) => {
    if (entry.targetField) {
      mappedFields.add(entry.targetField);
    }
  });

  // Collect mapped fields from compound mappings
  Object.values(mappings.compound).forEach((entry) => {
    if (entry.targetField) {
      mappedFields.add(entry.targetField);
    }
  });

  const unmetRequiredFields = requiredFields.filter((field) => !mappedFields.has(field));
  const enabled = unmetRequiredFields.length === 0;
  const tooltip = enabled
    ? undefined
    : `Required fields not mapped: ${unmetRequiredFields.join(', ')}`;

  return { enabled, unmetRequiredFields, tooltip };
}
