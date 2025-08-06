import React, { useState } from 'react';
// @ts-ignore
import Menu from '../Menu/Menu';
import CustomThemeToggleButton from './CustomThemeToggleButton';
// @ts-ignore
import MenuItem from '../Menu/MenuItem';
// @ts-ignore
import HomeIcon from '../Menu/icons/HomeIcon';
// @ts-ignore
import ProfileIcon from '../Menu/icons/ProfileIcon';
// @ts-ignore
import ContactIcon from '../Menu/icons/ContactIcon';

const IntegratedMenu: React.FC = () => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const handleItemClick = (index: number) => {
    setSelectedIndex(index);
    console.log(`Menu item ${index} clicked`);
    // Add navigation logic here
  };

  return (
    <Menu
      selectedIndex={selectedIndex}
      onItemClick={handleItemClick}
      position={['top', 'center']}
      glassy={true}
      expandable="expand"
      sticky={true}
      color="rgba(255, 255, 255, 0.1)"
      margin={{ top: '20px' }}
    >
      <MenuItem icon={<HomeIcon />} text="Home" />
      <MenuItem icon={<ProfileIcon />} text="Profile" />
      <MenuItem icon={<ContactIcon />} text="Contact" />
      <CustomThemeToggleButton />
    </Menu>
  );
};

export default IntegratedMenu; 