'use client';

import React, { useState } from 'react';
import { Input, Select } from 'antd';
import type { CSSProperties } from 'react';

const { Option } = Select;

type FontSizeUnit = 'px' | 'rem' | 'em' | '%';

interface FontSizeInputProps {
  value?: CSSProperties['fontSize'];
  onChange?: (value: CSSProperties['fontSize']) => void;
}

const FontSizeInput: React.FC<FontSizeInputProps> = ({ value = '16px', onChange }) => {
  const parseValue = (val: CSSProperties['fontSize']) => {
    if (typeof val === 'number') {
      return { value: val, unit: 'px' as FontSizeUnit };
    }
    const match = String(val).match(/^(\d+(?:\.\d+)?)(px|rem|em|%)$/);
    return match
      ? { value: parseFloat(match[1]), unit: match[2] as FontSizeUnit }
      : { value: 16, unit: 'px' as FontSizeUnit };
  };

  const { value: numValue, unit } = parseValue(value);

  const handleNumberChange = (val: string) => {
    const num = parseFloat(val);
    if (!isNaN(num)) {
      onChange?.(unit === 'px' ? num : `${num}${unit}`);
    }
  };

  const handleUnitChange = (newUnit: FontSizeUnit) => {
    onChange?.(newUnit === 'px' ? numValue : `${numValue}${newUnit}`);
  };

  return (
    <Input.Group compact>
      <Input
        style={{ width: 'calc(100% - 80px)' }}
        type="number"
        value={numValue}
        onChange={(e) => handleNumberChange(e.target.value)}
        min={0}
        step={0.1}
      />
      <Select
        style={{ width: 80 }}
        value={unit}
        onChange={handleUnitChange}
      >
        <Option value="px">px</Option>
        <Option value="rem">rem</Option>
        <Option value="em">em</Option>
        <Option value="%">%</Option>
      </Select>
    </Input.Group>
  );
};

export default FontSizeInput;