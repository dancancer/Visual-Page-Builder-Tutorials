'use client';

import * as React from 'react';
import * as RadixDropdownMenu from '@radix-ui/react-dropdown-menu';

interface DropdownMenuProps {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  defaultOpen?: boolean;
  modal?: boolean;
}

const DropdownMenu = ({ children, ...props }: DropdownMenuProps) => {
  return (
    <RadixDropdownMenu.Root {...props}>
      {children}
    </RadixDropdownMenu.Root>
  );
};

DropdownMenu.displayName = 'DropdownMenu';

interface DropdownMenuTriggerProps {
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

const DropdownMenuTrigger = React.forwardRef<HTMLButtonElement, DropdownMenuTriggerProps>(
  ({ children, className, ...props }, forwardedRef) => {
    return (
      <RadixDropdownMenu.Trigger {...props} ref={forwardedRef} className={className}>
        {children}
      </RadixDropdownMenu.Trigger>
    );
  },
);

DropdownMenuTrigger.displayName = 'DropdownMenuTrigger';

interface DropdownMenuContentProps {
  children: React.ReactNode;
  className?: string;
  side?: 'top' | 'right' | 'bottom' | 'left';
  sideOffset?: number;
}

const DropdownMenuContent = React.forwardRef<HTMLDivElement, DropdownMenuContentProps>(
  ({ children, className, ...props }, forwardedRef) => {
    return (
      <RadixDropdownMenu.Portal>
        <RadixDropdownMenu.Content {...props} ref={forwardedRef} className={className}>
          {children}
        </RadixDropdownMenu.Content>
      </RadixDropdownMenu.Portal>
    );
  },
);

DropdownMenuContent.displayName = 'DropdownMenuContent';

interface DropdownMenuItemProps {
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  onSelect?: (event: Event) => void;
}

const DropdownMenuItem = React.forwardRef<HTMLDivElement, DropdownMenuItemProps>(
  ({ children, className, ...props }, forwardedRef) => {
    return (
      <RadixDropdownMenu.Item {...props} ref={forwardedRef} className={className}>
        {children}
      </RadixDropdownMenu.Item>
    );
  },
);

DropdownMenuItem.displayName = 'DropdownMenuItem';

export { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem };