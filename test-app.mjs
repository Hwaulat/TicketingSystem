import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const appUrl = 'http://localhost:7777/TIXA%20Ticketing%20System.html';

const screenshotDir = path.join(__dirname, 'screenshots');
if (!fs.existsSync(screenshotDir)) fs.mkdirSync(screenshotDir);

const browser = await chromium.launch({
  headless: true,
  executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
});
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await context.newPage();

const errors = [];
page.on('pageerror', e => errors.push(e.message));
page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });

async function shot(name) {
  const file = path.join(screenshotDir, `${name}.png`);
  await page.screenshot({ path: file, fullPage: false });
  console.log(`  [screenshot] ${name}.png`);
  return file;
}

async function navTo(label) {
  const navBtn = page.locator(`nav button`).filter({ hasText: label }).first();
  await navBtn.click();
  await page.waitForTimeout(800);
}

console.log('\n=== TIXA Ticketing System - Full Feature Test ===\n');
console.log('Opening:', appUrl);
await page.goto(appUrl, { waitUntil: 'load', timeout: 30000 });
await page.waitForTimeout(5000); // wait for Babel + React to compile and boot

// ── 1. Dashboard ──────────────────────────────────────────────
console.log('\n[1] Dashboard');
await page.waitForSelector('h1', { timeout: 10000 });
await shot('01-dashboard');
const dashTitle = await page.locator('h1').first().textContent();
console.log('  Page title:', dashTitle);

// Check dashboard stats cards
const statCards = await page.locator('.card, [class*="card"]').count();
console.log('  Cards visible:', statCards);

// ── 2. Create Ticket ──────────────────────────────────────────
console.log('\n[2] Create Ticket');
await navTo('Create Ticket');
await shot('02-create-ticket');

// Fill the form
const subjectInput = page.locator('input[placeholder*="subject"], input[placeholder*="title"], input[placeholder*="Subject"], input[placeholder*="Title"]').first();
if (await subjectInput.count() > 0) {
  await subjectInput.fill('Test Ticket - Login Page Bug');
  console.log('  Filled subject');
}

// Select type if dropdown exists
const typeSelect = page.locator('select').first();
if (await typeSelect.count() > 0) {
  await typeSelect.selectOption({ index: 1 });
  console.log('  Selected ticket type');
}

// Fill description
const textarea = page.locator('textarea').first();
if (await textarea.count() > 0) {
  await textarea.fill('Deskripsi bug: tombol login tidak berfungsi di browser Firefox terbaru.');
  console.log('  Filled description');
}
await shot('02b-create-ticket-filled');

// Try submitting
const submitBtn = page.locator('button').filter({ hasText: /submit|create|save|kirim/i }).first();
if (await submitBtn.count() > 0) {
  await submitBtn.click();
  await page.waitForTimeout(1000);
  console.log('  Submitted ticket');
  await shot('02c-create-ticket-submitted');
}

// ── 3. My Tickets ─────────────────────────────────────────────
console.log('\n[3] My Tickets');
await navTo('My Tickets');
await page.waitForTimeout(800);
await shot('03-my-tickets');
const ticketRows = await page.locator('table tbody tr, [class*="ticket-row"], [class*="ticketRow"]').count();
console.log('  Ticket rows:', ticketRows);

// ── 4. All Tickets (switch to PM role first) ───────────────────
console.log('\n[4] All Tickets (as PM)');
// The role is already PM (default), check if "All Tickets" is in sidebar
const allTicketsBtn = page.locator('nav button').filter({ hasText: 'All Tickets' });
if (await allTicketsBtn.count() > 0) {
  await allTicketsBtn.click();
  await page.waitForTimeout(800);
  await shot('04-all-tickets');
  const allCount = await page.locator('table tbody tr').count();
  console.log('  All ticket rows:', allCount);

  // Test filter/search
  const searchInput = page.locator('input[placeholder*="earch"], input[placeholder*="filter"], input[placeholder*="Search"]').first();
  if (await searchInput.count() > 0) {
    await searchInput.fill('bug');
    await page.waitForTimeout(500);
    await shot('04b-all-tickets-filtered');
    console.log('  Search filter tested');
    await searchInput.fill('');
  }
}

