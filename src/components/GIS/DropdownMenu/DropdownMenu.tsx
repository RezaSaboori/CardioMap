import React, { useState, useEffect, useRef, useCallback, useLayoutEffect, ReactNode } from 'react';
import { createPortal } from 'react-dom';
import './DropdownMenu.css';

export interface SubmenuItem {
  label: string;
  value?: string;
  children?: SubmenuItem[];
}

export interface DropdownMenuProps {
  children?: ReactNode;
  items?: SubmenuItem[];
  value: string;
  onSelect: (value: string) => void;
  fontSize?: string;
  headerHeight?: number;
  maxHeight?: number;
  minWidth?: number;
  maxWidth?: number;
  initialBorderRadius?: number;
  finalBorderRadius?: number;
  direction?: 'rtl' | 'ltr';
  textColor?: string;
  background?: string;
  gradientColors?: Array<[string, number, string?]>;
  shadow?: string;
  hoverBackground?: [string, number];
  activeBackground?: [string, number];
  fixedWidth?: boolean;
  fixedHeight?: boolean;
}

interface SubmenuPosition {
  x: number;
  y: number;
  width: number;
  height: number;
}

const DropdownMenu: React.FC<DropdownMenuProps> = ({
  children,
  items,
  value,
  onSelect,
  fontSize = '14px',
  headerHeight = 48,
  maxHeight = 288,
  minWidth = 120,
  maxWidth = 320,
  initialBorderRadius,
  finalBorderRadius = 16,
  direction = 'rtl',
  textColor = '#ffffff',
  background = 'rgba(255, 255, 255, 0.2)',
  gradientColors,
  shadow = '0 8px 32px 0 rgba(0, 0, 0, 0.2)',
  hoverBackground = ['rgba(255,255,255,1)', 0.1],
  activeBackground = ['rgba(255,255,255,1)', 0.2],
  fixedWidth = false,
  fixedHeight = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isOnTop, setIsOnTop] = useState(false);
  const [currentWidth, setCurrentWidth] = useState(minWidth);
  const [currentHeight, setCurrentHeight] = useState(headerHeight + 2);
  const [shouldUseEllipsis, setShouldUseEllipsis] = useState(false);
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);
  const [submenuPositions, setSubmenuPositions] = useState<Map<string, SubmenuPosition>>(new Map());
  const [submenuHoverState, setSubmenuHoverState] = useState<Map<string, boolean>>(new Map());
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [activeItemIds, setActiveItemIds] = useState<Set<string>>(new Set());
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownDivRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const submenuRefs = useRef<Map<string, HTMLUListElement>>(new Map());
  const submenuTimers = useRef<Map<string, NodeJS.Timeout>>(new Map());

  const isRtl = direction === 'rtl';

  // Helper function to get the display label for the current value
  const getDisplayLabel = useCallback((): string => {
    if (!items) return value;
    
    const findItemByValue = (items: SubmenuItem[]): SubmenuItem | null => {
      for (const item of items) {
        if (item.value === value) {
          return item;
        }
        if (item.children) {
          const found = findItemByValue(item.children);
          if (found) return found;
        }
      }
      return null;
    };
    
    const foundItem = findItemByValue(items);
    return foundItem ? foundItem.label : value;
  }, [items, value]);

  // Helper function to generate item ID consistently
  const generateItemId = useCallback((item: SubmenuItem, index: number, parentId: string = ''): string => {
    const itemKey = item.value || item.label;
    return `${parentId}-${itemKey}-${index}`;
  }, []);

  // Helper function to find initial active items (only for items prop changes)
  const findActiveItems = useCallback((items: SubmenuItem[], parentId: string = ''): Set<string> => {
    console.log('🔍 findActiveItems called with:', { items, parentId, currentValue: value });
    const activeIds = new Set<string>();
    
    items.forEach((item, index) => {
      const itemId = generateItemId(item, index, parentId);
      
      console.log(`🔍 findActiveItems - checking item:`, {
        label: item.label,
        value: item.value,
        itemId,
        parentId,
        currentValue: value,
        matches: item.value === value
      });
      
      // Only add items that are selected by default (when items prop changes)
      if (item.value === value) {
        console.log('🔍 findActiveItems - adding to activeIds:', itemId);
        activeIds.add(itemId);
      }
      
      // Recursively check children
      if (item.children && item.children.length > 0) {
        const childActiveIds = findActiveItems(item.children, itemId);
        childActiveIds.forEach(id => activeIds.add(id));
      }
    });
    
    console.log('🔍 findActiveItems - returning activeIds:', Array.from(activeIds));
    return activeIds;
  }, [value, generateItemId]);

  // Update active items only when items prop changes (not on every value/activeSubmenu change)
  useEffect(() => {
    console.log('🔍 useEffect - items changed, updating activeItemIds');
    console.log('🔍 useEffect - current value:', value);
    console.log('🔍 useEffect - current items:', items);
    
    if (items) {
      const newActiveItems = findActiveItems(items);
      console.log('🔍 useEffect - newActiveItems:', Array.from(newActiveItems));
      setActiveItemIds(newActiveItems);
    }
  }, [items, findActiveItems]);

  // Update active items when value prop changes
  useEffect(() => {
    console.log('🔍 useEffect - value changed, updating activeItemIds');
    console.log('🔍 useEffect - new value:', value);
    console.log('🔍 useEffect - current items:', items);
    
    if (items) {
      const newActiveItems = findActiveItems(items);
      console.log('🔍 useEffect - newActiveItems after value change:', Array.from(newActiveItems));
      setActiveItemIds(newActiveItems);
    }
  }, [value, items, findActiveItems]);

  const getHeaderContentWidth = useCallback(() => {
    const tempSpan = document.createElement('span');
    tempSpan.style.visibility = 'hidden';
    tempSpan.style.position = 'absolute';
    tempSpan.style.fontSize = fontSize;
    tempSpan.style.fontWeight = '500';
    tempSpan.style.whiteSpace = 'nowrap';
    tempSpan.textContent = getDisplayLabel();
    document.body.appendChild(tempSpan);
    const textWidth = tempSpan.offsetWidth;
    document.body.removeChild(tempSpan);
    return textWidth;
  }, [fontSize, getDisplayLabel]);

  const calculateSubmenuPosition = useCallback((triggerElement: HTMLElement, submenuId: string): SubmenuPosition => {
    const rect = triggerElement.getBoundingClientRect();
    const gap = 16; // Gap between trigger and submenu
    
            // Calculate dynamic submenu width using the same logic as main dropdown
        let submenuWidth = 160; // Default minimum width
        let submenuHeight = maxHeight; // Default height, will be adjusted based on content
    
    // Try to find the submenu content to calculate width and height
    const submenuItems = findSubmenuItems(submenuId);
    if (submenuItems && submenuItems.length > 0) {
      // Use the same width calculation logic as main dropdown
      let widestChildWidth = 0;
      
      // Create a temporary container to measure actual text widths
      const tempContainer = document.createElement('div');
      tempContainer.style.visibility = 'hidden';
      tempContainer.style.position = 'absolute';
      tempContainer.style.fontSize = fontSize;
      tempContainer.style.fontFamily = 'inherit';
      tempContainer.style.fontWeight = '500'; // Same as main dropdown
      tempContainer.style.whiteSpace = 'nowrap';
      tempContainer.style.padding = '6px 12px'; // Same padding as submenu items
      document.body.appendChild(tempContainer);
      
      // Measure each submenu item's actual width
      submenuItems.forEach(item => {
        tempContainer.textContent = item.label;
        const itemWidth = tempContainer.scrollWidth;
        if (itemWidth > widestChildWidth) {
          widestChildWidth = itemWidth;
        }
      });
      
      // Clean up temporary container
      document.body.removeChild(tempContainer);
      
      // Apply the same padding logic as main dropdown (60px)
      const requiredWidth = widestChildWidth + 60;
      
      // Apply the same constraints as main dropdown using component props
      const validMinWidth = Math.max(160, minWidth); // Use component minWidth or fallback to 160
      const validMaxWidth = Math.min(400, maxWidth); // Use component maxWidth or fallback to 400
      
      submenuWidth = Math.max(validMinWidth, Math.min(requiredWidth, validMaxWidth));
      
                // Calculate height based on actual content (same logic as main dropdown)
        // Create a temporary container to measure actual content height
        const tempHeightContainer = document.createElement('ul');
        tempHeightContainer.style.visibility = 'hidden';
        tempHeightContainer.style.position = 'absolute';
        tempHeightContainer.style.top = '-9999px';
        tempHeightContainer.style.left = '-9999px';
        tempHeightContainer.style.width = `${submenuWidth}px`;
        tempHeightContainer.style.fontSize = fontSize;
        tempHeightContainer.style.fontFamily = 'inherit';
        tempHeightContainer.style.padding = '6px 6px';
        tempHeightContainer.style.margin = '0';
        tempHeightContainer.style.listStyle = 'none';
        tempHeightContainer.style.borderRadius = '16px';
        tempHeightContainer.style.boxSizing = 'border-box';
        
        // Add all submenu items to measure their actual height
        submenuItems.forEach(item => {
          const li = document.createElement('li');
          li.style.padding = '6px 12px';
          li.style.margin = '0';
          li.style.borderRadius = '16px';
          li.style.boxSizing = 'border-box';
          li.style.whiteSpace = 'nowrap';
          li.style.overflow = 'hidden';
          li.style.textOverflow = 'ellipsis';
          li.textContent = item.label;
          tempHeightContainer.appendChild(li);
        });
        
        document.body.appendChild(tempHeightContainer);
        
        // Get the actual scroll height (same as main dropdown logic)
        const actualContentHeight = tempHeightContainer.scrollHeight;
        
        // Clean up temporary container
        document.body.removeChild(tempHeightContainer);
        
        // Use the same height calculation logic as main dropdown
        const totalHeight = actualContentHeight + 2; // Add 2px like main dropdown
        submenuHeight = Math.min(totalHeight, maxHeight);
    }
    
    let x: number;
    let y: number;
    
    if (isRtl) {
      // For RTL, position submenu to the left of the trigger
      x = rect.left - gap - submenuWidth;
      // Ensure submenu doesn't go off the left edge of the screen
      if (x < 0) {
        x = rect.right + gap;
      }
    } else {
      // For LTR, position submenu to the right of the trigger
      x = rect.right + gap;
      // Ensure submenu doesn't go off the right edge of the screen
      if (x + submenuWidth > window.innerWidth) {
        x = rect.left - gap - submenuWidth;
        // If still off-screen, position it to the left edge
        if (x < 0) {
          x = 0;
        }
      }
    }
    
    // Ensure submenu doesn't go off the left edge
    if (x < 0) {
      x = 0;
    }
    
    y = rect.top;
    // Ensure submenu doesn't go off the bottom edge of the screen
    if (y + submenuHeight > window.innerHeight) {
      y = Math.max(0, window.innerHeight - submenuHeight);
    }
    // Ensure submenu doesn't go off the top edge of the screen
    if (y < 0) {
      y = 0;
    }
    
    return { x, y, width: submenuWidth, height: submenuHeight };
  }, [isRtl, fontSize, minWidth, maxWidth, maxHeight]);

  // Helper function to find submenu items for width calculation
  const findSubmenuItems = useCallback((submenuId: string): SubmenuItem[] | null => {
    if (!items) return null;
    
    // Parse the submenu ID to find the path
    const pathParts = submenuId.split('-').filter(part => part.length > 0);
    if (pathParts.length === 0) return null;
    
    let currentItems = items;
    let currentIndex = 0;
    
    // Navigate through the nested structure
    for (let i = 0; i < pathParts.length - 1; i += 2) {
      const itemIndex = parseInt(pathParts[i + 1]);
      if (isNaN(itemIndex) || itemIndex < 0 || itemIndex >= currentItems.length) {
        return null;
      }
      
      const currentItem = currentItems[itemIndex];
      if (!currentItem.children) {
        return null;
      }
      
      currentItems = currentItem.children;
      currentIndex = itemIndex;
    }
    
    return currentItems;
  }, [items, maxHeight]);

  const handleSubmenuEnter = useCallback((submenuId: string, triggerElement: HTMLElement) => {
    // Clear any existing timer for this submenu
    if (submenuTimers.current.has(submenuId)) {
      clearTimeout(submenuTimers.current.get(submenuId)!);
      submenuTimers.current.delete(submenuId);
    }
    
    const position = calculateSubmenuPosition(triggerElement, submenuId);
    setSubmenuPositions(prev => new Map(prev).set(submenuId, position));
    setActiveSubmenu(submenuId);
    setSubmenuHoverState(prev => new Map(prev).set(submenuId, true));
    
    // Immediately add to active items
    setActiveItemIds(prev => {
      const newActiveItems = new Set(prev);
      newActiveItems.add(submenuId);
      return newActiveItems;
    });
  }, [calculateSubmenuPosition]);

  const handleSubmenuLeave = useCallback((submenuId: string) => {
    setSubmenuHoverState(prev => new Map(prev).set(submenuId, false));
    
    // Set a longer delay to prevent submenu from closing instantly
    const timer = setTimeout(() => {
      setActiveSubmenu(prev => {
        // Only close if we're still on the same submenu and no hover state is active
        if (prev === submenuId && !submenuHoverState.get(submenuId)) {
          // Remove from active items when submenu closes
          setActiveItemIds(prev => {
            const newActiveItems = new Set(prev);
            newActiveItems.delete(submenuId);
            return newActiveItems;
          });
          return null;
        }
        return prev;
      });
    }, 300); // Increased delay to 300ms for better user experience
    
    submenuTimers.current.set(submenuId, timer);
  }, [submenuHoverState]);

  const handleSubmenuMouseEnter = useCallback((submenuId: string) => {
    // Clear any existing timer for this submenu
    if (submenuTimers.current.has(submenuId)) {
      clearTimeout(submenuTimers.current.get(submenuId)!);
      submenuTimers.current.delete(submenuId);
    }
    
    setSubmenuHoverState(prev => new Map(prev).set(submenuId, true));
    setActiveSubmenu(submenuId);
    
    // Ensure submenu stays in active items
    setActiveItemIds(prev => {
      const newActiveItems = new Set(prev);
      newActiveItems.add(submenuId);
      return newActiveItems;
    });
  }, []);

  const handleSubmenuMouseLeave = useCallback((submenuId: string) => {
    setSubmenuHoverState(prev => new Map(prev).set(submenuId, false));
    
    // Set a longer delay when leaving the submenu itself
    const timer = setTimeout(() => {
      setActiveSubmenu(prev => {
        if (prev === submenuId && !submenuHoverState.get(submenuId)) {
          // Remove from active items when submenu closes
          setActiveItemIds(prev => {
            const newActiveItems = new Set(prev);
            newActiveItems.delete(submenuId);
            return newActiveItems;
          });
          return null;
        }
        return prev;
      });
    }, 200);
    
    submenuTimers.current.set(submenuId, timer);
  }, [submenuHoverState]);

  const toggleDropdown = () => {
    if (isExpanded) {
      setIsExpanded(false);
      setActiveSubmenu(null); // Close all submenus when closing dropdown
    } else {
      if (containerRef.current && !fixedWidth) {
        const initialWidth = containerRef.current.offsetWidth;
        let widestChildWidth = 0;
        if (listRef.current) {
          const children = listRef.current.children;
          for (let i = 0; i < children.length; i++) {
            const child = children[i] as HTMLElement;
            child.style.whiteSpace = 'nowrap';
            const childWidth = child.scrollWidth;
            child.style.whiteSpace = 'normal';
            if (childWidth > widestChildWidth) {
              widestChildWidth = childWidth;
            }
          }
        }
        
        const headerContentWidth = getHeaderContentWidth();
        const requiredWidth = Math.max(initialWidth, widestChildWidth, headerContentWidth) + 60;
        
        if (requiredWidth > maxWidth) {
          setCurrentWidth(maxWidth);
          setShouldUseEllipsis(true);
        } else {
          setCurrentWidth(requiredWidth);
          setShouldUseEllipsis(false);
        }
      } else if (fixedWidth) {
        const headerContentWidth = getHeaderContentWidth();
        const currentContainerWidth = containerRef.current ? containerRef.current.offsetWidth : maxWidth;
        setShouldUseEllipsis(headerContentWidth + 60 > currentContainerWidth);
      }
      setIsExpanded(true);
    }
  };

  useEffect(() => {
    if (isExpanded && listRef.current && !fixedHeight) {
      const listElement = listRef.current;

      const observer = new ResizeObserver(() => {
        const contentHeight = listElement.scrollHeight;
        const totalHeight = contentHeight + headerHeight + 2;
        const newHeight = Math.min(totalHeight, maxHeight + 2);
        setCurrentHeight(newHeight);
      });

      observer.observe(listElement);

      return () => {
        observer.unobserve(listElement);
      };
    } else if (!isExpanded) {
      setCurrentHeight(headerHeight + 2);
    }
  }, [isExpanded, fixedHeight, headerHeight, maxHeight]);

  useLayoutEffect(() => {
    if (!fixedWidth && !isExpanded) {
      const headerContentWidth = getHeaderContentWidth();
      const requiredWidth = headerContentWidth + 60 + 8;
      
      const validMinWidth = typeof minWidth === 'number' ? minWidth : 120;
      const validMaxWidth = typeof maxWidth === 'number' ? maxWidth : 320;

      const newWidth = Math.max(validMinWidth, Math.min(requiredWidth, validMaxWidth));
      setCurrentWidth(newWidth);
    }
  }, [value, fixedWidth, isExpanded, minWidth, maxWidth, getHeaderContentWidth]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        // Check if click is inside any active submenu
        let isInsideSubmenu = false;
        submenuRefs.current.forEach((submenuRef) => {
          if (submenuRef && submenuRef.contains(event.target as Node)) {
            isInsideSubmenu = true;
          }
        });
        
        if (!isInsideSubmenu) {
          setIsExpanded(false);
          setActiveSubmenu(null);
          // Clear active items when dropdown closes
          setActiveItemIds(new Set());
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Cleanup effect for submenus
  useEffect(() => {
    return () => {
      // Clean up any active submenus when component unmounts
      setActiveSubmenu(null);
      setSubmenuPositions(new Map());
      setSubmenuHoverState(new Map());
      // Clear all timers
      submenuTimers.current.forEach(clearTimeout);
      submenuTimers.current.clear();
      // Clear active items
      setActiveItemIds(new Set());
    };
  }, []);

  // Track selected item when value prop changes
  useEffect(() => {
    console.log('🔍 DropdownMenu useEffect - value prop changed:', value);
    console.log('🔍 DropdownMenu useEffect - items:', items);
    
    if (items) {
      // Find the item that matches the current value
      const findSelectedItem = (items: SubmenuItem[], parentId: string = ''): string | null => {
        for (let i = 0; i < items.length; i++) {
          const item = items[i];
          // Use consistent ID generation
          const itemId = generateItemId(item, i, parentId);
          
          console.log(`🔍 findSelectedItem - checking item:`, {
            label: item.label,
            value: item.value,
            itemId,
            parentId,
            currentValue: value,
            matches: item.value === value
          });
          
          if (item.value === value) {
            console.log('🔍 findSelectedItem - found match! itemId:', itemId);
            return itemId;
          }
          
          if (item.children) {
            const found = findSelectedItem(item.children, itemId);
            if (found) return found;
          }
        }
        return null;
      };
      
      const foundId = findSelectedItem(items);
      console.log('🔍 DropdownMenu useEffect - foundId:', foundId);
      setSelectedItemId(foundId);
    }
  }, [value, items, generateItemId]);

  // Close submenus when dropdown closes
  useEffect(() => {
    if (!isExpanded) {
      setActiveSubmenu(null);
      setSubmenuHoverState(new Map());
      // Clear all timers when dropdown closes
      submenuTimers.current.forEach(clearTimeout);
      submenuTimers.current.clear();
    }
  }, [isExpanded]);

  // Handle window resize to recalculate submenu positions
  useEffect(() => {
    if (!isExpanded || !activeSubmenu) return;

    const handleResize = () => {
      // Close submenus on resize to avoid positioning issues
      setActiveSubmenu(null);
      setSubmenuPositions(new Map());
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [isExpanded, activeSubmenu]);

  useEffect(() => {
    const dropdownNode = dropdownDivRef.current;
    if (!dropdownNode) return;

    const handleTransitionEnd = (event: TransitionEvent) => {
      if (event.propertyName === 'height' && !isExpanded) {
        setIsOnTop(false);
        setCurrentHeight(headerHeight);
      }
    };

    dropdownNode.addEventListener('transitionend', handleTransitionEnd);
    return () => {
      dropdownNode.removeEventListener('transitionend', handleTransitionEnd);
    };
  }, [isExpanded, headerHeight]);

  useEffect(() => {
    if (containerRef.current) {
      const headerContentWidth = getHeaderContentWidth();
      const currentContainerWidth = containerRef.current.offsetWidth || maxWidth;
      setShouldUseEllipsis(headerContentWidth + 60 > currentContainerWidth);
    }
  }, [value, maxWidth, fontSize, getHeaderContentWidth]);

  const handleListClick = (e: React.MouseEvent<HTMLUListElement>) => {
    const listItem = (e.target as HTMLElement).closest('li');
    if (!listItem) return;
    
    console.log('🔍 handleListClick - clicked listItem:', listItem);
    
    // Check if it's a submenu item with children
    if (listItem.classList.contains('has-submenu')) {
      console.log('🔍 handleListClick - has-submenu item clicked');
      // Find the submenu ID for this trigger item
      const itemIndex = Array.from(listItem.parentNode?.children || []).indexOf(listItem);
      const itemKey = listItem.textContent?.trim() || '';
      const submenuId = `-${itemKey}-${itemIndex}`;
      
      console.log('🔍 handleListClick - submenuId:', submenuId);
      
      // Toggle the submenu
      handleSubmenuTriggerClick(submenuId);
      return;
    }
    
    const valueAttr = listItem.getAttribute('data-value');
    const isLeaf = !!valueAttr;
    if (!isLeaf) {
      console.log('🔍 handleListClick - not a leaf item, returning');
      return;
    }
    
    console.log('🔍 handleListClick - leaf item clicked, valueAttr:', valueAttr);
    
    if (onSelect) {
      const value = valueAttr || listItem.textContent || '';
      console.log('🔍 handleListClick - calling onSelect with value:', value);
      onSelect(value);
      
      // Find the correct item ID using the same logic as the useEffect
      if (items) {
        const findClickedItemId = (items: SubmenuItem[], parentId: string = ''): string | null => {
          for (let i = 0; i < items.length; i++) {
            const item = items[i];
            const itemId = generateItemId(item, i, parentId);
            
            console.log(`🔍 findClickedItemId - checking item:`, {
              label: item.label,
              value: item.value,
              itemId,
              parentId,
              clickedValue: value,
              matches: item.value === value
            });
            
            if (item.value === value) {
              console.log('🔍 findClickedItemId - found match! itemId:', itemId);
              return itemId;
            }
            
            if (item.children) {
              const found = findClickedItemId(item.children, itemId);
              if (found) return found;
            }
          }
          return null;
        };
        
        const clickedItemId = findClickedItemId(items);
        console.log('🔍 handleListClick - clickedItemId:', clickedItemId);
        
        if (clickedItemId) {
          setSelectedItemId(clickedItemId);
          
          // Immediately update active items to show the new selection
          const newActiveItems = new Set<string>();
          newActiveItems.add(clickedItemId);
          console.log('🔍 handleListClick - setting newActiveItems:', Array.from(newActiveItems));
          setActiveItemIds(newActiveItems);
        }
      }
    }
    setIsExpanded(false);
    setActiveSubmenu(null);
  };

  // Handle clicks on submenu items
  const handleSubmenuClick = useCallback((e: React.MouseEvent<HTMLUListElement>) => {
    const listItem = (e.target as HTMLElement).closest('li');
    if (!listItem) return;
    
    console.log('🔍 handleSubmenuClick - clicked listItem:', listItem);
    
    // Check if it's a submenu item with children
    if (listItem.classList.contains('has-submenu')) {
      console.log('🔍 handleSubmenuClick - has-submenu item clicked, returning');
      return; // Don't close for submenu triggers
    }
    
    const valueAttr = listItem.getAttribute('data-value');
    console.log('🔍 handleSubmenuClick - valueAttr:', valueAttr);
    
    if (valueAttr && onSelect) {
      console.log('🔍 handleSubmenuClick - calling onSelect with value:', valueAttr);
      onSelect(valueAttr);
      
      // Find the correct item ID using the same logic as the useEffect
      if (items) {
        const findClickedSubmenuItemId = (items: SubmenuItem[], parentId: string = ''): string | null => {
          for (let i = 0; i < items.length; i++) {
            const item = items[i];
            const itemId = generateItemId(item, i, parentId);
            
            console.log(`🔍 findClickedSubmenuItemId - checking item:`, {
              label: item.label,
              value: item.value,
              itemId,
              parentId,
              clickedValue: valueAttr,
              matches: item.value === valueAttr
            });
            
            if (item.value === valueAttr) {
              console.log('🔍 findClickedSubmenuItemId - found match! itemId:', itemId);
              return itemId;
            }
            
            if (item.children) {
              const found = findClickedSubmenuItemId(item.children, itemId);
              if (found) return found;
            }
          }
          return null;
        };
        
        const clickedItemId = findClickedSubmenuItemId(items);
        console.log('🔍 handleSubmenuClick - clickedItemId:', clickedItemId);
        
        if (clickedItemId) {
          setSelectedItemId(clickedItemId);
          
          // Immediately update active items to show the new selection
          const newActiveItems = new Set<string>();
          newActiveItems.add(clickedItemId);
          console.log('🔍 handleSubmenuClick - setting newActiveItems:', Array.from(newActiveItems));
          setActiveItemIds(newActiveItems);
        }
      }
      
      setIsExpanded(false);
      setActiveSubmenu(null);
    }
  }, [onSelect, items, generateItemId]);

  // Handle clicks on submenu trigger items (toggle behavior)
  const handleSubmenuTriggerClick = useCallback((submenuId: string) => {
    if (activeSubmenu === submenuId) {
      // If submenu is already open, close it
      setActiveSubmenu(null);
      setSubmenuHoverState(prev => new Map(prev).set(submenuId, false));
      // Clear any existing timer for this submenu
      if (submenuTimers.current.has(submenuId)) {
        clearTimeout(submenuTimers.current.get(submenuId)!);
        submenuTimers.current.delete(submenuId);
      }
      
                            // Remove from active items when closing submenu
                      setActiveItemIds(prev => {
                        const newActiveItems = new Set(prev);
                        newActiveItems.delete(submenuId);
                        return newActiveItems;
                      });
    } else {
      // If submenu is closed, open it
      setActiveSubmenu(submenuId);
      setSubmenuHoverState(prev => new Map(prev).set(submenuId, true));
      
                            // Add to active items when opening submenu
                      setActiveItemIds(prev => {
                        const newActiveItems = new Set(prev);
                        newActiveItems.add(submenuId);
                        return newActiveItems;
                      });
    }
  }, [activeSubmenu]);

  const generateGradient = (colors: Array<[string, number, string?]>) => {
    if (!colors || !Array.isArray(colors) || colors.length === 0) {
      return null;
    }
    
    const colorStops = colors.map(stop => {
      const [color, alpha, position] = stop;
      const alphaPercentage = alpha * 100;
      const positionStr = position ? ` ${position}` : '';
      return `color-mix(in srgb, ${color} ${alphaPercentage}%, transparent)${positionStr}`;
    }).join(', ');
    
    return `linear-gradient(to bottom, ${colorStops})`;
  };

  const generateMixedColor = (colorArray: [string, number]) => {
    if (!colorArray || !Array.isArray(colorArray) || colorArray.length !== 2) {
      return null;
    }
    const [color, alpha] = colorArray;
    const alphaPercentage = alpha * 100;
    return `color-mix(in srgb, ${color} ${alphaPercentage}%, transparent)`;
  };

  const renderSubmenuItems = (items: SubmenuItem[], parentId: string = ''): ReactNode => {
    return items.map((item, idx) => {
      const key = `${item.label}-${idx}`;
      const submenuId = generateItemId(item, idx, parentId);
      
      if (item.children && item.children.length > 0) {
        const isActive = activeItemIds.has(submenuId);
        const isSelected = selectedItemId === submenuId;
        const isSubmenuOpen = activeSubmenu === submenuId;
        
        console.log(`🔍 renderSubmenuItems (parent) - item: ${item.label}`, {
          submenuId,
          isActive,
          isSelected,
          isSubmenuOpen,
          activeItemIds: Array.from(activeItemIds),
          selectedItemId
        });
        
        const className = `has-submenu ${isActive ? 'active' : ''} ${isSelected ? 'selected' : ''} ${isSubmenuOpen ? 'submenu-open' : ''}`;
        
        return (
          <li 
            key={key} 
            className={className}
            tabIndex={-1}
            onMouseEnter={(e) => handleSubmenuEnter(submenuId, e.currentTarget)}
            onMouseLeave={() => handleSubmenuLeave(submenuId)}
            onClick={() => handleSubmenuTriggerClick(submenuId)}
          >
            <span className="item-label">{item.label}</span>
            <div className="submenu-arrow" aria-hidden>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                <g transform="translate(0 -32)">
                  <path d="M233.4 406.6c12.5 12.5 32.8 12.5 45.3 0l192-192c12.5 12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L256 338.7 86.6 169.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l192 192z"/>
                </g>
              </svg>
            </div>
            {/* Render submenu in portal */}
            {activeSubmenu === submenuId && createPortal(
              <ul 
                ref={(el) => {
                  if (el) submenuRefs.current.set(submenuId, el);
                }}
                className="dropdown-submenu-portal"
                dir={direction}
                style={{
                  position: 'fixed',
                  left: `${submenuPositions.get(submenuId)?.x || 0}px`,
                  top: `${submenuPositions.get(submenuId)?.y || 0}px`,
                  width: `${submenuPositions.get(submenuId)?.width || 160}px`,
                                          height: `${submenuPositions.get(submenuId)?.height || maxHeight}px`,
                  background: gradientColors ? generateGradient(gradientColors) || background : background,
                  boxShadow: shadow,
                  color: textColor,
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: `${finalBorderRadius}px`,
                  backdropFilter: 'blur(15px) brightness(1.2) saturate(1.5)',
                  WebkitBackdropFilter: 'blur(15px) brightness(1.2) saturate(1.5)',
                  fontSize: fontSize,
                  fontFamily: 'inherit',
                  zIndex: 10000,
                  listStyle: 'none',
                  margin: 0,
                  padding: '6px 6px',
                  overflowY: 'auto',
                  overflowX: 'hidden',
                  '--arrow-color': textColor,
                  '--hover-bg-color': effectiveHoverColor,
                  '--active-bg-color': effectiveActiveColor,
                } as React.CSSProperties & { 
                  '--arrow-color': string; 
                  '--hover-bg-color': string;
                  '--active-bg-color': string;
                }}
                onMouseEnter={() => handleSubmenuMouseEnter(submenuId)}
                onMouseLeave={() => handleSubmenuMouseLeave(submenuId)}
                onClick={handleSubmenuClick}
              >
                {renderSubmenuItems(item.children, submenuId)}
              </ul>,
              document.body
            )}
          </li>
        );
      }
      
      const isSelected = selectedItemId === submenuId;
      const isActive = activeItemIds.has(submenuId);
      
      console.log(`🔍 renderSubmenuItems (leaf) - item: ${item.label}`, {
        submenuId,
        isSelected,
        isActive,
        selectedItemId,
        activeItemIds: Array.from(activeItemIds)
      });
      
      const className = `${isSelected ? 'selected' : ''} ${isActive ? 'active' : ''}`;
      
      return (
        <li key={key} data-value={item.value || item.label} className={className}>
          <span className="item-label">{item.label}</span>
        </li>
      );
    });
  };
  
  const initialRad = initialBorderRadius !== undefined ? initialBorderRadius : headerHeight / 2;
  const listMaxHeight = maxHeight - headerHeight;
  
  const arrowSize = Math.min(headerHeight * 0.9, headerHeight - 8);
  const headerPadding = Math.max((headerHeight - arrowSize) / 2, 4);

  const listContainerInlinePadding = 6;
  const listItemInlinePadding = 6;
  const totalListIndent = listContainerInlinePadding + listItemInlinePadding;
  
  const titlePadding = totalListIndent - headerPadding;

  const headerTitleStyle: React.CSSProperties = {
    textAlign: isRtl ? 'right' : 'left',
    direction: isRtl ? 'rtl' : 'ltr',
    flex: '1 1 auto',
    paddingLeft: !isRtl ? `${titlePadding}px` : undefined,
    paddingRight: isRtl ? `${titlePadding}px` : undefined,
    order: isRtl ? 2 : 1,
  };
  
  if (shouldUseEllipsis) {
    headerTitleStyle.whiteSpace = 'nowrap';
    headerTitleStyle.overflow = 'hidden';
    headerTitleStyle.textOverflow = 'ellipsis';
    headerTitleStyle.minWidth = 0;
  }

  const containerStyle: React.CSSProperties = {
    minWidth,
    maxWidth,
    width: fixedWidth ? maxWidth : currentWidth,
    fontSize,
    display: 'inline-block',
    verticalAlign: 'top',
    position: 'relative',
    height: `${headerHeight + 2}px`,
    direction: direction,
  };

  if (!fixedWidth) {
    containerStyle.transition = 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
  }

  const hoverColor = generateMixedColor(hoverBackground as [string, number]);
  const activeColor = generateMixedColor(activeBackground as [string, number]);
  const gradientBackground = generateGradient(gradientColors || []);
  
  // Ensure hover color has a fallback value
  const effectiveHoverColor = hoverColor || 'rgba(255, 255, 255, 0.1)';
  const effectiveActiveColor = activeColor || 'rgba(255, 255, 255, 0.2)';

  // Main dropdown styles
  const dropdownStyle: React.CSSProperties = {
    height: isExpanded ? `${currentHeight}px` : `${headerHeight + 2}px`,
    position: isOnTop ? 'absolute' : 'relative',
    zIndex: isOnTop ? 1000 : 'auto',
    width: '100%',
    top: 0,
    background: gradientBackground || background,
    boxShadow: shadow,
    color: textColor,
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: isExpanded ? `${finalBorderRadius}px` : `${initialRad}px`,
    backdropFilter: 'blur(15px) brightness(1.2) saturate(1.5)',
    WebkitBackdropFilter: 'blur(15px) brightness(1.2) saturate(1.5)',
    fontSize: fontSize,
    fontFamily: 'inherit',
    '--arrow-color': textColor,
    '--hover-bg-color': effectiveHoverColor,
  } as React.CSSProperties & { 
    '--arrow-color': string; 
    '--hover-bg-color': string;
  };
  
  if(isOnTop) {
    dropdownStyle[isRtl ? 'right' : 'left'] = 0;
  }

  const headerStyle: React.CSSProperties = {
    height: `${headerHeight}px`,
    minHeight: `${headerHeight}px`,
    maxHeight: `${headerHeight}px`,
    paddingRight: `${headerPadding}px`,
    paddingLeft: `${headerPadding}px`,
    color: textColor,
    display: 'flex',
    flexDirection: 'row',
    direction: 'ltr',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'relative',
    boxSizing: 'border-box',
    overflow: 'hidden',
  };

  const arrowStyle: React.CSSProperties = {
    width: `${arrowSize}px`,
    height: `${arrowSize}px`,
    backgroundColor: effectiveHoverColor,
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 'auto 0',
    order: isRtl ? 1 : 2,
  };

  const listStyle: React.CSSProperties = {
    maxHeight: listMaxHeight,
    textAlign: isRtl ? 'right' : 'left',
    direction: direction,
    color: textColor,
    '--final-border-radius': `${finalBorderRadius}px`,
    '--hover-bg-color': effectiveHoverColor,
    '--active-bg-color': effectiveActiveColor,
  } as React.CSSProperties & { 
    '--final-border-radius': string;
    '--hover-bg-color': string;
    '--active-bg-color': string;
  };

  if (fixedWidth) {
    listStyle.wordBreak = 'break-word';
  }

  const dropdownClasses = `custom-dropdown-menu ${isExpanded ? 'expanded' : ''}`;

  return (
    <div className="dropdown-menu-container" style={containerStyle} ref={containerRef} dir={direction}>
      <div className={dropdownClasses} style={dropdownStyle} ref={dropdownDivRef}>
        <div 
          className="dropdown-menu-header" 
          onClick={toggleDropdown} 
          style={headerStyle}
        >
          <span className="dropdown-menu-header-title" style={headerTitleStyle}>{getDisplayLabel()}</span>
          <div className="dropdown-menu-arrow" style={arrowStyle}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
              <g transform="translate(0 -32)">
                <path d="M233.4 406.6c12.5 12.5 32.8 12.5 45.3 0l192-192c12.5 12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L256 338.7 86.6 169.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l192 192z"/>
              </g>
            </svg>
          </div>
        </div>
        <ul 
          ref={listRef}
          className="dropdown-menu-list" 
          style={listStyle} 
          onClick={handleListClick}
        >
          {items ? renderSubmenuItems(items) : children}
        </ul>
      </div>
    </div>
  );
};

export default DropdownMenu; 