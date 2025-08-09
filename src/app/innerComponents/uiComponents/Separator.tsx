'use client';

import * as React from 'react';
import * as RadixSeparator from '@radix-ui/react-separator';

interface SeparatorProps {
  orientation?: 'horizontal' | 'vertical';
  decorative?: boolean;
  className?: string;
}

const Separator = React.forwardRef<HTMLDivElement, SeparatorProps>(
  ({ className, ...props }, forwardedRef) => {
    return (
      <RadixSeparator.Root {...props} ref={forwardedRef} className={className} />
    );
  },
);

Separator.displayName = 'Separator';

export { Separator };