const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.toString()));
  
  await page.goto('https://kinti.app/belepes', {waitUntil: 'networkidle2'});
  console.log('Page loaded');
  
  // Try to type in the email field and click submit
  try {
    await page.waitForSelector('input[name="identifier"]', { timeout: 5000 });
    await page.type('input[name="identifier"]', 'test@example.com');
    await page.click('button[data-localization-key="formButtonPrimary"]');
    console.log('Clicked submit');
  } catch (e) {
    console.log('Could not find email input or submit button:', e.message);
  }
  
  // Wait for navigation or error
  await new Promise(r => setTimeout(r, 5000));
  
  console.log('Current URL:', page.url());
  await page.screenshot({path: 'kinti-login-step2.png'});
  
  await browser.close();
  console.log('DONE');
})();
