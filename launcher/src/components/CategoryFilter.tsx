import React from 'react';
import { useApp } from '../context/AppContext';
import { useBreakpoint } from '../hooks/useWindowSize';
import './CategoryFilter.css';

export const CategoryFilter: React.FC = () => {
  const { state, dispatch } = useApp();
  const { isMobile, isTablet } = useBreakpoint();

  const handleCategorySelect = (categoryId: string | null) => {
    dispatch({ type: 'SET_SELECTED_CATEGORY', payload: categoryId });
  };

  const containerStyle = {
    marginBottom: isMobile ? '15px' : isTablet ? '20px' : '25px',
    gap: isMobile ? '8px' : isTablet ? '10px' : '12px',
    padding: isMobile ? '0 10px' : isTablet ? '0 15px' : '0 20px',
    flexWrap: 'wrap' as const,
    justifyContent: 'center' as const,
  };

  const buttonStyle = {
    padding: isMobile ? '6px 12px' : isTablet ? '8px 16px' : '10px 20px',
    fontSize: isMobile ? '0.8rem' : isTablet ? '0.9rem' : '1rem',
    minWidth: isMobile ? '70px' : isTablet ? '80px' : '90px',
  };

  return (
    <div className={`category-filter ${isMobile ? 'mobile' : ''}`} style={containerStyle}>
      <button
        className={`category-btn ${state.selectedCategory === null ? 'active' : ''}`}
        onClick={() => handleCategorySelect(null)}
        style={buttonStyle}
      >
        全て
      </button>
      {state.categories.map(category => (
        <button
          key={category.id}
          className={`category-btn ${state.selectedCategory === category.id ? 'active' : ''}`}
          style={{ borderColor: category.color, ...buttonStyle }}
          onClick={() => handleCategorySelect(category.id)}
        >
          {category.name}
        </button>
      ))}
    </div>
  );
};