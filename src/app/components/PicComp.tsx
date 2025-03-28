'use client';

import React from 'react';
import { ComponentConfig } from '../common/types';
import defaultPic from './assets/default.png';

// 组件实现
const Pic: React.FC<ComponentConfig> = (props) => {
  const { compProps, styleProps } = props;
  const { imageSrc } = compProps || {};
  const { width, height } = styleProps || {};

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      style={{ ...styleProps, userSelect: 'none' }}
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
  compName: 'Pic',
  config: {
    name: '图片',
    compProps: [
      {
        key: 'imageSrc',
        label: '图片地址',
        type: 'image',
        defaultValue: '',
      },
    ],
  },
  styleProps: {
    width: '50px',
    height: '50px',
  },
  compType: Pic,
  domType: 'img',
};

export default PicComp;
