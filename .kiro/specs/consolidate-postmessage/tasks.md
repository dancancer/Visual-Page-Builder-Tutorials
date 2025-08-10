# Implementation Plan: Consolidate Direct postMessage Calls

Convert the feature design into a series of prompts for a code-generation LLM that will implement each step in a test-driven manner. Prioritize best practices, incremental progress, and early testing, ensuring no big jumps in complexity at any stage. Make sure that each prompt builds on the previous prompts, and ends with wiring things together. There should be no hanging or orphaned code that isn't integrated into a previous step. Focus ONLY on tasks that involve writing, modifying, or testing code.

## Task List

1. [ ] Update messageBus.ts to support additional message types
   - Add 'COMPONENT_SELECTED' message type for component selection events
   - Add 'ZOOM' message type for zoom events
   - Add 'ADD_COMPONENT' message type for adding components from canvas
   - Update MessagePayload interface to handle different data types for each message type

1.1. [ ] Add new message types to MessageType enum
   - Add 'COMPONENT_SELECTED' for component selection
   - Add 'ZOOM' for zoom events
   - Add 'ADD_COMPONENT' for adding components from canvas

1.2. [ ] Define data interfaces for new message types
   - Create ComponentSelectedData interface
   - Create ZoomData interface
   - Create AddComponentData interface

1.3. [ ] Update MessagePayload interface
   - Modify data property to handle all message types properly
   - Ensure type safety for each message type

2. [ ] Refactor editor/page.tsx to use messageBus instead of direct postMessage
   - Replace iframeRef.current!.contentWindow!.postMessage with sendMessageToCanvas
   - Remove redundant postMessage call since we already use sendMessageToCanvas

2.1. [ ] Remove direct postMessage call
   - Remove the line: iframeRef.current!.contentWindow!.postMessage({ name: 'update', componentTree, root }, '*')

3. [ ] Refactor canvas/page.tsx to use messageBus instead of direct window.parent.postMessage
   - Replace all window.parent.postMessage calls with sendMessageToParent
   - Handle different message types appropriately

3.1. [ ] Replace componentSelected message
   - Replace window.parent.postMessage with sendMessageToParent('COMPONENT_SELECTED', component)

3.2. [ ] Replace updateComponentStyle messages
   - Replace window.parent.postMessage with sendMessageToParent('UPDATE_COMPONENT_STYLE', styleUpdates, componentId)

3.3. [ ] Replace updateComponentProps messages
   - Replace window.parent.postMessage with sendMessageToParent('UPDATE_COMPONENT_PROPS', propsUpdates, componentId)

3.4. [ ] Replace ADD_CHILD_COMPONENT messages
   - Replace window.parent.postMessage with sendMessageToParent('ADD_CHILD_COMPONENT', { parentComponentId, componentType })

3.5. [ ] Replace zoom messages
   - Replace window.parent.postMessage with sendMessageToParent('ZOOM', { direction: zoomDirection })

3.6. [ ] Replace addComponent messages
   - Replace window.parent.postMessage with sendMessageToParent('ADD_COMPONENT', { componentType, position })

4. [ ] Update message listeners to handle new message types
   - Update handlers in editor/page.tsx to process new message types
   - Update handlers in canvas/page.tsx to process new message types

5. [ ] Remove canvasMessage.ts since it's redundant
   - Delete the file since all messaging should go through messageBus.ts

6. [ ] Test all functionality to ensure messages are properly sent and received
   - Verify component selection works
   - Verify component updates work
   - Verify zoom functionality works
   - Verify component addition works