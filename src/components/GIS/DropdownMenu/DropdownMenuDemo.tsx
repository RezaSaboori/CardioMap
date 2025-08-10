import React, { useState } from 'react';
import DropdownMenu from './DropdownMenu';
import './DropdownMenu.css';

const DropdownMenuDemo: React.FC = () => {
  const [selectedData, setSelectedData] = useState('data1');
  const [selectedMap, setSelectedMap] = useState('map1');

  const dataItems = [
    { label: 'Data 1', value: 'data1' },
    { label: 'Data 2', value: 'data2' },
    { 
      label: 'Data 3', 
      children: [
        { label: 'Sub Data 3.1', value: 'subdata3.1' },
        { label: 'Sub Data 3.2', value: 'subdata3.2' }
      ] 
    }
  ];

  const mapItems = [
    { label: 'Map 1', value: 'map1' },
    { label: 'Map 2', value: 'map2' },
    { 
      label: 'Map 3', 
      children: [
        { label: 'Sub Map 3.1', value: 'submap3.1' },
        { label: 'Sub Map 3.2', value: 'submap3.2' }
      ] 
    }
  ];

  return (
    <div style={{ 
      padding: '20px', 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      minHeight: '100vh',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1 style={{ color: 'white', textAlign: 'center', marginBottom: '40px' }}>
        Dropdown Menu Active State Demo
      </h1>
      
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '20px', 
        maxWidth: '600px', 
        margin: '0 auto' 
      }}>
        <div style={{ background: 'rgba(255,255,255,0.1)', padding: '20px', borderRadius: '16px' }}>
          <h3 style={{ color: 'white', marginBottom: '15px' }}>Data Selection</h3>
          <DropdownMenu
            value={selectedData}
            onSelect={setSelectedData}
            items={dataItems}
            direction="ltr"
            textColor="#ffffff"
            background="rgba(255, 255, 255, 0.2)"
            hoverBackground={['rgba(255,255,255,1)', 0.15]}
            fontSize="16px"
            headerHeight={50}
            finalBorderRadius={20}
          />
          <p style={{ color: 'white', marginTop: '10px', fontSize: '14px' }}>
            Selected: <strong>{selectedData}</strong>
          </p>
          <div style={{ marginTop: '10px' }}>
            <button 
              onClick={() => setSelectedData('subdata3.1')} 
              style={{ 
                marginRight: '10px', 
                padding: '5px 10px', 
                background: 'rgba(255,255,255,0.2)', 
                border: '1px solid rgba(255,255,255,0.3)', 
                borderRadius: '5px', 
                color: 'white',
                cursor: 'pointer'
              }}
            >
              Select Sub Data 3.1
            </button>
            <button 
              onClick={() => setSelectedData('data2')} 
              style={{ 
                padding: '5px 10px', 
                background: 'rgba(255,255,255,0.2)', 
                border: '1px solid rgba(255,255,255,0.3)', 
                borderRadius: '5px', 
                color: 'white',
                cursor: 'pointer'
              }}
            >
              Select Data 2
            </button>
          </div>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.1)', padding: '20px', borderRadius: '16px' }}>
          <h3 style={{ color: 'white', marginBottom: '15px' }}>Map Selection</h3>
          <DropdownMenu
            value={selectedMap}
            onSelect={setSelectedMap}
            items={mapItems}
            direction="rtl"
            textColor="#ffffff"
            background="rgba(255, 255, 255, 0.2)"
            hoverBackground={['rgba(255,255,255,1)', 0.15]}
            fontSize="16px"
            headerHeight={50}
            finalBorderRadius={20}
          />
          <p style={{ color: 'white', marginTop: '10px', fontSize: '14px' }}>
            Selected: <strong>{selectedMap}</strong>
          </p>
          <div style={{ marginTop: '10px' }}>
            <button 
              onClick={() => setSelectedMap('submap3.1')} 
              style={{ 
                marginRight: '10px', 
                padding: '5px 10px', 
                background: 'rgba(255,255,255,0.2)', 
                border: '1px solid rgba(255,255,255,0.3)', 
                borderRadius: '5px', 
                color: 'white',
                cursor: 'pointer'
              }}
            >
              Select Sub Map 3.1
            </button>
            <button 
              onClick={() => setSelectedMap('map2')} 
              style={{ 
                padding: '5px 10px', 
                background: 'rgba(255,255,255,0.2)', 
                border: '1px solid rgba(255,255,255,0.3)', 
                borderRadius: '5px', 
                color: 'white',
                cursor: 'pointer'
              }}
            >
              Select Map 2
            </button>
          </div>
        </div>

        <div style={{ 
          background: 'rgba(255,255,255,0.1)', 
          padding: '20px', 
          borderRadius: '16px',
          color: 'white'
        }}>
          <h3 style={{ marginBottom: '15px' }}>Active State Features</h3>
          <ul style={{ lineHeight: '1.6' }}>
            <li><strong>Selected Items:</strong> Maintain active background until a new item is selected</li>
            <li><strong>Submenu Triggers:</strong> Keep active background while submenu is open</li>
            <li><strong>Default Selection:</strong> Items selected by default show active state immediately</li>
            <li><strong>Active Background:</strong> Clear visual feedback for all active states</li>
            <li><strong>Smooth Transitions:</strong> All state changes are animated</li>
            <li><strong>RTL Support:</strong> Works seamlessly in both text directions</li>
            <li><strong>Multiple States:</strong> Items can have multiple active states (selected + submenu-open)</li>
          </ul>
        </div>

        <div style={{ 
          background: 'rgba(255,255,255,0.1)', 
          padding: '20px', 
          borderRadius: '16px',
          color: 'white'
        }}>
          <h3 style={{ marginBottom: '15px' }}>How Active States Work</h3>
          <ul style={{ lineHeight: '1.6' }}>
            <li><strong>Active Class:</strong> Applied to items that are selected by default or have open submenus</li>
            <li><strong>Selected Class:</strong> Applied to the currently selected item</li>
            <li><strong>Submenu-Open Class:</strong> Applied to items with currently open submenus</li>
            <li><strong>Background Persistence:</strong> Active background remains even when not hovered</li>
            <li><strong>State Combination:</strong> Multiple classes can be applied simultaneously</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default DropdownMenuDemo;
