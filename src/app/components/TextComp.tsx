'use client';

import React, { useRef } from 'react';
import { ComponentData } from '../common/types';
import { ComponentConfig } from '../common/types';

// 组件实现
const Text: React.FC<ComponentData> = (props) => {
  const { compProps, isEditing, onBlur } = props;
  const { content } = compProps || {};
  const textRef = useRef<HTMLParagraphElement>(null);

  // Apply all style props directly
  return (
    <p className="whitespace-pre-wrap" suppressContentEditableWarning contentEditable={isEditing} onBlur={onBlur} ref={textRef}>
      {content || '请输入文本内容'}
    </p>
  );
};

// 组件配置
const TextComp: ComponentConfig = {
  config: {
    name: '文本',
    compName: 'Text',
    compType: Text,
    compProps: [
      {
        key: 'content',
        label: '文本内容',
        type: 'string',
        defaultValue: 'Hello World',
      },
    ],
    isEditable: true,
    isContainer: false,
  },
  defaultProps: {
    styleProps: {
      position: 'absolute',
    },
  },
};

export default TextComp;
