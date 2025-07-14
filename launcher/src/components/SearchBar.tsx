import React from 'react';
import { useApp } from '../context/AppContext';
import './SearchBar.css';

export const SearchBar: React.FC = () => {
  const { state, dispatch } = useApp();

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch({ type: 'SET_SEARCH_QUERY', payload: e.target.value });
  };

  const handleClear = () => {
    dispatch({ type: 'SET_SEARCH_QUERY', payload: '' });
  };

  return (
    <div className="search-container">
      <div className="search-input-wrapper">
        <input
          type="text"
          className="search-input"
          placeholder="アプリを検索..."
          value={state.searchQuery}
          onChange={handleSearch}
        />
        {state.searchQuery && (
          <button className="clear-button" onClick={handleClear}>
            ×
          </button>
        )}
      </div>
    </div>
  );
};