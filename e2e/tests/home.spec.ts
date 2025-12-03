import { expect, test } from '../utils/test';

test.describe('Home Page Test Cases', () => {
  test.beforeEach(async ({ homePage, page }) => {
    await homePage.navigate();
    await page.getByRole('button', { name: 'Sign In' }).click();
  });

  test('it should have title', async ({ page }) => {
    await expect(page).toHaveTitle(/Stridyn/);
  });

  test('it should display Aderant Logo', async ({ page }) => {
    await expect(page.getByRole('img', { name: 'Aderant Logo' })).toBeVisible();
  });

  test('it should go to Aderant page when Logo is clicked', async ({ page }) => {
    const aderantInfo = {
      title: 'Stridyn',
      url: new URL('/home', page.url()).href,
    };

    await page.getByRole('img', { name: 'Aderant Logo' }).click();
    await page.waitForLoadState('load');

    await expect(page).toHaveURL(aderantInfo.url);
    await expect(page).toHaveTitle(aderantInfo.title);
  });
});