// ── 5. Ticket Detail ──────────────────────────────────────────
console.log('\n[5] Ticket Detail');
// Click the first ticket in the list
const firstTicketLink = page.locator('table tbody tr').first();
if (await firstTicketLink.count() > 0) {
  await firstTicketLink.click();
  await page.waitForTimeout(1000);
  await shot('05-ticket-detail');
  const detailH1 = await page.locator('h1, h2').first().textContent().catch(() => 'n/a');
  console.log('  Detail page heading:', detailH1?.trim());

  // Test comment/reply
  const commentInput = page.locator('textarea[placeholder*="comment"], textarea[placeholder*="reply"], textarea[placeholder*="Komentar"], textarea[placeholder*="message"]').first();
  if (await commentInput.count() > 0) {
    await commentInput.fill('Ini adalah komentar uji coba dari sistem.');
    const sendBtn = page.locator('button').filter({ hasText: /send|post|kirim|comment/i }).first();
    if (await sendBtn.count() > 0) {
      await sendBtn.click();
      await page.waitForTimeout(500);
      console.log('  Comment posted');
    }
    await shot('05b-ticket-detail-comment');
  }

  // Test status change
  const statusBtn = page.locator('button').filter({ hasText: /status|assign|progress|approve/i }).first();
  if (await statusBtn.count() > 0) {
    await statusBtn.click();
    await page.waitForTimeout(500);
    await shot('05c-ticket-status-change');
    console.log('  Status change clicked');
    // close modal if opened
    await page.keyboard.press('Escape');
  }
}

// ── 6. Assignments ────────────────────────────────────────────
console.log('\n[6] My Assignments');
await navTo('My Assignments');
await page.waitForTimeout(800);
await shot('06-assignments');
const assignCount = await page.locator('table tbody tr, [class*="assignRow"]').count();
console.log('  Assignment rows:', assignCount);

// ── 7. Reports ────────────────────────────────────────────────
console.log('\n[7] Reports');
const reportsBtn = page.locator('nav button').filter({ hasText: 'Reports' });
if (await reportsBtn.count() > 0) {
  await reportsBtn.click();
  await page.waitForTimeout(800);
  await shot('07-reports');
  console.log('  Reports page loaded');

  // Try changing report filters
  const reportFilter = page.locator('select, button[class*="seg"]').first();
  if (await reportFilter.count() > 0) {
    await shot('07b-reports-filters');
  }
}

// ── 8. User Management (Admin role) ───────────────────────────
console.log('\n[8] User Management — switching to Admin role');
// Switch role via profile menu
const profileBtn = page.locator('header button').filter({ has: page.locator('[class*="Avatar"], img[class*="avatar"]') }).first();
// Try clicking the profile area in header
const headerRight = page.locator('header').last();
const avatarBtn = headerRight.locator('button').last();
await avatarBtn.click();
await page.waitForTimeout(500);
await shot('08a-profile-menu');

// Click Admin role
const adminRoleBtn = page.locator('button').filter({ hasText: 'Admin' }).first();
if (await adminRoleBtn.count() > 0) {
  await adminRoleBtn.click();
  await page.waitForTimeout(500);
  console.log('  Switched to Admin role');
}

// Navigate to User Management
const usersBtn = page.locator('nav button').filter({ hasText: 'User Management' });
if (await usersBtn.count() > 0) {
  await usersBtn.click();
  await page.waitForTimeout(800);
  await shot('08-user-management');
  const userRows = await page.locator('table tbody tr').count();
  console.log('  User rows:', userRows);
}

