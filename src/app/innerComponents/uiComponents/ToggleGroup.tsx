'use client';

import * as React from 'react';
import * as RadixToggleGroup from '@radix-ui/react-toggle-group';
import './toggleGroup.css';

interface ToggleGroupProps {
  type: 'single' | 'multiple';
  value?: string | string[];
  onValueChange?: (value: string | string[]) => void;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  rovingFocus?: boolean;
  orientation?: 'horizontal' | 'vertical';
}

const ToggleGroup = React.forwardRef<HTMLDivElement, ToggleGroupProps>(({ children, className, ...props }, forwardedRef) => {
  return (
    <RadixToggleGroup.Root {...props} ref={forwardedRef} className={className || 'ToggleGroup'}>
      {children}
    </RadixToggleGroup.Root>
  );
});

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
