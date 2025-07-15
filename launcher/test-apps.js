// 100アプリテストスクリプト
const { chromium } = require('playwright');

async function testApps() {
  console.log('🚀 100 Web Apps テスト開始');
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  // テスト対象の最初の10個のアプリ
  const appsToTest = [
    { id: '1', name: '電卓', selector: '[data-app-id="1"]' },
    { id: '2', name: 'To-Do リスト', selector: '[data-app-id="2"]' },
    { id: '3', name: 'ストップウォッチ', selector: '[data-app-id="3"]' },
    { id: '4', name: 'ジャンケンゲーム', selector: '[data-app-id="4"]' },
    { id: '5', name: 'カラーピッカー', selector: '[data-app-id="5"]' },
    { id: '6', name: '天気予報', selector: '[data-app-id="6"]' },
    { id: '7', name: 'メモアプリ', selector: '[data-app-id="7"]' },
    { id: '8', name: 'タイマー', selector: '[data-app-id="8"]' },
    { id: '9', name: 'パスワードジェネレーター', selector: '[data-app-id="9"]' },
    { id: '10', name: 'QRコードジェネレーター', selector: '[data-app-id="10"]' }
  ];
  
  const results = [];
  
  try {
    // ランチャーページにアクセス
    console.log('📱 ランチャーページにアクセス中...');
    await page.goto('http://localhost:5174');
    await page.waitForLoadState('networkidle');
    
    // 各アプリをテスト
    for (const app of appsToTest) {
      console.log(`\n🔍 テスト中: ${app.name} (ID: ${app.id})`);
      
      try {
        // アプリカードを探す
        const appCard = await page.locator(`text="${app.name}"`).first();
        
        if (await appCard.isVisible()) {
          console.log(`✅ ${app.name} - カードが見つかりました`);
          
          // アプリを起動
          await appCard.click();
          
          // 新しいタブまたはページが開くのを待つ
          await page.waitForTimeout(2000);
          
          // エラーがないかチェック
          const errors = await page.evaluate(() => {
            const errorElements = document.querySelectorAll('[class*="error"], .error, [id*="error"]');
            return Array.from(errorElements).map(el => el.textContent);
          });
          
          results.push({
            id: app.id,
            name: app.name,
            status: 'success',
            found: true,
            clickable: true,
            errors: errors
          });
          
          console.log(`✅ ${app.name} - テスト完了`);
          
        } else {
          console.log(`❌ ${app.name} - カードが見つかりません`);
          results.push({
            id: app.id,
            name: app.name,
            status: 'error',
            found: false,
            clickable: false,
            error: 'カードが見つからない'
          });
        }
        
      } catch (error) {
        console.log(`❌ ${app.name} - エラー: ${error.message}`);
        results.push({
          id: app.id,
          name: app.name,
          status: 'error',
          found: false,
          clickable: false,
          error: error.message
        });
      }
      
      // ランチャーページに戻る
      await page.goto('http://localhost:5174');
      await page.waitForTimeout(1000);
    }
    
  } catch (error) {
    console.error('テスト実行中にエラーが発生:', error);
  }
  
  // テスト結果を表示
  console.log('\n\n📊 テスト結果サマリー:');
  console.log('=' .repeat(50));
  
  const successCount = results.filter(r => r.status === 'success').length;
  const errorCount = results.filter(r => r.status === 'error').length;
  
  console.log(`✅ 成功: ${successCount}/${appsToTest.length}`);
  console.log(`❌ エラー: ${errorCount}/${appsToTest.length}`);
  
  // 詳細結果
  console.log('\n📝 詳細結果:');
  results.forEach(result => {
    const status = result.status === 'success' ? '✅' : '❌';
    console.log(`${status} ${result.name} (ID: ${result.id})`);
    if (result.error) {
      console.log(`   エラー: ${result.error}`);
    }
    if (result.errors && result.errors.length > 0) {
      console.log(`   ページエラー: ${result.errors.join(', ')}`);
    }
  });
  
  await browser.close();
  console.log('\n🏁 テスト完了');
  
  return results;
}

// テストを実行
if (require.main === module) {
  testApps().catch(console.error);
}

module.exports = { testApps };