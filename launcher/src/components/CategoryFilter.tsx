import React from 'react';
import { useApp } from '../context/AppContext';
import './CategoryFilter.css';

export const CategoryFilter: React.FC = () => {
  const { state, dispatch } = useApp();

  const handleCategorySelect = (categoryId: string | null) => {
    dispatch({ type: 'SET_SELECTED_CATEGORY', payload: categoryId });
  };

  return (
    <div className="category-filter">
      <button
        className={`category-btn ${state.selectedCategory === null ? 'active' : ''}`}
        onClick={() => handleCategorySelect(null)}
      >
        全て
      </button>
      {state.categories.map(category => (
        <button
          key={category.id}
          className={`category-btn ${state.selectedCategory === category.id ? 'active' : ''}`}
          style={{ borderColor: category.color }}
          onClick={() => handleCategorySelect(category.id)}
        >
          {category.name}
        </button>
      ))}
    </div>
  );
};