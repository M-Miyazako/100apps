import React, { useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { AppCard } from './AppCard';
import './AppGrid.css';

export const AppGrid: React.FC = () => {
  const { state } = useApp();

  const filteredApps = useMemo(() => {
    let filtered = state.apps;

    if (state.searchQuery) {
      filtered = filtered.filter(app =>
        app.name.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
        app.description.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
        app.tags.some(tag => tag.toLowerCase().includes(state.searchQuery.toLowerCase()))
      );
    }

    if (state.selectedCategory) {
      filtered = filtered.filter(app => app.category === state.selectedCategory);
    }

    return filtered.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }, [state.apps, state.searchQuery, state.selectedCategory]);

  if (state.isLoading) {
    return (
      <div className="loading">
        <div className="loading-spinner"></div>
        <p>アプリを読み込み中...</p>
      </div>
    );
  }

  if (filteredApps.length === 0) {
    return (
      <div className="no-results">
        <p>
          {state.searchQuery || state.selectedCategory
            ? '検索結果が見つかりませんでした'
            : 'まだアプリが追加されていません'}
        </p>
        {!state.searchQuery && !state.selectedCategory && (
          <p className="no-results-subtitle">
            アプリが完成すると、ここに表示されます
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="app-grid">
      {filteredApps.map(app => (
        <AppCard key={app.id} app={app} />
      ))}
    </div>
  );
};