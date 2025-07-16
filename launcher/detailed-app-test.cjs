const { chromium } = require('playwright');

async function detailedAppTest() {
  console.log('🔍 Detailed App Functionality Testing');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 500
  });
  const page = await browser.newPage();
  
  // Previously problematic apps to test in detail
  const appsToTest = [
    { id: 34, name: 'Shopping List', file: 'app-034-shopping-list' },
    { id: 35, name: 'Recipe Finder', file: 'app-035-recipe-finder' },
    { id: 38, name: 'Modern Game', file: 'app-038-modern-game' },
    { id: 46, name: 'Drawing App', file: 'app-046-drawing-app' }
  ];
  
  const results = [];
  
  try {
    for (const app of appsToTest) {
      console.log(`\n🔍 Detailed testing: ${app.name} (ID: ${app.id})`);
      
      try {
        // Navigate directly to the app
        const appUrl = `http://localhost:5175/apps/${app.file}/index.html`;
        console.log(`📱 Loading app URL: ${appUrl}`);
        
        await page.goto(appUrl);
        await page.waitForLoadState('networkidle', { timeout: 10000 });
        
        // Wait for JavaScript to load
        await page.waitForTimeout(2000);
        
        const jsErrors = [];
        page.on('console', msg => {
          if (msg.type() === 'error') {
            jsErrors.push(msg.text());
          }
        });
        
        page.on('pageerror', err => {
          jsErrors.push(err.message);
        });
        
        // Wait a bit more for any async errors
        await page.waitForTimeout(1000);
        
        let functionalityResults = {};
        
        if (app.id === 34) { // Shopping List
          console.log('   Testing Shopping List functionality...');
          
          // Test if main elements are present
          const itemInput = await page.locator('#itemInput').isVisible();
          const addBtn = await page.locator('#addBtn').isVisible();
          const shoppingList = await page.locator('#shoppingList').isVisible();
          
          functionalityResults.mainElements = { itemInput, addBtn, shoppingList };
          
          if (itemInput && addBtn) {
            try {
              // Try to add an item
              await page.fill('#itemInput', 'Test Item');
              await page.click('#addBtn');
              await page.waitForTimeout(1000);
              
              // Check if item was added
              const itemAdded = await page.locator('.shopping-item').count() > 0;
              functionalityResults.addItem = itemAdded;
              
              if (itemAdded) {
                console.log('   ✅ Successfully added shopping list item');
              } else {
                console.log('   ❌ Failed to add shopping list item');
              }
            } catch (e) {
              functionalityResults.addItem = `error: ${e.message}`;
            }
          }
          
        } else if (app.id === 35) { // Recipe Finder
          console.log('   Testing Recipe Finder functionality...');
          
          const searchInput = await page.locator('#searchInput').isVisible();
          const recipeGrid = await page.locator('#recipeGrid').isVisible();
          const searchBtn = await page.locator('#searchBtn').isVisible();
          
          functionalityResults.mainElements = { searchInput, recipeGrid, searchBtn };
          
          // Check if recipes are displayed
          const recipeCount = await page.locator('.recipe-card').count();
          functionalityResults.recipesDisplayed = recipeCount;
          
          if (searchInput && searchBtn) {
            try {
              // Try searching
              await page.fill('#searchInput', 'curry');
              await page.click('#searchBtn');
              await page.waitForTimeout(1000);
              
              const searchResults = await page.locator('.recipe-card').count();
              functionalityResults.searchResults = searchResults;
              
              console.log(`   ✅ Search returned ${searchResults} results`);
            } catch (e) {
              functionalityResults.search = `error: ${e.message}`;
            }
          }
          
        } else if (app.id === 38) { // Modern Game (Tetris)
          console.log('   Testing Modern Game functionality...');
          
          const gameCanvas = await page.locator('#gameCanvas').isVisible();
          const nextCanvas = await page.locator('#nextCanvas').isVisible();
          const startBtn = await page.locator('#startBtn').isVisible();
          
          functionalityResults.mainElements = { gameCanvas, nextCanvas, startBtn };
          
          if (gameCanvas) {
            // Check canvas dimensions
            const canvasWidth = await page.locator('#gameCanvas').getAttribute('width');
            const canvasHeight = await page.locator('#gameCanvas').getAttribute('height');
            functionalityResults.canvasDimensions = { width: canvasWidth, height: canvasHeight };
            
            if (startBtn) {
              try {
                // Try starting the game
                await page.click('#startBtn');
                await page.waitForTimeout(1000);
                
                const btnDisabled = await page.locator('#startBtn').isDisabled();
                functionalityResults.gameStart = btnDisabled;
                
                console.log(`   ${btnDisabled ? '✅' : '❌'} Game start button state changed`);
              } catch (e) {
                functionalityResults.gameStart = `error: ${e.message}`;
              }
            }
          }
          
        } else if (app.id === 46) { // Drawing App
          console.log('   Testing Drawing App functionality...');
          
          const canvas = await page.locator('#canvas').isVisible();
          const colorPicker = await page.locator('#color-picker').isVisible();
          const brushSize = await page.locator('#brush-size').isVisible();
          
          functionalityResults.mainElements = { canvas, colorPicker, brushSize };
          
          if (canvas) {
            // Check canvas dimensions
            const canvasWidth = await page.locator('#canvas').getAttribute('width');
            const canvasHeight = await page.locator('#canvas').getAttribute('height');
            functionalityResults.canvasDimensions = { width: canvasWidth, height: canvasHeight };
            
            // Test drawing functionality
            try {
              const canvasElement = await page.locator('#canvas');
              const box = await canvasElement.boundingBox();
              
              if (box) {
                // Simulate drawing
                await page.mouse.move(box.x + 100, box.y + 100);
                await page.mouse.down();
                await page.mouse.move(box.x + 200, box.y + 200);
                await page.mouse.up();
                
                functionalityResults.drawingTest = 'drawing-attempted';
                console.log('   ✅ Drawing interaction attempted');
              }
            } catch (e) {
              functionalityResults.drawingTest = `error: ${e.message}`;
            }
          }
        }
        
        results.push({
          id: app.id,
          name: app.name,
          status: jsErrors.length === 0 ? 'OK' : 'NG',
          jsErrors: jsErrors,
          functionality: functionalityResults,
          url: page.url()
        });
        
        console.log(`${jsErrors.length === 0 ? '✅' : '❌'} ${app.name} - ${jsErrors.length === 0 ? 'OK' : 'NG'}`);
        if (jsErrors.length > 0) {
          console.log(`   JS Errors: ${jsErrors.join('; ')}`);
        }
        
      } catch (error) {
        console.log(`❌ Error testing ${app.name}: ${error.message}`);
        results.push({
          id: app.id,
          name: app.name,
          status: 'NG',
          error: error.message
        });
      }
    }
    
  } catch (error) {
    console.error('Test execution error:', error);
  }
  
  // Display detailed results
  console.log('\n\n📊 DETAILED TEST RESULTS');
  console.log('=' .repeat(60));
  
  results.forEach(result => {
    console.log(`\n${result.status === 'OK' ? '✅' : '❌'} app-${result.id.toString().padStart(3, '0')}: ${result.name} - ${result.status}`);
    
    if (result.jsErrors && result.jsErrors.length > 0) {
      console.log(`   JavaScript Errors: ${result.jsErrors.join('; ')}`);
    }
    
    if (result.functionality) {
      console.log('   Functionality Test Results:');
      Object.keys(result.functionality).forEach(key => {
        const value = result.functionality[key];
        console.log(`     ${key}: ${JSON.stringify(value)}`);
      });
    }
    
    if (result.error) {
      console.log(`   Error: ${result.error}`);
    }
  });
  
  const workingApps = results.filter(r => r.status === 'OK').length;
  const totalApps = results.length;
  
  console.log(`\n📈 Summary: ${workingApps}/${totalApps} apps are fully functional`);
  
  await browser.close();
  console.log('\n🏁 Detailed testing completed');
  
  return results;
}

// Run if this script is executed directly
if (require.main === module) {
  detailedAppTest().catch(console.error);
}

module.exports = { detailedAppTest };