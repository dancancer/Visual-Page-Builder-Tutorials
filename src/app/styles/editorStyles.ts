// Shared styling constants for the editor components (compact version)
export const editorStyles = {
  // Base text styles
  text: {
    primary: 'text-gray-900',
    secondary: 'text-gray-700',
    muted: 'text-gray-500',
  },

  // Container styles
  container: {
    panel: 'border border-gray-200 rounded-lg p-2',
    section: 'space-y-2',
    item: 'flex flex-col mb-1',
  },

  // Form element styles
  form: {
    label: 'text-xs font-medium mb-0.5 flex items-center',
    input:
      'w-full text-xs font-medium px-1 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500',
    inputNumber: 'w-full px-1 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500',
    inputColor: 'w-full h-8 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500',
    button: 'px-2 py-1 rounded text-xs font-medium',
    buttonPrimary: 'bg-blue-500 text-white hover:bg-blue-600',
    buttonSecondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200',
  },

  // Layout component styles
  layout: {
    header: 'p-2 m-0',
    divider: 'border-b border-gray-200 mx-2 my-1',
    sidebar: 'px-1',
  },

  // Dropdown styles
  dropdown: {
    trigger: 'w-full flex items-center justify-between p-1 text-left hover:bg-gray-100 rounded',
    content: 'ml-2 mt-0.5 w-48 bg-white rounded shadow-lg border border-gray-200',
    item: 'flex items-center p-1 text-xs hover:bg-gray-100 cursor-pointer',
  },

  // Tab styles
  tabs: {
    list: 'flex border-b border-gray-200 mb-2',
    trigger: 'px-2 py-1 text-xs font-medium border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:text-blue-600',
  },

  // Collapsible styles
  collapsible: {
    trigger: 'flex items-center justify-between w-full p-2 bg-gray-50 rounded-lg hover:bg-gray-100 mb-1',
  },

  // Select styles
  select: {
    trigger:
      'inline-flex items-center justify-between rounded-r-md px-2 py-1 text-xs leading-none bg-white border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500',
    triggerWithRadius:
      'inline-flex items-center justify-between rounded-md px-2 py-1 text-xs leading-none bg-white border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500',
  },

  // Zoom control styles
  zoomControl: {
    container: 'flex items-center gap-2 p-2 bg-white border-t border-gray-200',
    slider: 'relative flex items-center select-none touch-none w-full h-4',
    ratioDisplay: 'w-12 text-center text-xs font-medium cursor-pointer hover:bg-gray-100 rounded px-1 py-0.5',
  },

  // Property panel styles
  propertyPanel: {
    categoryHeader: 'flex items-center p-1 font-medium text-gray-700 text-xs',
    propertyGrid: 'grid grid-cols-1 gap-2 p-1',
    propertyItem: 'flex flex-col',
    propertyLabel: 'text-xs font-medium mb-0.5 flex items-center',
  },
};
