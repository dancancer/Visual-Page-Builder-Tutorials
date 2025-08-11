'use client';

import React from 'react';
import { ComponentConfig, ComponentData } from '../common/types';

// 组件实现
const Wrap: React.FC<ComponentData> = (props) => {
  const { children } = props;
  // 容器依托到包装组件上
  return <>{children}</>;
};

// 组件配置
const WrapComp: ComponentConfig = {
  config: {
    compName: 'Wrap',
    name: '容器',
    compProps: [],
    isContainer: true,
    compType: Wrap,
    domType: 'div',
  },
  defaultProps: {
    styleProps: {
      width: '200px',
      height: '150px',
      position: 'absolute',
    },
  },
};

export default WrapComp;
