import React from 'react';

export interface PropConfig {
  key: string;
  label: string;
  type: PropType;
  defaultValue?: string | number | boolean;
  options?: Array<{ label: string; value: string | number }>; // 用于 select 类型
  min?: number; // 用于 number 类型
  max?: number; // 用于 number 类型
}

export type ComponentConfig = {
  id?: number | undefined;
  compName: string;
  domType?: string | undefined;
  styleProps?: React.CSSProperties | undefined;
  compProps?: {
    [key: string]: number | number[] | string | string[] | undefined;
  };
  parentId?: number | null;
  children?: Array<number> | undefined;
  hasSlot?: boolean;
  compType?: React.FC<ComponentConfig>;
  config?: {
    name: string;
    compProps: PropConfig[];
  };
};

export type PropType = 'string' | 'number' | 'color' | 'select' | 'switch' | 'image';

export interface ComponentMetadata {
  name: string;
  props: PropConfig[];
}
