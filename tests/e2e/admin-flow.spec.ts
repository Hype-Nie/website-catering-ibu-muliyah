import { test, expect, type Page } from '@playwright/test';

async function loginAsAdmin(page: Page) {
  await page.goto('/admin');
  if (page.url().includes('/admin')) {
    const isLoginPage = await page.locator('input[name="email"]').isVisible().catch(() => false);
    if (!isLoginPage) return;
  }
  await page.goto('/login');
  await page.fill('input[name="email"]', 'admin@dapurmenteng.test');
  await page.fill('input[name="password"]', 'password123');
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL(/\/admin/);
}

async function loginAsCustomer(page: Page) {
  await page.goto('/login');
  await page.fill('input[name="email"]', 'siti@contoh.test');
  await page.fill('input[name="password"]', 'password123');
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL(/\/menu/);
}

test.describe.serial('Admin E2E Lifecycle Flow (Happy & Extreme Paths)', () => {
  test('1. Extreme Path: RBAC & Security Boundary (Guest & Customer Access Control)', async ({ page }) => {
    // 1A. Guest cannot access /admin, redirected to /login
    await page.goto('/admin');
    await expect(page).toHaveURL(/\/login/);

    // 1B. Guest cannot access /admin/menu, redirected to /login
    await page.goto('/admin/menu');
    await expect(page).toHaveURL(/\/login/);

    // 1C. Customer (role: customer) is strictly forbidden from accessing /admin (403)
    await loginAsCustomer(page);
    const response = await page.goto('/admin');
    expect(response?.status()).toBe(403);
    await expect(page.locator('body')).toContainText(/Akses ditolak/i);

    // Logout customer
    await page.goto('/menu');
    await page.click('[data-action="logout"]');
    await expect(page).toHaveURL(/\/login/);
  });

  test('2. Happy Path: Admin Login, Dashboard Metrics, and Sidebar Navigation', async ({ page }) => {
    await loginAsAdmin(page);

    // Assert Dashboard heading & greeting
    await expect(page.locator('h1')).toContainText('Selamat datang di dapur.');
    await expect(page.locator('.sidebar')).toBeVisible();
    await expect(page.locator('.sidebar-note')).toContainText('Dapur Menteng');

    // Assert real aggregated metrics cards
    const metrics = page.locator('.metrics article');
    await expect(metrics.nth(0)).toContainText('Omzet terverifikasi');
    await expect(metrics.nth(1)).toContainText('Total pesanan');
    await expect(metrics.nth(2)).toContainText('Menunggu verifikasi');

    // Assert quick action and recent orders table
    await expect(page.locator('.action-notice')).toBeVisible();
    await expect(page.locator('h2:has-text("Pesanan terbaru")')).toBeVisible();

    // Verify sidebar navigation links
    const sidebarNav = page.locator('.sidebar nav a');
    await expect(sidebarNav).toHaveCount(5);
    await expect(sidebarNav.nth(0)).toHaveAttribute('href', '/admin');
    await expect(sidebarNav.nth(1)).toHaveAttribute('href', '/admin/menu');
    await expect(sidebarNav.nth(2)).toHaveAttribute('href', '/admin/pesanan');
    await expect(sidebarNav.nth(3)).toHaveAttribute('href', '/admin/pelanggan');
    await expect(sidebarNav.nth(4)).toHaveAttribute('href', '/admin/laporan');
  });

  test('3. Menu Management: Availability Toggle, Extreme Validation, Create & Delete Menu', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin/menu');
    await expect(page.locator('h1')).toContainText('Menu & paket');

    // 3A. Happy Path: Toggle availability of existing menu
    const firstToggle = page.locator('.availability-toggle').first();
    const initialText = await firstToggle.textContent();
    await firstToggle.click();
    await expect(page.locator('#toast')).toHaveClass(/show/);
    await expect(page.locator('#toast')).toContainText('Ketersediaan menu diperbarui');
    
    // Toggle back to original state
    await firstToggle.click();
    await expect(page.locator('#toast')).toContainText('Ketersediaan menu diperbarui');
    if (initialText) {
      await expect(firstToggle).toContainText(initialText.trim());
    }

    // 3B. Extreme Path: HTML5 validation prevents empty or invalid menu creation
    await page.click('button[data-action="edit-menu"]');
    await expect(page.locator('#modal')).toBeVisible();
    await expect(page.locator('#modal-title')).toContainText('Tambah menu');

    const nameInput = page.locator('#menu-form input[name="name"]');
    await nameInput.fill('');
    await page.click('#menu-form button');
    // Modal stays open due to HTML5 validation on required field
    await expect(page.locator('#modal')).toBeVisible();

    // 3C. Happy Path: Fill valid menu details and submit
    const testMenuName = 'Nasi Uduk Spesial E2E ' + Date.now().toString().slice(-4);
    await nameInput.fill(testMenuName);
    await page.selectOption('#menu-form select[name="category"]', 'box');
    await page.fill('#menu-form input[name="min"]', '10');
    await page.fill('#menu-form input[name="price"]', '32000');
    await page.fill('#menu-form textarea[name="desc"]', 'Porsi komplit ayam bakar & tahu tempe untuk verifikasi E2E.');
    await page.click('#menu-form button');

    await expect(page.locator('#toast')).toHaveClass(/show/);
    await expect(page.locator('#toast')).toContainText(/Menu (berhasil ditambahkan|disimpan)/i);

    // 3D. Happy Path: Delete the newly created menu
    await page.goto('/admin/menu');
    const createdRow = page.locator('tr', { hasText: testMenuName });
    await expect(createdRow).toBeVisible();

    await createdRow.locator('button[data-action="delete-menu"]').click();
    await expect(page.locator('#modal')).toBeVisible();
    await expect(page.locator('#modal-title')).toContainText('Hapus menu ini?');

    await page.click('button[data-action="confirm-delete"]');
    await expect(page.locator('#toast')).toHaveClass(/show/);
    await expect(page.locator('#toast')).toContainText(/Menu (berhasil dihapus|dihapus)/i);
    await expect(page.locator('tr', { hasText: testMenuName })).toHaveCount(0);
  });

  test('4. Order Lifecycle: Search, Rejection Validation, Payment Verification & Status Transitions', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin/pesanan');
    await expect(page.locator('h1')).toContainText('Pesanan masuk');

    // 4A. Happy Path: Filter orders by search query
    await page.fill('#order-filter input[name="search"]', 'Siti');
    await page.click('#order-filter button[type="submit"]');
    const orderRows = page.locator('#orders-table tbody tr');
    const count = await orderRows.count();
    for (let i = 0; i < count; i++) {
      await expect(orderRows.nth(i)).toContainText(/Siti/i);
    }

    // Reset filter
    await page.click('#order-filter button[type="reset"]');

    // 4B. Open Order Detail Modal
    const detailBtn = page.locator('button[data-action="order-detail"]').first();
    await detailBtn.click();
    await expect(page.locator('#modal')).toBeVisible();
    await expect(page.locator('#modal-title')).toContainText(/DM-/);

    // 4C. Extreme Path: Rejection reason required validation
    const rejectBtn = page.locator('button[data-action="reject"]');
    if (await rejectBtn.isVisible()) {
      await rejectBtn.click();
      await expect(page.locator('#reject-form')).toBeVisible();
      await expect(page.locator('#modal-title')).toContainText('Tolak bukti pembayaran');

      // Attempt empty reason submit (HTML5 required blocks)
      const reasonTextarea = page.locator('#reject-form textarea[name="reason"]');
      await reasonTextarea.fill('');
      await page.click('#reject-form button');
      await expect(page.locator('#reject-form')).toBeVisible();

      // Close reject modal cleanly
      await page.evaluate(() => (document.getElementById('modal') as HTMLDialogElement)?.close());
    } else {
      await page.evaluate(() => (document.getElementById('modal') as HTMLDialogElement)?.close());
    }

    // 4D. Happy Path: Verify payment & transition order lifecycle
    const verifyTarget = page.locator('tr', { hasText: 'Menunggu verifikasi' }).first();
    if (await verifyTarget.isVisible()) {
      await verifyTarget.locator('button[data-action="order-detail"]').click();
      await expect(page.locator('button[data-action="verify"]')).toBeVisible();

      await page.click('button[data-action="verify"]');
      await expect(page.locator('#toast')).toHaveClass(/show/);
      await expect(page.locator('#toast')).toContainText(/Pembayaran.*diverifikasi/i);
    }
  });

  test('5. Customers Directory & Sales Report with Extreme Inverted Date Filter and CSV Export', async ({ page }) => {
    await loginAsAdmin(page);

    // 5A. Happy Path: Customer List & Detail Modal
    await page.goto('/admin/pelanggan');
    await expect(page.locator('h1')).toContainText('Pelanggan');
    await expect(page.locator('tbody tr')).not.toHaveCount(0);

    const firstCustomerDetail = page.locator('button[data-action="customer"]').first();
    await firstCustomerDetail.click();
    await expect(page.locator('#modal')).toBeVisible();
    await page.evaluate(() => (document.getElementById('modal') as HTMLDialogElement)?.close());

    // 5B. Extreme Path: Inverted Date Filter Validation in Reports
    await page.goto('/admin/laporan');
    await expect(page.locator('h1')).toContainText('Laporan penjualan');

    // Fill start date AFTER end date
    await page.fill('#report-filter input[name="start"]', '2026-11-20');
    await page.fill('#report-filter input[name="end"]', '2026-11-01');
    await page.click('#report-filter button');

    // Toast error must trigger and block submission
    await expect(page.locator('#toast')).toHaveClass(/show/);
    await expect(page.locator('#toast')).toContainText('Tanggal akhir harus setelah tanggal mulai.');

    // 5C. Happy Path: Reset to valid dates and Export CSV
    await page.fill('#report-filter input[name="start"]', '2026-11-01');
    await page.fill('#report-filter input[name="end"]', '2026-11-08');
    await page.click('#report-filter button');

    // Download CSV
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.click('button[data-action="export"]'),
    ]);

    expect(download.suggestedFilename()).toMatch(/laporan.*\.csv/i);
  });
});
