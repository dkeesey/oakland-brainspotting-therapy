#!/usr/bin/env node

/**
 * Visual verification script for Oakland Brainspotting site
 * Tests: rendering, sections, styling, responsiveness
 */

import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

(async () => {
  console.log('🔍 Starting Oakland Brainspotting site verification...\n');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();

  // Collect console logs
  const consoleLogs = [];
  page.on('console', msg => {
    const type = msg.type();
    if (type === 'error' || type === 'warning') {
      consoleLogs.push(`[${type.toUpperCase()}] ${msg.text()}`);
    }
  });

  try {
    // Navigate to local dev site
    console.log('📍 Navigating to http://localhost:4323...');
    await page.goto('http://localhost:4323', { waitUntil: 'networkidle' });

    // Take full page screenshot
    const screenshotDir = path.join(__dirname, 'test-results');
    if (!fs.existsSync(screenshotDir)) {
      fs.mkdirSync(screenshotDir, { recursive: true });
    }

    await page.screenshot({
      path: path.join(screenshotDir, 'homepage-desktop.png'),
      fullPage: true
    });
    console.log('✅ Desktop screenshot saved\n');

    // Check critical elements
    console.log('🔎 Verifying critical elements...');

    const checks = [
      { selector: 'header', name: 'Header' },
      { selector: 'h1', name: 'H1 heading' },
      { selector: '.hero', name: 'Hero section' },
      { selector: '.btn-primary', name: 'Primary CTA button' },
      { selector: '.what-is-brainspotting', name: 'What is Brainspotting section' },
      { selector: '.why-brainspotting', name: 'Why Choose Brainspotting section' },
      { selector: '.meet-megan', name: 'Meet Megan section' },
      { selector: '.oakland-bay-area', name: 'Oakland & Bay Area section' },
      { selector: '.faq', name: 'FAQ section' },
      { selector: 'footer', name: 'Footer' }
    ];

    const results = [];
    for (const check of checks) {
      const element = await page.locator(check.selector).first();
      const exists = await element.count() > 0;
      results.push({ name: check.name, exists });
      console.log(`  ${exists ? '✅' : '❌'} ${check.name}`);
    }

    // Check for Oakland branding colors
    console.log('\n🎨 Checking Oakland brand colors...');
    const styles = await page.evaluate(() => {
      const root = getComputedStyle(document.documentElement);
      return {
        oaklandBlue: root.getPropertyValue('--color-oakland-blue').trim(),
        oaklandGreen: root.getPropertyValue('--color-oakland-green').trim(),
        oaklandGold: root.getPropertyValue('--color-oakland-gold').trim()
      };
    });

    console.log(`  Oakland Blue: ${styles.oaklandBlue}`);
    console.log(`  Oakland Green: ${styles.oaklandGreen}`);
    console.log(`  Oakland Gold: ${styles.oaklandGold}`);

    // Check phone number is present
    console.log('\n📞 Checking contact info...');
    const phoneVisible = await page.locator('text=/\\(510\\) 694-0644/').count() > 0;
    console.log(`  ${phoneVisible ? '✅' : '❌'} Phone number visible`);

    // Test mobile viewport
    console.log('\n📱 Testing mobile view...');
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
    await page.screenshot({
      path: path.join(screenshotDir, 'homepage-mobile.png'),
      fullPage: true
    });
    console.log('✅ Mobile screenshot saved');

    // Console errors/warnings
    console.log('\n🔍 Console logs:');
    if (consoleLogs.length === 0) {
      console.log('  ✅ No console errors or warnings');
    } else {
      consoleLogs.forEach(log => console.log(`  ⚠️  ${log}`));
    }

    // Summary
    console.log('\n📊 VERIFICATION SUMMARY:');
    const passedChecks = results.filter(r => r.exists).length;
    const totalChecks = results.length;
    console.log(`  Elements found: ${passedChecks}/${totalChecks}`);
    console.log(`  Screenshots: test-results/homepage-{desktop,mobile}.png`);

    if (passedChecks === totalChecks && consoleLogs.length === 0) {
      console.log('\n✅ ALL CHECKS PASSED - Site is ready!');
    } else if (passedChecks >= totalChecks * 0.8) {
      console.log('\n⚠️  MOSTLY PASSING - Minor issues detected');
    } else {
      console.log('\n❌ ISSUES DETECTED - Review required');
    }

  } catch (error) {
    console.error('\n❌ Verification failed:', error.message);
    throw error;
  } finally {
    await browser.close();
  }
})();
