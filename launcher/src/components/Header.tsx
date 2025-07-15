import React from 'react';
import { useBreakpoint } from '../hooks/useWindowSize';
import './Header.css';

export const Header: React.FC = () => {
  const { isMobile, isTablet } = useBreakpoint();

  const headerStyle = {
    padding: isMobile ? '15px 10px' : isTablet ? '25px 15px' : '40px 20px',
    marginBottom: isMobile ? '15px' : isTablet ? '20px' : '30px',
  };

  const titleStyle = {
    fontSize: isMobile ? '1.5rem' : isTablet ? '2rem' : '2.5rem',
  };

  const descriptionStyle = {
    fontSize: isMobile ? '0.85rem' : isTablet ? '0.95rem' : '1.1rem',
    maxWidth: isMobile ? '100%' : '600px',
  };

  return (
    <header className={`header ${isMobile ? 'mobile' : ''}`} style={headerStyle}>
      <h1 className="header-title" style={titleStyle}>
        100 Web Apps Launcher
      </h1>
      <p className="header-description" style={descriptionStyle}>
        便利な100種類のWebアプリを起動できるランチャーです
      </p>
    </header>
  );
};