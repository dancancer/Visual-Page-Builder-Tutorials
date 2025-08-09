# Project Architecture Overview

## Core Technologies
- **Next.js 15.1.4** with Turbopack
- **React 19**
- **TypeScript**
- **Tailwind CSS 3.4.1**
- **Zustand** for state management
- **radix-ui** component library

## Project Structure
```
src/
├── app/
│   ├── layout.tsx        # Root layout with global fonts
│   ├── page.tsx          # Homepage
│   ├── canvas/           # Canvas-related components
│   ├── components/       # Reusable components
│   ├── editor/           # Editor functionality
│   └── store/            # Zustand state stores
```

## Key Architectural Principles
1. **Component-Based Architecture**
   - Reusable UI components
   - Separation of concerns
2. **Styling System**
   - Tailwind CSS for utility-first styling
   - Font optimization via `next/font`
   - Global CSS in `globals.css`
3. **State Management**
   - Zustand for client-side state
   - Stores located in `src/app/store/`
4. **Performance Optimization**
   - Turbopack for fast development
   - Next.js Image component
5. **Responsive Design**
   - Mobile-first approach
   - Responsive utility classes
6. **配置和渲染分离设计**
   - 画布在一个单独的iframe中
   - 画布与主框架间使用postmessage来通讯

## Development Workflow
```bash
npm run dev    # Start dev server with Turbopack
npm run build  # Create production build
npm run test   # Run Jest tests
```

## Key Dependencies
```json
{
  "dependencies": {
    "next": "15.1.4",
    "react": "^19.0.0",
    "zustand": "^5.0.3",
    "tailwindcss": "^3.4.1"
  }
}
```
