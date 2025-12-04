// Lightweight sheet inspector using dynamic import to avoid baseline bundle cost.
// Consumers can provide their own adapter; this module attempts to read basic sheet metadata.

export interface SheetMetadata {
  name: string;
  hidden?: boolean;
  rowEstimate?: number;
  columnCount?: number;
}

export interface SheetInspectionResult {
  sheets: SheetMetadata[];
  /** Sheets that are not hidden */
  visibleSheets: SheetMetadata[];
  /** Whether this file has multiple visible sheets that require user selection */
  requiresSheetSelection: boolean;
}

export interface SheetMetadataReader {
  read(file: File): Promise<SheetInspectionResult>;
}

/** Check if file is a spreadsheet format (Excel, ODS, etc.) */
export function isSpreadsheetFile(file: File): boolean {
  const spreadsheetExts = ['.xlsx', '.xls', '.xlsm', '.xlsb', '.ods'];
  const name = file.name.toLowerCase();
  return spreadsheetExts.some((ext) => name.endsWith(ext));
}

/** Check if file is a CSV (single sheet, no inspection needed) */
export function isCsvFile(file: File): boolean {
  const name = file.name.toLowerCase();
  return name.endsWith('.csv') || name.endsWith('.tsv');
}

export async function defaultSheetReader(file: File): Promise<SheetInspectionResult> {
  // Try to load xlsx lazily; if not available or fails, return graceful fallback.
  try {
    const xlsx = await import('xlsx');
    const buf = await file.arrayBuffer();
    const wb = xlsx.read(buf, { type: 'array' });
    const sheets: SheetMetadata[] = wb.SheetNames.map((name: string) => {
      const sheet = wb.Sheets[name];
      const range =
        sheet && sheet['!ref'] ? xlsx.utils.decode_range(sheet['!ref']) : undefined;
      const rowEstimate = range ? range.e.r + 1 : undefined;
      const columnCount = range ? range.e.c + 1 : undefined;
      const hidden = !!wb.Workbook?.Sheets?.find(
        (s: { name: string; Hidden?: number }) => s.name === name,
      )?.Hidden;
      return { name, hidden, rowEstimate, columnCount };
    });
    const visibleSheets = sheets.filter((s) => !s.hidden);
    return {
      sheets,
      visibleSheets,
      requiresSheetSelection: visibleSheets.length > 1,
    };
  } catch {
    // Fallback: no metadata available, assume single sheet
    return { sheets: [], visibleSheets: [], requiresSheetSelection: false };
  }
}

export async function inspectSheets(
  file: File,
  reader?: SheetMetadataReader,
): Promise<SheetInspectionResult> {
  if (reader) return reader.read(file);
  return defaultSheetReader(file);
}
