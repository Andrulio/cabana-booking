// @ts-check
const { test, expect } = require('@playwright/test');

const FRONTEND = 'http://localhost:3000';

test.describe('Resort Map UI', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(FRONTEND);
    // Wait for map to load
    await page.waitForSelector('.map-cell', { timeout: 5000 });
  });

  test('page loads with resort title', async ({ page }) => {
    await expect(page.locator('.resort-name')).toContainText('Azure Palms');
  });

  test('map renders cells including cabanas', async ({ page }) => {
    const cabanas = page.locator('.cell-cabana');
    const count = await cabanas.count();
    expect(count).toBeGreaterThan(0);
  });

  test('pool cells are visible', async ({ page }) => {
    const pools = page.locator('.cell-pool');
    const count = await pools.count();
    expect(count).toBeGreaterThan(0);
  });

  test('clicking available cabana opens booking modal', async ({ page }) => {
    await page.locator('.cell-cabana').first().click();
    await expect(page.locator('#modal-overlay')).toHaveClass(/active/);
    await expect(page.locator('#room-input')).toBeVisible();
    await expect(page.locator('#name-input')).toBeVisible();
  });

  test('booking modal closes on ESC', async ({ page }) => {
    await page.locator('.cell-cabana').first().click();
    await expect(page.locator('#modal-overlay')).toHaveClass(/active/);
    await page.keyboard.press('Escape');
    await expect(page.locator('#modal-overlay')).not.toHaveClass(/active/);
  });

  test('booking modal closes on X button', async ({ page }) => {
    await page.locator('.cell-cabana').first().click();
    await page.locator('#modal-close-btn').click();
    await expect(page.locator('#modal-overlay')).not.toHaveClass(/active/);
  });

  test('submitting empty form shows validation error', async ({ page }) => {
    await page.locator('.cell-cabana').first().click();
    await page.locator('#book-btn').click();
    await expect(page.locator('#booking-error')).toBeVisible();
  });

  test('invalid room number shows error message', async ({ page }) => {
    await page.locator('.cell-cabana').first().click();
    await page.fill('#room-input', '999');
    await page.fill('#name-input', 'Wrong Person');
    await page.locator('#book-btn').click();
    await expect(page.locator('#booking-error')).toBeVisible();
  });

  test('wrong guest name for valid room shows error', async ({ page }) => {
    await page.locator('.cell-cabana').first().click();
    await page.fill('#room-input', '101');
    await page.fill('#name-input', 'Wrong Name');
    await page.locator('#book-btn').click();
    await expect(page.locator('#booking-error')).toBeVisible();
  });

  test('valid booking shows confirmation and updates map', async ({ page }) => {
    await page.locator('.cell-cabana').first().click();
    await page.fill('#room-input', '101');
    await page.fill('#name-input', 'Alice Smith');
    await page.locator('#book-btn').click();

    // Success message appears
    await expect(page.locator('.modal-success')).toBeVisible({ timeout: 3000 });
    await expect(page.locator('.modal-success')).toContainText('Confirmed');

    // Wait for modal to auto-close
    await page.waitForTimeout(3000);
    await expect(page.locator('#modal-overlay')).not.toHaveClass(/active/);

    // The cabana should now be booked (red)
    const bookedCabanas = page.locator('.cell-cabana-booked');
    expect(await bookedCabanas.count()).toBeGreaterThan(0);
  });

  test('clicking booked cabana shows unavailable message', async ({ page }) => {
    // First book a cabana
    await page.locator('.cell-cabana').first().click();
    await page.fill('#room-input', '101');
    await page.fill('#name-input', 'Alice Smith');
    await page.locator('#book-btn').click();
    await page.waitForTimeout(3000); // wait for auto-close

    // Click the now-booked cabana
    await page.locator('.cell-cabana-booked').first().click();
    await expect(page.locator('#modal-overlay')).toHaveClass(/active/);
    await expect(page.locator('.unavailable-info')).toBeVisible();
  });
});
