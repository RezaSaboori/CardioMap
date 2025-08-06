import React from 'react';

export interface IconProps {
  className?: string;
}

declare const HomeIcon: React.FC<IconProps>;
declare const ProfileIcon: React.FC<IconProps>;
declare const ContactIcon: React.FC<IconProps>;

export { HomeIcon, ProfileIcon, ContactIcon }; 