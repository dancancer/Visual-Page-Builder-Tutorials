'use client';

import * as React from 'react';
import * as RadixSlider from '@radix-ui/react-slider';

interface SliderProps {
  value?: number[];
  onValueChange?: (value: number[]) => void;
  className?: string;
  disabled?: boolean;
  min?: number;
  max?: number;
  step?: number;
  orientation?: 'horizontal' | 'vertical';
  defaultValue?: number[];
}

const Slider = React.forwardRef<HTMLSpanElement, SliderProps>(
  ({ className, ...props }, forwardedRef) => {
    return (
      <RadixSlider.Root {...props} ref={forwardedRef} className={className}>
        <RadixSlider.Track>
          <RadixSlider.Range />
        </RadixSlider.Track>
        <RadixSlider.Thumb />
      </RadixSlider.Root>
    );
  },
);

Slider.displayName = 'Slider';

export { Slider };