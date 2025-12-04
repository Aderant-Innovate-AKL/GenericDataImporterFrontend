import { RouteObject } from 'react-router';

export function generateTestIDs(
  routes: RouteObject[],
  basePath = '',
): { path: string; testID: string }[] {
  const result: { path: string; testID: string }[] = [];

  routes.forEach((route) => {
    if (route.path && route.Component && route.path !== '*') {
      const fullPath = `${basePath}/${route.path}`.replace(/\/+/g, '/');
      const paths = fullPath.split('/');
      const testID = `${paths[paths.length - 1]}-page`;
      if (fullPath !== '/') {
        result.push({ path: fullPath, testID });
      }
    }

    if (route.children) {
      result.push(...generateTestIDs(route.children, `${basePath}${route.path || ''}`));
    }
  });

  return result;
}

export function generateTestIdByPathname(pathname: string): string {
  const pathParts = pathname.split('/');
  return `${pathParts[pathParts.length - 1]}-page`;
}
