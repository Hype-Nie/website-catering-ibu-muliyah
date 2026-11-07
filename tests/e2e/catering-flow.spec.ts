import { test, expect, type Page } from '@playwright/test';

const VALID_PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
  'base64'
);
const OVERSIZED_BUFFER = Buffer.alloc(2.5 * 1024 * 1024, 1);

async function loginAsCustomer(page: Page) {
  await page.goto('/login');
  await page.fill('input[name="email"]', 'siti@contoh.test');
  await page.fill('input[name="password"]', 'password123');
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL(/\/menu/);
  await expect(page.locator('.user-greeting')).toContainText('Siti');
}

test.describe.serial('Catering E2E Lifecycle Flow', () => {
  let createdOrderId: string = '';

  test('1. Catalog navigation & Category filter', async ({ page }) => {
    await page.goto('/menu');
    await expect(page).toHaveTitle(/Pilihan menu/);
    await expect(page.locator('h1')).toContainText('Mau makan apa hari ini?');

    // Filter by 'Nasi box'
    await page.click('button[data-category="box"]');
    await expect(page).toHaveURL(/kategori=box/);
    await expect(page.locator('button[data-category="box"]')).toHaveAttribute('aria-pressed', 'true');

    // Filter by 'Prasmanan'
    await page.click('button[data-category="prasmanan"]');
    await expect(page).toHaveURL(/kategori=prasmanan/);
    await expect(page.locator('button[data-category="prasmanan"]')).toHaveAttribute('aria-pressed', 'true');
    // Search filter
    await page.goto('/menu?kategori=satuan');
    await page.fill('#menu-search', 'Ayam');
    const filteredCards = page.locator('.menu-card');
    await expect(filteredCards.first()).toBeVisible();
    const count = await filteredCards.count();
    for (let i = 0; i < count; i++) {
      await expect(filteredCards.nth(i)).toContainText(/Ayam/i);
    }
  });

  test('2. Add item to cart with quantity validation & Cart persistence', async ({ page }) => {
    await loginAsCustomer(page);
    await page.goto('/menu?kategori=box');

    // Click detail for 'Nasi Box Berkah' (min 10)
    const boxCard = page.locator('.menu-card', { hasText: 'Nasi Box Berkah' });
    await boxCard.locator('button[data-action="detail"]').first().click();

    const modal = page.locator('#modal');
    await expect(modal).toBeVisible();
    await expect(modal.locator('#modal-title')).toContainText('Nasi Box Berkah');
    await expect(modal).toContainText('Minimal pemesanan 10 porsi.');

    // Enter valid quantity and note
    const qtyInput = modal.locator('input[name="qty"]');
    await qtyInput.fill('12');
    await modal.locator('textarea[name="note"]').fill('Sambal dipisah & jangan terlalu pedas');
    await modal.locator('button[type="submit"]').click();

    // Verify toast & cart count
    await expect(page.locator('#toast')).toContainText('12 porsi ditambahkan');
    await expect(page.locator('.cart-count')).toContainText('12');

    // Navigate to cart
    await page.goto('/keranjang');
    await expect(page.locator('h1')).toContainText('Keranjang Anda');
    const cartItem = page.locator('.cart-item');
    await expect(cartItem).toContainText('Nasi Box Berkah');
    await expect(cartItem.locator('input[data-cart-qty]')).toHaveValue('12');
    await expect(cartItem.locator('textarea[data-cart-note]')).toHaveValue('Sambal dipisah & jangan terlalu pedas');

    // Reload page to verify persistence
    await page.reload();
    await expect(page.locator('.cart-item')).toContainText('Nasi Box Berkah');
    await expect(page.locator('.cart-count')).toContainText('12');
  });

  test('3. Checkout flow with delivery address, map distance, and order placement', async ({ page }) => {
    await loginAsCustomer(page);
    await page.goto('/checkout');
    await expect(page.locator('h1')).toContainText('Sedikit lagi, siap dipesan');

    // Recipient fields autofilled from Siti's account
    await expect(page.locator('input[name="name"]')).toHaveValue('Siti Rahma');
    await expect(page.locator('input[name="phone"]')).toHaveValue('081234567890');

    // Map section & distance verification
    await expect(page.locator('#map-picker')).toBeVisible();
    await expect(page.locator('#distance-readout')).toBeVisible();
    await expect(page.locator('#calculated-fee')).toBeVisible();

    // Toggle pickup method
    await page.check('input[name="method"][value="pickup"]');
    await expect(page.locator('#delivery-fields')).toBeHidden();
    await expect(page.locator('#shipping-cost')).toContainText('Rp0');
    await expect(page.locator('#pickup-message')).toBeVisible();

    // Toggle back to delivery
    await page.check('input[name="method"][value="delivery"]');
    await expect(page.locator('#delivery-fields')).toBeVisible();
    await expect(page.locator('#shipping-cost')).not.toContainText('Rp0');

    // Fill address and submit
    await page.fill('#checkout-address', 'Jl. Teuku Umar No. 15, Menteng, Jakarta Pusat');
    await page.click('button[type="submit"]');

    // Verify redirect to payment page with order ID
    await page.waitForURL(/\/pembayaran\?id=DM-/);
    const url = page.url();
    const idMatch = url.match(/id=(DM-[^&]+)/);
    expect(idMatch).not.toBeNull();
    createdOrderId = idMatch![1];
    expect(createdOrderId).toMatch(/^DM-\d{6}-\d{4}$/);
  });

  test('4. Payment page UX: bank copy, drag & drop / upload preview & validation', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await loginAsCustomer(page);
    await page.goto('/pembayaran?id=' + createdOrderId);

    // Verify bank account details
    await expect(page.locator('.bank-acc').first()).toContainText('873-021-9988');
    await expect(page.locator('.bank-acc').nth(1)).toContainText('122-00-9876543-1');

    // Verify copy buttons
    const bcaCopyBtn = page.locator('.bank button.copy-btn', { hasText: 'Salin' }).first();
    await bcaCopyBtn.click();
    await expect(bcaCopyBtn).toContainText('Tersalin! ✓');

    const mandiriCopyBtn = page.locator('.bank button.copy-btn', { hasText: 'Salin' }).nth(1);
    await mandiriCopyBtn.click();
    await expect(mandiriCopyBtn).toContainText('Tersalin! ✓');

    // Test client-side oversized file rejection
    const fileInput = page.locator('input[name="bukti_transfer"]');
    await fileInput.setInputFiles({ name: 'besar.jpg', mimeType: 'image/jpeg', buffer: OVERSIZED_BUFFER });
    await expect(page.locator('#payment-error')).toContainText('maksimal 2 MB');
    await expect(page.locator('#proof-preview')).toBeEmpty();

    // Test valid file upload and preview card
    await fileInput.setInputFiles({ name: 'struk.png', mimeType: 'image/png', buffer: VALID_PNG });
    await expect(page.locator('#payment-error')).toBeEmpty();
    const previewCard = page.locator('.proof-preview-card');
    await expect(previewCard).toBeVisible();
    await expect(previewCard.locator('.proof-preview-name')).toContainText('struk.png');
    await expect(previewCard.locator('.badge')).toContainText('PNG');

    // Test clear proof button
    await previewCard.locator('button[data-action="clear-proof"]').click();
    await expect(page.locator('.proof-preview-card')).toBeHidden();

    // Re-upload valid file
    await fileInput.setInputFiles({ name: 'struk-final.png', mimeType: 'image/png', buffer: VALID_PNG });
    await expect(page.locator('.proof-preview-card')).toBeVisible();

    // Fill form and submit
    await page.fill('input[name="nama_bank"]', 'BCA');
    await page.fill('input[name="nama_pemilik_rekening"]', 'Siti Rahma');
    const submitBtn = page.locator('#payment-form button[type="submit"]');
    await submitBtn.click();

    // Loading state & redirect
    await expect(page).toHaveURL(new RegExp('/lacak-pesanan\\?id=' + createdOrderId));
    await expect(page.locator('#toast')).toContainText('Bukti transfer berhasil dikirim');
  });

  test('5. Order tracking timeline and detail display', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await loginAsCustomer(page);
    await page.goto('/lacak-pesanan?id=' + createdOrderId);

    // Verify order ID & copy button
    const orderTitle = page.locator('.tracking-id-row h2');
    await expect(orderTitle).toContainText(createdOrderId);
    const copyOrderBtn = page.locator('.tracking-id-row button.copy-btn');
    await copyOrderBtn.click();
    await expect(copyOrderBtn).toContainText('Tersalin! ✓');

    // Verify 5-step timeline
    const steps = page.locator('.tracking-steps li');
    await expect(steps).toHaveCount(5);
    await expect(steps.nth(0)).toContainText('Menunggu Pembayaran');
    await expect(steps.nth(0)).toHaveClass(/complete/);
    await expect(steps.nth(1)).toContainText('Menunggu Verifikasi');
    await expect(steps.nth(1)).toHaveClass(/current/);
    await expect(steps.nth(2)).toContainText('Diproses & Dimasak');
    await expect(steps.nth(3)).toContainText('Dikirim / Siap Diambil');
    await expect(steps.nth(4)).toContainText('Selesai');

    // Verify WhatsApp button
    const waLink = page.locator('a.wa-btn');
    await expect(waLink).toBeVisible();
    await expect(waLink).toHaveAttribute('href', new RegExp('wa\\.me/6281234567890.*' + createdOrderId));

    // Verify details
    const details = page.locator('.details-list');
    await expect(details).toContainText('Siti Rahma');
    await expect(details).toContainText('081234567890');
    await expect(details).toContainText('Jl. Teuku Umar No. 15');
  });
});
