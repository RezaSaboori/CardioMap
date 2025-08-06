import React, { useEffect, useRef, useState } from 'react';
import './Menu.css';
import ThemeToggleButton from '../ThemeToggleButton/ThemeToggleButton';
import MenuItem from './MenuItem';

// 🕐 Synchronized timing constants matching CSS variables
const MENU_TIMING = {
    MAIN: 600,        // --menu-timing-main: 0.6s
    QUICK: 300,       // --menu-timing-quick: 0.3s  
    SMOOTH: 450,      // --menu-timing-smooth: 0.45s
    FADE: 800,        // --menu-timing-fade: 0.8s
    INSTANT: 100,     // --menu-timing-instant: 0.1s
};

/**
 * Menu component with liquid glass dock design
 * @param {Object} props
 * @param {Array} props.position - [vertical, horizontal] e.g. ['top', 'right']
 * @param {boolean} props.sticky
 * @param {boolean} props.glassy
 * @param {string} props.color - overlay color (optional)
 * @param {'expand' | 'compact' | 'hover'} props.expandable
 * @param {string} props.direction - 'horizontal' | 'vertical'
 * @param {string|object} props.margin - CSS margin value or object (optional)
 * @param {React.ReactNode[]} props.children - menu items (legacy support)
 * @param {Array} props.items - Array of menu item configurations (new modular approach)
 * @param {number} props.selectedIndex - Currently selected item index (controlled)
 * @param {function} props.onItemClick - Callback when item is clicked (index) => void
 * @param {string} props.iconSize - CSS variable for icon size
 * @param {string} props.fontSize - CSS variable for font size
 * @param {Object} props.iconFactory - Factory function to create icons from string identifiers
 */
