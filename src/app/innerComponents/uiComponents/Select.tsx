'use client';

import * as React from 'react';
import * as RadixSelect from '@radix-ui/react-select';
import { CheckIcon, ChevronDownIcon, ChevronUpIcon } from '@radix-ui/react-icons';
import './select.css';

interface SelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
  defaultValue?: string;
  className?: string;
  disabled?: boolean;
}

const Select = React.forwardRef<HTMLButtonElement, SelectProps>(({ children, className, ...props }, forwardedRef) => {
  return (
    <RadixSelect.Root {...props}>
      <RadixSelect.Trigger ref={forwardedRef} className={className || 'SelectTrigger'}>
        <RadixSelect.Value />
        <RadixSelect.Icon className="SelectIcon">
          <ChevronDownIcon />
        </RadixSelect.Icon>
      </RadixSelect.Trigger>
      <RadixSelect.Portal>
        <RadixSelect.Content className="SelectContent">
          <RadixSelect.ScrollUpButton className="SelectScrollButton">
            <ChevronUpIcon />
          </RadixSelect.ScrollUpButton>
          <RadixSelect.Viewport className="SelectViewport">{children}</RadixSelect.Viewport>
          <RadixSelect.ScrollDownButton className="SelectScrollButton">
            <ChevronDownIcon />
          </RadixSelect.ScrollDownButton>
        </RadixSelect.Content>
      </RadixSelect.Portal>
    </RadixSelect.Root>
  );
});

Select.displayName = 'Select';

interface SelectItemProps {
  value: string;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

const SelectItem = React.forwardRef<HTMLDivElement, SelectItemProps>(({ children, className, ...props }, forwardedRef) => {
  return (
    <RadixSelect.Item {...props} ref={forwardedRef} className={className + ' SelectItem'}>
      <RadixSelect.ItemText>{children}</RadixSelect.ItemText>
      <RadixSelect.ItemIndicator className="SelectItemIndicator">
        <CheckIcon />
      </RadixSelect.ItemIndicator>
    </RadixSelect.Item>
  );
});

SelectItem.displayName = 'SelectItem';

export { Select, SelectItem };
