const { chromium } = require('playwright');

async function testSpecificApps() {
  console.log('🔍 Focused App Testing - Problem Apps + Random OK Apps');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1000 // Slow down for better debugging
  });
  const page = await browser.newPage();
  
  // Apps to test - focusing on problematic ones and some random OK ones
  const appsToTest = [
    // Previously problematic apps
    { id: 34, name: 'Shopping List', category: 'previously-ng' },
    { id: 35, name: 'Recipe Finder', category: 'previously-ng' },
    { id: 38, name: 'Modern Game', category: 'previously-ng' },
    { id: 46, name: 'Drawing App', category: 'previously-ng' },
    
    // Random OK apps from 034-053 range for verification
    { id: 37, name: 'Simple Game', category: 'random-ok' },
    { id: 39, name: 'Fantasy Game', category: 'random-ok' },
    { id: 41, name: 'Shooting Game', category: 'random-ok' },
    { id: 44, name: 'Expense Tracker', category: 'random-ok' },
    { id: 47, name: 'Voice Recorder', category: 'random-ok' },
    { id: 50, name: 'PDF Viewer', category: 'random-ok' },
    { id: 52, name: 'Presentation Tool', category: 'random-ok' }
  ];
  
  const results = [];
  
  try {
    // Navigate to launcher
    console.log('📱 Loading launcher page...');
    await page.goto('http://localhost:5174');
    await page.waitForLoadState('networkidle', { timeout: 10000 });
    
    // Test each app
    for (const app of appsToTest) {
      console.log(`\n🔍 Testing: ${app.name} (ID: ${app.id}) - ${app.category}`);
      
      try {
        // Look for the app card by searching for the app number in a more flexible way
        const appSelector = `[data-testid="app-${app.id}"], .app-card:has-text("${app.id.toString().padStart(3, '0')}"), .app-card:has-text("app-${app.id}")`;
        
        // Try to find the app card
        let appCard = null;
        try {
          appCard = await page.locator(appSelector).first();
          if (!(await appCard.isVisible())) {
            // Try alternative search by app name or number pattern
            appCard = await page.locator(`.app-card`).filter({ 
              hasText: new RegExp(`${app.id}|${app.name}`, 'i') 
            }).first();
          }
        } catch (e) {
          // Fallback to text search
          appCard = await page.locator(`.app-card`).filter({ 
            hasText: app.name 
          }).first();
        }
        
        if (await appCard.isVisible()) {
          console.log(`✅ Found app card for ${app.name}`);
          
          // Click on the app card
          await appCard.click();
          await page.waitForTimeout(2000);
          
          // Check if a new tab/window opened or if we navigated
          const pages = browser.contexts()[0].pages();
          let testPage = page;
          
          if (pages.length > 1) {
            testPage = pages[pages.length - 1]; // Use the newest page
            await testPage.waitForLoadState('networkidle', { timeout: 5000 });
          } else {
            // Check if we navigated to a new URL
            const currentUrl = page.url();
            if (currentUrl.includes(`app-${app.id.toString().padStart(3, '0')}`)) {
              console.log(`📱 Navigated to app URL: ${currentUrl}`);
            }
          }
          
          // Wait for app to load
          await testPage.waitForTimeout(2000);
          
          // Check for JavaScript errors
          const jsErrors = [];
          testPage.on('console', msg => {
            if (msg.type() === 'error') {
              jsErrors.push(msg.text());
            }
          });
          
          testPage.on('pageerror', err => {
            jsErrors.push(err.message);
          });
          
          // Wait a bit more for any async errors
          await testPage.waitForTimeout(1000);
          
          // Check if the page loaded properly
          const title = await testPage.title();
          const hasContent = await testPage.locator('body').isVisible();
          
          // Look for app-specific elements that indicate the app loaded
          let hasMainContent = false;
          try {
            // Common selectors that indicate the app loaded
            const contentSelectors = [
              '.container', '.main-content', '#app', '.app-container',
              'canvas', '.game-container', '.drawing-app', '.recipe-finder',
              '.shopping-list', 'main', 'section'
            ];
            
            for (const selector of contentSelectors) {
              if (await testPage.locator(selector).isVisible()) {
                hasMainContent = true;
                break;
              }
            }
          } catch (e) {
            // Ignore selector errors
          }
          
          // Test basic functionality based on app type
          let functionalityTest = 'not-tested';
          try {
            if (app.id === 34) { // Shopping List
              const addBtn = testPage.locator('#addBtn');
              if (await addBtn.isVisible()) {
                functionalityTest = 'add-button-visible';
              }
            } else if (app.id === 35) { // Recipe Finder
              const searchInput = testPage.locator('#searchInput');
              if (await searchInput.isVisible()) {
                functionalityTest = 'search-input-visible';
              }
            } else if (app.id === 38) { // Modern Game
              const gameCanvas = testPage.locator('#gameCanvas');
              if (await gameCanvas.isVisible()) {
                functionalityTest = 'game-canvas-visible';
              }
            } else if (app.id === 46) { // Drawing App
              const canvas = testPage.locator('#canvas');
              if (await canvas.isVisible()) {
                functionalityTest = 'drawing-canvas-visible';
              }
            } else {
              // Generic test - look for interactive elements
              const buttons = await testPage.locator('button').count();
              const inputs = await testPage.locator('input').count();
              if (buttons > 0 || inputs > 0) {
                functionalityTest = `interactive-elements-found (${buttons} buttons, ${inputs} inputs)`;
              }
            }
          } catch (e) {
            functionalityTest = `test-error: ${e.message}`;
          }
          
          results.push({
            id: app.id,
            name: app.name,
            category: app.category,
            status: jsErrors.length === 0 && hasContent && hasMainContent ? 'OK' : 'NG',
            found: true,
            loaded: hasContent,
            hasMainContent: hasMainContent,
            title: title,
            jsErrors: jsErrors,
            functionalityTest: functionalityTest,
            url: testPage.url()
          });
          
          console.log(`${jsErrors.length === 0 && hasContent && hasMainContent ? '✅' : '❌'} ${app.name} - Status: ${jsErrors.length === 0 && hasContent && hasMainContent ? 'OK' : 'NG'}`);
          if (jsErrors.length > 0) {
            console.log(`   JS Errors: ${jsErrors.join(', ')}`);
          }
          console.log(`   Functionality: ${functionalityTest}`);
          
          // Close extra tabs
          if (pages.length > 1) {
            await testPage.close();
          }
          
        } else {
          console.log(`❌ App card not found for ${app.name}`);
          results.push({
            id: app.id,
            name: app.name,
            category: app.category,
            status: 'NG',
            found: false,
            error: 'App card not found in launcher'
          });
        }
        
        // Navigate back to launcher
        await page.goto('http://localhost:5174');
        await page.waitForTimeout(1000);
        
      } catch (error) {
        console.log(`❌ Error testing ${app.name}: ${error.message}`);
        results.push({
          id: app.id,
          name: app.name,
          category: app.category,
          status: 'NG',
          found: false,
          error: error.message
        });
      }
    }
    
  } catch (error) {
    console.error('Test execution error:', error);
  }
  
  // Display results summary
  console.log('\n\n📊 TEST RESULTS SUMMARY');
  console.log('=' .repeat(60));
  
  const previouslyNGApps = results.filter(r => r.category === 'previously-ng');
  const randomOKApps = results.filter(r => r.category === 'random-ok');
  
  console.log('\n🔴 Previously NG Apps:');
  previouslyNGApps.forEach(result => {
    console.log(`${result.status === 'OK' ? '✅' : '❌'} app-${result.id.toString().padStart(3, '0')}: ${result.name} - ${result.status}`);
    if (result.jsErrors && result.jsErrors.length > 0) {
      console.log(`   Errors: ${result.jsErrors.join('; ')}`);
    }
    if (result.error) {
      console.log(`   Error: ${result.error}`);
    }
  });
  
  console.log('\n🔵 Random OK Apps (Verification):');
  randomOKApps.forEach(result => {
    console.log(`${result.status === 'OK' ? '✅' : '❌'} app-${result.id.toString().padStart(3, '0')}: ${result.name} - ${result.status}`);
    if (result.jsErrors && result.jsErrors.length > 0) {
      console.log(`   Errors: ${result.jsErrors.join('; ')}`);
    }
    if (result.error) {
      console.log(`   Error: ${result.error}`);
    }
  });
  
  console.log('\n📈 Statistics:');
  const prevNGFixed = previouslyNGApps.filter(r => r.status === 'OK').length;
  const prevNGStillBroken = previouslyNGApps.filter(r => r.status === 'NG').length;
  const randomOKWorking = randomOKApps.filter(r => r.status === 'OK').length;
  const randomOKBroken = randomOKApps.filter(r => r.status === 'NG').length;
  
  console.log(`Previously NG Apps: ${prevNGFixed}/${previouslyNGApps.length} now working`);
  console.log(`Random OK Apps: ${randomOKWorking}/${randomOKApps.length} still working`);
  
  await browser.close();
  console.log('\n🏁 Testing completed');
  
  return results;
}

// Run if this script is executed directly
if (require.main === module) {
  testSpecificApps().catch(console.error);
}

module.exports = { testSpecificApps };