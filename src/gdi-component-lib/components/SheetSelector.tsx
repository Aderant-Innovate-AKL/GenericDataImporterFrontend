import { Box, List, ListItemButton, ListItemText, Typography } from '@mui/material';

import type { ExtractionContext } from '../types';

interface SheetSelectorProps {
  context: ExtractionContext;
  onSelect: (sheetName: string) => void;
}

export default function SheetSelector({ onSelect }: SheetSelectorProps) {
  // Placeholder: In Phase 3, `sheetInspector` provides metadata; here we show a stub.
  const sheets = [{ name: 'Sheet1' }, { name: 'Sheet2' }];
  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 1 }}>
        Select a sheet
      </Typography>
      <List>
        {sheets.map((s) => (
          <ListItemButton key={s.name} onClick={() => onSelect(s.name)}>
            <ListItemText
              primary={s.name}
              secondary={s.name === 'Sheet2' ? 'Hidden' : undefined}
            />
          </ListItemButton>
        ))}
      </List>
    </Box>
  );
}
