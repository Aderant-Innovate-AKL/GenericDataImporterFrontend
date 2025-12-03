import { Error404Page } from '@aderant/stridyn-foundation';
import { Box } from '@mui/material';

const SCROLLBAR_WIDTH_PX = 15;

export default function NotFoundPage() {
  return (
    <Box
      sx={{
        width: `calc(100vw - ${SCROLLBAR_WIDTH_PX}px)`,
        '> div': {
          padding: '0 !important',
        },
      }}
      data-testid="not-found-page"
    >
      <Error404Page
        translations={{
          title: 'Page Not Found',
          message: 'The page you are looking for does not exist or has been moved.',
        }}
      />
    </Box>
  );
}
