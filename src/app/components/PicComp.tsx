'use client';

import React from 'react';
import { ComponentConfig, ComponentData } from '../common/types';
import defaultPic from './assets/default.png';

// 组件实现
const Pic: React.FC<ComponentData> = (props) => {
  const { compProps, styleProps } = props;
  const { imageSrc } = compProps || {};
  const { width, height } = styleProps || {};

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      style={{ userSelect: 'none' }}
      draggable="false"
      src={String(imageSrc || defaultPic.src)}
      height={height || '50px'}
      width={width || '50px'}
      alt="图片"
    />
  );
};

// 组件配置
const PicComp: ComponentConfig = {
  config: {
    compName: 'Pic',
    name: '图片',
    compType: Pic,
    domType: 'img',
    compProps: [
      {
        key: 'imageSrc',
        label: '图片地址',
        type: 'image',
        defaultValue: '',
      },
    ],
  },
  defaultProps: {
    styleProps: {
      width: '50px',
      height: '50px',
      position: 'absolute',
    },
  },
};

export default PicComp;
