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

export type ComponentData = {
  id?: number;
  parentId?: number | null;
  styleProps?: React.CSSProperties | undefined;
  compProps?: {
    [key: string]: number | number[] | string | string[] | undefined | boolean;
  };
  children?: Array<number> | undefined;
  config?: {
    name: string;
    compName: string;
    isEditable?: boolean;
    isContainer?: boolean;
  };
};

export type ComponentConfig = {
  config: {
    name: string;
    compProps: PropConfig[];
    isEditable?: boolean;
    isContainer?: boolean;
    compName: string;
    domType?: string | undefined;
    compType?: React.FC<ComponentData>;
  };
  defaultProps?: ComponentData;
};

export type PropType = 'string' | 'number' | 'color' | 'select' | 'switch' | 'image' | 'boolean';

export interface ComponentMetadata {
  name: string;
  props: PropConfig[];
}
