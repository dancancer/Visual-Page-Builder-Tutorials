'use client';

import * as React from 'react';
import * as RadixContextMenu from '@radix-ui/react-context-menu';

interface ContextMenuProps {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  defaultOpen?: boolean;
  modal?: boolean;
}

const ContextMenu = ({ children, ...props }: ContextMenuProps) => {
  return (
    <RadixContextMenu.Root {...props}>
      {children}
    </RadixContextMenu.Root>
  );
};

ContextMenu.displayName = 'ContextMenu';

interface ContextMenuTriggerProps {
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

const ContextMenuTrigger = React.forwardRef<HTMLDivElement, ContextMenuTriggerProps>(
  ({ children, className, ...props }, forwardedRef) => {
    return (
      <RadixContextMenu.Trigger {...props} ref={forwardedRef} className={className}>
        {children}
      </RadixContextMenu.Trigger>
    );
  },
);

ContextMenuTrigger.displayName = 'ContextMenuTrigger';

interface ContextMenuContentProps {
  children: React.ReactNode;
  className?: string;
  side?: 'top' | 'right' | 'bottom' | 'left';
  sideOffset?: number;
}

const ContextMenuContent = React.forwardRef<HTMLDivElement, ContextMenuContentProps>(
  ({ children, className, ...props }, forwardedRef) => {
    return (
      <RadixContextMenu.Portal>
        <RadixContextMenu.Content {...props} ref={forwardedRef} className={className}>
          {children}
        </RadixContextMenu.Content>
      </RadixContextMenu.Portal>
    );
  },
);

ContextMenuContent.displayName = 'ContextMenuContent';

interface ContextMenuItemProps {
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  onSelect?: (event: Event) => void;
}

const ContextMenuItem = React.forwardRef<HTMLDivElement, ContextMenuItemProps>(
  ({ children, className, ...props }, forwardedRef) => {
    return (
      <RadixContextMenu.Item {...props} ref={forwardedRef} className={className}>
        {children}
      </RadixContextMenu.Item>
    );
  },
);

ContextMenuItem.displayName = 'ContextMenuItem';

export { ContextMenu, ContextMenuTrigger, ContextMenuContent, ContextMenuItem };