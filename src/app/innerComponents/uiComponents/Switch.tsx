'use client';

import * as React from 'react';
import * as RadixSwitch from '@radix-ui/react-switch';

interface SwitchProps {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  className?: string;
  disabled?: boolean;
  required?: boolean;
  name?: string;
  value?: string;
  id?: string;
}

const Switch = React.forwardRef<HTMLButtonElement, SwitchProps>(
  ({ className, ...props }, forwardedRef) => {
    return (
      <RadixSwitch.Root {...props} ref={forwardedRef} className={className}>
        <RadixSwitch.Thumb />
      </RadixSwitch.Root>
    );
  },
);

Switch.displayName = 'Switch';

export { Switch };