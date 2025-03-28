import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import ResizableWrapper from '../ResizableWrapper';
import { eventBus } from '../../utils/eventBus';

// Mock eventBus
jest.mock('../../utils/eventBus', () => ({
  eventBus: {
    emit: jest.fn(),
  },
}));

describe('ResizableWrapper', () => {
  const mockComponentConfig = {
    id: 'test-component',
    type: 'test',
    styleProps: {
      width: '100px',
      height: '100px',
      left: '0px',
      top: '0px',
    },
  };

  const defaultProps = {
    componentConfig: mockComponentConfig,
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
    expect(document.querySelectorAll('.resize-handle').length).toBe(8);
  });

  it('calls onSelect when clicked', () => {
    render(<ResizableWrapper {...defaultProps} />);
    fireEvent.click(screen.getByText('Test Content').parentElement!);
    expect(defaultProps.onSelect).toHaveBeenCalled();
  });

  it('handles dragging correctly', () => {
    render(<ResizableWrapper {...defaultProps} isSelected={true} />);
    const dragHandle = document.querySelector('.drag-handle')!;

    // 开始拖拽
    fireEvent.mouseDown(dragHandle, { clientX: 0, clientY: 0 });
    
    // 移动鼠标
    fireEvent.mouseMove(document, { clientX: 100, clientY: 50 });
    
    expect(defaultProps.onMove).toHaveBeenCalledWith(100, 50);

    // 释放鼠标
    fireEvent.mouseUp(document);
    
    expect(eventBus.emit).toHaveBeenCalledWith(
      'updateComponentStyle',
      'test-component',
      expect.objectContaining({
        left: '100px',
        top: '50px',
      })
    );
  });

  it('handles resizing correctly', () => {
    render(<ResizableWrapper {...defaultProps} isSelected={true} />);
    const seHandle = document.querySelector('.resize-handle.se')!;

    // 开始调整大小
    fireEvent.mouseDown(seHandle, { clientX: 100, clientY: 100 });
    
    // 移动鼠标
    fireEvent.mouseMove(document, { clientX: 200, clientY: 150 });
    
    expect(defaultProps.onResize).toHaveBeenCalledWith(200, 150);

    // 释放鼠标
    fireEvent.mouseUp(document);
    
    expect(defaultProps.onResizeComplete).toHaveBeenCalledWith(200, 150);
    expect(eventBus.emit).toHaveBeenCalledWith(
      'updateComponentStyle',
      'test-component',
      expect.objectContaining({
        width: '200px',
        height: '150px',
      })
    );
  });

  it('respects minimum dimensions when resizing', () => {
    render(<ResizableWrapper {...defaultProps} isSelected={true} />);
    const seHandle = document.querySelector('.resize-handle.se')!;

    // 开始调整大小
    fireEvent.mouseDown(seHandle, { clientX: 100, clientY: 100 });
    
    // 尝试调整到小于最小尺寸
    fireEvent.mouseMove(document, { clientX: 20, clientY: 20 });
    
    expect(defaultProps.onResize).toHaveBeenCalledWith(50, 50); // 最小尺寸为 50x50
  });
});