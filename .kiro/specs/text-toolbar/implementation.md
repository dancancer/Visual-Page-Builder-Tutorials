# Text Component Toolbar Implementation Plan

## Phase 1: Component Creation

### Task 1: Create TextToolbar Component
Create the main TextToolbar component with basic structure and styling:
- Import necessary Radix UI components
- Set up basic layout and styling
- Implement placeholder controls

### Task 2: Implement UI Controls
Create individual controls for each text property:
- Font family dropdown
- Font size input with increment/decrement
- Color picker
- Toggle buttons (bold, italic, strikethrough)
- Alignment buttons
- Letter spacing input
- Line height input

### Task 3: Add Styling
Apply consistent styling using existing editorStyles:
- Match existing toolbar appearance
- Ensure responsive design
- Add hover and active states

## Phase 2: Integration

### Task 4: Connect to Editor Store
Integrate with the editor store to access selected component:
- Import useEditorStore hook
- Access selectedComponentId and componentTree
- Implement component type checking

### Task 5: Implement Style Updates
Add functionality to update component styles:
- Create update handler functions
- Implement real-time style updates
- Add validation for input values

### Task 6: Add Show/Hide Logic
Implement visibility logic based on component selection:
- Show toolbar only for text components
- Hide when no component is selected
- Hide for non-text components

## Phase 3: Communication

### Task 7: Implement Canvas Communication
Set up communication with canvas iframe:
- Use existing message passing system
- Implement style update messages
- Add error handling

### Task 8: Ensure Real-time Updates
Make sure toolbar reflects current component styles:
- Read initial styles from selected component
- Update toolbar when component changes
- Synchronize with property panel edits

### Task 9: Add Performance Optimizations
Optimize for smooth performance:
- Debounce style updates
- Memoize expensive calculations
- Optimize re-renders

## Phase 4: Testing and Refinement

### Task 10: Unit Testing
Write unit tests for core functionality:
- Component rendering
- Style update logic
- Input validation
- Component detection

### Task 11: Integration Testing
Test integration with existing systems:
- Editor store integration
- Canvas communication
- Property panel consistency

### Task 12: User Experience Refinement
Refine the user experience:
- Adjust toolbar positioning
- Optimize control layouts
- Improve visual feedback
- Add keyboard shortcuts

## Detailed Implementation Steps

### Step 1: Create TextToolbar Component File
Create `src/app/innerComponents/TextToolbar.tsx` with basic structure

### Step 2: Import Dependencies
Import necessary React, Radix UI, and utility components

### Step 3: Implement Component Structure
Set up the main component with props interface and basic layout

### Step 4: Add Font Family Control
Implement dropdown with common font families

### Step 5: Add Font Size Control
Create input with increment/decrement buttons

### Step 6: Add Color Picker
Implement color selection control

### Step 7: Add Formatting Toggles
Create toggle buttons for bold, italic, strikethrough

### Step 8: Add Alignment Controls
Implement alignment button group

### Step 9: Add Spacing Controls
Add inputs for letter spacing and line height

### Step 10: Connect to Editor Store
Integrate with useEditorStore to access selected component

### Step 11: Implement Update Logic
Add functions to update component styles

### Step 12: Add Visibility Logic
Implement show/hide based on component selection

### Step 13: Test with Editor
Integrate toolbar into editor page

### Step 14: Refine and Optimize
Make adjustments based on testing feedback