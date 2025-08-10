'use client';

import * as React from 'react';
import * as RadixToggleGroup from '@radix-ui/react-toggle-group';
import './toggleGroup.css';

type ToggleGroupSingleProps = {
  type: 'single';
  value?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  rovingFocus?: boolean;
  orientation?: 'horizontal' | 'vertical';
};

type ToggleGroupMultipleProps = {
  type: 'multiple';
  value?: string[];
  onValueChange?: (value: string[]) => void;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  rovingFocus?: boolean;
  orientation?: 'horizontal' | 'vertical';
};

type ToggleGroupProps = ToggleGroupSingleProps | ToggleGroupMultipleProps;

const ToggleGroup = (props: ToggleGroupProps) => {
  const { children, className, type, ...restProps } = props;
  
  if (type === 'single') {
    const { value, onValueChange, disabled, rovingFocus, orientation } = restProps as ToggleGroupSingleProps;
    return (
      <RadixToggleGroup.Root 
        type="single" 
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        rovingFocus={rovingFocus}
        orientation={orientation}
        className={className || 'ToggleGroup'}
      >
        {children}
      </RadixToggleGroup.Root>
    );
  } else {
    const { value, onValueChange, disabled, rovingFocus, orientation } = restProps as ToggleGroupMultipleProps;
    return (
      <RadixToggleGroup.Root 
        type="multiple" 
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        rovingFocus={rovingFocus}
        orientation={orientation}
        className={className || 'ToggleGroup'}
      >
        {children}
      </RadixToggleGroup.Root>
    );
  }
};

ToggleGroup.displayName = 'ToggleGroup';

interface ToggleGroupItemProps {
  value: string;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

const ToggleGroupItem = React.forwardRef<HTMLButtonElement, ToggleGroupItemProps>(({ children, className, ...props }, forwardedRef) => {
  return (
    <RadixToggleGroup.Item {...props} ref={forwardedRef} className={className || 'ToggleGroupItem'}>
      {children}
    </RadixToggleGroup.Item>
  );
});

ToggleGroupItem.displayName = 'ToggleGroupItem';

export { ToggleGroup, ToggleGroupItem };
