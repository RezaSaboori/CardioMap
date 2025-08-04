import React, { useState, useRef, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import './Tooltip.css';

const Tooltip = ({ children, content, boundaryRef }) => {
    const triggerRef = useRef(null);
    const tooltipRef = useRef(null);
    const [isVisible, setIsVisible] = useState(false);

    const handleMouseEnter = () => {
        setIsVisible(true);
    };

    const handleMouseLeave = () => {
        setIsVisible(false);
    };

    useLayoutEffect(() => {
        if (isVisible && triggerRef.current && tooltipRef.current) {
            const triggerRect = triggerRef.current.getBoundingClientRect();
            const tooltipRect = tooltipRef.current.getBoundingClientRect();

            const boundaryRect = boundaryRef?.current?.getBoundingClientRect();
            const viewport = { top: 0, left: 0, right: window.innerWidth, bottom: window.innerHeight };
            const bounds = boundaryRect || viewport;

            let top = triggerRect.top - tooltipRect.height - 8;
            let left = triggerRect.left + (triggerRect.width / 2) - (tooltipRect.width / 2);

            if (top < bounds.top) {
                top = triggerRect.bottom + 8;
            }

            left = Math.max(bounds.left, left);
            left = Math.min(bounds.right - tooltipRect.width, left);
            
            top = Math.max(bounds.top, top);
            top = Math.min(bounds.bottom - tooltipRect.height, top);

            tooltipRef.current.style.top = `${top}px`;
            tooltipRef.current.style.left = `${left}px`;
        }
    }, [isVisible, boundaryRef]);

    return (
        <>
            {React.cloneElement(children, {
                ref: triggerRef,
                onMouseEnter: handleMouseEnter,
                onMouseLeave: handleMouseLeave,
            })}
            {isVisible && createPortal(
                <div ref={tooltipRef} className="tooltip-portal">
                    {content}
                </div>,
                document.body
            )}
        </>
    );
};

export default Tooltip; 
