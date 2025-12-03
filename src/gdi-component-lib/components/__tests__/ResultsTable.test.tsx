import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

import type { ExtractionResult, ExtractionContext } from '../../types';
import ResultsTable from '../ResultsTable';

describe('ResultsTable mapping', () => {
  it('renders columns and rows', () => {
    const result: ExtractionResult = {
      source: {
        filename: 'test.csv',
        sheetName: 'Sheet1',
        totalRows: 2,
      },
      rows: [
        {
          direct: {
            A: { sourceColumn: 'A', targetField: 'fieldA', value: 'a1' },
            B: { sourceColumn: 'B', targetField: 'fieldB', value: 'b1' },
          },
          compound: {},
          unmapped: {},
        },
        {
          direct: {
            A: { sourceColumn: 'A', targetField: 'fieldA', value: 'a2' },
            B: { sourceColumn: 'B', targetField: 'fieldB', value: 'b2' },
          },
          compound: {},
          unmapped: {},
        },
      ],
      metadata: {
        totalRows: 2,
        directMappings: 2,
        compoundColumns: 0,
        unmappedColumns: 0,
      },
    };
    const context: ExtractionContext = {
      description: 'Test data',
      fields: [
        { field: 'fieldA', description: 'Field A' },
        { field: 'fieldB', description: 'Field B' },
      ],
    };
    render(<ResultsTable result={result} context={context} />);

    expect(screen.getByText('a1')).toBeInTheDocument();
    expect(screen.getByText('b2')).toBeInTheDocument();
  });
});
