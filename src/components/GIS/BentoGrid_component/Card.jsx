import React, { useState, useRef, useLayoutEffect } from 'react';
import './Card.css';
import PinIcon from './PinIcon';
import InfoIcon from './InfoIcon';
import Tooltip from './Tooltip';
import UnpinIcon from './UnpinIcon';
import PlusIcon from './PlusIcon';
import MinusIcon from './MinusIcon';

const Card = ({ header, children, visibleItemsInitial = 1, id, beforeSize = null, afterSize = null, onExpandToggle, onPinToggle, tooltipContent, gridRef, cardPadding = '24px', borderRadius = '32px', borderSize = '3px', childrenGap = '16px' }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const h1Ref = useRef(null);
  const [isHeaderOverflowing, setIsHeaderOverflowing] = useState(false);
  const [isCardValueOverflowing, setIsCardValueOverflowing] = useState(false);
  const [headerAnimationDuration, setHeaderAnimationDuration] = useState('10s');
  
  const childrenArray = React.Children.toArray(children);
  const hasMoreContent = childrenArray.length > visibleItemsInitial;

  useLayoutEffect(() => {
    const checkHeaderOverflow = () => {
      const el = h1Ref.current;
      if (el) {
        const isOverflowing = el.scrollWidth > el.clientWidth;
        if (isOverflowing !== isHeaderOverflowing) {
          setIsHeaderOverflowing(isOverflowing);
          if (isOverflowing) {
            const duration = el.scrollWidth / 50; // 50px per second
            setHeaderAnimationDuration(`${duration.toFixed(2)}s`);
          }
        }
      }
    };

            const checkCardValueOverflow = () => {
          // Find card value elements within this specific card
          const cardElement = document.querySelector(`[data-card-id="${id}"]`);
          if (cardElement) {
            const cardValueEls = cardElement.querySelectorAll('.card-value');
            cardValueEls.forEach(el => {
              // Check if ellipsis is actually visible (text is truncated)
              const hasEllipsis = el.scrollWidth > el.clientWidth;
              
              // Additional check: ensure the element has proper dimensions
              const isValidElement = el.clientWidth > 0 && el.scrollWidth > 0;
              
              // Check if the text is actually truncated (ellipsis visible)
              const computedStyle = window.getComputedStyle(el);
              const isTextTruncated = computedStyle.textOverflow === 'ellipsis' && 
                                     computedStyle.overflow === 'hidden' && 
                                     el.scrollWidth > el.clientWidth;
              
              // Only add overflowing class if text is actually truncated (ellipsis is visible)
              const shouldAnimate = isTextTruncated && isValidElement;
              
              if (shouldAnimate) {
                el.classList.add('overflowing');
              } else {
                el.classList.remove('overflowing');
              }
            });
          }
        };

    const headerEl = h1Ref.current;
    const cardElement = document.querySelector(`[data-card-id="${id}"]`);

    if (headerEl) {
      checkHeaderOverflow();
      const headerResizeObserver = new ResizeObserver(checkHeaderOverflow);
      headerResizeObserver.observe(headerEl);
    }

    if (cardElement) {
      // Initial check
      checkCardValueOverflow();
      
      // Set up ResizeObserver for card value overflow
      const cardValueResizeObserver = new ResizeObserver(() => {
        // Add a small delay to ensure the DOM has updated
        requestAnimationFrame(checkCardValueOverflow);
      });
      cardValueResizeObserver.observe(cardElement);
    }

    return () => {
      if (headerEl) {
        const headerResizeObserver = new ResizeObserver(checkHeaderOverflow);
        headerResizeObserver.unobserve(headerEl);
      }
      if (cardElement) {
        const cardValueResizeObserver = new ResizeObserver(() => {
          requestAnimationFrame(checkCardValueOverflow);
        });
        cardValueResizeObserver.unobserve(cardElement);
      }
    };
  }, [header, isHeaderOverflowing, id]);



  const toggleExpanded = () => {
    if (!hasMoreContent) return;

    const newExpandedState = !isExpanded;
    setIsExpanded(newExpandedState);
    if (onExpandToggle) {
      onExpandToggle(newExpandedState);
    }
  };

  const togglePinned = () => {
    const newPinnedState = !isPinned;
    setIsPinned(newPinnedState);
    if (onPinToggle) {
      onPinToggle(newPinnedState);
    }
  };

  // Convert children to array to handle limiting
  const visibleChildren = isExpanded ? childrenArray : childrenArray.slice(0, visibleItemsInitial);

  const cardStyle = {
    '--card-padding': cardPadding,
    '--card-border-radius': borderRadius,
    '--card-border-size': borderSize,
    '--children-gap': childrenGap,
    '--child-border-radius': `calc(${borderRadius} - ${cardPadding} - ${borderSize})`,
  };

  return (
    <div 
      className={`card ${isExpanded ? 'card-expanded' : ''}`}
      style={cardStyle}
      data-card-id={id}
    >
      <div className="card-canvas-wrapper"></div> {/* Shader shows here */}
      <div className="color-blend-overlay"></div>
      <div className="blur-overlay"></div>
      <div className="border-effect-overlay"></div>
      <div className="text-content">
        <div className="card-header">
          <div className="card-header-text">
            <h1 
              ref={h1Ref} 
              className={isHeaderOverflowing ? 'overflowing' : ''}
              style={{ '--scroll-duration': headerAnimationDuration }}
            >
              <span data-text={header}>{header}</span>
            </h1>
          </div>
          <div className="card-header-icons">
            {tooltipContent && (
              <Tooltip content={tooltipContent} boundaryRef={gridRef}>
                <button
                  className="card-info-btn"
                  aria-label="Information"
                >
                  <InfoIcon className="info-icon" />
                </button>
              </Tooltip>
            )}
            <button
              className={`card-pin-btn ${isPinned ? 'pinned' : ''}`}
              onClick={togglePinned}
              aria-label={isPinned ? "Unpin" : "Pin"}
            >
              {isPinned ? <UnpinIcon className="unpin-icon" /> : <PinIcon className="pin-icon" />}
            </button>
            <button 
              className={`card-expand-btn ${isExpanded ? 'expanded' : ''}`}
              onClick={toggleExpanded}
              aria-label={isExpanded ? "Collapse" : "Expand"}
              disabled={!hasMoreContent}
            >
              {isExpanded ? <MinusIcon className="minus-icon" /> : <PlusIcon className="plus-icon" />}
            </button>
          </div>
        </div>
        <div className="card-content">
          {visibleChildren}
        </div>
      </div>
    </div>
  );
};

export default Card;