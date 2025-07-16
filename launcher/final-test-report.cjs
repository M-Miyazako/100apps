const { chromium } = require('playwright');

async function finalAppTest() {
  console.log('🔍 Final Comprehensive App Testing Report');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 300
  });
  const page = await browser.newPage();
  
  // Test previously problematic apps + random verification apps
  const appsToTest = [
    // Previously NG - now should be OK
    { id: 34, name: 'Shopping List', file: 'app-034-shopping-list', status: 'previously-ng' },
    { id: 35, name: 'Recipe Finder', file: 'app-035-recipe-finder', status: 'previously-ng' },
    { id: 38, name: 'Modern Game', file: 'app-038-modern-game', status: 'previously-ng' },
    { id: 46, name: 'Drawing App', file: 'app-046-drawing-app', status: 'previously-ng' },
    
    // Random verification apps (should still work)
    { id: 1, name: 'Calculator', file: 'app-001-calculator', status: 'verification' },
    { id: 2, name: 'Todo List', file: 'app-002-todo', status: 'verification' },
    { id: 10, name: 'QR Generator', file: 'app-010-qr-generator', status: 'verification' },
    { id: 25, name: 'Music Player', file: 'app-025-music-player', status: 'verification' }
  ];
  
  const results = [];
  
  try {
    for (const app of appsToTest) {
      console.log(`\n🔍 Testing: ${app.name} (ID: ${app.id}) - ${app.status}`);
      
      try {
        const appUrl = `http://localhost:5175/apps/${app.file}/index.html`;
        await page.goto(appUrl);
        await page.waitForLoadState('networkidle', { timeout: 8000 });
        await page.waitForTimeout(1500);
        
        const jsErrors = [];
        page.on('console', msg => {
          if (msg.type() === 'error') {
            jsErrors.push(msg.text());
          }
        });
        
        page.on('pageerror', err => {
          jsErrors.push(err.message);
        });
        
        await page.waitForTimeout(1000);
        
        // Test basic functionality
        let functionalityScore = 0;
        let maxScore = 4;
        
        // Check if page has content
        const hasBody = await page.locator('body').isVisible();
        if (hasBody) functionalityScore++;
        
        // Check for interactive elements
        const buttonCount = await page.locator('button').count();
        const inputCount = await page.locator('input').count();
        if (buttonCount > 0 || inputCount > 0) functionalityScore++;
        
        // Check for main content container
        const hasContainer = await page.locator('.container, .main-content, main, #app').count() > 0;
        if (hasContainer) functionalityScore++;
        
        // App-specific functionality tests
        if (app.id === 34) { // Shopping List
          const canAddItem = await page.locator('#itemInput').isVisible() && await page.locator('#addBtn').isVisible();
          if (canAddItem) functionalityScore++;
        } else if (app.id === 35) { // Recipe Finder
          const hasSearch = await page.locator('#searchInput').isVisible();
          if (hasSearch) functionalityScore++;
        } else if (app.id === 38) { // Modern Game
          const hasCanvas = await page.locator('#gameCanvas').isVisible();
          if (hasCanvas) functionalityScore++;
        } else if (app.id === 46) { // Drawing App
          const hasCanvas = await page.locator('#canvas').isVisible();
          if (hasCanvas) functionalityScore++;
        } else {
          // Generic test for other apps
          const hasTitle = (await page.title()).length > 0;
          if (hasTitle) functionalityScore++;
        }
        
        const functionalityPercentage = Math.round((functionalityScore / maxScore) * 100);
        const overallStatus = jsErrors.length === 0 && functionalityPercentage >= 75 ? 'OK' : 'NG';
        
        results.push({
          id: app.id,
          name: app.name,
          status: app.status,
          overallStatus: overallStatus,
          jsErrors: jsErrors.length,
          functionalityScore: `${functionalityScore}/${maxScore} (${functionalityPercentage}%)`,
          buttonCount,
          inputCount,
          url: page.url()
        });
        
        console.log(`${overallStatus === 'OK' ? '✅' : '❌'} ${app.name}: ${overallStatus} (Functionality: ${functionalityPercentage}%)`);
        if (jsErrors.length > 0) {
          console.log(`   ⚠️ ${jsErrors.length} JS errors detected`);
        }
        
      } catch (error) {
        console.log(`❌ ${app.name}: ERROR - ${error.message}`);
        results.push({
          id: app.id,
          name: app.name,
          status: app.status,
          overallStatus: 'ERROR',
          error: error.message
        });
      }
    }
    
  } catch (error) {
    console.error('Test execution error:', error);
  }
  
  // Generate final report
  console.log('\n\n📊 FINAL COMPREHENSIVE TEST REPORT');
  console.log('=' .repeat(70));
  
  const previouslyNG = results.filter(r => r.status === 'previously-ng');
  const verification = results.filter(r => r.status === 'verification');
  
  console.log('\n🔴 Previously Problematic Apps (Fixed):');
  previouslyNG.forEach(result => {
    const emoji = result.overallStatus === 'OK' ? '✅' : result.overallStatus === 'NG' ? '❌' : '⚠️';
    console.log(`${emoji} app-${result.id.toString().padStart(3, '0')}: ${result.name} - ${result.overallStatus}`);
    if (result.functionalityScore) {
      console.log(`   Functionality: ${result.functionalityScore}`);
    }
    if (result.jsErrors > 0) {
      console.log(`   JS Errors: ${result.jsErrors}`);
    }
    if (result.error) {
      console.log(`   Error: ${result.error}`);
    }
  });
  
  console.log('\n🔵 Verification Apps (Should Still Work):');
  verification.forEach(result => {
    const emoji = result.overallStatus === 'OK' ? '✅' : result.overallStatus === 'NG' ? '❌' : '⚠️';
    console.log(`${emoji} app-${result.id.toString().padStart(3, '0')}: ${result.name} - ${result.overallStatus}`);
    if (result.functionalityScore) {
      console.log(`   Functionality: ${result.functionalityScore}`);
    }
    if (result.jsErrors > 0) {
      console.log(`   JS Errors: ${result.jsErrors}`);
    }
  });
  
  // Summary statistics
  const fixedApps = previouslyNG.filter(r => r.overallStatus === 'OK').length;
  const stillBrokenApps = previouslyNG.filter(r => r.overallStatus !== 'OK').length;
  const verificationOK = verification.filter(r => r.overallStatus === 'OK').length;
  const verificationBroken = verification.filter(r => r.overallStatus !== 'OK').length;
  
  console.log('\n📈 SUMMARY STATISTICS:');
  console.log(`Previously NG Apps Fixed: ${fixedApps}/${previouslyNG.length} (${Math.round(fixedApps/previouslyNG.length*100)}%)`);
  console.log(`Verification Apps Working: ${verificationOK}/${verification.length} (${Math.round(verificationOK/verification.length*100)}%)`);
  console.log(`Total Apps Tested: ${results.length}`);
  console.log(`Overall Success Rate: ${results.filter(r => r.overallStatus === 'OK').length}/${results.length} (${Math.round(results.filter(r => r.overallStatus === 'OK').length/results.length*100)}%)`);
  
  if (stillBrokenApps === 0 && verificationBroken === 0) {
    console.log('\n🎉 ALL TESTS PASSED! The previously problematic apps have been successfully fixed.');
  } else {
    console.log(`\n⚠️ ${stillBrokenApps + verificationBroken} apps still need attention.`);
  }
  
  await browser.close();
  console.log('\n🏁 Final testing completed');
  
  return results;
}

// Run if this script is executed directly
if (require.main === module) {
  finalAppTest().catch(console.error);
}

module.exports = { finalAppTest };