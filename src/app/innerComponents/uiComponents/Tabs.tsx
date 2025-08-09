'use client';

import * as React from 'react';
import * as RadixTabs from '@radix-ui/react-tabs';

interface TabsProps {
  value?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
  className?: string;
  defaultValue?: string;
  orientation?: 'horizontal' | 'vertical';
}

const Tabs = React.forwardRef<HTMLDivElement, TabsProps>(
  ({ children, className, ...props }, forwardedRef) => {
    return (
      <RadixTabs.Root {...props} ref={forwardedRef} className={className}>
        {children}
      </RadixTabs.Root>
    );
  },
);

Tabs.displayName = 'Tabs';

interface TabsListProps {
  children: React.ReactNode;
  className?: string;
}

const TabsList = React.forwardRef<HTMLDivElement, TabsListProps>(
  ({ children, className, ...props }, forwardedRef) => {
    return (
      <RadixTabs.List {...props} ref={forwardedRef} className={className}>
        {children}
      </RadixTabs.List>
    );
  },
);

TabsList.displayName = 'TabsList';

interface TabsTriggerProps {
  value: string;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

const TabsTrigger = React.forwardRef<HTMLButtonElement, TabsTriggerProps>(
  ({ children, className, ...props }, forwardedRef) => {
    return (
      <RadixTabs.Trigger {...props} ref={forwardedRef} className={className}>
        {children}
      </RadixTabs.Trigger>
    );
  },
);

TabsTrigger.displayName = 'TabsTrigger';

interface TabsContentProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

const TabsContent = React.forwardRef<HTMLDivElement, TabsContentProps>(
  ({ children, className, ...props }, forwardedRef) => {
    return (
      <RadixTabs.Content {...props} ref={forwardedRef} className={className}>
        {children}
      </RadixTabs.Content>
    );
  },
);

TabsContent.displayName = 'TabsContent';

export { Tabs, TabsList, TabsTrigger, TabsContent };