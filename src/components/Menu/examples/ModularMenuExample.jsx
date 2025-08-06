import React, { useState } from 'react';
import { Menu, MenuItem, createIconFactory } from '../index';
import HomeIcon from '../icons/HomeIcon';
import ProfileIcon from '../icons/ProfileIcon';
import ContactIcon from '../icons/ContactIcon';

/**
 * Example demonstrating the modular Menu component usage
 * This shows how to use the Menu component in different projects with different configurations
 */

// Example 1: Basic Modular Menu with Icon Factory
export const BasicModularMenu = () => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Create icon factory for this project
  const iconFactory = createIconFactory({
    home: HomeIcon,
    profile: ProfileIcon,
    contact: ContactIcon,
  });

  // Define menu items configuration
  const menuItems = [
    {
      icon: 'home',
      text: 'Home',
      onClick: (index) => {
        console.log('Home clicked', index);
        setSelectedIndex(index);
      }
    },
    {
      icon: 'profile',
      text: 'Profile',
      onClick: (index) => {
        console.log('Profile clicked', index);
        setSelectedIndex(index);
      }
    },
    {
      icon: 'contact',
      text: 'Contact',
      onClick: (index) => {
        console.log('Contact clicked', index);
        setSelectedIndex(index);
      }
    }
  ];

  return (
    <Menu
      items={menuItems}
      iconFactory={iconFactory}
      selectedIndex={selectedIndex}
      onItemClick={setSelectedIndex}
      position={['top', 'right']}
      glassy={true}
      expandable="expand"
    />
  );
};

// Example 2: Compact Menu with Custom Icons
export const CompactMenu = () => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Custom icon components for this project
  const DashboardIcon = () => (
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M8 8h8v8H8z" fill="var(--color-gray12)"/>
      <path d="M24 8h8v8h-8z" fill="var(--color-gray1)"/>
      <path d="M8 24h8v8H8z" fill="var(--color-gray12)"/>
      <path d="M24 24h8v8h-8z" fill="var(--color-gray1)"/>
    </svg>
  );

  const AnalyticsIcon = () => (
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M8 32l8-8 8 4 8-12" stroke="var(--color-gray12)" strokeWidth="2" fill="none"/>
      <circle cx="8" cy="32" r="2" fill="var(--color-gray1)"/>
      <circle cx="16" cy="24" r="2" fill="var(--color-gray1)"/>
      <circle cx="24" cy="28" r="2" fill="var(--color-gray1)"/>
      <circle cx="32" cy="16" r="2" fill="var(--color-gray1)"/>
    </svg>
  );

  const iconFactory = createIconFactory({
    dashboard: DashboardIcon,
    analytics: AnalyticsIcon,
    home: HomeIcon,
  });

  const menuItems = [
    { icon: 'dashboard', text: 'Dashboard' },
    { icon: 'analytics', text: 'Analytics' },
    { icon: 'home', text: 'Home' }
  ];

  return (
    <Menu
      items={menuItems}
      iconFactory={iconFactory}
      selectedIndex={selectedIndex}
      onItemClick={setSelectedIndex}
      position={['top', 'center']}
      glassy={true}
      expandable="compact"
    />
  );
};

// Example 3: Hover-based Menu with Non-selectable Items
export const HoverMenu = () => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const SettingsIcon = () => (
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 24a4 4 0 100-8 4 4 0 000 8z" fill="var(--color-gray12)"/>
      <path d="M35.5 20.5l-3.5-3.5 1.5-1.5 3.5 3.5-1.5 1.5z" fill="var(--color-gray1)"/>
      <path d="M4.5 20.5l3.5-3.5-1.5-1.5-3.5 3.5 1.5 1.5z" fill="var(--color-gray1)"/>
    </svg>
  );

  const iconFactory = createIconFactory({
    home: HomeIcon,
    profile: ProfileIcon,
    settings: SettingsIcon,
  });

  const menuItems = [
    {
      icon: 'home',
      text: 'Home',
      onClick: (index) => setSelectedIndex(index)
    },
    {
      icon: 'profile',
      text: 'Profile',
      onClick: (index) => setSelectedIndex(index)
    },
    {
      icon: 'settings',
      text: 'Settings',
      isNonSelectable: true, // Won't participate in selection
      onClick: (index) => console.log('Settings clicked')
    }
  ];

  return (
    <Menu
      items={menuItems}
      iconFactory={iconFactory}
      selectedIndex={selectedIndex}
      onItemClick={setSelectedIndex}
      position={['bottom', 'right']}
      glassy={true}
      expandable="hover"
    />
  );
};

