import { createBrowserRouter } from 'react-router';
import { Navigate } from 'react-router-dom';

import App from './App';
import Home from './pages/Home';
import NotFoundPage from './pages/NotFoundPage';

const routes = [
  {
    Component: App,
    errorElement: <NotFoundPage />,
    children: [
      {
        path: '/',
        Component: () => <Navigate data-testid="navigate-home" to="/home" replace />,
      },
      {
        path: '/home',
        Component: Home,
      },
      {
        path: '*',
        Component: NotFoundPage,
      },
    ],
  },
];

const router = createBrowserRouter(routes);

export { routes, router };
