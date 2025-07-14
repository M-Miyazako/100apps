import React from 'react';
import type { App } from '../types/app';
import { useApp } from '../context/AppContext';
import './AppCard.css';

interface AppCardProps {
  app: App;
}

export const AppCard: React.FC<AppCardProps> = ({ app }) => {
  const { state } = useApp();

  const handleLaunch = () => {
    if (app.isCompleted) {
      window.open(app.path, '_blank');
    }
  };

  const category = state.categories.find(cat => cat.id === app.category);

  return (
    <div className="app-card">
      <div className="app-card-header">
        <h3 className="app-card-title">{app.name}</h3>
        <div
          className="app-card-category"
          style={{ backgroundColor: category?.color }}
        >
          {category?.name}
        </div>
      </div>
      
      <p className="app-card-description">{app.description}</p>
      
      <div className="app-card-tags">
        {app.tags.map(tag => (
          <span key={tag} className="app-card-tag">
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
        >
          {app.isCompleted ? '起動' : '開発中'}
        </button>
      </div>
    </div>
  );
};