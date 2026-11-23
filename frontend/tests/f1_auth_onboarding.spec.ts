import { test, expect } from '@playwright/test';
import path from 'path';

test.describe('F1 – Authentication & Onboarding Verification', () => {

  test('Journey 1: Welcome Screen & Bilingual Language Toggle', async ({ page }) => {
    await page.goto('/welcome');

    // Check title in Kannada (default) or English
    await expect(page.locator('h1')).toContainText(/ಕೃಷಿಮಿತ್ರಕ್ಕೆ ಸುಸ್ವಾಗತ|Welcome to AgriMitra/i);

    // Switch language to English using the main card selector
    const englishBtn = page.getByRole('button', { name: 'English', exact: true });
    await englishBtn.click();
    await expect(page.locator('h1')).toContainText('Welcome to AgriMitra');
    await expect(page.getByRole('heading', { name: 'Smart Crop Advisory' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Farmer Community' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Farmer-to-Buyer Connect' })).toBeVisible();

    // Switch back to Kannada using exact header button
    const kannadaBtn = page.locator('button:has-text("ಕನ್ನಡ")').first();
    await kannadaBtn.click();
    await expect(page.locator('h1')).toContainText('ಕೃಷಿಮಿತ್ರಕ್ಕೆ ಸುಸ್ವಾಗತ');
  });

  test('Journey 2 & 3: Registration with Validation & Demonstration OTP Verification', async ({ page }) => {
    await page.goto('/register');

    // Verify demonstration environment banner is clearly visible
    await expect(page.getByText(/ಪ್ರಾತ್ಯಕ್ಷಿಕೆ ಸೂಚನೆ|Demonstration Notice/i)).toBeVisible();
    await expect(page.getByText(/SMS/i)).toBeVisible();

    // Trigger validation by clicking submit without filling
    const submitBtn = page.getByRole('button', { name: /ಮುಂದುವರಿಯಿರಿ|Continue/i });
    await submitBtn.click();

    // Fill valid registration credentials
    await page.getByPlaceholder(/ರಮೇಶ್ ಗೌಡ|Ramesh Gowda/i).fill('Chenna Basappa');
    await page.getByPlaceholder(/10-digit mobile number|10-ಅಂಕಿಯ/i).fill('9876543210');
    const pwdInputs = page.locator('input[type="password"]');
    await pwdInputs.nth(0).fill('password123');
    await pwdInputs.nth(1).fill('password123');

    // Submit registration
    await submitBtn.click();

    // Expect navigation to /verify-otp
    await page.waitForURL('**/verify-otp');
    await expect(page.locator('h1')).toContainText(/ಮೊಬೈಲ್ ಸಂಖ್ಯೆ ದೃಢೀಕರಣ|Verify Mobile Number/i);

    // Verify phone number displayed
    await expect(page.getByText('9876543210')).toBeVisible();

    // Test invalid OTP
    const otpInput = page.locator('input[placeholder="123456"]');
    await otpInput.fill('000111');
    await page.getByRole('button', { name: /ದೃಢೀಕರಿಸಿ|Verify/i }).click();
    await expect(page.getByText(/ಅಮಾನ್ಯವಾದ OTP|Invalid/i)).toBeVisible();

    // Test autofill demo OTP
    const autoFillBtn = page.getByRole('button', { name: /ಡೆಮೊ OTP ಭರ್ತಿ ಮಾಡಿ|Fill Demo OTP/i });
    await autoFillBtn.click();
    await expect(otpInput).toHaveValue('123456');

    // Submit valid OTP
    await page.getByRole('button', { name: /ದೃಢೀಕರಿಸಿ|Verify/i }).click();

    // Expect navigation to /onboarding
    await page.waitForURL('**/onboarding');
  });

  test('Journey 4: Multi-Step Farmer Onboarding (Role -> Location -> Crops -> Farm Details -> Terms -> Dashboard)', async ({ page }) => {
    await page.goto('/onboarding');

    // Step 1: Role Selection -> Choose Farmer
    await expect(page.locator('h2')).toContainText(/ಪಾತ್ರ ಆಯ್ಕೆ|Choose Role/i);
    const farmerCard = page.getByText(/ರೈತ \(Farmer\)|Farmer \(ರೈತ\)/i);
    await farmerCard.click();
    await page.getByRole('button', { name: /ಮುಂದೆ|Continue/i }).click();

    // Step 2: Location Cascade (State -> District -> Taluk -> Hobli -> Village)
    await expect(page.locator('h2')).toContainText(/ನಿಮ್ಮ ಸ್ಥಳ|Your Location/i);
    // Select Taluk Maddur
    const selects = page.locator('select');
    await selects.nth(0).selectOption('Maddur');
    await page.waitForTimeout(100);
    // Select Hobli Koppa
    await selects.nth(1).selectOption('Koppa');
    await page.waitForTimeout(100);
    // Select Village Besagarahalli
    await selects.nth(2).selectOption('Besagarahalli');
    await page.getByRole('button', { name: /ಮುಂದೆ|Continue/i }).click();

    // Step 3: Crop Selection
    await expect(page.locator('h2')).toContainText(/ಬೆಳೆಗಳು|What crops/i);
    // Toggle a crop (e.g., Sugarcane or Banana)
    const cropCard = page.getByText(/ಬಾಳೆ|Banana/i).first();
    await cropCard.click();
    await page.getByRole('button', { name: /ಮುಂದೆ|Continue/i }).click();

    // Step 4: Farmer Profile Details
    await expect(page.locator('h2')).toContainText(/ಕೃಷಿ ವಿವರಗಳು|Farm Details/i);
    const farmSizeInput = page.locator('input[type="number"]');
    await farmSizeInput.fill('4.5');
    // Select Avatar
    const avatarBtn = page.getByText('🚜').first();
    await avatarBtn.click();
    await page.getByRole('button', { name: /ಮುಂದೆ|Continue/i }).click();

    // Step 5: Terms & Consent
    await expect(page.locator('h2')).toContainText(/ಒಪ್ಪಿಗೆ & ನಿಯಮಗಳು|Consent & Terms/i);
    const consentCheckbox = page.locator('input[type="checkbox"]');
    await expect(consentCheckbox).toBeChecked();
    await page.getByRole('button', { name: /ಪೂರ್ಣಗೊಳಿಸಿ|Complete Setup/i }).click();

    // Step 6: Completion Screen
    await expect(page.locator('h2')).toContainText(/ಸುಸ್ವಾಗತ|Welcome/i);
    await expect(page.getByText('Besagarahalli, Maddur')).toBeVisible();

    // Enter Dashboard
    const enterDashBtn = page.getByRole('button', { name: /ಡ್ಯಾಶ್‌ಬೋರ್ಡ್|Dashboard/i });
    await enterDashBtn.click();
    await page.waitForURL('**/');
    await expect(page.locator('h1')).toContainText(/ನಮಸ್ಕಾರ|Namaskara/i);
  });

  test('Journey 5: Dual-Role Selection & Header Role Switcher Pill', async ({ page }) => {
    await page.goto('/onboarding');

    // Select Both: Farmer & Buyer
    const bothCard = page.getByText(/ರೈತ ಮತ್ತು ಖರೀದಿದಾರ|Both: Farmer & Buyer/i);
    await bothCard.click();
    await page.getByRole('button', { name: /ಮುಂದೆ|Continue/i }).click();

    // Step 2: Location
    await page.getByRole('button', { name: /ಮುಂದೆ|Continue/i }).click();

    // Step 3: Crops
    await page.getByRole('button', { name: /ಮುಂದೆ|Continue/i }).click();

    // Step 4: Farmer Details
    await page.getByRole('button', { name: /ಮುಂದೆ|Continue/i }).click();

    // Step 5: Buyer Details (Shown for 'both')
    await expect(page.locator('h2')).toContainText(/ಖರೀದಿದಾರರ ವಿವರಗಳು|Buyer Details/i);
    const businessInput = page.getByPlaceholder(/ಮಂಡ್ಯ ಆಗ್ರೋ|Mandya Agro/i);
    await businessInput.fill('Cauvery Agro Mills Mandya');
    await page.getByRole('button', { name: /ಮುಂದೆ|Continue/i }).click();

    // Step 6: Terms
    await page.getByRole('button', { name: /ಪೂರ್ಣಗೊಳಿಸಿ|Complete Setup/i }).click();

    // Step 7: Completion
    await page.waitForTimeout(300);
    await page.getByRole('button', { name: /ಡ್ಯಾಶ್‌ಬೋರ್ಡ್|Dashboard/i }).click();
    await page.waitForURL('**/');

    // Header Role Switcher Pill should now be present
    const buyerRoleBtn = page.getByRole('button', { name: /ಖರೀದಿದಾರ|Buyer/i }).first();
    await expect(buyerRoleBtn).toBeVisible();

    // Click Buyer Mode -> redirects to /market
    await buyerRoleBtn.click();
    await page.waitForURL('**/market');

    // Click Farmer Mode -> redirects to /
    const farmerRoleBtn = page.getByRole('button', { name: /ರೈತ|Farmer/i }).first();
    await farmerRoleBtn.click();
    await page.waitForURL('**/');
  });

  test('Journey 6: Login & Forgot Password Flows', async ({ page }) => {
    // 1. Login page
    await page.goto('/login');
    await expect(page.locator('h1')).toContainText(/ಲಾಗಿನ್|Sign in/i);

    // Quick demo 1-click login
    const quickDemoBtn = page.getByRole('button', { name: /1-ಕ್ಲಿಕ್ ಡೆಮೊ|1-Click Demo/i });
    await quickDemoBtn.click();
    await page.waitForURL('**/');

    // 2. Forgot Password page
    await page.goto('/forgot-password');
    await expect(page.locator('h1')).toContainText(/ಪಾಸ್‌ವರ್ಡ್ ಮರುಹೊಂದಿಸಿ|Reset Your Password/i);

    // Step 1: Send reset OTP
    const sendOtpBtn = page.getByRole('button', { name: /OTP ಕಳುಹಿಸಿ|Send Reset OTP/i });
    await sendOtpBtn.click();

    // Step 2: OTP + New Password
    await page.getByPlaceholder(/123456/).fill('123456');
    const pwdInputs = page.locator('input[type="password"]');
    await pwdInputs.nth(0).fill('newpassword123');
    await pwdInputs.nth(1).fill('newpassword123');
    await page.getByRole('button', { name: /ಹೊಸ ಪಾಸ್‌ವರ್ಡ್ ಉಳಿಸಿ|Set New Password/i }).click();

    // Redirected to /login
    await page.waitForURL('**/login');
  });

  test('Capture Onboarding & Auth Screenshots (Desktop & Mobile)', async ({ page }) => {
    const screenshotDir = path.resolve('C:/Users/Kavana/.gemini/antigravity/brain/c681cc85-4a07-4bab-8f6f-c622293bb831/screenshots');

    // 1. Welcome Desktop & Mobile
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/welcome');
    await page.waitForSelector('h1');
    await page.waitForTimeout(400);
    await page.screenshot({ path: path.join(screenshotDir, 'f1_welcome_desktop.png') });

    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(200);
    await page.screenshot({ path: path.join(screenshotDir, 'f1_welcome_mobile.png') });

    // 2. Register Desktop & Mobile
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/register');
    await page.waitForSelector('h1');
    await page.waitForTimeout(400);
    await page.screenshot({ path: path.join(screenshotDir, 'f1_register_desktop.png') });

    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(200);
    await page.screenshot({ path: path.join(screenshotDir, 'f1_register_mobile.png') });

    // 3. OTP Verification Desktop & Mobile
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/verify-otp');
    await page.waitForSelector('h1');
    await page.waitForTimeout(400);
    await page.screenshot({ path: path.join(screenshotDir, 'f1_otp_desktop.png') });

    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(200);
    await page.screenshot({ path: path.join(screenshotDir, 'f1_otp_mobile.png') });

    // 4. Onboarding Role Desktop & Mobile
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/onboarding');
    await page.waitForSelector('h2');
    await page.waitForTimeout(400);
    await page.screenshot({ path: path.join(screenshotDir, 'f1_onboarding_role_desktop.png') });

    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(200);
    await page.screenshot({ path: path.join(screenshotDir, 'f1_onboarding_role_mobile.png') });

    // 5. Login Desktop & Mobile
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/login');
    await page.waitForSelector('h1');
    await page.waitForTimeout(400);
    await page.screenshot({ path: path.join(screenshotDir, 'f1_login_desktop.png') });

    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(200);
    await page.screenshot({ path: path.join(screenshotDir, 'f1_login_mobile.png') });
  });

});
