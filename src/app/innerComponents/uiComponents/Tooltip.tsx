'use client';

import * as React from 'react';
import * as RadixTooltip from '@radix-ui/react-tooltip';

interface TooltipProviderProps {
  children: React.ReactNode;
  delayDuration?: number;
  skipDelayDuration?: number;
  disableHoverableContent?: boolean;
}

const TooltipProvider: React.FC<TooltipProviderProps> = ({ children, ...props }) => {
  return <RadixTooltip.Provider {...props}>{children}</RadixTooltip.Provider>;
};

TooltipProvider.displayName = 'TooltipProvider';

interface TooltipProps {
  children: React.ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  delayDuration?: number;
}

const Tooltip = ({ children, ...props }: TooltipProps) => {
  return (
    <RadixTooltip.Root {...props}>
      {children}
    </RadixTooltip.Root>
  );
};

Tooltip.displayName = 'Tooltip';

interface TooltipTriggerProps {
  children: React.ReactNode;
  className?: string;
}

const TooltipTrigger = React.forwardRef<HTMLButtonElement, TooltipTriggerProps>(
  ({ children, className, ...props }, forwardedRef) => {
    return (
      <RadixTooltip.Trigger {...props} ref={forwardedRef} className={className}>
        {children}
      </RadixTooltip.Trigger>
    );
  },
);

TooltipTrigger.displayName = 'TooltipTrigger';

interface TooltipContentProps {
  children: React.ReactNode;
  className?: string;
  side?: 'top' | 'right' | 'bottom' | 'left';
  sideOffset?: number;
}

const TooltipContent = React.forwardRef<HTMLDivElement, TooltipContentProps>(
  ({ children, className, ...props }, forwardedRef) => {
    return (
      <RadixTooltip.Content {...props} ref={forwardedRef} className={className}>
        {children}
        <RadixTooltip.Arrow />
      </RadixTooltip.Content>
    );
  },
);

TooltipContent.displayName = 'TooltipContent';

export { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent };