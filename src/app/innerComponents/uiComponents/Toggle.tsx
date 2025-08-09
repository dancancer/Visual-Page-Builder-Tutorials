'use client';

import * as React from 'react';
import * as RadixToggle from '@radix-ui/react-toggle';
import './toggle.css';

interface ToggleProps {
  pressed?: boolean;
  onPressedChange?: (pressed: boolean) => void;
  className?: string;
  disabled?: boolean;
  children: React.ReactNode;
  defaultPressed?: boolean;
  asChild?: boolean;
}

const Toggle = React.forwardRef<HTMLButtonElement, ToggleProps>(
  ({ children, className, ...props }, forwardedRef) => {
    return (
      <RadixToggle.Root {...props} ref={forwardedRef} className={className || 'Toggle'}>
        {children}
      </RadixToggle.Root>
    );
  },
);

Toggle.displayName = 'Toggle';

export { Toggle };