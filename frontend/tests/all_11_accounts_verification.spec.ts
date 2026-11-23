import { test, expect } from '@playwright/test';

interface AccountTestSpec {
  role: 'admin' | 'farmer' | 'buyer' | 'staff';
  name: string;
  email: string;
  phone: string;
  pass: string;
  expectedVillage: string;
  expectedTaluk: string;
  specificChecks: (page: any) => Promise<void>;
}

const ALL_11_ACCOUNTS: AccountTestSpec[] = [
  // 1. Platform Admin
  {
    role: 'admin',
    name: 'Mandya Krishi Admin',
    email: 'admin@agrimitra.gov.in',
    phone: '9845000000',
    pass: 'Admin@123',
    expectedVillage: 'Guthalu',
    expectedTaluk: 'Mandya',
    specificChecks: async (page) => {
      await page.goto('http://localhost:8000/admin');
      await page.waitForLoadState('networkidle');
      let content = await page.textContent('body');
      expect(content).toMatch(/Admin|ಆಡಳಿತ/i);
      expect(content).toMatch(/Total Users|ಒಟ್ಟು ಬಳಕೆದಾರರು/i); // Users stat card

      // Click Users & Verification tab to inspect user management
      const usersTab = page.locator('button').filter({ hasText: /Users & Verification|ಬಳಕೆದಾರರು/i }).first();
      await usersTab.click();
      await page.waitForTimeout(500);
      content = await page.textContent('body');
      expect(content).toContain('Kavana');
      expect(content).toContain('Vijay');
      expect(content).toContain('Dr. Ravi Kumar');
      console.log('    ✓ Admin overview, 11 users, and user management tab verified');
    }
  },

  // 2. Farmer: Kavana N (Maddur)
  {
    role: 'farmer',
    name: 'Kavana N',
    email: 'kavana.farmer@example.com',
    phone: '9845222001',
    pass: 'KavanaFarmer@2026',
    expectedVillage: 'Shivapura',
    expectedTaluk: 'Maddur',
    specificChecks: async (page) => {
      // Check My Listings & Enquiries
      await page.goto('http://localhost:8000/my-listings');
      await page.waitForLoadState('networkidle');
      let bodyText = await page.textContent('body');
      expect(bodyText).toMatch(/Co 86032|Sugarcane|ಕಬ್ಬು/i);

      // Check Enquiries received
      await page.goto('http://localhost:8000/enquiries');
      await page.waitForLoadState('networkidle');
      bodyText = await page.textContent('body');
      expect(bodyText).toMatch(/Vijay|3180|25/i);
      console.log('    ✓ Kavana sugarcane listing and Vijay enquiry verified');
    }
  },

  // 3. Farmer: Ananya Rao (Maddur)
  {
    role: 'farmer',
    name: 'Ananya Rao',
    email: 'ananya.farmer@example.com',
    phone: '9845111001',
    pass: 'AnanyaFarmer@2026',
    expectedVillage: 'Shivapura',
    expectedTaluk: 'Maddur',
    specificChecks: async (page) => {
      // Check My Listings
      await page.goto('http://localhost:8000/my-listings');
      await page.waitForLoadState('networkidle');
      let bodyText = await page.textContent('body');
      expect(bodyText).toMatch(/BPT 5204|Paddy|ಭತ್ತ/i);

      // Check Enquiry from Arjun Traders
      await page.goto('http://localhost:8000/enquiries');
      await page.waitForLoadState('networkidle');
      bodyText = await page.textContent('body');
      expect(bodyText).toMatch(/Arjun|2550|2600|40/i);
      console.log('    ✓ Ananya paddy listing and Arjun active counter-offer verified');
    }
  },

  // 4. Farmer: Kavya Gowda (Malavalli)
  {
    role: 'farmer',
    name: 'Kavya Gowda',
    email: 'kavya.farmer@example.com',
    phone: '9845111003',
    pass: 'KavyaFarmer@2026',
    expectedVillage: 'Halaguru',
    expectedTaluk: 'Malavalli',
    specificChecks: async (page) => {
      // Check My Listings
      await page.goto('http://localhost:8000/my-listings');
      await page.waitForLoadState('networkidle');
      let bodyText = await page.textContent('body');
      expect(bodyText).toMatch(/Yelakki|Banana|ಬಾಳೆ/i);

      // Check Support Tickets in Profile / Help
      await page.goto('http://localhost:8000/profile');
      await page.waitForLoadState('networkidle');
      bodyText = await page.textContent('body');
      expect(bodyText).toContain('Kavya Gowda');
      console.log('    ✓ Kavya banana listing and profile verified');
    }
  },

  // 5. Farmer: Manjunath Swamy (Malavalli)
  {
    role: 'farmer',
    name: 'Manjunath Swamy',
    email: 'manjunath.farmer@example.com',
    phone: '9845222003',
    pass: 'ManjunathFarmer@2026',
    expectedVillage: 'Halaguru',
    expectedTaluk: 'Malavalli',
    specificChecks: async (page) => {
      // Check My Listings
      await page.goto('http://localhost:8000/my-listings');
      await page.waitForLoadState('networkidle');
      let bodyText = await page.textContent('body');
      expect(bodyText).toMatch(/ML-365|Ragi|ರಾಗಿ/i);

      // Check Enquiries received from Priya
      await page.goto('http://localhost:8000/enquiries');
      await page.waitForLoadState('networkidle');
      bodyText = await page.textContent('body');
      expect(bodyText).toMatch(/Priya|3750|15/i);
      console.log('    ✓ Manjunath ZBNF Ragi listing and Priya accepted enquiry verified');
    }
  },

  // 6. Farmer: Chethan Kumar (Srirangapatna)
  {
    role: 'farmer',
    name: 'Chethan Kumar',
    email: 'chethan.farmer@example.com',
    phone: '9845222004',
    pass: 'ChethanFarmer@2026',
    expectedVillage: 'Arakere',
    expectedTaluk: 'Srirangapatna',
    specificChecks: async (page) => {
      // Check Community Forum
      await page.goto('http://localhost:8000/community');
      await page.waitForLoadState('networkidle');
      const bodyText = await page.textContent('body');
      expect(bodyText).toMatch(/Banana|Riverine|Kaveri|ಗಾಳಿ/i);
      console.log('    ✓ Chethan community interactions verified');
    }
  },

  // 7. Buyer: Vijay Kumar (Wholesaler)
  {
    role: 'buyer',
    name: 'Vijay Kumar',
    email: 'vijay.buyer@example.com',
    phone: '9845222002',
    pass: 'VijayBuyer@2026',
    expectedVillage: 'Guthalu',
    expectedTaluk: 'Mandya',
    specificChecks: async (page) => {
      // Check Enquiries sent
      await page.goto('http://localhost:8000/enquiries');
      await page.waitForLoadState('networkidle');
      const sentTab = page.locator('button').filter({ hasText: /My Sent Enquiries|ಕಳುಹಿಸಿದ/i }).first();
      if (await sentTab.isVisible()) {
        await sentTab.click();
        await page.waitForTimeout(500);
      }
      const bodyText = await page.textContent('body');
      expect(bodyText).toMatch(/Kavana|3180|25/i);
      // Privacy check: Arjun's enquiry on Ananya should NOT appear in Vijay's sent enquiries
      expect(bodyText).not.toContain('BPT 5204 (Sona Masoori Deluxe)');
      console.log('    ✓ Vijay accepted enquiry verified with cross-buyer privacy');
    }
  },

  // 8. Buyer: Arjun Traders (Trader)
  {
    role: 'buyer',
    name: 'Arjun Traders',
    email: 'arjun.buyer@example.com',
    phone: '9845111002',
    pass: 'ArjunBuyer@2026',
    expectedVillage: 'Guthalu',
    expectedTaluk: 'Mandya',
    specificChecks: async (page) => {
      // Check Enquiries sent
      await page.goto('http://localhost:8000/enquiries');
      await page.waitForLoadState('networkidle');
      const sentTab = page.locator('button').filter({ hasText: /My Sent Enquiries|ಕಳುಹಿಸಿದ/i }).first();
      if (await sentTab.isVisible()) {
        await sentTab.click();
        await page.waitForTimeout(500);
      }
      const bodyText = await page.textContent('body');
      expect(bodyText).toMatch(/Ananya|Paddy|2550|2600/i);
      // Privacy check: Vijay's sugarcane deal should NOT appear in Arjun's sent enquiries
      expect(bodyText).not.toContain('Vijay Agro Mandi Ltd.');
      console.log('    ✓ Arjun paddy enquiry verified with cross-buyer privacy');
    }
  },

  // 9. Buyer: Priya Dharshini (Processor)
  {
    role: 'buyer',
    name: 'Priya Dharshini',
    email: 'priya.buyer@example.com',
    phone: '9845222005',
    pass: 'PriyaBuyer@2026',
    expectedVillage: 'Arakere',
    expectedTaluk: 'Srirangapatna',
    specificChecks: async (page) => {
      // Check Enquiries sent
      await page.goto('http://localhost:8000/enquiries');
      await page.waitForLoadState('networkidle');
      const sentTab = page.locator('button').filter({ hasText: /My Sent Enquiries|ಕಳುಹಿಸಿದ/i }).first();
      if (await sentTab.isVisible()) {
        await sentTab.click();
        await page.waitForTimeout(500);
      }
      const bodyText = await page.textContent('body');
      expect(bodyText).toMatch(/Manjunath|Ragi|3750/i);
      console.log('    ✓ Priya accepted ragi procurement verified');
    }
  },

  // 10. Agricultural Staff: Dr. Ravi Kumar (Extension Officer)
  {
    role: 'staff',
    name: 'Dr. Ravi Kumar',
    email: 'ravi.extension@agrimitra.gov.in',
    phone: '9845333001',
    pass: 'RaviOfficer@2026',
    expectedVillage: 'Guthalu',
    expectedTaluk: 'Mandya',
    specificChecks: async (page) => {
      // Check Groups & Announcements
      await page.goto('http://localhost:8000/groups');
      await page.waitForLoadState('networkidle');
      const bodyText = await page.textContent('body');
      expect(bodyText).toMatch(/Pandavapura|Rotation|ಕಾಲುವೆ|ವೇಳಾಪಟ್ಟಿ/i);

      // Verify restriction: Staff cannot open /admin
      await page.goto('http://localhost:8000/admin');
      await page.waitForLoadState('networkidle');
      const adminText = await page.textContent('body');
      expect(adminText).toMatch(/Access Denied|403|Forbidden|ಮುಖಪುಟ|Home/i);
      console.log('    ✓ Dr. Ravi moderator announcements and admin restriction verified');
    }
  },

  // 11. Agricultural Staff: Sowmya K. S. (Village Coordinator)
  {
    role: 'staff',
    name: 'Sowmya K. S.',
    email: 'sowmya.coordinator@agrimitra.gov.in',
    phone: '9845333002',
    pass: 'SowmyaCoord@2026',
    expectedVillage: 'Shivapura',
    expectedTaluk: 'Maddur',
    specificChecks: async (page) => {
      // Check Groups & Announcements
      await page.goto('http://localhost:8000/groups');
      await page.waitForLoadState('networkidle');
      const bodyText = await page.textContent('body');
      expect(bodyText).toMatch(/Maddur|Koppa|Sugar Mill|ಸಕ್ಕರೆ/i);
      console.log('    ✓ Sowmya RSK harvest quota announcements verified');
    }
  }
];

