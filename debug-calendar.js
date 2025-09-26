import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  // Navigate to the calendar
  await page.goto('http://localhost:5174');
  
  // Wait for the calendar to load
  await page.waitForSelector('.weekly-view', { timeout: 10000 });
  
  // Take a screenshot
  await page.screenshot({ path: 'calendar-debug.png', fullPage: true });
  
  // Get debug information from console
  page.on('console', msg => {
    console.log('BROWSER LOG:', msg.text());
  });
  
  // Check if events are in the DOM
  const eventElements = await page.$$('.stacked-event');
  console.log(`Found ${eventElements.length} event elements in DOM`);
  
  // Check worker rows
  const workerRows = await page.$$('.resource-row');
  console.log(`Found ${workerRows.length} worker rows`);
  
  // Get debug info from the page
  const debugInfo = await page.evaluate(() => {
    const workers = document.querySelectorAll('.resource-row');
    const result = [];
    
    workers.forEach((worker, index) => {
      const workerName = worker.querySelector('.resource-name')?.textContent;
      const events = worker.querySelectorAll('.stacked-event');
      const debugHeight = worker.querySelector('[style*="color: red"]')?.textContent;
      const debugEvents = worker.querySelector('[style*="color: orange"]')?.textContent;
      
      result.push({
        index,
        name: workerName,
        eventsCount: events.length,
        debugHeight,
        debugEvents
      });
    });
    
    return result;
  });
  
  console.log('Worker Debug Info:', JSON.stringify(debugInfo, null, 2));
  
  // Keep browser open for manual inspection
  console.log('Browser opened for manual inspection. Press Ctrl+C to close.');
  
  // Wait for manual inspection
  await new Promise(resolve => {
    process.on('SIGINT', () => {
      console.log('Closing browser...');
      browser.close().then(resolve);
    });
  });
})();