// Example 4: Vertical Menu
export const VerticalMenu = () => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const iconFactory = createIconFactory({
    home: HomeIcon,
    profile: ProfileIcon,
    contact: ContactIcon,
  });

  const menuItems = [
    { icon: 'home', text: 'Home' },
    { icon: 'profile', text: 'Profile' },
    { icon: 'contact', text: 'Contact' }
  ];

  return (
    <Menu
      items={menuItems}
      iconFactory={iconFactory}
      selectedIndex={selectedIndex}
      onItemClick={setSelectedIndex}
      position={['center', 'left']}
      direction="vertical"
      glassy={true}
      expandable="expand"
    />
  );
};

// Example 5: Legacy Children-based Approach (for backward compatibility)
export const LegacyMenu = () => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  return (
    <Menu
      selectedIndex={selectedIndex}
      onItemClick={setSelectedIndex}
      position={['top', 'left']}
      glassy={true}
      expandable="expand"
    >
      <MenuItem icon={<HomeIcon />} text="Home" />
      <MenuItem icon={<ProfileIcon />} text="Profile" />
      <MenuItem icon={<ContactIcon />} text="Contact" />
    </Menu>
  );
};

// Example 6: Mixed Approach (items + children)
export const MixedMenu = () => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const iconFactory = createIconFactory({
    home: HomeIcon,
    profile: ProfileIcon,
  });

  const menuItems = [
    { icon: 'home', text: 'Home' },
    { icon: 'profile', text: 'Profile' }
  ];

  return (
    <Menu
      items={menuItems}
      iconFactory={iconFactory}
      selectedIndex={selectedIndex}
      onItemClick={setSelectedIndex}
      position={['top', 'center']}
      glassy={true}
      expandable="expand"
    >
      {/* Additional children can be added here if needed */}
    </Menu>
  );
};

// Example 7: Custom Styling
export const CustomStyledMenu = () => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const iconFactory = createIconFactory({
    home: HomeIcon,
    profile: ProfileIcon,
  });

  const menuItems = [
    { icon: 'home', text: 'Home' },
    { icon: 'profile', text: 'Profile' }
  ];

  return (
    <Menu
      items={menuItems}
      iconFactory={iconFactory}
      selectedIndex={selectedIndex}
      onItemClick={setSelectedIndex}
      position={['bottom', 'center']}
      glassy={true}
      expandable="expand"
      iconSize="48px"
      fontSize="14px"
      margin="20px"
      color="rgba(255, 255, 255, 0.1)"
    />
  );
};

// Main example component that showcases all variations
export const ModularMenuExamples = () => {
  return (
    <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <h2>Modular Menu Examples</h2>
      
      <div>
        <h3>Basic Modular Menu</h3>
        <BasicModularMenu />
      </div>

      <div>
        <h3>Compact Menu</h3>
        <CompactMenu />
      </div>

      <div>
        <h3>Hover Menu</h3>
        <HoverMenu />
      </div>

      <div>
        <h3>Vertical Menu</h3>
        <VerticalMenu />
      </div>

      <div>
        <h3>Legacy Menu</h3>
        <LegacyMenu />
      </div>

      <div>
        <h3>Custom Styled Menu</h3>
        <CustomStyledMenu />
      </div>
    </div>
  );
};

export default ModularMenuExamples; 
