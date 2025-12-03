import type { FieldMappings, DirectMappingEntry } from '../types';

export type MappingAction =
  | { type: 'SET_INITIAL'; payload: FieldMappings }
  | {
      type: 'UPDATE_DIRECT_MAPPING';
      payload: { sourceColumn: string; targetField: string | null };
    }
  | { type: 'RESET' };

export function mappingReducer(
  state: FieldMappings,
  action: MappingAction,
): FieldMappings {
  switch (action.type) {
    case 'SET_INITIAL':
      return cloneMappings(action.payload);
    case 'UPDATE_DIRECT_MAPPING': {
      const { sourceColumn, targetField } = action.payload;
      const next = cloneMappings(state);
      const current = next.direct[sourceColumn] ?? { sourceColumn, targetField: null };
      // Enforce uniqueness: no other column can keep the same targetField
      if (targetField) {
        Object.keys(next.direct).forEach((col) => {
          if (col !== sourceColumn && next.direct[col]?.targetField === targetField) {
            next.direct[col] = { ...next.direct[col], targetField: null };
          }
        });
      }
      const updated: DirectMappingEntry = {
        ...current,
        sourceColumn,
        targetField,
        isUserModified: true,
      };
      next.direct[sourceColumn] = updated;
      return next;
    }
    case 'RESET':
      return { direct: {}, compound: {} };
    default:
      return state;
  }
}

function cloneMappings(m: FieldMappings): FieldMappings {
  return {
    direct: Object.fromEntries(
      Object.entries(m.direct ?? {}).map(([k, v]) => [k, { ...v }]),
    ),
    compound: Object.fromEntries(
      Object.entries(m.compound ?? {}).map(([k, v]) => [k, { ...v }]),
    ),
  };
}
