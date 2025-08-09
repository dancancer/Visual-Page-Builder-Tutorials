'use client';

import React from 'react';
import { ToggleExample } from '../innerComponents/uiComponents/examples';

export default function ToggleExamplePage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Toggle Component Example</h1>
      <ToggleExample />
    </div>
  );
}