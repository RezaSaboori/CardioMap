declare module '*/Menu/Menu' {
  import React from 'react';

  export interface MenuItem {
    icon: string | React.ReactNode;
    text: string;
    onClick?: (index: number, event?: React.MouseEvent) => void;
    isNonSelectable?: boolean;
  }

  export interface MenuProps {
    position?: [string, string]; // [vertical, horizontal]
    sticky?: boolean;
    glassy?: boolean;
    color?: string;
    expandable?: 'expand' | 'compact' | 'hover';
    direction?: 'horizontal' | 'vertical';
    margin?: string | object;
    children?: React.ReactNode[];
    items?: MenuItem[];
    selectedIndex?: number;
    onItemClick?: (index: number) => void;
    iconSize?: string;
    fontSize?: string;
    iconFactory?: (iconName: string) => React.ReactNode | null;
  }

  const Menu: React.FC<MenuProps>;
  export default Menu;
}

declare module '*/Menu/MenuItem' {
  import React from 'react';

  export interface MenuItemProps {
    icon: React.ReactNode;
    text: string;
    isExpanded?: boolean;
  }

  const MenuItem: React.FC<MenuItemProps>;
  export default MenuItem;
}

declare module '*/Menu/icons/HomeIcon' {
  import React from 'react';

  export interface IconProps {
    className?: string;
  }

  const HomeIcon: React.FC<IconProps>;
  export default HomeIcon;
}

declare module '*/Menu/icons/ProfileIcon' {
  import React from 'react';

  export interface IconProps {
    className?: string;
  }

  const ProfileIcon: React.FC<IconProps>;
  export default ProfileIcon;
}

declare module '*/Menu/icons/ContactIcon' {
  import React from 'react';

  export interface IconProps {
    className?: string;
  }

  const ContactIcon: React.FC<IconProps>;
  export default ContactIcon;
}

declare module '*/ThemeToggleButton/ThemeToggleButton' {
  import React from 'react';

  export interface ThemeToggleButtonProps {
    isExpanded?: boolean;
    transitionDelay?: string;
  }

  const ThemeToggleButton: React.FC<ThemeToggleButtonProps>;
  export default ThemeToggleButton;
} 