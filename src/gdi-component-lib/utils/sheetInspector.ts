// Lightweight sheet inspector using dynamic import to avoid baseline bundle cost.
// Consumers can provide their own adapter; this module attempts to read basic sheet metadata.

export interface SheetMetadata {
  name: string;
  hidden?: boolean;
  rowEstimate?: number;
}

export interface SheetInspectionResult {
  sheets: SheetMetadata[];
}

export interface SheetMetadataReader {
  read(file: File): Promise<SheetInspectionResult>;
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
      const hidden = !!wb.Workbook?.Sheets?.find(
        (s: { name: string; Hidden?: boolean }) => s.name === name,
      )?.Hidden;
      return { name, hidden, rowEstimate };
    });
    return { sheets };
  } catch {
    // Fallback: no metadata available
    return { sheets: [] };
  }
}

export async function inspectSheets(
  file: File,
  reader?: SheetMetadataReader,
): Promise<SheetInspectionResult> {
  if (reader) return reader.read(file);
  return defaultSheetReader(file);
}
