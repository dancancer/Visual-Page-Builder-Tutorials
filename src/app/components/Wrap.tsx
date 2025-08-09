'use client';

import React from 'react';
import { ComponentConfig } from '../common/types';

// 组件实现
const Wrap: React.FC<ComponentConfig> = (props) => {
  const { children } = props;
  // 容器依托到包装组件上
  return <>{children}</>;
};

// 组件配置
const WrapComp: ComponentConfig = {
  compName: 'Wrap',
  config: {
    name: '容器',
    compProps: [
      {
        key: 'hasSlot',
        label: '是否可有子元素',
        type: 'boolean',
        defaultValue: true,
      },
    ],
  },
  styleProps: {
    width: '200px',
    height: '150px',
  },
  compType: Wrap,
  domType: 'div',
};

export default WrapComp;
