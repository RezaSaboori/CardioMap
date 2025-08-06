import React, { useRef, useEffect, useMemo } from 'react';
import './BentoGrid.css';
import * as THREE from 'three';

// Import shaders as strings
import vertexShaderSource from './shaders/vertex.glsl';
import fragmentShaderSource from './shaders/fragment.glsl';

// Default card properties
const defaultCardProps = {
    beforeSize: { colSpan: 1, rowSpan: 1 },
    afterSize: { colSpan: 2, rowSpan: 2 }, // Default expanded size
    borderRadius: '32px',
    borderSize: '2.5px',
    cardPadding: '0px',
    childrenGap: '16px',
    borderEffect: {
        blur: '3px',
        gradient: 'linear-gradient(to bottom, rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.5))'
    },
    blurOverlay: {
        gradient: 'linear-gradient(to bottom, rgba(0,0,0,1) 50%, rgba(0,0,0,0.8) 70%, rgba(0,0,0,0) 100%)'
    }
};

// Function to get card size based on expanded state
const getCardSize = (card, isExpanded) => {
    if (isExpanded && card.afterSize) {
        return card.afterSize;
    }
    return card.beforeSize;
};

const BentoGrid = ({ cards = [], columns = 4, children, backgroundColor, shader = true, padding }) => {
    const canvasRef = useRef();
    const gridRef = useRef();
    const maskRef = useRef();
    const cardRefs = useRef({});
    const mouse = useRef(new THREE.Vector2(0.5, 0.5));
    const childrenArray = React.Children.toArray(children);

    // Helper function to calculate screen scale based on grid dimensions
    const calculateScreenScale = (width, height) => {
        const minDimension = Math.min(width, height);
        const baseDimension = 800; // Base size for scaling calculation
        return Math.max(0.5, Math.min(2.0, minDimension / baseDimension));
    };

    // Merge cards with default properties
    const mergedCards = useMemo(() => {
        return cards.map(card => ({
            ...defaultCardProps,
            ...card,
            beforeSize: { ...defaultCardProps.beforeSize, ...card.beforeSize },
            afterSize: { ...defaultCardProps.afterSize, ...card.afterSize },
            borderEffect: { ...defaultCardProps.borderEffect, ...card.borderEffect },
            blurOverlay: { ...defaultCardProps.blurOverlay, ...card.blurOverlay }
        }));
    }, [cards]);

    // Track expanded states
    const [expandedStates, setExpandedStates] = React.useState({});
    const [pinnedStates, setPinnedStates] = React.useState({});
    const [layout, setLayout] = React.useState([]);

    // Sort cards so pinned items come first
    const sortedCards = React.useMemo(() => {
        const pinned = [];
        const unpinned = [];
        mergedCards.forEach(card => {
            if (pinnedStates[card.id]) {
                pinned.push(card);
            } else {
                unpinned.push(card);
            }
        });
        return [...pinned, ...unpinned];
    }, [mergedCards, pinnedStates]);

    // Calculate layout when cards or expanded states change
    React.useEffect(() => {
        const calculateLayout = () => {
            const grid = []; // 2D array representing occupied cells
            const numColumns = columns;
    
            const isSpaceAvailable = (x, y, colSpan, rowSpan) => {
                for (let i = 0; i < rowSpan; i++) {
                    for (let j = 0; j < colSpan; j++) {
                        if (grid[y + i] && grid[y + i][x + j]) {
                            return false; // Space is occupied
                        }
                    }
                }
                return true; // Space is available
            };
    
            const findOpenSlot = (colSpan, rowSpan) => {
                let y = 0;
                while (true) {
                    for (let x = 0; x <= numColumns - colSpan; x++) {
                        if (isSpaceAvailable(x, y, colSpan, rowSpan)) {
                            return { x, y };
                        }
                    }
                    y++;
                }
            };
    
            const occupySlot = (x, y, colSpan, rowSpan) => {
                for (let i = 0; i < rowSpan; i++) {
                    if (!grid[y + i]) {
                        grid[y + i] = Array(numColumns).fill(false);
                    }
                    for (let j = 0; j < colSpan; j++) {
                        grid[y + i][x + j] = true; // Mark as occupied
                    }
                }
            };
    
            const newLayout = sortedCards.map(card => {
                const isExpanded = expandedStates[card.id] || false;
                const size = getCardSize(card, isExpanded);
                const { colSpan = 1, rowSpan = 1 } = size;
    
                const position = findOpenSlot(colSpan, rowSpan);
                occupySlot(position.x, position.y, colSpan, rowSpan);
    
                return {
                    id: card.id,
                    gridColumn: `${position.x + 1} / span ${colSpan}`,
                    gridRow: `${position.y + 1} / span ${rowSpan}`,
                };
            });
    
            setLayout(newLayout);
        };
    
        calculateLayout();
    }, [sortedCards, expandedStates, columns, pinnedStates]);

    // Update mask when cards change
    const updateMask = () => {
        if (!maskRef.current || !gridRef.current) return;
        
        const gridRect = gridRef.current.getBoundingClientRect();
        const maskSvg = maskRef.current;
        
        // Clear existing mask
        maskSvg.innerHTML = '';
        
        // Create mask definition
        const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
        const mask = document.createElementNS('http://www.w3.org/2000/svg', 'mask');
        mask.setAttribute('id', 'cardMask');
        
        // Start with black background (hidden)
        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect.setAttribute('width', '100%');
        rect.setAttribute('height', '100%');
        rect.setAttribute('fill', 'black');
        mask.appendChild(rect);
        
        // Add white rectangles for each card (visible areas)
        sortedCards.forEach(card => {
            const cardEl = cardRefs.current[card.id];
            if (!cardEl) return;
            
            const cardRect = cardEl.getBoundingClientRect();
            const relativeLeft = cardRect.left - gridRect.left;
            const relativeTop = cardRect.top - gridRect.top;
            
            const cardMask = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            cardMask.setAttribute('x', relativeLeft);
            cardMask.setAttribute('y', relativeTop);
            cardMask.setAttribute('width', cardRect.width);
            cardMask.setAttribute('height', cardRect.height);
            
            // Get computed border radius to handle CSS variables
            const computedRadius = window.getComputedStyle(cardEl).borderRadius;
            cardMask.setAttribute('rx', computedRadius);
            
            cardMask.setAttribute('fill', 'white');
            mask.appendChild(cardMask);
        });
        
        defs.appendChild(mask);
        maskSvg.appendChild(defs);
        
        // Apply mask to canvas
        const canvas = canvasRef.current;
        if (canvas) {
            canvas.style.mask = 'url(#cardMask)';
            canvas.style.webkitMask = 'url(#cardMask)';
        }
    };

    useEffect(() => {
        if (!shader) {
            if (canvasRef.current) {
                canvasRef.current.style.display = 'none';
            }
            return;
        }

        if (canvasRef.current) {
            canvasRef.current.style.display = 'block';
        }

        const renderer = new THREE.WebGLRenderer({
            canvas: canvasRef.current,
            antialias: true,
            alpha: true
        });
        renderer.setPixelRatio(window.devicePixelRatio);

        const scene = new THREE.Scene();
        const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
        
        const material = new THREE.ShaderMaterial({
            uniforms: {
                iTime: { value: 0 },
                iResolution: { value: new THREE.Vector2() },
                iMouse: { value: mouse.current },
                uLightRadius: { value: 20.0 },
                uScreenScale: { value: 1.0 }
            },
            vertexShader: vertexShaderSource,
            fragmentShader: fragmentShaderSource,
            transparent: true
        });

        const geometry = new THREE.PlaneGeometry(2, 2);
        const mesh = new THREE.Mesh(geometry, material);
        scene.add(mesh);

        // Store renderer and material references for external access
        if (canvasRef.current) {
            canvasRef.current.__renderer = renderer;
            canvasRef.current.__material = material;
        }

        const handleResize = () => {
            if (!gridRef.current) return;
            
            const gridRect = gridRef.current.getBoundingClientRect();
            const w = gridRect.width;
            const h = gridRect.height;
            
            renderer.setSize(w, h);
            material.uniforms.iResolution.value.set(w, h);
            
            // Calculate screen scale based on grid size
            const screenScale = calculateScreenScale(w, h);
            material.uniforms.uScreenScale.value = screenScale;
            
            // Update mask after resize
            setTimeout(updateMask, 10);
        };

        const handleMouseMove = (event) => {
            if (!gridRef.current) return;
            
            const gridRect = gridRef.current.getBoundingClientRect();
            const relativeX = (event.clientX - gridRect.left) / gridRect.width;
            const relativeY = 1.0 - ((event.clientY - gridRect.top) / gridRect.height);
            
            mouse.current.set(relativeX, relativeY);
        };

        window.addEventListener('resize', handleResize);
        window.addEventListener('mousemove', handleMouseMove);
        
        // Initial setup
        handleResize();
        
        // Update mask after initial render
        setTimeout(updateMask, 100);

        let animationId;
        const animate = (time) => {
            if (!gridRef.current) return;
            
            material.uniforms.iTime.value = time * 0.001;
            renderer.render(scene, camera);
            animationId = requestAnimationFrame(animate);
        };
        animate(0);

        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('mousemove', handleMouseMove);
            cancelAnimationFrame(animationId);
            renderer.dispose();
            geometry.dispose();
            material.dispose();
        };
    }, [shader]);

    // Update mask and canvas size when layout changes
    useEffect(() => {
        setTimeout(() => {
            // Update canvas size
            if (canvasRef.current && gridRef.current) {
                const gridRect = gridRef.current.getBoundingClientRect();
                const renderer = canvasRef.current.__renderer;
                if (renderer) {
                    renderer.setSize(gridRect.width, gridRect.height);
                    const material = canvasRef.current.__material;
                    if (material) {
                        material.uniforms.iResolution.value.set(gridRect.width, gridRect.height);
                        // Update screen scale
                        const screenScale = calculateScreenScale(gridRect.width, gridRect.height);
                        material.uniforms.uScreenScale.value = screenScale;
                    }
                }
            }
            updateMask();
        }, 10);
    }, [layout]); 

    const handlePinToggle = (cardId, isPinned) => {
        setPinnedStates(prev => ({
            ...prev,
            [cardId]: isPinned
        }));
        // We need to trigger a re-render to recalculate layout
        setTimeout(updateMask, 50);
    };

    // Handle expand toggle
    const handleExpandToggle = (cardId, isExpanded) => {
        setExpandedStates(prev => ({
            ...prev,
            [cardId]: isExpanded
        }));
        // Update canvas size and mask immediately and after transition
        requestAnimationFrame(() => {
            // Force canvas resize by triggering handleResize
            if (canvasRef.current && gridRef.current) {
                const gridRect = gridRef.current.getBoundingClientRect();
                const renderer = canvasRef.current.__renderer;
                if (renderer) {
                    renderer.setSize(gridRect.width, gridRect.height);
                    const material = canvasRef.current.__material;
                    if (material) {
                        material.uniforms.iResolution.value.set(gridRect.width, gridRect.height);
                        // Update screen scale
                        const screenScale = calculateScreenScale(gridRect.width, gridRect.height);
                        material.uniforms.uScreenScale.value = screenScale;
                    }
                }
            }
            updateMask();
            setTimeout(() => {
                // Update again after transition
                if (canvasRef.current && gridRef.current) {
                    const gridRect = gridRef.current.getBoundingClientRect();
                    const renderer = canvasRef.current.__renderer;
                    if (renderer) {
                        renderer.setSize(gridRect.width, gridRect.height);
                        const material = canvasRef.current.__material;
                        if (material) {
                            material.uniforms.iResolution.value.set(gridRect.width, gridRect.height);
                            // Update screen scale
                            const screenScale = calculateScreenScale(gridRect.width, gridRect.height);
                            material.uniforms.uScreenScale.value = screenScale;
                        }
                    }
                }
                updateMask();
            }, 450); // Wait for CSS transition to complete
        });
    };

    return (
        <div className="bento-grid-container" style={{ backgroundColor, padding }}>
            <div className="bento-grid" ref={gridRef} style={{'--bento-grid-columns': columns}}>
                <svg ref={maskRef} className="card-mask-svg" width="100%" height="100%"></svg>
                <canvas ref={canvasRef} className="bento-grid-canvas" />
                {sortedCards.map((card) => {
                    const child = childrenArray.find(c => c.props.id === card.id);
                    if (!child) return null;
                    
                    const cardLayout = layout.find(l => l.id === card.id);
                    if (!cardLayout) return null; // Wait for layout calculation

                    const cardStyle = {
                        gridColumn: cardLayout.gridColumn,
                        gridRow: cardLayout.gridRow,
                        '--card-border-radius': card.borderRadius,
                        '--card-border-size': card.borderSize,
                        '--card-border-effect-blur': card.borderEffect.blur,
                        '--card-border-effect-gradient': card.borderEffect.gradient,
                        '--card-blur-overlay-gradient': card.blurOverlay.gradient,
                        '--card-background-color': card.backgroundColor,
                        transition: 'all var(--card-transition-duration, 0.4s) cubic-bezier(0.4, 0, 0.2, 1)',
                    };

                    return (
                        <div 
                            key={card.id} 
                            className="bento-card" 
                            ref={el => cardRefs.current[card.id] = el}
                            style={cardStyle}
                        >
                            {React.cloneElement(child, { 
                                beforeSize: card.beforeSize,
                                afterSize: card.afterSize,
                                onExpandToggle: (isExpanded) => handleExpandToggle(card.id, isExpanded),
                                onPinToggle: (isPinned) => handlePinToggle(card.id, isPinned),
                                gridRef: gridRef,
                                borderRadius: card.borderRadius,
                                borderSize: card.borderSize,
                                cardPadding: card.cardPadding,
                                childrenGap: card.childrenGap,
                            })}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default BentoGrid;
