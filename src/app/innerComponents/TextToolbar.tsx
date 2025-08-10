'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Toggle } from './uiComponents/Toggle';
import { ToggleGroup, ToggleGroupItem } from './uiComponents/ToggleGroup';
import { Select, SelectItem } from './uiComponents/Select';
import {
  TextAlignLeftIcon,
  TextAlignCenterIcon,
  TextAlignRightIcon,
  TextAlignJustifyIcon,
  FontBoldIcon,
  FontItalicIcon,
  StrikethroughIcon,
  UnderlineIcon,
} from '@radix-ui/react-icons';
import useEditorStore from '../store/editorStore';
import { editorStyles } from '../styles/editorStyles';

interface TextToolbarProps {
  onUpdateStyle?: (styleUpdates: Record<string, string>) => void;
}

const TextToolbar: React.FC<TextToolbarProps> = ({ onUpdateStyle }) => {
  // Use separate selectors to avoid unnecessary re-renders
  const selectedComponentId = useEditorStore((state) => state.selectedComponentId);
  const componentTree = useEditorStore((state) => state.componentTree);

  // Get the actual selected component from the component tree
  const selectedComponent = selectedComponentId !== null ? componentTree[selectedComponentId] : null;

  const [isVisible, setIsVisible] = useState(false);
  const [currentStyles, setCurrentStyles] = useState<React.CSSProperties>({});
  const [hasUnderline, setHasUnderline] = useState(false);
  const [hasStrikethrough, setHasStrikethrough] = useState(false);

  // Check if selected component is a text component
  useEffect(() => {
    if (selectedComponent && selectedComponent.config?.compName === 'Text') {
      setIsVisible(true);
      const styleProps = selectedComponent.styleProps || {};
      setCurrentStyles(styleProps);

      // 初始化下划线和删除线状态
      const textDecoration = (styleProps.textDecoration as string) || '';
      setHasUnderline(textDecoration.includes('underline'));
      setHasStrikethrough(textDecoration.includes('line-through'));
    } else {
      setIsVisible(false);
      setCurrentStyles({});
      setHasUnderline(false);
      setHasStrikethrough(false);
    }
  }, [selectedComponent, selectedComponentId]);

  // 更新文本装饰（下划线和删除线可以共存）
  useEffect(() => {
    let decoration = '';
    if (hasUnderline && hasStrikethrough) {
      decoration = 'underline line-through';
    } else if (hasUnderline) {
      decoration = 'underline';
    } else if (hasStrikethrough) {
      decoration = 'line-through';
    } else {
      decoration = 'none';
    }

    const styleUpdates = { textDecoration: decoration };
    onUpdateStyle?.(styleUpdates);

    // 更新本地状态以提供即时反馈
    setCurrentStyles((prev) => ({ ...prev, textDecoration: decoration }));
  }, [hasStrikethrough, hasUnderline, onUpdateStyle]);

  // 切换下划线
  const toggleUnderline = useCallback(() => {
    setHasUnderline(!hasUnderline);
  }, [hasUnderline]);

  // 切换删除线
  const toggleStrikethrough = useCallback(() => {
    setHasStrikethrough(!hasStrikethrough);
  }, [hasStrikethrough]);

  // Update style handler
  const handleStyleUpdate = useCallback(
    (property: string, value: string) => {
      // 对于textDecoration属性，使用特殊处理
      if (property === 'textDecoration') {
        if (value.includes('underline')) {
          setHasUnderline(true);
        } else if (value.includes('line-through')) {
          setHasStrikethrough(true);
        } else {
          // 如果值为'none'，则清除所有装饰
          setHasUnderline(false);
          setHasStrikethrough(false);
        }
        return;
      }

      const styleUpdates = { [property]: value };
      onUpdateStyle?.(styleUpdates);

      // Update local state for immediate feedback
      setCurrentStyles((prev) => ({ ...prev, [property]: value }));
    },
    [onUpdateStyle],
  );

  // Keyboard shortcuts
  useEffect(() => {
    if (!isVisible) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Only apply shortcuts when modifier keys are pressed
      if (!e.ctrlKey && !e.metaKey) return;

      // Bold: Ctrl/Cmd + B
      if (e.key === 'b' || e.key === 'B') {
        e.preventDefault();
        handleStyleUpdate('fontWeight', currentStyles.fontWeight === 'bold' ? 'normal' : 'bold');
      }
      // Italic: Ctrl/Cmd + I
      else if (e.key === 'i' || e.key === 'I') {
        e.preventDefault();
        handleStyleUpdate('fontStyle', currentStyles.fontStyle === 'italic' ? 'normal' : 'italic');
      }
      // Underline: Ctrl/Cmd + U
      else if (e.key === 'u' || e.key === 'U') {
        e.preventDefault();
        toggleUnderline();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isVisible, currentStyles, hasUnderline, hasStrikethrough, handleStyleUpdate, toggleUnderline]);

  // Font family options
  const fontFamilies = [
    { value: 'Arial, sans-serif', label: 'Arial' },
    { value: 'Helvetica, sans-serif', label: 'Helvetica' },
    { value: 'Times New Roman, serif', label: 'Times New Roman' },
    { value: 'Georgia, serif', label: 'Georgia' },
    { value: 'Verdana, sans-serif', label: 'Verdana' },
    { value: 'Tahoma, sans-serif', label: 'Tahoma' },
    { value: 'Courier New, monospace', label: 'Courier New' },
  ];

  // Font sizes
  const fontSizes = ['12px', '14px', '16px', '18px', '20px', '24px', '28px', '32px', '36px', '48px'];

  if (!isVisible) {
    return null;
  }

  return (
    <div
      className={` fixed top-[50px] border border-gray-200 flex items-center gap-2 p-1 mb-4 flex-wrap bg-white left-1/2 transform -translate-x-1/2 z-1 rounded-lg`}
    >
      {/* Font Family */}
      <div className="flex items-center gap-2">
        <label className={`${editorStyles.form.label} ${editorStyles.text.secondary} whitespace-nowrap`}>字体:</label>
        <Select
          value={currentStyles.fontFamily || 'Arial, sans-serif'}
          onValueChange={(value) => handleStyleUpdate('fontFamily', value)}
          className={`${editorStyles.form.input} w-[120px] flex items-center justify-between`}
        >
          {fontFamilies.map((font) => (
            <SelectItem key={font.value} value={font.value} className="text-xs px-2 py-1 cursor-pointer hover:bg-gray-100 outline-none">
              {font.label}
            </SelectItem>
          ))}
        </Select>
      </div>

      {/* Font Size */}
      <div className="flex items-center gap-2">
        <label className={`${editorStyles.form.label} ${editorStyles.text.secondary} whitespace-nowrap`}>大小:</label>
        <Select
          value={currentStyles.fontSize?.toString() || '16px'}
          onValueChange={(value) => handleStyleUpdate('fontSize', value)}
          className={`${editorStyles.form.input} w-[80px] flex items-center justify-between`}
        >
          {fontSizes.map((size) => (
            <SelectItem key={size} value={size} className="px-2 py-1 cursor-pointer hover:bg-gray-100 outline-none">
              {size}
            </SelectItem>
          ))}
        </Select>
      </div>

      {/* Color Picker */}
      <div className="flex items-center gap-2">
        <label className={`${editorStyles.form.label} ${editorStyles.text.secondary} whitespace-nowrap`}>颜色:</label>
        <input
          type="color"
          className="w-8 h-8 p-0 border border-gray-300 rounded cursor-pointer"
          value={currentStyles.color || '#000000'}
          onChange={(e) => handleStyleUpdate('color', e.target.value)}
        />
      </div>

      {/* Formatting Toggles */}
      <div className="flex items-center gap-1">
        <div className="flex gap-1">
          <Toggle
            pressed={currentStyles.fontWeight === 'bold'}
            onPressedChange={(pressed) => handleStyleUpdate('fontWeight', pressed ? 'bold' : 'normal')}
            aria-label="粗体"
          >
            <FontBoldIcon />
          </Toggle>
          <Toggle
            pressed={currentStyles.fontStyle === 'italic'}
            onPressedChange={(pressed) => handleStyleUpdate('fontStyle', pressed ? 'italic' : 'normal')}
            aria-label="斜体"
          >
            <FontItalicIcon />
          </Toggle>
          <Toggle pressed={hasStrikethrough} onPressedChange={() => toggleStrikethrough()} aria-label="删除线">
            <StrikethroughIcon />
          </Toggle>
          <Toggle pressed={hasUnderline} onPressedChange={() => toggleUnderline()} aria-label="下划线">
            <UnderlineIcon />
          </Toggle>
        </div>
      </div>

      {/* Alignment */}
      <div className="flex items-center gap-1">
        <ToggleGroup
          type="single"
          value={currentStyles.textAlign || 'left'}
          onValueChange={(value) => {
            if (value) handleStyleUpdate('textAlign', value.toString());
          }}
          className="flex"
        >
          <ToggleGroupItem value="left" aria-label="左对齐">
            <TextAlignLeftIcon />
          </ToggleGroupItem>
          <ToggleGroupItem value="center" aria-label="居中">
            <TextAlignCenterIcon />
          </ToggleGroupItem>
          <ToggleGroupItem value="right" aria-label="右对齐">
            <TextAlignRightIcon />
          </ToggleGroupItem>
          <ToggleGroupItem value="justify" aria-label="两端对齐">
            <TextAlignJustifyIcon />
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      {/* Letter Spacing */}
      {/* <div className="flex items-center gap-2">
        <label className={`${editorStyles.form.label} ${editorStyles.text.secondary} whitespace-nowrap`}>字间距:</label>
        <input
          type="number"
          className={editorStyles.form.inputNumber}
          value={parseFloat(currentStyles.letterSpacing as string) || 0}
          onChange={(e) => handleStyleUpdate('letterSpacing', `${e.target.value}px`)}
          style={{ width: '60px' }}
          min="0"
          step="0.1"
        />
      </div> */}

      {/* Line Height */}
      {/* <div className="flex items-center gap-2">
        <label className={`${editorStyles.form.label} ${editorStyles.text.secondary} whitespace-nowrap`}>行高:</label>
        <input
          type="number"
          className={editorStyles.form.inputNumber}
          value={parseFloat(currentStyles.lineHeight as string) || 1.2}
          onChange={(e) => handleStyleUpdate('lineHeight', e.target.value)}
          style={{ width: '60px' }}
          min="0.5"
          step="0.1"
        />
      </div> */}
    </div>
  );
};

export default TextToolbar;
