import React from 'react';
import './Header.css';

export const Header: React.FC = () => {
  return (
    <header className="header">
      <h1 className="header-title">100 Web Apps Launcher</h1>
      <p className="header-description">
        便利な100種類のWebアプリを起動できるランチャーです
      </p>
    </header>
  );
};