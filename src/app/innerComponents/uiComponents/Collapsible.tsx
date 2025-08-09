'use client';

import * as React from 'react';
import * as RadixCollapsible from '@radix-ui/react-collapsible';

interface CollapsibleProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  defaultOpen?: boolean;
}

const Collapsible = React.forwardRef<HTMLDivElement, CollapsibleProps>(
  ({ children, className, ...props }, forwardedRef) => {
    return (
      <RadixCollapsible.Root {...props} ref={forwardedRef} className={className}>
        {children}
      </RadixCollapsible.Root>
    );
  },
);

Collapsible.displayName = 'Collapsible';

interface CollapsibleTriggerProps {
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

const CollapsibleTrigger = React.forwardRef<HTMLButtonElement, CollapsibleTriggerProps>(
  ({ children, className, ...props }, forwardedRef) => {
    return (
      <RadixCollapsible.Trigger {...props} ref={forwardedRef} className={className}>
        {children}
      </RadixCollapsible.Trigger>
    );
  },
);

CollapsibleTrigger.displayName = 'CollapsibleTrigger';

interface CollapsibleContentProps {
  children: React.ReactNode;
  className?: string;
}

const CollapsibleContent = React.forwardRef<HTMLDivElement, CollapsibleContentProps>(
  ({ children, className, ...props }, forwardedRef) => {
    return (
      <RadixCollapsible.Content {...props} ref={forwardedRef} className={className}>
        {children}
      </RadixCollapsible.Content>
    );
  },
);

CollapsibleContent.displayName = 'CollapsibleContent';

export { Collapsible, CollapsibleTrigger, CollapsibleContent };