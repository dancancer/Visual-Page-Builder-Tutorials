'use client';

import React, { useRef } from 'react';
import { ComponentConfig } from '../common/types';

// 组件实现
const Text: React.FC<ComponentConfig> = (props) => {
  const { compProps } = props;
  const { content } = compProps || {};
  const textRef = useRef<HTMLParagraphElement>(null);

  // Apply all style props directly
  return <p ref={textRef}>{content || '请输入文本内容'}</p>;
};

// 组件配置
const TextComp: ComponentConfig = {
  compName: 'Text',
  config: {
    name: '文本',
    compProps: [
      {
        key: 'content',
        label: '文本内容',
        type: 'string',
        defaultValue: 'Hello World',
      },
    ],
  },
  styleProps: {
    position: 'absolute',
  },
  compType: Text,
};

export default TextComp;
