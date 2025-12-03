import { test as base, expect } from '@playwright/test';

import { HomePage } from '../pages';
import { StridynFixture } from '../types';

export const test = base.extend<StridynFixture>({
  homePage: async ({ page }, config) => {
    const homePage = new HomePage(page);
    await config(homePage);
  },
});

export { expect };
