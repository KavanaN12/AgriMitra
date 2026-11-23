import { test, expect } from '@playwright/test';

test.describe('F3 – Farmer Community Verification', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/community');
    await page.waitForLoadState('networkidle');
  });

  test('should display community forum feed with search and topic category filters', async ({ page }) => {
    // Check Community Title & Subtitle
    await expect(page.locator('h1')).toContainText(/Farmer Community|ರೈತರ ಸಂಘ ಮತ್ತು ವೇದಿಕೆ/i);

    // Verify Topic Filter pills are visible
    await expect(page.locator('text=/All Topics|ಎಲ್ಲಾ ವಿಷಯಗಳು/i').first()).toBeVisible();
    await expect(page.locator('text=/Cultivation & Sowing|ಬೇಸಾಯ ಮತ್ತು ನಾಟಿ/i').first()).toBeVisible();
    await expect(page.locator('text=/Pest & Disease Control|ಕೀಟ ಮತ್ತು ರೋಗ ನಿಯಂತ್ರಣ/i').first()).toBeVisible();

    // Verify existing posts are rendered
    const postCards = page.locator('div[role="dialog"]').locator('..').locator('text=/Best drip fertigation|Desi neem-cake|Combined paddy harvester/i');
    await expect(page.locator('text=/Best drip fertigation|Desi neem-cake/i').first()).toBeVisible();

    // Click on Topic Filter (Pest & Disease Control)
    const pestTopicBtn = page.getByRole('button', { name: /Pest & Disease Control|ಕೀಟ ಮತ್ತು ರೋಗ ನಿಯಂತ್ರಣ/i });
    await pestTopicBtn.click();
    await page.waitForTimeout(300);

    // Verify pest control post remains visible
    await expect(page.locator('text=/Desi neem-cake|ಬೇವಿನ ಹಿಂಡಿ/i').first()).toBeVisible();

    // Reset back to All Topics
    await page.getByRole('button', { name: /All Topics|ಎಲ್ಲಾ ವಿಷಯಗಳು/i }).first().click();
    await page.waitForTimeout(300);
  });

  test('should create a new community discussion post', async ({ page }) => {
    // Open Create Post Modal
    const newPostBtn = page.getByRole('button', { name: /Start Discussion|ಹೊಸ ಚರ್ಚೆ ಪ್ರಾರಂಭಿಸಿ/i }).first();
    await newPostBtn.click();

    // Verify modal is visible
    const modal = page.locator('role=dialog');
    await expect(modal).toBeVisible();
    await expect(modal).toContainText(/Start Discussion|ಚರ್ಚೆ ಪ್ರಾರಂಭಿಸಿ/i);

    // Fill form
    const uniqueTitle = `Rotavator and Harvester sharing in Maddur ${Date.now()}`;
    await modal.locator('input[placeholder*="ಉದಾ"], input[placeholder*="e.g."]').fill(uniqueTitle);
    await modal.locator('textarea[placeholder*="ವಿವರವಾಗಿ"], textarea[placeholder*="symptoms"]').fill(
      'Looking for fellow farmers in Shivapura to coordinate combine harvester booking for next week paddy harvest.'
    );

    // Submit form
    const submitBtn = modal.getByRole('button', { name: /Publishing|Start Discussion|ಚರ್ಚೆ ಪ್ರಾರಂಭಿಸಿ/i });
    await submitBtn.click();

    // Verify modal closes and post is present in feed
    await expect(modal).not.toBeVisible();
    await expect(page.locator(`text=${uniqueTitle}`)).toBeVisible();
  });

  test('should open post details, toggle like counter, and toggle bookmark', async ({ page }) => {
    // Click on the first post card
    const firstPost = page.locator('text=/Best drip fertigation/i').first();
    await firstPost.click();

    const dialog = page.locator('role=dialog');
    await expect(dialog).toBeVisible();
    await expect(dialog).toContainText(/Best drip fertigation/i);
    await expect(dialog).toContainText(/Ramesh Gowda/i);

    // Test Like toggle
    const likeBtn = dialog.getByRole('button', { name: /Helpful|ಉಪಯುಕ್ತ/i }).first();
    const initialText = await likeBtn.innerText();
    await likeBtn.click();
    await expect(likeBtn).not.toHaveText(initialText, { timeout: 5000 });

    // Test Bookmark toggle
    const saveBtn = dialog.getByRole('button', { name: /Bookmark|Saved|ಉಳಿಸಿ|ಉಳಿಸಲಾಗಿದೆ/i }).first();
    await saveBtn.click();
    await page.waitForTimeout(300);

    // Close dialog
    await page.getByRole('button', { name: /Close dialog/i }).click();
    await expect(dialog).not.toBeVisible();
  });

  test('should add a comment to a discussion post', async ({ page }) => {
    // Click on a post
    await page.locator('text=/Desi neem-cake/i').first().click();

    const dialog = page.locator('role=dialog');
    await expect(dialog).toBeVisible();

    // Add comment
    const commentInput = dialog.locator('textarea[placeholder*="advice"], textarea[placeholder*="ಸಲಹೆ"]');
    const commentText = `Verified organic result with neem cake: very effective in Mandya soil (${Date.now()})`;
    await commentInput.fill(commentText);

    // Click submit button (the button inside the form)
    await dialog.locator('button[type="submit"]').click();
    await page.waitForTimeout(400);

    // Verify comment appears in list
    await expect(dialog.locator(`text=${commentText}`)).toBeVisible();

    // Close dialog
    await page.getByRole('button', { name: /Close dialog/i }).click();
  });

  test('should open report dialog and submit content report', async ({ page }) => {
    // Open post
    await page.locator('text=/Best drip fertigation/i').first().click();

    const postDialog = page.locator('role=dialog');
    await expect(postDialog).toBeVisible();

    // Click Report button
    const reportBtn = postDialog.getByRole('button', { name: /Report/i }).first();
    await reportBtn.click();

    // Verify report dialog opens
    const reportDialog = page.locator('role=dialog').filter({ hasText: /Report Community Content|ವರದಿ ಮಾಡಿ/i });
    await expect(reportDialog).toBeVisible();

    // Select reason
    await reportDialog.locator('input[value="misleading"]').check();

    // Submit report
    const submitReportBtn = reportDialog.getByRole('button', { name: /Submit Report|ವರದಿ ಸಲ್ಲಿಸಿ/i });
    await submitReportBtn.click();

    // Verify success banner
    await expect(reportDialog.locator('text=/submitted to village moderators|ವರದಿಯನ್ನು ಪರಿಶೀಲನೆಗಾಗಿ/i')).toBeVisible();

    await page.waitForTimeout(1000);
  });

  test('should discover village groups, view group details, and approve join requests', async ({ page }) => {
    // Switch to Village Groups tab
    const groupsTab = page.getByRole('button', { name: /Village Groups|ಗ್ರಾಮ ಸಂಘಗಳು/i });
    await groupsTab.click();
    await page.waitForTimeout(300);

    // Verify village groups are displayed
    await expect(page.locator('text=/Maddur Sugarcane Growers Forum|ಮದ್ದೂರು ಕಬ್ಬು ಬೆಳೆಗಾರರ ವೇದಿಕೆ/i')).toBeVisible();
    await expect(page.locator('text=/Mandya Organic & Natural Farming|ಮಂಡ್ಯ ಸಾವಯವ/i')).toBeVisible();

    // Click on Maddur group
    await page.locator('text=/Maddur Sugarcane Growers Forum|ಮದ್ದೂರು ಕಬ್ಬು ಬೆಳೆಗಾರರ ವೇದಿಕೆ/i').first().click();

    const groupDialog = page.locator('role=dialog');
    await expect(groupDialog).toBeVisible();
    await expect(groupDialog).toContainText(/Shivapura, Maddur/i);

    // Check Announcements Tab
    const annTab = groupDialog.getByRole('button', { name: /Announcements|ಪ್ರಕಟಣೆಗಳು/i });
    await annTab.click();
    await page.waitForTimeout(300);
    await expect(groupDialog.locator('text=/Cauvery Canal Water Release|ವಿಶ್ವೇಶ್ವರಯ್ಯ ನಾಲೆಯಲ್ಲಿ/i').first()).toBeVisible();

    // Check Members & Requests Tab
    const membersTab = groupDialog.getByRole('button', { name: /Members & Requests|ಸದಸ್ಯರು ಮತ್ತು ವಿನಂತಿಗಳು/i });
    await membersTab.click();
    await page.waitForTimeout(300);

    // Check pending requests and approved members
    await expect(groupDialog.locator('text=/Approved Group Members|ಸದಸ್ಯರು/i')).toBeVisible();

    // If there is an Approve button, click it
    const approveBtn = groupDialog.getByRole('button', { name: /Approve|ಅನುಮೋದಿಸಿ/i }).first();
    if (await approveBtn.isVisible()) {
      await approveBtn.click();
      await page.waitForTimeout(300);
    }

    // Close group dialog
    await page.getByRole('button', { name: /Close dialog/i }).click();
    await expect(groupDialog).not.toBeVisible();
  });

  test('should toggle bilingual Kannada and English switching', async ({ page }) => {
    // Switch to English
    const enBtn = page.getByRole('button', { name: 'English' });
    await enBtn.click();
    await page.waitForTimeout(300);
    await expect(page.locator('text=/Community Forum/i').first()).toBeVisible();

    // Switch to Kannada
    const knBtn = page.getByRole('button', { name: /ಕನ್ನಡ/i });
    await knBtn.click();
    await page.waitForTimeout(300);
    await expect(page.locator('text=/ಚರ್ಚಾ ವೇದಿಕೆ/i').first()).toBeVisible();
  });
});
