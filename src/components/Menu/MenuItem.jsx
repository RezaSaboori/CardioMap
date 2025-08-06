import React from 'react';

const MenuItem = ({ icon, text, isExpanded = true }) => {
  return (
    <div className={`menu-item ${isExpanded ? 'expanded' : 'compact'}`}>
      {icon && (
        <div className="menu-item-icon">
          {typeof icon === 'string' ? (
            <img src={icon} alt={text} width="24" height="24" />
          ) : (
            icon
          )}
        </div>
      )}
      {isExpanded && text && (
        <span className="menu-item-text">{text}</span>
      )}
    </div>
  );
};

export default MenuItem; 
