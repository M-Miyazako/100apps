class RecipeFinder {
    constructor() {
        this.recipes = [
            {
                id: 1,
                name: '親子丼',
                category: '和食',
                difficulty: '簡単',
                time: 20,
                servings: 2,
                ingredients: ['鶏肉', '卵', '玉ねぎ', 'ご飯', 'だし', '醤油', 'みりん', '砂糖'],
                instructions: [
                    '玉ねぎを薄切りにする',
                    '鶏肉を一口大に切る',
                    'フライパンにだし、醤油、みりん、砂糖を入れて煮立たせる',
                    '鶏肉と玉ねぎを加えて煮る',
                    '溶き卵を回し入れて半熟にする',
                    'ご飯の上にのせて完成'
                ],
                image: '🍚',
                tags: ['丼', '卵料理', '鶏肉']
            },
            {
                id: 2,
                name: 'ハンバーグ',
                category: '洋食',
                difficulty: '普通',
                time: 30,
                servings: 4,
                ingredients: ['牛ひき肉', '豚ひき肉', '玉ねぎ', '卵', 'パン粉', '牛乳', '塩', 'こしょう'],
                instructions: [
                    '玉ねぎをみじん切りにして炒める',
                    'パン粉を牛乳に浸す',
                    'ひき肉、玉ねぎ、卵、パン粉を混ぜる',
                    '塩こしょうで味を調える',
                    '形を整えてフライパンで焼く',
                    '蓋をして蒸し焼きにする'
                ],
                image: '🍖',
                tags: ['肉料理', 'メイン']
            },
            {
                id: 3,
                name: 'カレーライス',
                category: '洋食',
                difficulty: '簡単',
                time: 45,
                servings: 4,
                ingredients: ['牛肉', 'じゃがいも', 'にんじん', '玉ねぎ', 'カレールー', 'ご飯'],
                instructions: [
                    '野菜と肉を一口大に切る',
                    '鍋で肉を炒める',
                    '野菜を加えて炒める',
                    '水を加えて煮込む',
                    '野菜が柔らかくなったらカレールーを加える',
                    'ご飯と一緒に盛り付ける'
                ],
                image: '🍛',
                tags: ['カレー', 'スパイス']
            },
            {
                id: 4,
                name: 'チャーハン',
                category: '中華',
                difficulty: '簡単',
                time: 15,
                servings: 2,
                ingredients: ['ご飯', '卵', 'ネギ', 'ハム', '醤油', '塩', 'こしょう', 'ごま油'],
                instructions: [
                    'ご飯をほぐしておく',
                    'ネギを小口切りにする',
                    'フライパンで卵を炒めて取り出す',
                    'ハムを炒める',
                    'ご飯を加えてパラパラになるまで炒める',
                    '卵とネギを戻し入れて調味料で味付け'
                ],
                image: '🍳',
                tags: ['炒飯', '中華料理']
            },
            {
                id: 5,
                name: 'サラダ',
                category: 'サラダ',
                difficulty: '簡単',
                time: 10,
                servings: 2,
                ingredients: ['レタス', 'トマト', 'きゅうり', 'ドレッシング'],
                instructions: [
                    'レタスを洗って一口大にちぎる',
                    'トマトを櫛切りにする',
                    'きゅうりを輪切りにする',
                    '皿に盛り付けてドレッシングをかける'
                ],
                image: '🥗',
                tags: ['野菜', 'ヘルシー']
            }
        ];
        
        this.favorites = JSON.parse(localStorage.getItem('recipeFavorites') || '[]');
        this.searchHistory = JSON.parse(localStorage.getItem('recipeSearchHistory') || '[]');
        
        this.initializeElements();
        this.bindEvents();
        this.displayRecipes(this.recipes);
        this.updateStats();
    }
    
    initializeElements() {
        this.elements = {
            searchInput: document.getElementById('searchInput'),
            searchBtn: document.getElementById('searchBtn'),
            clearBtn: document.getElementById('clearBtn'),
            categoryFilter: document.getElementById('categoryFilter'),
            difficultyFilter: document.getElementById('difficultyFilter'),
            timeFilter: document.getElementById('timeFilter'),
            sortBy: document.getElementById('sortBy'),
            recipeGrid: document.getElementById('recipesGrid'),
            noResults: document.getElementById('noResults'),
            totalRecipes: document.getElementById('totalRecipes'),
            favoriteCount: document.getElementById('favoriteCount'),
            searchHistory: document.getElementById('searchHistory'),
            selectedRecipe: document.getElementById('selectedRecipe'),
            recipeModal: document.getElementById('recipeModal'),
            closeModal: document.getElementById('closeModal')
        };
    }
    
    bindEvents() {
        // 検索機能
        this.elements.searchBtn.addEventListener('click', () => this.searchRecipes());
        this.elements.searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.searchRecipes();
        });
        this.elements.clearBtn.addEventListener('click', () => this.clearSearch());
        
        // フィルター機能
        this.elements.categoryFilter.addEventListener('change', () => this.filterRecipes());
        this.elements.difficultyFilter.addEventListener('change', () => this.filterRecipes());
        this.elements.timeFilter.addEventListener('change', () => this.filterRecipes());
        this.elements.sortBy.addEventListener('change', () => this.sortRecipes());
        
        // モーダル
        this.elements.closeModal.addEventListener('click', () => this.closeRecipeModal());
        window.addEventListener('click', (e) => {
            if (e.target === this.elements.recipeModal) {
                this.closeRecipeModal();
            }
        });
    }
    
    searchRecipes() {
        const query = this.elements.searchInput.value.trim().toLowerCase();
        if (!query) return;
        
        // 検索履歴に追加
        this.addToSearchHistory(query);
        
        const filteredRecipes = this.recipes.filter(recipe => 
            recipe.name.toLowerCase().includes(query) ||
            recipe.ingredients.some(ingredient => ingredient.toLowerCase().includes(query)) ||
            recipe.tags.some(tag => tag.toLowerCase().includes(query))
        );
        
        this.displayRecipes(filteredRecipes);
    }
    
    clearSearch() {
        this.elements.searchInput.value = '';
        this.elements.categoryFilter.value = 'all';
        this.elements.difficultyFilter.value = 'all';
        this.elements.timeFilter.value = 'all';
        this.elements.sortBy.value = 'name';
        this.displayRecipes(this.recipes);
    }
    
    filterRecipes() {
        let filtered = this.recipes;
        
        const category = this.elements.categoryFilter.value;
        const difficulty = this.elements.difficultyFilter.value;
        const time = this.elements.timeFilter.value;
        
        if (category !== 'all') {
            filtered = filtered.filter(recipe => recipe.category === category);
        }
        
        if (difficulty !== 'all') {
            filtered = filtered.filter(recipe => recipe.difficulty === difficulty);
        }
        
        if (time !== 'all') {
            const maxTime = parseInt(time);
            filtered = filtered.filter(recipe => recipe.time <= maxTime);
        }
        
        this.displayRecipes(filtered);
    }
    
    sortRecipes() {
        const sortBy = this.elements.sortBy.value;
        const currentRecipes = this.getCurrentDisplayedRecipes();
        
        const sorted = [...currentRecipes].sort((a, b) => {
            switch (sortBy) {
                case 'name':
                    return a.name.localeCompare(b.name);
                case 'time':
                    return a.time - b.time;
                case 'difficulty':
                    const difficultyOrder = { '簡単': 1, '普通': 2, '難しい': 3 };
                    return difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
                case 'category':
                    return a.category.localeCompare(b.category);
                default:
                    return 0;
            }
        });
        
        this.displayRecipes(sorted);
    }
    
    getCurrentDisplayedRecipes() {
        // 現在表示されているレシピを取得
        const recipeCards = document.querySelectorAll('.recipe-card');
        return Array.from(recipeCards).map(card => {
            const id = parseInt(card.dataset.id);
            return this.recipes.find(recipe => recipe.id === id);
        }).filter(recipe => recipe);
    }
    
    displayRecipes(recipes) {
        if (recipes.length === 0) {
            this.elements.recipeGrid.style.display = 'none';
            this.elements.noResults.style.display = 'block';
            return;
        }
        
        this.elements.recipeGrid.style.display = 'grid';
        this.elements.noResults.style.display = 'none';
        
        this.elements.recipeGrid.innerHTML = recipes.map(recipe => this.createRecipeCard(recipe)).join('');
        
        // イベントバインド
        this.bindRecipeEvents();
    }
    
    createRecipeCard(recipe) {
        const isFavorite = this.favorites.includes(recipe.id);
        return `
            <div class="recipe-card" data-id="${recipe.id}">
                <div class="recipe-image">${recipe.image}</div>
                <div class="recipe-content">
                    <h3 class="recipe-title">${recipe.name}</h3>
                    <div class="recipe-meta">
                        <span class="recipe-category">${recipe.category}</span>
                        <span class="recipe-time">⏱️ ${recipe.time}分</span>
                        <span class="recipe-difficulty">${recipe.difficulty}</span>
                    </div>
                    <div class="recipe-ingredients">
                        ${recipe.ingredients.slice(0, 3).join(', ')}${recipe.ingredients.length > 3 ? '...' : ''}
                    </div>
                    <div class="recipe-actions">
                        <button class="view-recipe-btn" data-id="${recipe.id}">レシピを見る</button>
                        <button class="favorite-btn ${isFavorite ? 'favorited' : ''}" data-id="${recipe.id}">
                            ${isFavorite ? '❤️' : '🤍'}
                        </button>
                    </div>
                </div>
            </div>
        `;
    }
    
    bindRecipeEvents() {
        // レシピ詳細表示
        document.querySelectorAll('.view-recipe-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.target.dataset.id);
                this.showRecipeModal(id);
            });
        });
        
        // お気に入り
        document.querySelectorAll('.favorite-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = parseInt(e.target.dataset.id);
                this.toggleFavorite(id);
            });
        });
    }
    
    showRecipeModal(id) {
        const recipe = this.recipes.find(r => r.id === id);
        if (!recipe) return;
        
        const isFavorite = this.favorites.includes(id);
        
        this.elements.selectedRecipe.innerHTML = `
            <div class="modal-recipe">
                <div class="modal-recipe-header">
                    <div class="modal-recipe-image">${recipe.image}</div>
                    <div class="modal-recipe-info">
                        <h2>${recipe.name}</h2>
                        <div class="modal-recipe-meta">
                            <span class="badge">${recipe.category}</span>
                            <span class="badge">${recipe.difficulty}</span>
                            <span class="badge">⏱️ ${recipe.time}分</span>
                            <span class="badge">👥 ${recipe.servings}人分</span>
                        </div>
                        <button class="modal-favorite-btn ${isFavorite ? 'favorited' : ''}" data-id="${id}">
                            ${isFavorite ? '❤️ お気に入り済み' : '🤍 お気に入りに追加'}
                        </button>
                    </div>
                </div>
                
                <div class="modal-recipe-content">
                    <div class="ingredients-section">
                        <h3>材料</h3>
                        <ul class="ingredients-list">
                            ${recipe.ingredients.map(ingredient => `<li>${ingredient}</li>`).join('')}
                        </ul>
                    </div>
                    
                    <div class="instructions-section">
                        <h3>作り方</h3>
                        <ol class="instructions-list">
                            ${recipe.instructions.map(instruction => `<li>${instruction}</li>`).join('')}
                        </ol>
                    </div>
                    
                    <div class="tags-section">
                        <h3>タグ</h3>
                        <div class="tags">
                            ${recipe.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // モーダル内のお気に入りボタン
        const modalFavoriteBtn = this.elements.selectedRecipe.querySelector('.modal-favorite-btn');
        modalFavoriteBtn.addEventListener('click', (e) => {
            const id = parseInt(e.target.dataset.id);
            this.toggleFavorite(id);
            
            // ボタンの表示を更新
            const isFav = this.favorites.includes(id);
            e.target.textContent = isFav ? '❤️ お気に入り済み' : '🤍 お気に入りに追加';
            e.target.classList.toggle('favorited', isFav);
        });
        
        this.elements.recipeModal.style.display = 'block';
    }
    
    closeRecipeModal() {
        this.elements.recipeModal.style.display = 'none';
    }
    
    toggleFavorite(id) {
        const index = this.favorites.indexOf(id);
        if (index > -1) {
            this.favorites.splice(index, 1);
        } else {
            this.favorites.push(id);
        }
        
        localStorage.setItem('recipeFavorites', JSON.stringify(this.favorites));
        this.updateStats();
        
        // 表示を更新
        this.displayRecipes(this.getCurrentDisplayedRecipes());
    }
    
    addToSearchHistory(query) {
        if (!this.searchHistory.includes(query)) {
            this.searchHistory.unshift(query);
            this.searchHistory = this.searchHistory.slice(0, 10); // 最新10件まで
            localStorage.setItem('recipeSearchHistory', JSON.stringify(this.searchHistory));
            this.updateSearchHistory();
        }
    }
    
    updateSearchHistory() {
        if (this.searchHistory.length === 0) {
            this.elements.searchHistory.innerHTML = '<p style="text-align: center; color: #999;">検索履歴がありません</p>';
            return;
        }
        
        this.elements.searchHistory.innerHTML = this.searchHistory.map(query => 
            `<div class="history-item" onclick="recipeFinder.searchFromHistory('${query}')">${query}</div>`
        ).join('');
    }
    
    searchFromHistory(query) {
        this.elements.searchInput.value = query;
        this.searchRecipes();
    }
    
    updateStats() {
        this.elements.totalRecipes.textContent = this.recipes.length;
        this.elements.favoriteCount.textContent = this.favorites.length;
        this.updateSearchHistory();
    }
    
    exportFavorites() {
        const favoriteRecipes = this.recipes.filter(recipe => this.favorites.includes(recipe.id));
        const data = {
            favorites: favoriteRecipes,
            exported: new Date().toISOString(),
            version: '1.0'
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `favorite-recipes-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }
}

// アプリ初期化
let recipeFinder;
document.addEventListener('DOMContentLoaded', () => {
    recipeFinder = new RecipeFinder();
});