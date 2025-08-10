import React from 'react'
import { render } from '@testing-library/react'
import Page from '../page'

// Mock useEditorStore
jest.mock('../../store/editorStore', () => ({
  __esModule: true,
  default: () => ({
    setSelectedComponentId: jest.fn(),
    addComponentType: jest.fn(),
  }),
}))

describe('Canvas Page', () => {
  it('should render nothing when root is not defined', () => {
    const { container } = render(<Page />)
    expect(container.firstChild).toBeNull()
  })

  // 添加更多测试用例...
})