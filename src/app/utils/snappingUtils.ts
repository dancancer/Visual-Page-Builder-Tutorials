import { ComponentData } from '../common/types';

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

export type CompRect = {
  id: number;
  rect: DOMRect;
  clientTop: number;
  clientLeft: number;
};

/**
 * Calculate component bounds from component config
 */
export function getComponentRect(component: ComponentData): CompRect | null {
  const el = document.getElementById(`wrapper-${component.id}`);
  if (!el) {
    return null;
  }
  const rect = el.getBoundingClientRect();
  return { id: component.id!, rect, clientTop: el.clientTop, clientLeft: el.clientLeft };
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
export function calculateAlignmentGuides(draggingBounds: CompRect, otherComponents: CompRect[], threshold: number): AlignmentGuide[] {
  const guides: AlignmentGuide[] = [];
  const getCenter = (rect: DOMRect) => rect.left + rect.width / 2;
  const getMiddle = (rect: DOMRect) => rect.top + rect.height / 2;
  // Check alignment with other components
  otherComponents.forEach((component) => {
    if (component.id === draggingBounds.id) return;

    // Vertical alignments (left, center, right)
    if (Math.abs(draggingBounds.rect.left - component.rect.left) <= threshold) {
      guides.push({
        type: 'vertical',
        position: component.rect.left,
        sourceComponentId: component.id,
      });
    }

    if (Math.abs(getCenter(draggingBounds.rect) - getCenter(component.rect)) <= threshold) {
      guides.push({
        type: 'vertical',
        position: getCenter(component.rect),
        sourceComponentId: component.id,
      });
    }

    if (Math.abs(draggingBounds.rect.right - component.rect.right) <= threshold) {
      guides.push({
        type: 'vertical',
        position: component.rect.right,
        sourceComponentId: component.id,
      });
    }

    // Horizontal alignments (top, middle, bottom)
    if (Math.abs(draggingBounds.rect.top - component.rect.top) <= threshold) {
      guides.push({
        type: 'horizontal',
        position: component.rect.top,
        sourceComponentId: component.id,
      });
    }

    if (Math.abs(getMiddle(draggingBounds.rect) - getMiddle(component.rect)) <= threshold) {
      guides.push({
        type: 'horizontal',
        position: getMiddle(component.rect),
        sourceComponentId: component.id,
      });
    }

    if (Math.abs(draggingBounds.rect.bottom - component.rect.bottom) <= threshold) {
      guides.push({
        type: 'horizontal',
        position: component.rect.bottom,
        sourceComponentId: component.id,
      });
    }
  });

  return guides;
}

/**
 * Calculate snap position based on alignment guides
 */
export function calculateSnapPosition(position: number, bounds: ComponentBounds, guides: AlignmentGuide[], isVertical: boolean): SnapResult {
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

/**
 * Check if two components overlap
 */
export function checkComponentOverlap(component1: CompRect, component2: CompRect): boolean {
  return (
    component1.rect.left < component2.rect.left + component2.rect.width &&
    component1.rect.left + component1.rect.width > component2.rect.left &&
    component1.rect.top < component2.rect.top + component2.rect.height &&
    component1.rect.top + component1.rect.height > component2.rect.top
  );
}

/**
 * Find overlapping components
 */
export function findOverlappingComponents(draggingComponent: CompRect, components: CompRect[]): CompRect[] {
  return components.filter(
    (component) => component.id !== draggingComponent.id && component.id !== -1 && checkComponentOverlap(draggingComponent, component),
  );
}
