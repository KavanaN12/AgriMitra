import { test, expect } from '@playwright/test';
import * as path from 'path';

test('Marketplace Crop Images Verification across all crops', async ({ page }) => {
  test.setTimeout(60000);

  const screenshotDir = 'C:/Users/Kavana/.gemini/antigravity/brain/c681cc85-4a07-4bab-8f6f-c622293bb831/screenshots';

  console.log('[Market Images Test] Logging in as Kavana N');
  await page.goto('http://localhost:8000/login');
  await page.waitForLoadState('networkidle');

  await page.evaluate(() => { localStorage.clear(); sessionStorage.clear(); });
  await page.reload();

  await page.fill('input[type="text"]', 'kavana.farmer@example.com');
  await page.fill('input[type="password"]', 'KavanaFarmer@2026');
  await page.locator('button[type="submit"]').click();
  await page.waitForTimeout(2000);

  // Navigate to Marketplace
  console.log('[Market Images Test] Navigating to Marketplace (/market)');
  await page.goto('http://localhost:8000/market');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2500);

  // Audit cards
  const cards = page.locator('.grid > div.group.cursor-pointer');
  const cardCount = await cards.count();
  console.log(`[Market Images Test] Found ${cardCount} listing cards in discovery grid`);
  expect(cardCount).toBeGreaterThanOrEqual(6);

  const cropImageChecks: Record<string, string> = {
    'sugarcane': 'sugarcane.jpg',
    'paddy': 'paddy.jpg',
    'ragi': 'ragi.jpg',
    'banana': 'banana.jpg',
    'coconut': 'coconut.jpg',
    'tomato': 'tomato.jpg'
  };

  const foundCrops: Record<string, boolean> = {};

  for (let i = 0; i < cardCount; i++) {
    const card = cards.nth(i);
    const img = card.locator('img').first();
    const src = await img.getAttribute('src');
    
    // Check if image is loaded in browser
    const isLoaded = await img.evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth > 0);
    console.log(`Card #${i + 1}: Image src="${src}", naturalWidth > 0: ${isLoaded}`);
    expect(isLoaded).toBe(true);

    for (const [cropKey, imgFile] of Object.entries(cropImageChecks)) {
      if (src && src.includes(imgFile)) {
        foundCrops[cropKey] = true;
      }
    }
  }

  console.log('[Market Images Test] Distinct crops found in grid:', Object.keys(foundCrops));
  expect(foundCrops['sugarcane']).toBe(true);
  expect(foundCrops['paddy']).toBe(true);
  expect(foundCrops['ragi']).toBe(true);
  expect(foundCrops['banana']).toBe(true);
  expect(foundCrops['coconut']).toBe(true);
  expect(foundCrops['tomato']).toBe(true);

  // Save full marketplace screenshot
  await page.screenshot({ path: path.join(screenshotDir, 'marketplace_distinct_crops_grid.png'), fullPage: false });
  console.log('  ✓ Saved marketplace_distinct_crops_grid.png');

  // Verify Banana Detail Modal
  console.log('[Market Images Test] Testing Banana Listing Detail Modal');
  const bananaCard = page.locator('.grid > div.group.cursor-pointer').filter({ hasText: /Banana|ಬಾಳೆ|Yelakki/i }).first();
  await bananaCard.click();
  await page.waitForTimeout(1000);

  const modalImg = page.locator('.fixed.inset-0 img').first();
  await expect(modalImg).toBeVisible();
  const modalImgSrc = await modalImg.getAttribute('src');
  console.log(`Banana Modal image src: ${modalImgSrc}`);
  expect(modalImgSrc).toContain('banana.jpg');
  const bananaModalLoaded = await modalImg.evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth > 0);
  expect(bananaModalLoaded).toBe(true);

  await page.screenshot({ path: path.join(screenshotDir, 'marketplace_banana_detail_modal.png') });
  console.log('  ✓ Saved marketplace_banana_detail_modal.png');

  // Close modal
  await page.keyboard.press('Escape');
  await page.waitForTimeout(600);

  // Verify Tomato Detail Modal
  console.log('[Market Images Test] Testing Tomato Listing Detail Modal');
  const tomatoCard = page.locator('.grid > div.group.cursor-pointer').filter({ hasText: /Tomato|ಟೊಮೆಟೊ|Shivam/i }).first();
  await tomatoCard.click();
  await page.waitForTimeout(1000);

  const tomatoModalImg = page.locator('.fixed.inset-0 img').first();
  await expect(tomatoModalImg).toBeVisible();
  const tomatoModalSrc = await tomatoModalImg.getAttribute('src');
  console.log(`Tomato Modal image src: ${tomatoModalSrc}`);
  expect(tomatoModalSrc).toContain('tomato.jpg');
  const tomatoModalLoaded = await tomatoModalImg.evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth > 0);
  expect(tomatoModalLoaded).toBe(true);

  await page.screenshot({ path: path.join(screenshotDir, 'marketplace_tomato_detail_modal.png') });
  console.log('  ✓ Saved marketplace_tomato_detail_modal.png');

  // Close modal
  await page.keyboard.press('Escape');
  await page.waitForTimeout(600);

  // Verify Tender Coconut Detail Modal
  console.log('[Market Images Test] Testing Tender Coconut Listing Detail Modal');
  const coconutCard = page.locator('.grid > div.group.cursor-pointer').filter({ hasText: /Coconut|ತೆಂಗು|Ganga Bondam/i }).first();
  await coconutCard.click();
  await page.waitForTimeout(1000);

  const coconutModalImg = page.locator('.fixed.inset-0 img').first();
  await expect(coconutModalImg).toBeVisible();
  const coconutModalSrc = await coconutModalImg.getAttribute('src');
  console.log(`Coconut Modal image src: ${coconutModalSrc}`);
  expect(coconutModalSrc).toContain('coconut.jpg');
  const coconutModalLoaded = await coconutModalImg.evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth > 0);
  expect(coconutModalLoaded).toBe(true);

  await page.screenshot({ path: path.join(screenshotDir, 'marketplace_coconut_detail_modal.png') });
  console.log('  ✓ Saved marketplace_coconut_detail_modal.png');

  // Close modal
  await page.keyboard.press('Escape');
  await page.waitForTimeout(600);

  // Verify Create Listing Modal
  console.log('[Market Images Test] Testing Create Listing Modal crop image selection');
  const createListingBtn = page.locator('button').filter({ hasText: /List Your Produce|ಹೊಸ ಉತ್ಪನ್ನ ಪಟ್ಟಿ|List Produce/i }).first();
  await createListingBtn.click();
  await page.waitForTimeout(1000);

  // Check that produce image choices exist
  const produceOptions = page.locator('.fixed.inset-0 button').filter({ has: page.locator('img') });
  const produceOptionsCount = await produceOptions.count();
  console.log(`Produce image selection options: ${produceOptionsCount}`);
  expect(produceOptionsCount).toBe(6);

  // Test selecting Banana in the crop dropdown (crop id 4)
  const cropSelect = page.locator('.fixed.inset-0 select').first();
  await cropSelect.selectOption('4');
  await page.waitForTimeout(500);

  // Check that the Banana image button in the grid has the active border class
  const bananaBtn = produceOptions.filter({ has: page.locator('img[src*="banana.jpg"]') });
  const bananaClass = await bananaBtn.getAttribute('class');
  console.log(`After selecting Banana, banana button class: ${bananaClass}`);
  expect(bananaClass).toContain('border-forest-600');

  // Test selecting Tomato in crop dropdown (crop id 6)
  await cropSelect.selectOption('6');
  await page.waitForTimeout(500);

  const tomatoBtn = produceOptions.filter({ has: page.locator('img[src*="tomato.jpg"]') });
  const tomatoClass = await tomatoBtn.getAttribute('class');
  console.log(`After selecting Tomato, tomato button class: ${tomatoClass}`);
  expect(tomatoClass).toContain('border-forest-600');

  await page.screenshot({ path: path.join(screenshotDir, 'marketplace_create_listing_modal.png') });
  console.log('  ✓ Saved marketplace_create_listing_modal.png');

  // Close create modal
  await page.keyboard.press('Escape');
  await page.waitForTimeout(600);

  // Verify "My Listings" tab
  console.log('[Market Images Test] Testing My Listings tab');
  const myListingsTab = page.locator('button').filter({ hasText: /My Listings|ನನ್ನ ಪಟ್ಟಿಗಳು/i }).first();
  await myListingsTab.click();
  await page.waitForTimeout(2000);

  const myListingsCards = page.locator('div.grid.grid-cols-1.md\\:grid-cols-2 > div');
  const myCardsCount = await myListingsCards.count();
  console.log(`My Listings cards count: ${myCardsCount}`);
  expect(myCardsCount).toBeGreaterThanOrEqual(1);

  // Verify thumbnail image in first card
  const myFirstImg = myListingsCards.first().locator('img').first();
  const myFirstSrc = await myFirstImg.getAttribute('src');
  const myFirstLoaded = await myFirstImg.evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth > 0);
  console.log(`My Listings first card img src: ${myFirstSrc}, naturalWidth > 0: ${myFirstLoaded}`);
  expect(myFirstLoaded).toBe(true);

  await page.screenshot({ path: path.join(screenshotDir, 'marketplace_my_listings.png') });
  console.log('  ✓ Saved marketplace_my_listings.png');

  console.log('[Market Images Test] All Marketplace crop image checks PASSED successfully!');
});
