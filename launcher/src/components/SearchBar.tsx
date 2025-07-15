import React from 'react';
import { useApp } from '../context/AppContext';
import { useBreakpoint } from '../hooks/useWindowSize';
import './SearchBar.css';

export const SearchBar: React.FC = () => {
  const { state, dispatch } = useApp();
  const { isMobile, isTablet } = useBreakpoint();

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch({ type: 'SET_SEARCH_QUERY', payload: e.target.value });
  };

  const handleClear = () => {
    dispatch({ type: 'SET_SEARCH_QUERY', payload: '' });
  };

  const containerStyle = {
    marginBottom: isMobile ? '12px' : isTablet ? '16px' : '20px',
    padding: isMobile ? '0 10px' : isTablet ? '0 15px' : '0 20px',
  };

  const inputStyle = {
    padding: isMobile ? '8px 12px' : isTablet ? '10px 14px' : '12px 16px',
    fontSize: isMobile ? '0.85rem' : isTablet ? '0.9rem' : '1rem',
  };

  const clearButtonStyle = {
    right: isMobile ? '18px' : '12px',
    width: isMobile ? '20px' : '24px',
    height: isMobile ? '20px' : '24px',
    fontSize: isMobile ? '1rem' : '1.2rem',
  };

  return (
    <div className={`search-container ${isMobile ? 'mobile' : ''}`} style={containerStyle}>
      <div className="search-input-wrapper">
        <input
          type="text"
          className="search-input"
          placeholder="アプリを検索..."
          value={state.searchQuery}
          onChange={handleSearch}
          style={inputStyle}
        />
        {state.searchQuery && (
          <button className="clear-button" onClick={handleClear} style={clearButtonStyle}>
            ×
          </button>
        )}
      </div>
    </div>
  );
};