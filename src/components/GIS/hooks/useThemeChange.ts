import { useEffect, useState } from 'react';

/**
 * useThemeChange
 * Listens for data-theme attribute changes on the theme root (default: html) and increments a version number on each change.
 * Always call as useThemeChange('html', 'data-theme') for consistency.
 */
export function useThemeChange(themeRootSelector: string = 'html', themeAttribute: string = 'data-theme'): number {
  const [themeVersion, setThemeVersion] = useState(0);

  useEffect(() => {
    const root = document.querySelector(themeRootSelector);
    if (!root) return;

    const observer = new MutationObserver(() => {
      setThemeVersion(v => v + 1); // force update on attribute change
    });

    observer.observe(root, { attributes: true, attributeFilter: [themeAttribute] });

    return () => observer.disconnect();
  }, [themeRootSelector, themeAttribute]);

  return themeVersion;
} 