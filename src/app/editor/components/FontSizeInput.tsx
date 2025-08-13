'use client';

import React from 'react';
import { Select, SelectItem } from '../../innerComponents/uiComponents/Select';
import type { CSSProperties } from 'react';
import { editorStyles } from '../../styles/editorStyles';

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
    return match ? { value: parseFloat(match[1]), unit: match[2] as FontSizeUnit } : { value: 16, unit: 'px' as FontSizeUnit };
  };

  const { value: numValue, unit } = parseValue(value);

  const handleNumberChange = (val: string) => {
    const num = parseFloat(val);
    if (!isNaN(num)) {
      onChange?.(unit === 'px' ? num : `${num}${unit}`);
    }
  };

  const handleUnitChange = (newUnit: string) => {
    const unit = newUnit as FontSizeUnit;
    onChange?.(unit === 'px' ? numValue : `${numValue}${unit}`);
  };

  return (
    <div className="flex">
      <input
        className={`${editorStyles.form.inputNumber} rounded-r-none`}
        type="number"
        value={numValue}
        onChange={(e) => handleNumberChange(e.target.value)}
        min={0}
        step={0.1}
      />
      <Select value={unit} onValueChange={handleUnitChange} className={editorStyles.select.trigger}>
        <SelectItem value="px" className={`${editorStyles.dropdown.item} ${editorStyles.text.primary}`}>
          px
        </SelectItem>
        <SelectItem value="rem" className={`${editorStyles.dropdown.item} ${editorStyles.text.primary}`}>
          rem
        </SelectItem>
        <SelectItem value="em" className={`${editorStyles.dropdown.item} ${editorStyles.text.primary}`}>
          em
        </SelectItem>
        <SelectItem value="%" className={`${editorStyles.dropdown.item} ${editorStyles.text.primary}`}>
          %
        </SelectItem>
      </Select>
    </div>
  );
};

export default FontSizeInput;
