import { test, expect } from '@playwright/test';

test.describe('F2 – Smart Crop Advisory Verification', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate directly to advisory page
    await page.goto('/advisory');
    await page.waitForLoadState('networkidle');
  });

  test('should display weather hero with live/cached indicator and open 7-day forecast modal', async ({ page }) => {
    // Check Weather Hero is visible
    await expect(page.locator('text=/°C/')).toBeVisible();
    await expect(page.locator('text=/Live Weather|Cached Mandya Weather|ಲೈವ್ ಹವಾಮಾನ|ಸಂಗ್ರಹಿತ ಮಂಡ್ಯ ಹವಾಮಾನ/i')).toBeVisible();

    // Verify key weather metrics
    await expect(page.locator('text=/Rain Probability|ಮಳೆ ಸಾಧ್ಯತೆ/i').first()).toBeVisible();
    await expect(page.locator('text=/Humidity|ಆರ್ದ್ರತೆ/i').first()).toBeVisible();
    await expect(page.locator('text=/Wind Speed|ಗಾಳಿಯ ವೇಗ/i').first()).toBeVisible();

    // Open 7-day forecast modal
    const forecastBtn = page.getByRole('button', { name: /7-Day Forecast|೭ ದಿನಗಳ ಮುನ್ಸೂಚನೆ/i });
    await expect(forecastBtn).toBeVisible();
    await forecastBtn.click();

    // Verify modal header and content
    await expect(page.locator('role=dialog')).toBeVisible();
    await expect(page.locator('role=dialog')).toContainText(/7-Day Agro-Weather Forecast|೭ ದಿನಗಳ ಮಂಡ್ಯ ಕೃಷಿ ಹವಾಮಾನ ಮುನ್ಸೂಚನೆ/i);
    await expect(page.locator('role=dialog')).toContainText(/Mandya|ಮಂಡ್ಯ/i);

    // Verify at least one day item with temperature
    await expect(page.locator('role=dialog').locator('text=/°/').first()).toBeVisible();

    // Close modal
    await page.getByRole('button', { name: /Close dialog/i }).click();
    await expect(page.locator('role=dialog')).not.toBeVisible();
  });

  test('should show smart agro recommendations and expand scientific reasoning', async ({ page }) => {
    // Verify Smart Agro Recommendations section is rendered
    const recSection = page.locator('text=/Smart Agro Recommendations|ಸ್ಮಾರ್ಟ್ ಕೃಷಿ ಶಿಫಾರಸುಗಳು/i');
    await expect(recSection).toBeVisible();

    // Click on explanation toggle ("Why this recommendation?" / "ವೈಜ್ಞಾನಿಕ ವಿವರಣೆ")
    const explainBtn = page.getByRole('button', { name: /Why this recommendation|ವೈಜ್ಞಾನಿಕ ವಿವರಣೆ|Hide Reasoning|ವಿವರಣೆ ಮರೆಮಾಡಿ/i }).first();
    await expect(explainBtn).toBeVisible();
    await explainBtn.click();

    // Verify explanation and source attribution appear
    await expect(page.locator('text=/Agronomic Reasoning|ವೈಜ್ಞಾನಿಕ ವಿವರಣೆ/i').first()).toBeVisible();
    await expect(page.locator('text=/Source & Attribution|ಮೂಲ & ದೃಢೀಕರಣ|UAS Bangalore|ICAR-KVK/i').first()).toBeVisible();
  });

  test('should filter advisories, toggle action items, and view advisory details', async ({ page }) => {
    // Verify advisory cards are rendered
    await expect(page.locator('text=/Recommended Farmer Actions|ರೈತರು ಕೈಗೊಳ್ಳಬೇಕಾದ ಕ್ರಮಗಳು/i').first()).toBeVisible();

    // Test Interactive Checklist: click first action item checkbox
    const firstCheckbox = page.locator('button[aria-label="Toggle task"]').first();
    if (await firstCheckbox.isVisible()) {
      await firstCheckbox.click();
      // Should now show checked state
      await expect(firstCheckbox.locator('svg')).toBeVisible();
    }

    // Open full advisory detail modal
    const viewDetailBtn = page.getByRole('button', { name: /View Full Details|ಸಂಪೂರ್ಣ ವಿವರ ನೋಡಿ/i }).first();
    await expect(viewDetailBtn).toBeVisible();
    await viewDetailBtn.click();

    // Verify Dialog content
    await expect(page.locator('role=dialog')).toBeVisible();
    await expect(page.locator('role=dialog')).toContainText(/Recommended Farmer Checklist|ರೈತರಿಗೆ ಶಿಫಾರಸು ಕ್ರಮಗಳ ಪರಿಶೀಲನಾ ಪಟ್ಟಿ/i);
    await expect(page.locator('role=dialog')).toContainText(/UAS Bangalore|ICAR-KVK|RSK/i);

    // Close Dialog
    const closeBtn = page.locator('role=dialog').getByRole('button', { name: /Close|ಮುಚ್ಚಿ/i }).last();
    await closeBtn.click();
    await expect(page.locator('role=dialog')).not.toBeVisible();
  });

  test('should support My Crops complete CRUD lifecycle', async ({ page }) => {
    // Switch to "My Crops" tab
    const myCropsTab = page.getByRole('button', { name: /My Crops|ನನ್ನ ಬೆಳೆಗಳು/i });
    await expect(myCropsTab).toBeVisible();
    await myCropsTab.click();

    // Verify My Crops heading
    await expect(page.locator('text=/Track your active fields|ವೈಯಕ್ತಿಕ ನೀರಾವರಿ ವೇಳಾಪಟ್ಟಿ/i')).toBeVisible();

    // 1. CREATE: Click Add Crop button
    const addCropBtn = page.getByRole('button', { name: /Add New Crop|ಹೊಸ ಬೆಳೆ ಸೇರಿಸಿ/i }).first();
    await expect(addCropBtn).toBeVisible();
    await addCropBtn.click();

    // Verify Add Crop dialog is open
    await expect(page.locator('role=dialog')).toBeVisible();
    await expect(page.locator('role=dialog')).toContainText(/Add New Crop|ಹೊಸ ಬೆಳೆ ಸೇರಿಸಿ/i);

    // Fill acreage
    const acreageInput = page.getByRole('dialog').locator('input[type="number"]');
    await acreageInput.fill('4.5');

    // Submit Add Crop form
    const saveBtn = page.getByRole('dialog').locator('button[type="submit"]');
    await saveBtn.click();

    // Dialog should close
    await expect(page.locator('role=dialog')).not.toBeVisible();

    // Verify newly added acreage or crop exists in list
    await expect(page.locator('text=/4.5/').first()).toBeVisible();

    // 2. EDIT: Click Edit Crop on the newly added item
    const editBtn = page.getByRole('button', { name: /Edit Crop|ಬೆಳೆ ವಿವರ ತಿದ್ದಿ/i }).first();
    await expect(editBtn).toBeVisible();
    await editBtn.click();

    // Verify Edit dialog is open
    await expect(page.locator('role=dialog')).toBeVisible();
    await expect(page.locator('role=dialog')).toContainText(/Edit Crop|ಬೆಳೆ ವಿವರ ತಿದ್ದಿ/i);

    // Update acreage to 5.2
    const editAcreageInput = page.getByRole('dialog').locator('input[type="number"]');
    await editAcreageInput.fill('5.2');

    // Save changes
    const editSaveBtn = page.getByRole('dialog').locator('button[type="submit"]');
    await editSaveBtn.click();
    await expect(page.locator('role=dialog')).not.toBeVisible();

    // Verify edited acreage is reflected
    await expect(page.locator('text=/5.2/').first()).toBeVisible();

    // 3. DELETE: Click Delete Crop
    const deleteBtn = page.getByRole('button', { name: /Delete Crop|ಬೆಳೆ ತೆಗೆದುಹಾಕಿ/i }).first();
    await expect(deleteBtn).toBeVisible();
    await deleteBtn.click();

    // Verify confirmation dialog
    await expect(page.locator('role=dialog')).toBeVisible();
    await expect(page.locator('role=dialog')).toContainText(/Are you sure you want to remove this crop|ತೆಗೆದುಹಾಕಲು ಖಚಿತವೇ/i);

    // Confirm deletion
    const confirmDeleteBtn = page.getByRole('dialog').getByRole('button', { name: /Delete Crop|ಬೆಳೆ ತೆಗೆದುಹಾಕಿ/i });
    await confirmDeleteBtn.click();
    await expect(page.locator('role=dialog')).not.toBeVisible();
  });

  test('should search and inspect Crop Knowledge Library growth timeline & IPM guide', async ({ page }) => {
    // Switch to "Crop Library" tab
    const libraryTab = page.getByRole('button', { name: /Crop Library|ಬೆಳೆ ಮಾಹಿತಿ ಕೋಶ/i });
    await expect(libraryTab).toBeVisible();
    await libraryTab.click();

    // Verify library header
    await expect(page.locator('text=/Mandya Crop Knowledge Library|ಮಂಡ್ಯ ಬೆಳೆ ಮಾಹಿತಿ ಕೋಶ/i')).toBeVisible();

    // Search for Sugarcane / ಕಬ್ಬು
    const searchInput = page.getByPlaceholder(/Search crops|ಬೆಳೆ ಹೆಸರು ಹುಡುಕಿ/i);
    await searchInput.fill('Sugarcane');

    // Verify search filtered list shows Sugarcane
    await expect(page.locator('text=/Sugarcane|ಕಬ್ಬು/i').first()).toBeVisible();

    // Click "Growth Guide" / "ಸಂಪೂರ್ಣ ಮಾಹಿತಿ"
    const guideBtn = page.getByRole('button', { name: /Growth Guide|ಸಂಪೂರ್ಣ ಮಾಹಿತಿ/i }).first();
    await expect(guideBtn).toBeVisible();
    await guideBtn.click();

    // Verify dialog opened
    await expect(page.locator('role=dialog')).toBeVisible();
    await expect(page.locator('role=dialog')).toContainText(/Growth Stage Timeline|ಬೆಳವಣಿಗೆಯ ಹಂತಗಳ ವೇಳಾಪಟ್ಟಿ/i);

    // Inspect Requirements tab
    const reqTab = page.locator('role=dialog').getByRole('button', { name: /Water Requirements|ನೀರಿನ ಅಗತ್ಯತೆ/i });
    await reqTab.click();
    await expect(page.locator('role=dialog')).toContainText(/Soil Requirements|ಮಣ್ಣಿನ ಅವಶ್ಯಕತೆ/i);

    // Inspect Pests & IPM tab
    const pestsTab = page.locator('role=dialog').getByRole('button', { name: /Common Pests|ಸಾಮಾನ್ಯ ಕೀಟ/i });
    await pestsTab.click();
    await expect(page.locator('role=dialog')).toContainText(/Symptoms|ರೋಗ ಲಕ್ಷಣಗಳು|Management|ನಿಯಂತ್ರಣ ಕ್ರಮಗಳು/i);

    // Close dialog
    const closeBtn = page.locator('role=dialog').getByRole('button', { name: /Close|ಮುಚ್ಚಿ/i }).last();
    await closeBtn.click();
    await expect(page.locator('role=dialog')).not.toBeVisible();
  });

  test('should test AI Disease Assistant preview with symptom analysis and RSK disclaimer', async ({ page }) => {
    // Switch to "AI Disease Doctor" tab
    const diseaseTab = page.getByRole('button', { name: /AI Disease Doctor|ಎಐ ರೋಗ ನಿದಾನ ವೈದ್ಯ/i });
    await expect(diseaseTab).toBeVisible();
    await diseaseTab.click();

    // Verify upcoming AI preview badge and disclaimer banner
    await expect(page.locator('text=/Upcoming AI Feature|ಮುಂಬರುವ ಎಐ ವೈಶಿಷ್ಟ್ಯ/i')).toBeVisible();
    await expect(page.locator('text=/Raitha Samparka Kendra|ರೈತ ಸಂಪರ್ಕ ಕೇಂದ್ರ/i').first()).toBeVisible();

    // Click a sample preset to quickly stage symptoms
    const sampleBtn = page.getByRole('button', { name: /Sugarcane Red Rot|ಕಬ್ಬಿನ ಕೆಂಪು ಕೊಳೆ/i });
    await expect(sampleBtn).toBeVisible();
    await sampleBtn.click();

    // Verify photo preview is staged
    await expect(page.locator('text=/Photo staged|ಫೋಟೋ ಆಯ್ಕೆಯಾಗಿದೆ/i')).toBeVisible();

    // Click "Analyze Crop Symptoms" / "ರೋಗ ಲಕ್ಷಣ ವಿಶ್ಲೇಷಿಸಿ"
    const diagnoseBtn = page.getByRole('button', { name: /Analyze Crop Symptoms|ರೋಗ ಲಕ್ಷಣ ವಿಶ್ಲೇಷಿಸಿ/i });
    await expect(diagnoseBtn).toBeVisible();
    await diagnoseBtn.click();

    // Verify analysis result card
    await expect(page.locator('text=/Suspected Condition|ಅನುಮಾನಿತ ರೋಗ/i')).toBeVisible();
    await expect(page.locator('text=/Diagnostic Confidence|ವಿಶ್ವಾಸಾರ್ಹತೆ/i')).toBeVisible();
    await expect(page.locator('text=/Immediate Organic|ತಕ್ಷಣದ ಜೈವಿಕ/i')).toBeVisible();
    await expect(page.locator('text=/Preventive Measures|ಮುಂಜಾಗ್ರತಾ ಕ್ರಮಗಳು/i')).toBeVisible();
    await expect(page.locator('text=/Verified by|ದೃಢೀಕರಿಸಿದವರು|ICAR-KVK Mandya/i')).toBeVisible();
  });

  test('should switch languages seamlessly across all F2 views', async ({ page }) => {
    // Switch to English
    const enBtn = page.getByRole('button', { name: /English/i }).first();
    await enBtn.click();
    await expect(page.locator('h1')).toContainText('Smart Crop Advisory');
    await expect(page.getByRole('button', { name: 'My Crops' })).toBeVisible();

    // Switch to Kannada
    const knBtn = page.getByRole('button', { name: /ಕನ್ನಡ/i }).first();
    await knBtn.click();
    await expect(page.locator('h1')).toContainText('ಸ್ಮಾರ್ಟ್ ಬೆಳೆ ಸಲಹೆ');
    await expect(page.getByRole('button', { name: 'ನನ್ನ ಬೆಳೆಗಳು' })).toBeVisible();
  });
});
