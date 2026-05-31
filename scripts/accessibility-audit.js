#!/usr/bin/env node
/*
 Accessibility audit using Playwright + axe-core against a live local URL.
 Usage: node scripts/accessibility-audit.js [base-url]
*/
import process from 'process';
import { chromium } from '@playwright/test';
import axe from 'axe-core';

async function run() {
  const baseUrl = process.argv[2] || 'http://127.0.0.1:3000';
  const routes = [
    '/',
    '/login',
    '/register',
    '/forgot-password',
    '/reset-password',
    '/dashboard',
    '/admin',
    '/legal/privacy',
    '/legal/terms',
    '/legal/ip-infringement',
    '/legal/data-compliance',
    '/this-route-does-not-exist'
  ];

  try {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    const results = [];

    for (const route of routes) {
      const url = new URL(route, baseUrl).toString();
      await page.goto(url, { waitUntil: 'networkidle' });
      await page.addScriptTag({ content: axe.source });
      const report = await page.evaluate(async () => {
        // @ts-ignore
        return await axe.run(document, {
          resultTypes: ['violations', 'incomplete', 'passes'],
          runOnly: {
            type: 'tag',
            values: ['wcag2a', 'wcag2aa']
          }
        });
      });

      results.push({ url, violations: report.violations, incomplete: report.incomplete });
    }

    await browser.close();
    console.log(JSON.stringify(results, null, 2));
  } catch (err) {
    console.error('Accessibility audit failed:', err.message || err);
    process.exit(2);
  }
}

run();
