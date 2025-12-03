import { describe, it, expect, beforeAll } from 'vitest';

import { isBinaryFile, validateFile } from '../fileValidator';

// Mock arrayBuffer for Blob/File in test environment
beforeAll(() => {
  if (!Blob.prototype.arrayBuffer) {
    Blob.prototype.arrayBuffer = async function () {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as ArrayBuffer);
        reader.readAsArrayBuffer(this);
      });
    };
  }
});

function makeTextFile(name: string, content: string): File {
  return new File([content], name, { type: 'text/plain' });
}

function makeBinaryFile(name: string): File {
  const bytes = new Uint8Array([0, 255, 0, 10]);
  return new File([bytes], name, { type: 'application/octet-stream' });
}

describe('fileValidator', () => {
  it('detects empty file', async () => {
    const empty = new File([], 'empty.txt');
    const res = await validateFile(empty, 1024);
    expect(res.ok).toBe(false);
    expect(res.error?.code).toBe('EMPTY_FILE');
  });

  it('rejects files too large', async () => {
    const big = makeTextFile('big.txt', 'x'.repeat(3000));
    const res = await validateFile(big, 1024);
    expect(res.ok).toBe(false);
    expect(res.error?.code).toBe('FILE_TOO_LARGE');
  });

  it('detects binary content unless spreadsheet allowed', async () => {
    const bin = makeBinaryFile('dat.bin');
    const isBin = await isBinaryFile(bin, false);
    expect(isBin).toBe(true);

    const xlsx = makeBinaryFile('book.xlsx');
    const isBinSheet = await isBinaryFile(xlsx, true);
    expect(isBinSheet).toBe(false);
  });

  it('accepts valid text file', async () => {
    const txt = makeTextFile('note.txt', 'Hello world');
    const res = await validateFile(txt, 1024);
    expect(res.ok).toBe(true);
  });
});
