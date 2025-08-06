import React from 'react';
import { IntegratedMenu, GISDashboard } from './components/GIS';
import TitleBlock from './components/TitleBlock';
import './app.css';


const App: React.FC = () => {
  return (
    <div className="app-wrapper">
      <IntegratedMenu />
      <TitleBlock />
      <div className="app-container">
        <GISDashboard />
      </div>
    </div>
  );
};

export default App; 