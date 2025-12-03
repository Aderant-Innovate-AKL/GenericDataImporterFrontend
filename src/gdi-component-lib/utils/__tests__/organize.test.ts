import { describe, it, expect } from 'vitest';

import type { ExtractionResult } from '../../types';
import { organizeColumns, getAllSourceColumns, getAvailableFields } from '../organize';

const mockResult: ExtractionResult = {
  source: {
    filename: 'test.csv',
    sheetName: 'Sheet1',
    totalRows: 2,
  },
  rows: [
    {
      direct: {
        'First Name': {
          sourceColumn: 'First Name',
          targetField: 'firstName',
          value: 'John',
        },
        'Last Name': { sourceColumn: 'Last Name', targetField: 'lastName', value: 'Doe' },
      },
      compound: {
        'Contact Info': {
          sourceColumn: 'Contact Info',
          sourceValue: 'john@example.com',
          extractions: [
            {
              targetField: 'email',
              extractedValue: 'john@example.com',
              confidence: { value: 9, level: 'high' },
            },
          ],
        },
      },
      unmapped: {
        Notes: { sourceColumn: 'Notes', value: 'Some note' },
      },
    },
  ],
  metadata: {
    totalRows: 2,
    directMappings: 2,
    compoundColumns: 1,
    unmappedColumns: 1,
  },
};

describe('organize utilities', () => {
  it('organizes columns into categories', () => {
    const organized = organizeColumns(mockResult);
    expect(organized.directColumns).toEqual(['First Name', 'Last Name']);
    expect(organized.compoundColumns).toEqual(['Contact Info']);
    expect(organized.unmappedColumns).toEqual(['Notes']);
  });

  it('returns all source columns', () => {
    const allColumns = getAllSourceColumns(mockResult);
    expect(allColumns).toContain('First Name');
    expect(allColumns).toContain('Contact Info');
    expect(allColumns).toContain('Notes');
    expect(allColumns.length).toBe(4);
  });

  it('filters available fields not used in mappings', () => {
    const fields = [{ field: 'firstName' }, { field: 'lastName' }, { field: 'email' }];
    const mappings = {
      direct: {
        'First Name': { targetField: 'firstName' },
        'Last Name': { targetField: null },
      },
    } as { direct: Record<string, { targetField: string | null }> };
    const available = getAvailableFields(fields, mappings);
    expect(available.map((f) => f.field)).toEqual(['lastName', 'email']);
  });

  it('handles empty result', () => {
    const emptyResult: ExtractionResult = {
      source: { filename: 'empty.csv', totalRows: 0 },
      rows: [],
      metadata: {
        totalRows: 0,
        directMappings: 0,
        compoundColumns: 0,
        unmappedColumns: 0,
      },
    };
    const organized = organizeColumns(emptyResult);
    expect(organized.directColumns).toEqual([]);
    expect(organized.compoundColumns).toEqual([]);
    expect(organized.unmappedColumns).toEqual([]);
  });
});
