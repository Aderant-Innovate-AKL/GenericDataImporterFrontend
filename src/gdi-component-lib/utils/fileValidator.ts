import type { FileValidationResult, FileValidationError } from '../types';

// Detects if a File is likely binary by reading a small chunk and checking for null bytes
// and a ratio of non-printable characters. Spreadsheet files may contain binary headers,
// so allow extensions commonly used for spreadsheets if acceptsSpreadsheets=true.
export async function isBinaryFile(
  file: File,
  acceptsSpreadsheets = true,
): Promise<boolean> {
  const spreadsheetExts = ['.xlsx', '.xls', '.ods', '.csv'];
  const name = file.name.toLowerCase();
  const isSpreadsheet = spreadsheetExts.some((ext) => name.endsWith(ext));
  if (acceptsSpreadsheets && isSpreadsheet) return false;

  const chunkSize = 1024; // 1KB sample
  const blob = file.slice(0, Math.min(file.size, chunkSize));
  const buf = await blob.arrayBuffer();
  const bytes = new Uint8Array(buf);
  let nonPrintable = 0;
  for (let i = 0; i < bytes.length; i++) {
    const b = bytes[i];
    if (b === 0) return true; // null byte
    // printable ASCII range roughly 9..127 (include tabs/newlines)
    if (!(b === 9 || b === 10 || b === 13 || (b >= 32 && b <= 126))) {
      nonPrintable++;
    }
  }
  const ratio = bytes.length > 0 ? nonPrintable / bytes.length : 0;
  return ratio > 0.3; // heuristic threshold
}

export async function validateFile(
  file: File,
  maxSizeBytes: number,
  acceptsSpreadsheets = true,
): Promise<FileValidationResult> {
  const makeError = (
    code: FileValidationError['code'],
    message: string,
  ): FileValidationError => ({
    code,
    message,
  });

  if (!file || file.size === 0) {
    return { ok: false, error: makeError('EMPTY_FILE', 'The selected file is empty.') };
  }

  if (file.size > maxSizeBytes) {
    return {
      ok: false,
      error: makeError('FILE_TOO_LARGE', 'The selected file exceeds the maximum size.'),
      size: file.size,
    };
  }

  const binary = await isBinaryFile(file, acceptsSpreadsheets);
  if (binary) {
    return {
      ok: false,
      error: makeError('BINARY_FILE', 'The selected file appears to be binary.'),
    };
  }

  return { ok: true, size: file.size };
}
