import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import ResizableWrapper from '../ResizableWrapper';
import { eventBus } from '../../utils/eventBus';

if (typeof global.DragEvent === 'undefined') {
  global.DragEvent = class DragEvent extends MouseEvent {};
}

// Mock eventBus
jest.mock('../../utils/eventBus', () => ({
  eventBus: {
    emit: jest.fn(),
  },
}));

// Mock sendMessageToParent
jest.mock('../../utils/messageBus', () => ({
  sendMessageToParent: jest.fn(),
}));

describe('ResizableWrapper', () => {
  const mockComponentData = {
    id: 'test-component',
    config: {
      compName: 'test',
    },
    styleProps: {
      width: '100px',
      height: '100px',
      left: '0px',
      top: '0px',
      position: 'absolute' as const,
    },
  };

  const defaultProps = {
    componentData: mockComponentData,
    children: <div>Test Content</div>,
    isSelected: false,
    onSelect: jest.fn(),
    onResize: jest.fn(),
    onMove: jest.fn(),
    onResizeComplete: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with default props', () => {
    render(<ResizableWrapper {...defaultProps} />);
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('shows resize handles when selected', () => {
    render(<ResizableWrapper {...defaultProps} isSelected={true} />);
    expect(document.querySelector('.resize-handles')).toBeInTheDocument();
    expect(document.querySelectorAll('.resize-handle').length).toBe(4);
  });

  it('calls onSelect when clicked', () => {
    render(<ResizableWrapper {...defaultProps} />);
    fireEvent.click(screen.getByText('Test Content').parentElement!);
    expect(defaultProps.onSelect).toHaveBeenCalled();
  });

  it('respects minimum dimensions when resizing', () => {
    render(<ResizableWrapper {...defaultProps} isSelected={true} />);
    const seHandle = document.querySelector('.resize-handle.se')!;

    // 开始调整大小
    fireEvent.mouseDown(seHandle, { clientX: 100, clientY: 100 });
    
    // 尝试调整到小于最小尺寸
    fireEvent.mouseMove(document, { clientX: 0, clientY: 0 });
    
    expect(defaultProps.onResize).toHaveBeenCalledWith(10, 10); // 最小尺寸为 10x10
  });
});