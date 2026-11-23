import { test } from '@playwright/test';
import * as path from 'path';

const ARTIFACTS_DIR = 'C:/Users/Kavana/.gemini/antigravity/brain/c681cc85-4a07-4bab-8f6f-c622293bb831/screenshots';

test.describe('F3 Community Visual Documentation', () => {
  test('capture F3 desktop screens', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/community');
    await page.waitForLoadState('networkidle');

    // Wait for feed items to be rendered
    await page.locator('text=/Best drip fertigation|Desi neem-cake/i').first().waitFor({ state: 'visible', timeout: 10000 });
    await page.waitForTimeout(400);

    // 1. Community Forum Feed Desktop
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'f3_forum_feed_desktop.png'), fullPage: true });

    // 2. Post Detail Modal Desktop (with comments & interactions)
    const firstPost = page.locator('text=/Best drip fertigation/i').first();
    await firstPost.click();
    const postDialog = page.locator('role=dialog');
    await postDialog.waitFor({ state: 'visible' });
    await page.waitForTimeout(600);
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'f3_post_detail_desktop.png') });

    // 3. Report Content Dialog Desktop
    const reportBtn = postDialog.getByRole('button', { name: /Report/i }).first();
    if (await reportBtn.isVisible()) {
      await reportBtn.click();
      const reportDialog = page.locator('role=dialog').filter({ hasText: /Report Community Content|ವರದಿ ಮಾಡಿ/i });
      await reportDialog.waitFor({ state: 'visible' });
      await page.waitForTimeout(400);
      await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'f3_report_dialog_desktop.png') });
      // Close report dialog
      await reportDialog.getByRole('button', { name: /Cancel/i }).click();
      await page.waitForTimeout(300);
    }

    // Close post dialog
    await page.getByRole('button', { name: /Close dialog/i }).click();
    await page.waitForTimeout(300);

    // 4. Village Groups Directory Desktop
    const groupsTab = page.getByRole('button', { name: /Village Groups|ಗ್ರಾಮ ಸಂಘಗಳು/i });
    await groupsTab.click();
    await page.locator('text=/Maddur Sugarcane Growers Forum|ಮದ್ದೂರು ಕಬ್ಬು ಬೆಳೆಗಾರರ ವೇದಿಕೆ/i').first().waitFor({ state: 'visible', timeout: 10000 });
    await page.waitForTimeout(400);
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'f3_village_groups_desktop.png'), fullPage: true });

    // 5. Group Detail Modal Desktop (Discussions, Announcements, Members)
    const firstGroup = page.locator('text=/Maddur Sugarcane Growers Forum|ಮದ್ದೂರು ಕಬ್ಬು ಬೆಳೆಗಾರರ ವೇದಿಕೆ/i').first();
    await firstGroup.click();
    const groupDialog = page.locator('role=dialog');
    await groupDialog.waitFor({ state: 'visible' });
    await page.waitForTimeout(600);
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'f3_group_detail_desktop.png') });
    await page.getByRole('button', { name: /Close dialog/i }).click();
    await page.waitForTimeout(300);
  });

  test('capture F3 mobile screens', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/community');
    await page.waitForLoadState('networkidle');

    // Wait for feed items
    await page.locator('text=/Best drip fertigation|Desi neem-cake/i').first().waitFor({ state: 'visible', timeout: 10000 });
    await page.waitForTimeout(400);

    // 1. Community Forum Feed Mobile
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'f3_forum_feed_mobile.png'), fullPage: true });

    // 2. Post Detail Mobile
    const firstPost = page.locator('text=/Best drip fertigation/i').first();
    await firstPost.click();
    const postDialog = page.locator('role=dialog');
    await postDialog.waitFor({ state: 'visible' });
    await page.waitForTimeout(600);
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'f3_post_detail_mobile.png') });
    await page.getByRole('button', { name: /Close dialog/i }).click();
    await page.waitForTimeout(300);

    // 3. Village Groups Directory Mobile
    const groupsTab = page.getByRole('button', { name: /Village Groups|ಗ್ರಾಮ ಸಂಘಗಳು/i });
    await groupsTab.click();
    await page.locator('text=/Maddur Sugarcane Growers Forum|ಮದ್ದೂರು ಕಬ್ಬು ಬೆಳೆಗಾರರ ವೇದಿಕೆ/i').first().waitFor({ state: 'visible', timeout: 10000 });
    await page.waitForTimeout(400);
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'f3_village_groups_mobile.png'), fullPage: true });

    // 4. Group Detail Mobile
    const firstGroup = page.locator('text=/Maddur Sugarcane Growers Forum|ಮದ್ದೂರು ಕಬ್ಬು ಬೆಳೆಗಾರರ ವೇದಿಕೆ/i').first();
    await firstGroup.click();
    const groupDialog = page.locator('role=dialog');
    await groupDialog.waitFor({ state: 'visible' });
    await page.waitForTimeout(600);
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'f3_group_detail_mobile.png') });
    await page.getByRole('button', { name: /Close dialog/i }).click();
    await page.waitForTimeout(300);
  });
});