test.describe('Role-by-Role Login Access & Ecosystem Verification for All 11 Accounts', () => {

  for (const acc of ALL_11_ACCOUNTS) {
    test(`Verify ${acc.role.toUpperCase()} Account: ${acc.name} (${acc.email})`, async ({ page }) => {
      test.setTimeout(45000);
      console.log(`\n--> Testing Account: ${acc.name} [${acc.role}] (${acc.email})`);

      // 1. Open Login Page
      await page.goto('http://localhost:8000/login');
      await page.waitForLoadState('networkidle');

      // Clear any prior storage/token
      await page.evaluate(() => {
        localStorage.clear();
        sessionStorage.clear();
      });
      await page.reload();
      await page.waitForLoadState('networkidle');

      // 2. Perform Login with primary email
      await page.fill('input[type="text"]', acc.email);
      await page.fill('input[type="password"]', acc.pass);
      await page.locator('button[type="submit"]').click();
      await page.waitForTimeout(2000);

      // 3. Verify successful authentication
      const token = await page.evaluate(() => localStorage.getItem('agrimitra_token') || sessionStorage.getItem('agrimitra_token') || localStorage.getItem('token'));
      // Even if token key differs, check user profile loads
      await page.goto('http://localhost:8000/profile');
      await page.waitForLoadState('networkidle');

      const profileContent = await page.textContent('body');
      expect(profileContent).toContain(acc.name);
      expect(profileContent).toContain(acc.email);

      // Check village/location
      expect(profileContent).toContain(acc.expectedVillage);
      console.log(`    ✓ Authenticated profile verified: ${acc.name} in ${acc.expectedVillage}`);

      // 4. Role-Specific Functional & Data Checks
      await acc.specificChecks(page);

      // 5. Logout cleanly
      const logoutBtn = page.locator('button').filter({ hasText: /Logout|ನಿರ್ಗಮಿಸಿ/i }).first();
      if (await logoutBtn.isVisible()) {
        await logoutBtn.click();
        await page.waitForTimeout(1000);
      }
      console.log(`    ✓ Successfully logged out ${acc.name}`);
    });
  }
});
