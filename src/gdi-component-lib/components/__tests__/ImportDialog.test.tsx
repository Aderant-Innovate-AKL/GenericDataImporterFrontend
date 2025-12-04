import { render, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

import { ImportService } from '../../services/importService';
import type { ExtractionContext, ExtractionResult } from '../../types';
import ImportDialog from '../ImportDialog';

const context: ExtractionContext = {
  description: 'Test import context',
  fields: [
    { field: 'firstName', description: 'First name', required: true },
    { field: 'lastName', description: 'Last name', required: true },
    { field: 'email', description: 'Email address', required: true },
  ],
};

const apiConfig = { baseUrl: '' };

describe('ImportDialog flow (mock)', () => {
  it('starts import automatically when file is provided and shows results', async () => {
    const file = new File(['x'], 'x.txt');
    const spy = vi.spyOn(ImportService.prototype, 'extractWithPolling');
    spy.mockResolvedValueOnce({
      source: {
        filename: 'x.txt',
        sheetName: 'MockSheet',
        totalRows: 1,
      },
      rows: [
        {
          direct: {
            firstName: {
              sourceColumn: 'firstName',
              targetField: 'firstName',
              value: 'John',
            },
          },
          compound: {},
          unmapped: {},
        },
      ],
      metadata: {
        totalRows: 1,
        directMappings: 1,
        compoundColumns: 0,
        unmappedColumns: 0,
      },
    } as ExtractionResult);

    const onSuccess = vi.fn();
    render(
      <ImportDialog
        open
        file={file}
        context={context}
        apiConfig={apiConfig}
        onClose={() => {}}
        onSuccess={onSuccess}
      />,
    );

    // Import should start automatically when file is provided
    await waitFor(() => expect(onSuccess).toHaveBeenCalled());
  });
});
