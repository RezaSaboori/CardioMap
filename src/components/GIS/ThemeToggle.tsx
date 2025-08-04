import React, { useState, useEffect } from 'react';

const ThemeToggle: React.FC = () => {
  const [dark, setDark] = useState(() => document.documentElement.getAttribute('data-theme') === 'dark');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
  }, [dark]);

  return (
    <label style={{ position: 'fixed', top: 16, right: 16, zIndex: 1000, background: '#fff8', padding: 8, borderRadius: 8 }}>
      <input
        type="checkbox"
        checked={dark}
        onChange={e => setDark(e.target.checked)}
        style={{ marginRight: 8 }}
      />
      Dark mode
    </label>
  );
};

export default ThemeToggle; 