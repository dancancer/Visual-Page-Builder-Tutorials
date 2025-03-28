'use client';

import React from 'react';
import { ComponentConfig } from '../common/types';

// 组件实现
const Wrap: React.FC<ComponentConfig> = (props) => {
  const { styleProps, children } = props;

  return <div style={{ ...styleProps }}>{children}</div>;
};

// 组件配置
const WrapComp: ComponentConfig = {
  compName: 'Wrap',
  config: {
    name: '容器',
    compProps: [],
  },
  styleProps: {
    width: '50px',
    height: '50px',
  },
  compType: Wrap,
  domType: 'div',
  hasSlot: true,
};

export default WrapComp;
