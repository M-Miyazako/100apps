import React from 'react';
import type { App } from '../types/app';
import { useApp } from '../context/AppContext';
import { useBreakpoint } from '../hooks/useWindowSize';
import './AppCard.css';

interface AppCardProps {
  app: App;
}

export const AppCard: React.FC<AppCardProps> = ({ app }) => {
  const { state } = useApp();
  const { isMobile, isTablet } = useBreakpoint();

  const handleLaunch = () => {
    if (app.isCompleted) {
      window.open(app.path, '_blank');
    }
  };

  const category = state.categories.find(cat => cat.id === app.category);

  const cardStyle = {
    padding: isMobile ? '12px' : isTablet ? '16px' : '20px',
    minHeight: isMobile ? '160px' : isTablet ? '180px' : '200px',
  };

  const titleStyle = {
    fontSize: isMobile ? '1rem' : isTablet ? '1.1rem' : '1.2rem',
    marginBottom: isMobile ? '6px' : isTablet ? '8px' : '10px',
  };

  const descriptionStyle = {
    fontSize: isMobile ? '0.8rem' : isTablet ? '0.85rem' : '0.9rem',
    marginBottom: isMobile ? '8px' : isTablet ? '10px' : '12px',
  };

  const categoryStyle = {
    fontSize: isMobile ? '0.7rem' : isTablet ? '0.75rem' : '0.8rem',
    padding: isMobile ? '2px 6px' : isTablet ? '3px 8px' : '4px 10px',
  };

  const tagStyle = {
    fontSize: isMobile ? '0.65rem' : isTablet ? '0.7rem' : '0.75rem',
    padding: isMobile ? '2px 6px' : isTablet ? '3px 8px' : '4px 10px',
  };

  const buttonStyle = {
    padding: isMobile ? '6px 12px' : isTablet ? '8px 16px' : '10px 20px',
    fontSize: isMobile ? '0.75rem' : isTablet ? '0.8rem' : '0.85rem',
  };

  return (
    <div className={`app-card ${isMobile ? 'mobile' : ''}`} style={cardStyle}>
      <div className="app-card-header">
        <h3 className="app-card-title" style={titleStyle}>{app.name}</h3>
        <div
          className="app-card-category"
          style={{ backgroundColor: category?.color, ...categoryStyle }}
        >
          {category?.name}
        </div>
      </div>
      
      <p className="app-card-description" style={descriptionStyle}>{app.description}</p>
      
      <div className="app-card-tags">
        {app.tags.map(tag => (
          <span key={tag} className="app-card-tag" style={tagStyle}>
            {tag}
          </span>
        ))}
      </div>

      <div className="app-card-footer">
        <div className="app-card-status">
          <span className={`status-badge ${app.isCompleted ? 'completed' : 'in-progress'}`}>
            {app.isCompleted ? '完成' : '開発中'}
          </span>
        </div>
        
        <button
          className="app-card-launch-btn"
          onClick={handleLaunch}
          disabled={!app.isCompleted}
          style={buttonStyle}
        >
          {app.isCompleted ? '起動' : '開発中'}
        </button>
      </div>
    </div>
  );
};