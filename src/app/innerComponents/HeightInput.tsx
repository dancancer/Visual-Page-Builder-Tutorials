'use client';

import React from 'react';
import { Select, SelectItem } from './uiComponents/Select';
import type { CSSProperties } from 'react';
import { editorStyles } from '../styles/editorStyles';

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
    <div className="flex">
      {!['auto', 'max-content', 'min-content', 'fit-content'].includes(unit) && (
        <input
          className={`${editorStyles.form.inputNumber} rounded-r-none`}
          type="number"
          value={numValue}
          onChange={(e) => handleNumberChange(e.target.value)}
          min={0}
          step={1}
        />
      )}
      <Select value={unit} onValueChange={handleUnitChange} className={editorStyles.select.trigger}>
        <SelectItem value="px" className={`${editorStyles.dropdown.item} ${editorStyles.text.primary}`}>
          px
        </SelectItem>
        <SelectItem value="%" className={`${editorStyles.dropdown.item} ${editorStyles.text.primary}`}>
          %
        </SelectItem>
        <SelectItem value="vh" className={`${editorStyles.dropdown.item} ${editorStyles.text.primary}`}>
          vh
        </SelectItem>
        <SelectItem value="rem" className={`${editorStyles.dropdown.item} ${editorStyles.text.primary}`}>
          rem
        </SelectItem>
        <SelectItem value="em" className={`${editorStyles.dropdown.item} ${editorStyles.text.primary}`}>
          em
        </SelectItem>
        <SelectItem value="auto" className={`${editorStyles.dropdown.item} ${editorStyles.text.primary}`}>
          auto
        </SelectItem>
        <SelectItem value="max-content" className={`${editorStyles.dropdown.item} ${editorStyles.text.primary}`}>
          max-content
        </SelectItem>
        <SelectItem value="min-content" className={`${editorStyles.dropdown.item} ${editorStyles.text.primary}`}>
          min-content
        </SelectItem>
        <SelectItem value="fit-content" className={`${editorStyles.dropdown.item} ${editorStyles.text.primary}`}>
          fit-content
        </SelectItem>
      </Select>
    </div>
  );
};

export default HeightInput;