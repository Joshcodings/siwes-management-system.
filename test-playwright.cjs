const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
  await page.goto('https://siwes-management-system-el0j.onrender.com/', { waitUntil: 'networkidle' });
  const html = await page.content();
  console.log('ROOT HTML:', html.substring(0, 300));
  await browser.close();
})();
