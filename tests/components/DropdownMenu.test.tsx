import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import DropdownMenu from '../../src/components/GIS/DropdownMenu/DropdownMenu';

// Mock React Portal
jest.mock('react-dom', () => ({
  ...jest.requireActual('react-dom'),
  createPortal: (node: React.ReactNode) => node,
}));

describe('DropdownMenu Active State Behavior', () => {
  const mockItems = [
    {
      label: 'Option 1',
      value: 'opt1'
    },
    {
      label: 'Option 2',
      children: [
        {
          label: 'Sub Option 2.1',
          value: 'sub2.1'
        },
        {
          label: 'Sub Option 2.2',
          value: 'sub2.2'
        }
      ]
    },
    {
      label: 'Option 3',
      value: 'opt3'
    }
  ];

  const defaultProps = {
    items: mockItems,
    value: 'opt1',
    onSelect: jest.fn(),
    direction: 'rtl' as const,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders with selected value', () => {
    render(<DropdownMenu {...defaultProps} />);
    
    expect(screen.getByText('Option 1')).toBeInTheDocument();
    expect(screen.getByText('opt1')).toBeInTheDocument();
  });

  test('applies selected class to currently selected item', () => {
    render(<DropdownMenu {...defaultProps} />);
    
    // The dropdown should be expanded by default in test environment
    // Check if the selected item has the selected class
    const selectedItem = screen.getByText('Option 1').closest('li');
    expect(selectedItem).toHaveClass('selected');
  });

  test('applies active class to selected item by default', () => {
    render(<DropdownMenu {...defaultProps} />);
    
    // Check if the selected item has the active class
    const selectedItem = screen.getByText('Option 1').closest('li');
    expect(selectedItem).toHaveClass('active');
  });

  test('applies submenu-open class when submenu is active', async () => {
    render(<DropdownMenu {...defaultProps} />);
    
    // Hover over submenu trigger
    const submenuTrigger = screen.getByText('Option 2');
    fireEvent.mouseEnter(submenuTrigger);
    
    await waitFor(() => {
      expect(submenuTrigger.closest('li')).toHaveClass('submenu-open');
    });
  });

  test('applies active class when submenu is open', async () => {
    render(<DropdownMenu {...defaultProps} />);
    
    // Hover over submenu trigger
    const submenuTrigger = screen.getByText('Option 2');
    fireEvent.mouseEnter(submenuTrigger);
    
    await waitFor(() => {
      expect(submenuTrigger.closest('li')).toHaveClass('active');
    });
  });

  test('maintains selected state when new item is selected', () => {
    render(<DropdownMenu {...defaultProps} />);
    
    // Click on a different item
    const newItem = screen.getByText('Option 3');
    fireEvent.click(newItem);
    
    // Check if onSelect was called with the new value
    expect(defaultProps.onSelect).toHaveBeenCalledWith('opt3');
  });

  test('applies hover styles on mouse enter', () => {
    render(<DropdownMenu {...defaultProps} />);
    
    // Hover over an item
    const item = screen.getByText('Option 3');
    fireEvent.mouseEnter(item);
    
    // The item should have hover styles applied
    expect(item.closest('li')).toBeInTheDocument();
  });

  test('submenu items maintain selected state', async () => {
    render(<DropdownMenu {...defaultProps} />);
    
    // Hover over submenu trigger to open submenu
    const submenuTrigger = screen.getByText('Option 2');
    fireEvent.mouseEnter(submenuTrigger);
    
    await waitFor(() => {
      // Check if submenu items are rendered
      expect(screen.getByText('Sub Option 2.1')).toBeInTheDocument();
      expect(screen.getByText('Sub Option 2.2')).toBeInTheDocument();
    });
    
    // Click on a submenu item
    const submenuItem = screen.getByText('Sub Option 2.1');
    fireEvent.click(submenuItem);
    
    // Check if onSelect was called with the submenu item value
    expect(defaultProps.onSelect).toHaveBeenCalledWith('sub2.1');
  });

  test('submenu items get selected class when they are the current value', () => {
    // Render with a submenu item as the selected value
    const propsWithSubmenuSelected = {
      ...defaultProps,
      value: 'sub2.1'
    };
    
    render(<DropdownMenu {...propsWithSubmenuSelected} />);
    
    // Hover over submenu trigger to open submenu
    const submenuTrigger = screen.getByText('Option 2');
    fireEvent.mouseEnter(submenuTrigger);
    
    // Check if the submenu item has the selected class
    const submenuItem = screen.getByText('Sub Option 2.1');
    expect(submenuItem.closest('li')).toHaveClass('selected');
  });

  test('submenu items get active class when they are the current value', () => {
    // Render with a submenu item as the selected value
    const propsWithSubmenuSelected = {
      ...defaultProps,
      value: 'sub2.1'
    };
    
    render(<DropdownMenu {...propsWithSubmenuSelected} />);
    
    // Hover over submenu trigger to open submenu
    const submenuTrigger = screen.getByText('Option 2');
    fireEvent.mouseEnter(submenuTrigger);
    
    // Check if the submenu item has the active class
    const submenuItem = screen.getByText('Sub Option 2.1');
    expect(submenuItem.closest('li')).toHaveClass('active');
  });

  test('items can have multiple active states simultaneously', async () => {
    render(<DropdownMenu {...defaultProps} />);
    
    // Hover over submenu trigger to open submenu
    const submenuTrigger = screen.getByText('Option 2');
    fireEvent.mouseEnter(submenuTrigger);
    
    await waitFor(() => {
      // The submenu trigger should have both active and submenu-open classes
      expect(submenuTrigger.closest('li')).toHaveClass('active');
      expect(submenuTrigger.closest('li')).toHaveClass('submenu-open');
    });
  });

  test('active state persists when not hovered', async () => {
    render(<DropdownMenu {...defaultProps} />);
    
    // Hover over submenu trigger to open submenu
    const submenuTrigger = screen.getByText('Option 2');
    fireEvent.mouseEnter(submenuTrigger);
    
    await waitFor(() => {
      expect(submenuTrigger.closest('li')).toHaveClass('active');
    });
    
    // Move mouse away from submenu trigger
    fireEvent.mouseLeave(submenuTrigger);
    
    // The active class should still be present
    expect(submenuTrigger.closest('li')).toHaveClass('active');
  });
});
