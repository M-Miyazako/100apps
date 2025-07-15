import React, { useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { AppCard } from './AppCard';
import { useBreakpoint } from '../hooks/useWindowSize';
import './AppGrid.css';

export const AppGrid: React.FC = () => {
  const { state } = useApp();
  const { isMobile, isTablet, width } = useBreakpoint();

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

  const getGridStyle = () => {
    let gridTemplateColumns;
    let gap;
    let padding;

    if (isMobile) {
      gridTemplateColumns = '1fr';
      gap = '12px';
      padding = '0 10px';
    } else if (isTablet) {
      gridTemplateColumns = 'repeat(auto-fill, minmax(260px, 1fr))';
      gap = '16px';
      padding = '0 15px';
    } else if (width < 1200) {
      gridTemplateColumns = 'repeat(auto-fill, minmax(280px, 1fr))';
      gap = '18px';
      padding = '0 20px';
    } else if (width < 1600) {
      gridTemplateColumns = 'repeat(auto-fill, minmax(300px, 1fr))';
      gap = '20px';
      padding = '0 20px';
    } else {
      gridTemplateColumns = 'repeat(auto-fill, minmax(320px, 1fr))';
      gap = '24px';
      padding = '0 20px';
    }

    return {
      display: 'grid',
      gridTemplateColumns,
      gap,
      padding,
      width: '100%',
      maxWidth: isMobile ? '100%' : '1600px',
      marginBottom: isMobile ? '20px' : '30px',
      justifyContent: 'center',
    };
  };

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
    <div className={`app-grid ${isMobile ? 'mobile' : ''}`} style={getGridStyle()}>
      {filteredApps.map(app => (
        <AppCard key={app.id} app={app} />
      ))}
    </div>
  );
};