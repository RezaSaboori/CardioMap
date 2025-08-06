import React, { useState, useEffect } from 'react';
import './ThemeToggleButton.css';

const ThemeToggleButton = ({ isExpanded = true, transitionDelay = '0ms' }) => {
  // Read initial theme state from DOM
  const [isDarkMode, setIsDarkMode] = useState(() => 
    document.body.classList.contains('dark')
  );

  // Listen for theme changes and update state accordingly
  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          const isDark = document.body.classList.contains('dark');
          setIsDarkMode(isDark);
        }
      });
    });

    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['class']
    });

    return () => observer.disconnect();
  }, []);

  const toggleTheme = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    
    if (newMode) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  };

  return (
    <button 
      className={`capsule-toggle ${isDarkMode ? 'dark-mode' : 'light-mode'} ${isExpanded ? 'expanded' : 'compact'}`}
      onClick={toggleTheme}
      style={{ transitionDelay }}
    >
      {isExpanded && (
        <>
          <span className="label-light">Light</span>
          <span className="label-dark">Dark</span>
        </>
      )}
      <span className="toggle-knob">
        <svg
          className="toggler-svg"
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <mask id="moon-mask">
            <rect x="0" y="0" width="100%" height="100%" fill="white" />
            <circle id="mask-circle" cx="12" cy="6" r="9" fill="black" />
          </mask>
    
          <g className="sun-and-moon">
             <circle cx="12" cy="12" r="9" mask="url(#moon-mask)"/>
          </g>
         
          <g className="sun-rays" stroke="currentColor">
            <line x1="12" y1="1" x2="12" y2="3" />
            <line x1="12" y1="21" x2="12" y2="23" />
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
            <line x1="1" y1="12" x2="3" y2="12" />
            <line x1="21" y1="12" x2="23" y2="12" />
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
          </g>
        </svg>
      </span>
    </button>
  );
};

export default ThemeToggleButton; 
