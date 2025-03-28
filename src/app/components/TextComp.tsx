'use client';

import React from 'react';
import { ComponentConfig } from '../common/types';

// 组件实现
const Text: React.FC<ComponentConfig> = (props) => {
  const { compProps, styleProps } = props;
  const { content } = compProps || {};
  const { fontSize, color } = styleProps || {};

  const style: React.CSSProperties = {};
  if (fontSize) {
    style['fontSize'] = fontSize;
  }
  if (color) {
    style['color'] = color;
  }
  return <span style={style}>{content || '请输入文本内容'}</span>;
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
  compType: Text,
  domType: 'span',
};

export default TextComp;
