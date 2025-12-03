import { FormControl, InputLabel, MenuItem, Select } from '@mui/material';

import type { FieldDefinition } from '../types';

interface MappingSelectorProps {
  value: string | null;
  fields: FieldDefinition[];
  disabledFieldIds?: string[];
  onChange: (next: string | null) => void;
  label?: string;
}

/**
 * Dropdown selector for mapping a source column to a target field.
 * Displays \"None\" option plus all available fields.
 * Disabled fields are greyed out.
 */
export default function MappingSelector({
  value,
  fields,
  disabledFieldIds = [],
  onChange,
  label = 'Map to Field',
}: MappingSelectorProps) {
  const disabled = new Set(disabledFieldIds);
  return (
    <FormControl size="small" sx={{ minWidth: 180 }}>
      <InputLabel>{label}</InputLabel>
      <Select
        value={value ?? ''}
        label={label}
        onChange={(e) => {
          const v = e.target.value as string;
          onChange(v === '' ? null : v);
        }}
      >
        <MenuItem value="">None</MenuItem>
        {fields.map((f) => (
          <MenuItem key={f.field} value={f.field} disabled={disabled.has(f.field)}>
            {f.field}
            {f.required ? ' *' : ''}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
