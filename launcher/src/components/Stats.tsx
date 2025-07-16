import React, { useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { useBreakpoint } from '../hooks/useWindowSize';
import './Stats.css';

export const Stats: React.FC = () => {
  const { state } = useApp();
  const { isMobile, isTablet } = useBreakpoint();

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

  const completedApps = state.apps.filter(app => app.isTestedWorking === true).length;

  const containerStyle = {
    marginBottom: isMobile ? '15px' : isTablet ? '20px' : '25px',
    gap: isMobile ? '10px' : isTablet ? '15px' : '20px',
    padding: isMobile ? '0 10px' : isTablet ? '0 15px' : '0 20px',
    flexDirection: isMobile ? 'column' as const : 'row' as const,
  };

  const statItemStyle = {
    padding: isMobile ? '10px' : isTablet ? '12px' : '15px',
    minWidth: isMobile ? '100%' : isTablet ? '140px' : '160px',
  };

  const statNumberStyle = {
    fontSize: isMobile ? '1.5rem' : isTablet ? '1.8rem' : '2rem',
  };

  const statLabelStyle = {
    fontSize: isMobile ? '0.75rem' : isTablet ? '0.8rem' : '0.9rem',
  };

  return (
    <div className={`stats ${isMobile ? 'mobile' : ''}`} style={containerStyle}>
      <div className="stat-item" style={statItemStyle}>
        <span className="stat-number" style={statNumberStyle}>{filteredApps.length}</span>
        <span className="stat-label" style={statLabelStyle}>
          {state.searchQuery || state.selectedCategory ? '検索結果' : '利用可能なアプリ'}
        </span>
      </div>
      <div className="stat-item" style={statItemStyle}>
        <span className="stat-number" style={statNumberStyle}>{completedApps}</span>
        <span className="stat-label" style={statLabelStyle}>完成済み</span>
      </div>
      <div className="stat-item" style={statItemStyle}>
        <span className="stat-number" style={statNumberStyle}>{100 - completedApps}</span>
        <span className="stat-label" style={statLabelStyle}>残り</span>
      </div>
    </div>
  );
};