const Menu = ({
    position = ['top', 'right'],
    sticky = false,
    glassy = false,
    color = '',
    expandable = 'expand',
    direction = 'horizontal',
    margin = undefined,
    children,
    items = [],
    selectedIndex = 0,
    onItemClick = () => {},
    iconSize,
    fontSize,
    iconFactory = null,
}) => {
    const dockRef = useRef(null);
    const indicatorRef = useRef(null);
    const itemsRef = useRef([]);
    const [isHovered, setIsHovered] = useState(false);

    const isTargetExpanded = expandable === 'expand' || (expandable === 'hover' && isHovered);
    const [isExpanded, setIsExpanded] = useState(isTargetExpanded);
    const [visuallyExpanded, setVisuallyExpanded] = useState(isTargetExpanded); // Controls CSS class for smooth dock transitions
    const [indicatorVisible, setIndicatorVisible] = useState(true);

    // 🎭 DUAL-MODE INDICATOR BEHAVIOR:
    // - Normal selection changes: Smooth sliding animation between items  
    // - Expand/collapse transitions: Gentle fade out (800ms) → reposition → gentle fade in (800ms)
    // 
    // 🌙 TIMING COORDINATION:
    // - Layout transitions: 600ms (dock, items, ThemeToggleButton)
    // - Fade transitions: 800ms (ultra-soft and elegant)
    // - Wait for fade completion before repositioning to avoid interruption
    
    // Calculate indicator position and size
    const updateIndicatorPosition = (disableTransition = false, useStaggeredDelay = false, waitForLayout = false) => {
        if (!dockRef.current || !indicatorRef.current || !itemsRef.current[selectedIndex]) {
            return;
        }
        
        const updatePosition = () => {
            const dockRect = dockRef.current.getBoundingClientRect();
            const itemRect = itemsRef.current[selectedIndex].getBoundingClientRect();
            const indicator = indicatorRef.current;
            
            // Apply staggered delay to match ThemeToggleButton timing
            if (useStaggeredDelay) {
                const delay = `${selectedIndex * 25}ms`;
                indicator.style.transitionDelay = delay;
            } else {
                indicator.style.transitionDelay = '0ms';
            }
            
            // Temporarily disable ONLY positioning transitions if requested (preserve opacity fade)
            if (disableTransition) {
                indicator.style.transition = 'opacity var(--menu-timing-fade) var(--menu-easing-fade)';
            }
            
            if (direction === 'horizontal') {
                const left = itemRect.left - dockRect.left;
                const width = itemRect.width;
                indicator.style.left = `${left}px`;
                indicator.style.width = `${width}px`;
            } else {
                const top = itemRect.top - dockRect.top;
                const height = itemRect.height;
                indicator.style.top = `${top}px`;
                indicator.style.height = `${height}px`;
            }
            
            // Re-enable full transitions after positioning
            if (disableTransition) {
                // Force a reflow to ensure the position change takes effect without transition
                indicator.offsetHeight;
                // Restore full CSS transitions including gentle fade
                indicator.style.transition = '';
            }
        };
        
        if (waitForLayout) {
            // Wait multiple animation frames to ensure layout has stabilized
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    requestAnimationFrame(updatePosition);
                });
            });
        } else {
            // Use requestAnimationFrame to ensure we get the most up-to-date layout
            requestAnimationFrame(updatePosition);
        }
    };

    // Handle expand/collapse transitions
    useEffect(() => {
        if (isTargetExpanded === isExpanded && isTargetExpanded === visuallyExpanded) return;

        // 🎭 Use fading effect instead of sliding during expand/collapse transitions
        setIndicatorVisible(false); // Fade out indicator during layout changes

        if (isTargetExpanded) {
            // Expanding: change visual state first for smooth dock transition
            setVisuallyExpanded(true);
            setIsExpanded(true);
            
            // 🌙 Wait for fade out to complete (synchronized with CSS --menu-timing-fade)
            setTimeout(() => {
                // First reposition without affecting transitions
                updateIndicatorPosition(false, false, false); // keep transitions enabled for gentle fade-in
                // Then trigger gentle fade back in
                requestAnimationFrame(() => {
                    setIndicatorVisible(true); // Gentle fade back in
                });
            }, MENU_TIMING.FADE); // Synchronized timing
        } else {
            // Collapsing: start smooth animation first, then change states with proper delays
            
            // Delay logical state change to allow indicator fade to start gently
            setTimeout(() => {
                setIsExpanded(false);
            }, MENU_TIMING.INSTANT); // Quick transition start
            
            // Delay visual state change to allow smooth dock transition (synchronized with CSS --menu-timing-quick)
            setTimeout(() => {
                setVisuallyExpanded(false);
            }, MENU_TIMING.QUICK); // Harmonious with main CSS transition timing
            
            // 🌙 Wait for fade out to complete (synchronized with CSS --menu-timing-fade)
            setTimeout(() => {
                // First reposition without affecting transitions  
                updateIndicatorPosition(false, false, false); // keep transitions enabled for gentle fade-in
                // Then trigger gentle fade back in
                requestAnimationFrame(() => {
                    setIndicatorVisible(true); // Gentle fade back in
                });
            }, MENU_TIMING.FADE); // Synchronized timing
        }
    }, [isTargetExpanded]);

    // Update indicator position when selection changes (keeps sliding animation for normal selection)
    useEffect(() => {
        if (!indicatorVisible) {
            // If indicator is hidden during expand/collapse transition, don't try to position it yet
            return;
        }

        // 🎯 For normal selection changes (not expand/collapse), use smooth sliding animation
        const selectedItem = itemsRef.current[selectedIndex];
        if (selectedItem) {
            // Check if the item is currently transitioning due to expand/collapse
            const isTransitioning = getComputedStyle(selectedItem).transitionDuration !== '0s';
            
            if (isTransitioning) {
                // Wait for the expand/collapse transition to complete before sliding
                const handleTransitionEnd = (e) => {
                    if (e.target === selectedItem) {
                        selectedItem.removeEventListener('transitionend', handleTransitionEnd);
                        setTimeout(() => updateIndicatorPosition(false, true, false), 20); // smooth sliding for selection
                    }
                };
                selectedItem.addEventListener('transitionend', handleTransitionEnd);
                
                // 🎪 Fallback timeout - synchronized with CSS timing (fade is longest transition)
                setTimeout(() => {
                    selectedItem.removeEventListener('transitionend', handleTransitionEnd);
                    updateIndicatorPosition(false, true, false); // smooth sliding for selection
                }, MENU_TIMING.FADE); // Synchronized timing
            } else {
                // No transition, update immediately with smooth sliding for selection changes
                setTimeout(() => updateIndicatorPosition(false, true, false), 10); // smooth sliding animation
            }
        }
    }, [selectedIndex, isExpanded, children, indicatorVisible]);

    // Update indicator on window resize
    useEffect(() => {
        const handleResize = () => {
            if (indicatorVisible) {
                updateIndicatorPosition(false, false, false); // no transition delay for resize
            }
        };
        
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [indicatorVisible]);

    // Initial positioning
    useEffect(() => {
        if (indicatorVisible) {
            updateIndicatorPosition(false, false, false); // no transition delay for initial position
        }
    }, []);

    const handleMouseEnter = () => {
        if (expandable === 'hover') {
            setIsHovered(true);
        }
    };

    const handleMouseLeave = () => {
        if (expandable === 'hover') {
            setIsHovered(false);
        }
    };

    // Simple positioning logic
    const posStyle = {};

    if (sticky) {
        posStyle.position = 'fixed';
        posStyle.zIndex = 1100; // Higher than map tooltips (1000)
    } else {
        posStyle.position = 'absolute';
        posStyle.zIndex = 1100; // Higher than map tooltips (1000)
    }

    // Set position based on props
    if (position.includes('top')) {
        // Handle margin for top positioning
        if (margin && typeof margin === 'object' && margin.top) {
            posStyle.top = margin.top;
        } else {
            posStyle.top = 0;
        }
    }
    if (position.includes('bottom')) posStyle.bottom = 0;
    if (position.includes('right')) posStyle.right = 0;
    if (position.includes('left')) posStyle.left = 0;

    // Center overrides
    if (position.includes('center')) {
        if (position.includes('top') || position.includes('bottom')) {
            posStyle.left = '50%';
            posStyle.right = 'auto';
            posStyle.transform = 'translateX(-50%)';
        } else if (position.includes('left') || position.includes('right')) {
            posStyle.top = '50%';
            posStyle.bottom = 'auto';
            posStyle.transform = 'translateY(-50%)';
        }
    }

    // Glassy style
    const glassVars = glassy ? {
        '--menu-glass-color': color || 'var(--c-glass, #bbbbbc)',
    } : {};

    // Margin style
    const marginStyle = margin ? { margin } : {};

    // Create the style object for CSS variables
    const menuStyle = {
        ...posStyle,
        ...glassVars,
        ...marginStyle,
    };
    if (iconSize) menuStyle['--menu-icon-size'] = iconSize;
    if (fontSize) menuStyle['--menu-font-size'] = fontSize;

    // Helper function to create icon from string identifier
    const createIcon = (iconConfig) => {
        if (typeof iconConfig === 'string') {
            // If iconFactory is provided, use it to create icon from string
            if (iconFactory && typeof iconFactory === 'function') {
                return iconFactory(iconConfig);
            }
            // Fallback: treat as image path
            return <img src={iconConfig} alt="" width="24" height="24" />;
        }
        // If iconConfig is already a React element, return it
        return iconConfig;
    };

    // Process menu items - support both legacy children and new items prop
    const processMenuItems = () => {
        if (items && items.length > 0) {
            // Use new modular items configuration
            return items.map((item, index) => {
                const { icon, text, onClick, isNonSelectable = false } = item;
                
                return (
                    <div
                        key={index}
                        ref={(el) => (itemsRef.current[index] = el)}
                        className={`glass-item${selectedIndex === index ? ' selected' : ''}${isNonSelectable ? ' non-selectable' : ''}${!visuallyExpanded ? ' compact-mode' : ''}`}
                        onClick={(event) => {
                            if (onClick) {
                                onClick(index, event);
                            } else if (!isNonSelectable) {
                                onItemClick(index);
                            }
                        }}
                        style={{ transitionDelay: `${index * 25}ms` }}
                    >
                        <div className="glass-item-object">
                            <MenuItem 
                                icon={createIcon(icon)} 
                                text={text} 
                                isExpanded={isExpanded}
                            />
                        </div>
                    </div>
                );
            });
        } else if (children) {
            // Legacy support for children-based approach
            const childrenArray = React.Children.toArray(children);
            return childrenArray.map((child, index) => {
                const isNonSelectable = React.isValidElement(child) &&
                    (child.type === ThemeToggleButton || child.type?.displayName === 'CustomThemeToggleButton' || child.props?.onClick);
                
                // Clone components to pass isExpanded prop based on the rendered state
                let processedChild = child;
                if (React.isValidElement(child)) {
                    if (child.type === ThemeToggleButton) {
                        processedChild = React.cloneElement(child, { 
                            isExpanded: isExpanded,
                            transitionDelay: `${index * 25}ms`
                        });
                    } else if (child.type === MenuItem) {
                        processedChild = React.cloneElement(child, { isExpanded: isExpanded });
                    }
                }

                return (
                    <div
                        key={index}
                        ref={(el) => (itemsRef.current[index] = el)}
                        className={`glass-item${selectedIndex === index ? ' selected' : ''}${isNonSelectable ? ' non-selectable' : ''}${!visuallyExpanded ? ' compact-mode' : ''}`}
                        onClick={(event) => {
                            // Check if the clicked item is a ThemeToggleButton (or has a click handler)
                            if (React.isValidElement(child) &&
                                (child.type === ThemeToggleButton || child.type?.displayName === 'CustomThemeToggleButton' ||
                                    child.props?.onClick)) {
                                // Let the component handle its own click, don't update selection
                                if (event) event.stopPropagation();
                                return;
                            }
                            onItemClick(index);
                        }}
                        style={{ transitionDelay: `${index * 25}ms` }}
                    >
                        <div className="glass-item-object">
                            {React.isValidElement(processedChild) ? processedChild : processedChild}
                        </div>
                    </div>
                );
            });
        }
        return [];
    };

    const menuItems = processMenuItems();

    return (
        <div
            className={`menu-container ${glassy ? ' glassy' : ''} ${direction} ${!visuallyExpanded ? 'compact' : ''}`}
            style={menuStyle}
        >
            {/* SVG filter for glass effect */}
            {glassy && (
                <>
                    <svg style={{ display: 'none' }}>
                        <filter
                            id="glass-distortion"
                            x="0%"
                            y="0%"
                            width="100%"
                            height="100%"
                            filterUnits="objectBoundingBox"
                        >
                            <feTurbulence
                                type="fractalNoise"
                                baseFrequency="0.01 0.01"
                                numOctaves="1"
                                seed="5"
                                result="turbulence"
                            />
                            <feComponentTransfer in="turbulence" result="mapped">
                                <feFuncR type="gamma" amplitude="1" exponent="10" offset="0.5" />
                                <feFuncG type="gamma" amplitude="0" exponent="1" offset="0" />
                                <feFuncB type="gamma" amplitude="0" exponent="1" offset="0.5" />
                            </feComponentTransfer>
                            <feGaussianBlur in="turbulence" stdDeviation="3" result="softMap" />
                            <feSpecularLighting
                                in="softMap"
                                surfaceScale="5"
                                specularConstant="1"
                                specularExponent="100"
                                lightingColor="white"
                                result="specLight"
                            >
                                <fePointLight x="-200" y="-200" z="300" />
                            </feSpecularLighting>
                            <feComposite
                                in="specLight"
                                operator="arithmetic"
                                k1="0"
                                k2="1"
                                k3="1"
                                k4="0"
                                result="litImage"
                            />
                            <feDisplacementMap
                                in="SourceGraphic"
                                in2="softMap"
                                scale="40"
                                xChannelSelector="R"
                                yChannelSelector="G"
                            />
                        </filter>
                    </svg>
                </>
            )}

            <div
                className="liquid-dock"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
            >
                <fieldset
                    ref={dockRef}
                    className="glass-dock"
                    style={{ flexDirection: direction === 'vertical' ? 'column' : 'row' }}
                >
                    {menuItems}

                    {glassy && (
                        <div 
                            className={`toggle-indicator ${indicatorVisible ? 'visible' : 'hidden'}`}
                            ref={indicatorRef}
                        />
                    )}
                </fieldset>
            </div>
        </div>
    );
};

export default Menu;
