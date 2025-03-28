'use client';

import React, { useState } from 'react';
import { Input, Select } from 'antd';
import type { CSSProperties } from 'react';

const { Option } = Select;

type HeightUnit = 'px' | '%' | 'vh' | 'rem' | 'em' | 'auto' | 'max-content' | 'min-content' | 'fit-content';

interface HeightInputProps {
  value?: CSSProperties['height'];
  onChange?: (value: CSSProperties['height']) => void;
}

const HeightInput: React.FC<HeightInputProps> = ({ value = '100px', onChange }) => {
  const parseValue = (val: CSSProperties['height']) => {
    if (typeof val === 'number') {
      return { value: val, unit: 'px' as HeightUnit };
    }
    if (typeof val === 'string') {
      if (['auto', 'max-content', 'min-content', 'fit-content'].includes(val)) {
        return { value: 0, unit: val as HeightUnit };
      }
      const match = String(val).match(/^(\d+(?:\.\d+)?)(px|%|vh|rem|em)$/);
      return match
        ? { value: parseFloat(match[1]), unit: match[2] as HeightUnit }
        : { value: 100, unit: 'px' as HeightUnit };
    }
    return { value: 100, unit: 'px' as HeightUnit };
  };

  const { value: numValue, unit } = parseValue(value);

  const handleNumberChange = (val: string) => {
    if (unit === 'auto' || unit === 'max-content' || unit === 'min-content' || unit === 'fit-content') {
      return;
    }
    const num = parseFloat(val);
    if (!isNaN(num)) {
      onChange?.(unit === 'px' ? num : `${num}${unit}`);
    }
  };

  const handleUnitChange = (newUnit: HeightUnit) => {
    if (['auto', 'max-content', 'min-content', 'fit-content'].includes(newUnit)) {
      onChange?.(newUnit);
    } else {
      onChange?.(newUnit === 'px' ? numValue : `${numValue}${newUnit}`);
    }
  };

  return (
    <Input.Group compact>
      {!['auto', 'max-content', 'min-content', 'fit-content'].includes(unit) && (
        <Input
          style={{ width: 'calc(100% - 120px)' }}
          type="number"
          value={numValue}
          onChange={(e) => handleNumberChange(e.target.value)}
          min={0}
          step={1}
        />
      )}
      <Select
        style={{ width: 120 }}
        value={unit}
        onChange={handleUnitChange}
      >
        <Option value="px">px</Option>
        <Option value="%">%</Option>
        <Option value="vh">vh</Option>
        <Option value="rem">rem</Option>
        <Option value="em">em</Option>
        <Option value="auto">auto</Option>
        <Option value="max-content">max-content</Option>
        <Option value="min-content">min-content</Option>
        <Option value="fit-content">fit-content</Option>
      </Select>
    </Input.Group>
  );
};

export default HeightInput;