// ── 9. Master Data ────────────────────────────────────────────
console.log('\n[9] Master Data');
const masterBtn = page.locator('nav button').filter({ hasText: 'Master Data' });
if (await masterBtn.count() > 0) {
  await masterBtn.click();
  await page.waitForTimeout(500);

  const masterPages = ['Application', 'Module', 'Business Unit', 'Team', 'Category', 'Severity', 'Priority', 'Status', 'SLA'];
  for (const mp of masterPages) {
    const mpBtn = page.locator('nav button').filter({ hasText: mp }).first();
    if (await mpBtn.count() > 0) {
      await mpBtn.click();
      await page.waitForTimeout(600);
      const safeName = mp.toLowerCase().replace(/ /g, '-');
      await shot(`09-master-${safeName}`);
      console.log(`  Master: ${mp} loaded`);
    }
  }
}

// ── 10. Notifications & Profile ───────────────────────────────
console.log('\n[10] Notifications Panel');
const bellBtn = page.locator('header button[aria-label*="otif"], header button[aria-label*="bell"]').first();
if (await bellBtn.count() === 0) {
  // try finding the bell by icon
  const headerBtns = page.locator('header button');
  const count = await headerBtns.count();
  for (let i = 0; i < count; i++) {
    const btn = headerBtns.nth(i);
    const aria = await btn.getAttribute('aria-label') || '';
    if (aria.toLowerCase().includes('notif')) {
      await btn.click();
      break;
    }
  }
} else {
  await bellBtn.click();
}
await page.waitForTimeout(500);
await shot('10-notifications-panel');
console.log('  Notifications panel opened');

// Mark all read
const markAllBtn = page.locator('button').filter({ hasText: /mark all/i }).first();
if (await markAllBtn.count() > 0) {
  await markAllBtn.click();
  console.log('  Marked all notifications as read');
}
// close any open overlay by clicking outside
await page.mouse.click(400, 400);
await page.waitForTimeout(500);

// ── 11. Dark Mode ─────────────────────────────────────────────
console.log('\n[11] Dark Mode Toggle');
const themeBtn = page.locator('header button[aria-label="Toggle theme"]').first();
if (await themeBtn.count() > 0) {
  await themeBtn.click({ force: true });
  await page.waitForTimeout(500);
  await shot('11-dark-mode');
  console.log('  Dark mode enabled');
  await themeBtn.click({ force: true });
  await page.waitForTimeout(300);
  console.log('  Back to light mode');
}

// ── 12. Notification Settings page ────────────────────────────
console.log('\n[12] Notification Settings');
// Open profile menu again
const avatarBtn2 = page.locator('header').last().locator('button').last();
await avatarBtn2.click();
await page.waitForTimeout(400);
const notifSettingsBtn = page.locator('button').filter({ hasText: /Notification Pref/i }).first();
if (await notifSettingsBtn.count() > 0) {
  await notifSettingsBtn.click();
  await page.waitForTimeout(600);
  await shot('12-notification-settings');
  console.log('  Notification settings page loaded');
}

// ── 13. Profile page ──────────────────────────────────────────
console.log('\n[13] Profile page');
await avatarBtn2.click();
await page.waitForTimeout(400);
const myProfileBtn = page.locator('button').filter({ hasText: 'My Profile' }).first();
if (await myProfileBtn.count() > 0) {
  await myProfileBtn.click();
  await page.waitForTimeout(600);
  await shot('13-profile');
  console.log('  Profile page loaded');
}

// ── 14. Role switching — all roles ────────────────────────────
console.log('\n[14] Role Switching Test');
const roles = ['BA', 'Developer', 'QA', 'Requestor', 'Project Manager'];
for (const r of roles) {
  await avatarBtn2.click();
  await page.waitForTimeout(400);
  const rBtn = page.locator('button').filter({ hasText: r }).first();
  if (await rBtn.count() > 0) {
    await rBtn.click();
    await page.waitForTimeout(600);
    const safeName = r.toLowerCase().replace(/ /g, '-');
    await shot(`14-role-${safeName}`);
    console.log(`  Role switched to: ${r}`);
  }
}

// ── Console errors check ──────────────────────────────────────
console.log('\n=== Console Errors ===');
if (errors.length === 0) {
  console.log('  No errors detected!');
} else {
  errors.forEach(e => console.log('  ERROR:', e));
}

console.log('\n=== Screenshots saved to:', screenshotDir, '===\n');
await browser.close();
