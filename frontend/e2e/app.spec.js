import { test, expect } from '@playwright/test';
async function login(page, destination = '/') {
  await page.goto('/login');
  await page.getByLabel('Correo electrónico').fill('browser@example.com');
  await page.getByLabel('Contraseña', { exact: true }).fill('BrowserTest123');
  await page.getByRole('button', { name: 'Iniciar sesión', exact: true }).click();
  await expect(page).toHaveURL('http://127.0.0.1:5175' + destination);
}
test('sesión persistente, reseña, colección y estadísticas desde la interfaz', async ({ page }) => {
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await login(page);
  await page.goto('/biblioteca');
  await expect(page.locator('.game-card')).toHaveCount(12);
  await page.reload();
  await expect(page.locator('.game-card')).toHaveCount(12);
  await page
    .locator('.game-card')
    .filter({ has: page.getByRole('heading', { name: 'Elden Ring', exact: true }) })
    .getByRole('link')
    .first()
    .click();
  await page.getByLabel('Tu reseña').fill('Reseña persistente desde el navegador.');
  await page.getByLabel('Horas jugadas').fill('42');
  await page.getByRole('button', { name: 'Guardar experiencia' }).click();
  await expect(page.getByLabel('Tu reseña')).toHaveValue('Reseña persistente desde el navegador.');
  await page.reload();
  await expect(page.getByLabel('Tu reseña')).toHaveValue('Reseña persistente desde el navegador.');
  await page.goto('/colecciones');
  await page.getByRole('button', { name: 'Nueva colección' }).click();
  await page.getByLabel('Nombre', { exact: true }).fill('Colección del navegador');
  await page.getByRole('button', { name: 'Guardar colección' }).click();
  await expect(
    page.getByRole('heading', { name: 'Colección del navegador', exact: true }),
  ).toBeVisible();
  await page.goto('/estadisticas');
  await expect(page.getByText('Horas de juego', { exact: true })).toBeVisible();
  await expect(page.locator('.metric')).toHaveCount(8);
  await page.goto('/perfil');
  await page.getByRole('button', { name: 'Editar perfil' }).click();
  await page.getByLabel('Biografía', { exact: true }).fill('Perfil editado desde Playwright');
  await page.getByRole('button', { name: 'Guardar perfil' }).click();
  await expect(page.getByText('Perfil editado desde Playwright', { exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByText('Perfil editado desde Playwright', { exact: true })).toBeVisible();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole('main').getByRole('button', { name: 'Cerrar sesión' }).click();
  await page.goto('/biblioteca');
  await expect(page.getByRole('heading', { name: 'Qué bueno verte de nuevo' })).toBeVisible();
  await login(page, '/biblioteca');
  await page.goto('/juego/1');
  await expect(page.getByLabel('Tu reseña')).toHaveValue('Reseña persistente desde el navegador.');
  expect(errors).toEqual([]);
});
test('referencia visual en escritorio y navegación en celular', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await login(page);
  await page.screenshot({ path: 'test-results/home-desktop.png', fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/explorar');
  await expect(page.locator('.game-card')).toHaveCount(12);
  await page.screenshot({ path: 'test-results/explore-mobile.png', fullPage: true });
  const noOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth <= window.innerWidth,
  );
  expect(noOverflow).toBe(true);
  await page.getByRole('textbox', { name: 'Título del juego' }).fill('Cory');
  await page.getByRole('button', { name: 'Buscar', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Cory in the House', exact: true })).toBeVisible();
});
