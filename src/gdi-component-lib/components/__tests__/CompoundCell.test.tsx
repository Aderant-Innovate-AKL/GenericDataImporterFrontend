import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

import type { CompoundColumn } from '../../types';
import CompoundCell from '../CompoundCell';

describe('CompoundCell overrides', () => {
  it('displays compound column with extractions', () => {
    const column: CompoundColumn = {
      sourceColumn: 'Contact Info',
      sourceValue: 'john@example.com | +1-555-0100',
      extractions: [
        {
          targetField: 'email',
          extractedValue: 'john@example.com',
          confidence: { value: 9, level: 'high' },
          highlightStart: 0,
          highlightEnd: 17,
        },
        {
          targetField: 'phone',
          extractedValue: '+1-555-0100',
          confidence: { value: 8, level: 'high' },
          highlightStart: 20,
          highlightEnd: 32,
        },
      ],
    };

    render(<CompoundCell column={column} />);

    // Check that source value is displayed
    expect(screen.getByText('john@example.com | +1-555-0100')).toBeInTheDocument();

    // Check that extractions are displayed as chips
    expect(screen.getByText(/email:/)).toBeInTheDocument();
    expect(screen.getByText(/phone:/)).toBeInTheDocument();
  });
});
