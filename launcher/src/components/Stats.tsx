import React, { useMemo } from 'react';
import { useApp } from '../context/AppContext';
import './Stats.css';

export const Stats: React.FC = () => {
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

    return filtered;
  }, [state.apps, state.searchQuery, state.selectedCategory]);

  const completedApps = state.apps.filter(app => app.isCompleted).length;

  return (
    <div className="stats">
      <div className="stat-item">
        <span className="stat-number">{filteredApps.length}</span>
        <span className="stat-label">
          {state.searchQuery || state.selectedCategory ? '検索結果' : '利用可能なアプリ'}
        </span>
      </div>
      <div className="stat-item">
        <span className="stat-number">{completedApps}</span>
        <span className="stat-label">完成済み</span>
      </div>
      <div className="stat-item">
        <span className="stat-number">{100 - completedApps}</span>
        <span className="stat-label">残り</span>
      </div>
    </div>
  );
};