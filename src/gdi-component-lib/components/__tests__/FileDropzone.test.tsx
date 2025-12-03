import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

import FileDropzone from '../FileDropzone';

describe('FileDropzone', () => {
  it('calls onFileSelected when a file is chosen', async () => {
    const onFileSelected = vi.fn();
    render(<FileDropzone onFileSelected={onFileSelected} />);

    const input = screen
      .getByLabelText('Choose file')
      .querySelector('input[type="file"]') as HTMLInputElement;

    const file = new File(['hello'], 'hello.txt', { type: 'text/plain' });

    // Create a mock FileList
    Object.defineProperty(input, 'files', {
      value: [file],
      writable: false,
    });

    await fireEvent.change(input);

    // Wait for async validation to complete
    await waitFor(() => expect(onFileSelected).toHaveBeenCalledWith(file), {
      timeout: 3000,
    });
  });
});
