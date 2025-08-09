import { ComponentConfig } from '../common/types';

export interface GridConfig {
  enabled: boolean;
  size: number;
  visible: boolean;
  snapThreshold: number;
}

export interface ComponentBounds {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  edges: {
    left: number;
    center: number;
    right: number;
    top: number;
    middle: number;
    bottom: number;
  };
}

export interface SnapResult {
  x?: number;
  y?: number;
  snapType: 'grid' | 'component' | 'boundary' | 'none';
}

export interface AlignmentGuide {
  type: 'vertical' | 'horizontal';
  position: number;
  sourceComponentId?: number;
}

// Default grid configuration
export const DEFAULT_GRID_CONFIG: GridConfig = {
  enabled: true,
  size: 10,
  visible: true,
  snapThreshold: 5,
};

/**
 * Calculate component bounds from component config
 */
export function calculateComponentBounds(component: ComponentConfig): ComponentBounds | null {
  if (!component.styleProps) return null;
  
  const x = parseInt(component.styleProps.left as string) || 0;
  const y = parseInt(component.styleProps.top as string) || 0;
  const width = parseInt(component.styleProps.width as string) || 0;
  const height = parseInt(component.styleProps.height as string) || 0;
  
  return {
    id: component.id || -1,
    x,
    y,
    width,
    height,
    edges: {
      left: x,
      center: x + width / 2,
      right: x + width,
      top: y,
      middle: y + height / 2,
      bottom: y + height,
    },
  };
}

/**
 * Calculate grid snap position
 */
export function calculateGridSnap(position: number, gridSize: number): number {
  return Math.round(position / gridSize) * gridSize;
}

/**
 * Check if position should snap to grid
 */
export function shouldSnapToGrid(position: number, gridPosition: number, threshold: number): boolean {
  return Math.abs(position - gridPosition) <= threshold;
}

/**
 * Calculate alignment guides for a dragging component
 */
export function calculateAlignmentGuides(
  draggingBounds: ComponentBounds,
  otherComponents: ComponentBounds[],
  threshold: number
): AlignmentGuide[] {
  const guides: AlignmentGuide[] = [];
  
  // Check alignment with other components
  otherComponents.forEach(component => {
    if (component.id === draggingBounds.id) return;
    
    // Vertical alignments (left, center, right)
    if (Math.abs(draggingBounds.edges.left - component.edges.left) <= threshold) {
      guides.push({
        type: 'vertical',
        position: component.edges.left,
        sourceComponentId: component.id,
      });
    }
    
    if (Math.abs(draggingBounds.edges.center - component.edges.center) <= threshold) {
      guides.push({
        type: 'vertical',
        position: component.edges.center,
        sourceComponentId: component.id,
      });
    }
    
    if (Math.abs(draggingBounds.edges.right - component.edges.right) <= threshold) {
      guides.push({
        type: 'vertical',
        position: component.edges.right,
        sourceComponentId: component.id,
      });
    }
    
    // Horizontal alignments (top, middle, bottom)
    if (Math.abs(draggingBounds.edges.top - component.edges.top) <= threshold) {
      guides.push({
        type: 'horizontal',
        position: component.edges.top,
        sourceComponentId: component.id,
      });
    }
    
    if (Math.abs(draggingBounds.edges.middle - component.edges.middle) <= threshold) {
      guides.push({
        type: 'horizontal',
        position: component.edges.middle,
        sourceComponentId: component.id,
      });
    }
    
    if (Math.abs(draggingBounds.edges.bottom - component.edges.bottom) <= threshold) {
      guides.push({
        type: 'horizontal',
        position: component.edges.bottom,
        sourceComponentId: component.id,
      });
    }
  });
  
  return guides;
}

/**
 * Calculate snap position based on alignment guides
 */
export function calculateSnapPosition(
  position: number,
  bounds: ComponentBounds,
  guides: AlignmentGuide[],
  isVertical: boolean
): SnapResult {
  for (const guide of guides) {
    if (guide.type === 'vertical' && isVertical) {
      // For vertical snapping, adjust based on which edge is aligning
      const leftDiff = Math.abs(position - guide.position);
      const centerDiff = Math.abs(bounds.edges.center - guide.position);
      const rightDiff = Math.abs(bounds.edges.right - guide.position);
      
      if (leftDiff <= DEFAULT_GRID_CONFIG.snapThreshold) {
        return {
          x: guide.position,
          snapType: 'component',
        };
      } else if (centerDiff <= DEFAULT_GRID_CONFIG.snapThreshold) {
        return {
          x: guide.position - bounds.width / 2,
          snapType: 'component',
        };
      } else if (rightDiff <= DEFAULT_GRID_CONFIG.snapThreshold) {
        return {
          x: guide.position - bounds.width,
          snapType: 'component',
        };
      }
    } else if (guide.type === 'horizontal' && !isVertical) {
      // For horizontal snapping, adjust based on which edge is aligning
      const topDiff = Math.abs(position - guide.position);
      const middleDiff = Math.abs(bounds.edges.middle - guide.position);
      const bottomDiff = Math.abs(bounds.edges.bottom - guide.position);
      
      if (topDiff <= DEFAULT_GRID_CONFIG.snapThreshold) {
        return {
          y: guide.position,
          snapType: 'component',
        };
      } else if (middleDiff <= DEFAULT_GRID_CONFIG.snapThreshold) {
        return {
          y: guide.position - bounds.height / 2,
          snapType: 'component',
        };
      } else if (bottomDiff <= DEFAULT_GRID_CONFIG.snapThreshold) {
        return {
          y: guide.position - bounds.height,
          snapType: 'component',
        };
      }
    }
  }
  
  return {
    snapType: 'none',
  };
}