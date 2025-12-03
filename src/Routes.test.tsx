import { PropsWithChildren } from 'react';

import { render, screen } from '@testing-library/react';
import { createRoutesStub, Outlet } from 'react-router';
import { describe, it, expect, vi } from 'vitest';

import { routes } from './Routes';
import { generateTestIDs } from './utils/test';

const routeTestCases = generateTestIDs(routes);

vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
}));

vi.mock('./App', () => {
  return {
    default: () => (
      <div>
        <Outlet />
      </div>
    ),
  };
});

vi.mock('@aderant/stridyn-foundation', async (importOriginal) => {
  const original =
    (await importOriginal()) as typeof import('@aderant/stridyn-foundation');
  return {
    ...original,
    PlatformPageContainer: <T extends object>({
      children,
      ...rest
    }: PropsWithChildren<T>) => <div {...rest}>{children}</div>,
    PlatformPageTitleBar: () => <div>Title Bar</div>,
  };
});

const Stub = createRoutesStub(routes);

const renderWithRouter = (route: string = '/') => {
  return render(
    <div>
      <Stub initialEntries={[route]} />
    </div>,
  );
};

describe('Routes', () => {
  it.each(routeTestCases)(
    'should render the $path page for $path path',
    async ({ path, testID }) => {
      renderWithRouter(path);
      const text = await screen.findByTestId(testID);
      expect(text).toBeInTheDocument();
    },
  );
});
