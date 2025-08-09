'use client';

import React, { useState } from 'react';
import { Toggle } from '../Toggle';
import { FontBoldIcon, FontItalicIcon, UnderlineIcon } from '@radix-ui/react-icons';

export function ToggleExample() {
  const [boldPressed, setBoldPressed] = useState(false);
  const [italicPressed, setItalicPressed] = useState(false);
  const [underlinePressed, setUnderlinePressed] = useState(false);

  return (
    <div className="flex flex-col gap-4 p-4">
      <h2 className="text-lg font-medium">Toggle Examples</h2>
      
      <div className="flex gap-2">
        <Toggle 
          pressed={boldPressed} 
          onPressedChange={setBoldPressed}
        >
          <FontBoldIcon />
        </Toggle>
        
        <Toggle 
          pressed={italicPressed} 
          onPressedChange={setItalicPressed}
        >
          <FontItalicIcon />
        </Toggle>
        
        <Toggle 
          pressed={underlinePressed} 
          onPressedChange={setUnderlinePressed}
        >
          <UnderlineIcon />
        </Toggle>
      </div>
      
      <div className="mt-4">
        <p className="text-sm">
          Current state: 
          <span className={boldPressed ? 'font-bold' : ''}>
            {boldPressed ? 'Bold ' : ''}
          </span>
          <span className={italicPressed ? 'italic' : ''}>
            {italicPressed ? 'Italic ' : ''}
          </span>
          <span className={underlinePressed ? 'underline' : ''}>
            {underlinePressed ? 'Underline' : ''}
          </span>
          {!boldPressed && !italicPressed && !underlinePressed && 'No styles applied'}
        </p>
      </div>
      
      <div className="mt-4">
        <h3 className="text-md font-medium">Disabled Toggle</h3>
        <div className="mt-2">
          <Toggle disabled>
            Disabled
          </Toggle>
        </div>
      </div>
    </div>
  );
}