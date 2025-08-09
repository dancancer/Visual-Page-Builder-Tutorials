# Text Component Toolbar Feature Design

## Overview

This document outlines the design for implementing a toolbar that appears above the canvas when a text component is selected. The toolbar will provide quick access to common text formatting options including font family, font size, font color, bold, italic, strikethrough, alignment, letter spacing, and line height.

## Requirements

Based on the feature request, the toolbar must support:
- Font family selection
- Font size adjustment
- Font color picker
- Bold toggle
- Italic toggle
- Strikethrough toggle
- Text alignment options (left, center, right, justify)
- Letter spacing control
- Line height control

## Architecture

The feature will be implemented as a new component that integrates with the existing editor architecture:

1. **TextToolbar Component** - The main toolbar UI component
2. **Editor Integration** - Connection to the editor store for component selection
3. **Canvas Communication** - Message passing between editor and canvas iframes
4. **State Management** - Coordination with existing component state management

## Detailed Design

### 1. TextToolbar Component

The TextToolbar component will be a React component that:
- Appears when a text component is selected
- Disappears when no component or a non-text component is selected
- Provides controls for all required text properties
- Updates component styles in real-time

```typescript
interface TextToolbarProps {
  selectedComponent: ComponentConfig | null;
  onUpdateStyle: (styleUpdates: Record<string, string>) => void;
}
```

### 2. Component Integration

The toolbar will integrate with:
- **Editor Store**: To access selected component information
- **Canvas Communication**: To update component styles
- **Property Panel**: To maintain consistency with existing property editing

### 3. UI Design

The toolbar will include:
- Font family dropdown with common fonts
- Font size input with increment/decrement buttons
- Color picker for font color
- Toggle buttons for bold, italic, strikethrough
- Alignment buttons (left, center, right, justify)
- Letter spacing input
- Line height input

### 4. State Management

The toolbar will:
- Read current text styles from the selected component
- Update styles through the existing editor store mechanisms
- Maintain consistency with property panel edits

## Implementation Plan

### Phase 1: Component Creation

1. Create TextToolbar component with basic structure
2. Implement UI controls for all required properties
3. Add styling consistent with existing editor UI

### Phase 2: Integration

1. Connect toolbar to editor store for component selection
2. Implement style update functionality
3. Add show/hide logic based on component selection

### Phase 3: Communication

1. Implement canvas communication for style updates
2. Ensure real-time updates across iframes
3. Add error handling and validation

### Phase 4: Testing and Refinement

1. Test with various text components
2. Verify consistency with property panel
3. Optimize performance and UX

## Data Models

### Text Style Properties

The toolbar will manage these CSS properties:
- `fontFamily`: Font family name
- `fontSize`: Font size with unit (px, em, etc.)
- `color`: Font color in hex format
- `fontWeight`: 'normal' or 'bold'
- `fontStyle`: 'normal' or 'italic'
- `textDecoration`: 'none', 'underline', 'line-through'
- `textAlign`: 'left', 'center', 'right', 'justify'
- `letterSpacing`: Letter spacing value
- `lineHeight`: Line height value

### Component Interface

```typescript
interface TextStyleUpdates {
  fontFamily?: string;
  fontSize?: string;
  color?: string;
  fontWeight?: string;
  fontStyle?: string;
  textDecoration?: string;
  textAlign?: string;
  letterSpacing?: string;
  lineHeight?: string;
}
```

## Error Handling

- Graceful degradation when selected component is not a text component
- Validation of input values
- Error boundaries for UI components
- Fallback to default values for invalid inputs

## Testing Strategy

### Unit Tests

- Toolbar component rendering
- Style update functionality
- Component selection logic
- Input validation

### Integration Tests

- Editor store integration
- Canvas communication
- Consistency with property panel
- Cross-iframe updates

### User Experience Tests

- Toolbar visibility logic
- Real-time style updates
- Performance with multiple components
- Responsive design

## Design Decisions

### 1. Toolbar Positioning

The toolbar will be positioned above the canvas area to avoid interfering with component placement and to provide easy access during text editing.

### 2. Component Detection

The toolbar will only appear when a text component is selected, determined by checking the `compName` property of the selected component.

### 3. Style Synchronization

The toolbar will use the same style update mechanisms as the existing property panel to ensure consistency and avoid conflicts.

### 4. Performance Optimization

Updates will be debounced to prevent excessive re-renders and maintain smooth UI performance.

## Dependencies

- Existing editor store for component state management
- Canvas communication system for cross-iframe updates
- Radix UI components for consistent UI elements
- Existing styling system for visual consistency