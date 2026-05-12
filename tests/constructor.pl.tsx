import { expect, test } from '@playwright/test';
import path from 'path';

const bun = {
  id: '643d69a5c3f7b9001cfa093c',
  name: 'Краторная булка N-200i',
  calories: '420'
};

const main = {
  id: '643d69a5c3f7b9001cfa0941',
  name: 'Биокотлета из марсианской Магнолии',
  calories: '4242'
};

const apiHarPath = path.join(__dirname, 'hars', 'api.har');

test.beforeEach(async ({ page }) => {
  await page.routeFromHAR(apiHarPath, {
    url: '**/api/**',
    update: false
  });
});

test.afterEach(async ({ context, page }) => {
  await page.evaluate(() => localStorage.clear()).catch(() => undefined);
  await context.clearCookies();
});

test.describe('конструктор бургера', () => {
  test('добавляет ингредиенты из списка в конструктор', async ({ page }) => {
    await page.goto('/');

    await page.getByTestId(`ingredient-${bun.id}`).getByRole('button').click();
    await page.getByTestId(`ingredient-${main.id}`).getByRole('button').click();

    const constructor = page.getByTestId('burger-constructor');
    await expect(constructor).toContainText(bun.name);
    await expect(constructor).toContainText(main.name);
    await expect(constructor.getByTestId('constructor-ingredient')).toHaveCount(
      1
    );
  });

  test('открывает и закрывает модальное окно с описанием ингредиента', async ({
    page
  }) => {
    await page.goto('/');

    await page.getByTestId(`ingredient-link-${bun.id}`).click();

    const modal = page.getByTestId('modal');
    await expect(modal).toBeVisible();
    await expect(modal).toContainText(bun.name);

    await page.getByTestId('modal-close-button').click();
    await expect(modal).toBeHidden();
  });

  test('закрывает модальное окно ингредиента по клику на оверлей', async ({
    page
  }) => {
    await page.goto('/');

    await page.getByTestId(`ingredient-link-${bun.id}`).click();

    const modal = page.getByTestId('modal');
    await expect(modal).toBeVisible();

    await page.getByTestId('modal-overlay').click({ position: { x: 1, y: 1 } });
    await expect(modal).toBeHidden();
  });

  test('показывает данные выбранного ингредиента в модальном окне', async ({
    page
  }) => {
    await page.goto('/');

    await page.getByTestId(`ingredient-link-${main.id}`).click();

    const modal = page.getByTestId('modal');
    await expect(modal).toContainText(main.name);
    await expect(modal).toContainText(main.calories);
    await expect(modal).not.toContainText(bun.name);
  });

  test('создает заказ, показывает номер и очищает конструктор', async ({
    context,
    page
  }) => {
    await context.addCookies([
      {
        name: 'accessToken',
        value: 'Bearer fake-access-token',
        domain: '127.0.0.1',
        path: '/'
      }
    ]);
    await page.addInitScript(() => {
      localStorage.setItem('refreshToken', 'fake-refresh-token');
    });

    await page.goto('/');
    await page.getByTestId(`ingredient-${bun.id}`).getByRole('button').click();
    await page.getByTestId(`ingredient-${main.id}`).getByRole('button').click();
    await page
      .getByTestId('burger-constructor')
      .locator('button')
      .last()
      .click();

    await expect(page.getByTestId('order-number')).toHaveText('12345');
    await page.getByTestId('modal-close-button').click();
    await expect(page.getByTestId('modal')).toBeHidden();

    const constructor = page.getByTestId('burger-constructor');
    await expect(constructor.getByTestId('constructor-ingredient')).toHaveCount(
      0
    );
    await expect(constructor).not.toContainText(bun.name);
    await expect(constructor).not.toContainText(main.name);
  });
});
