import React from 'react';
import { ThemeToggle, GISDashboard } from './components/GIS';
import './app.css';

const App: React.FC = () => {
  return (
    <div className="app-wrapper">
      <ThemeToggle />
      <div className="app-container">
        <GISDashboard />
      </div>
    </div>
  );
};

export default App; 