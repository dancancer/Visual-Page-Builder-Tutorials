'use client';

import React, { useState, useEffect } from 'react';
import { PropConfig } from '../common/types';
import useEditorStore from '../store/editorStore';
import { useCanvasSync } from '../hooks/useCanvasSync';
import { useStoreSync } from '../hooks/useStoreSync';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './uiComponents/Tabs';
import { Select, SelectItem } from './uiComponents/Select';
import { Switch } from './uiComponents/Switch';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from './uiComponents/Collapsible';
import { editorStyles } from '../styles/editorStyles';

// CSS 属性分类
const cssCategories = {
  layout: {
    name: '布局',
    icon: '📐',
    properties: [
      {
        key: 'display',
        label: '显示方式',
        type: 'select',
        options: [
          { label: '块级元素', value: 'block' },
          { label: '行内元素', value: 'inline' },
          { label: '弹性布局', value: 'flex' },
          { label: '网格布局', value: 'grid' },
          { label: '行内块级', value: 'inline-block' },
          { label: '不显示', value: 'none' },
        ],
      },
      {
        key: 'position',
        label: '定位方式',
        type: 'select',
        options: [
          { label: '静态定位', value: 'static' },
          { label: '相对定位', value: 'relative' },
          { label: '绝对定位', value: 'absolute' },
          { label: '固定定位', value: 'fixed' },
          { label: '粘性定位', value: 'sticky' },
        ],
      },
      { key: 'top', label: '上边距', type: 'string' },
      { key: 'right', label: '右边距', type: 'string' },
      { key: 'bottom', label: '下边距', type: 'string' },
      { key: 'left', label: '左边距', type: 'string' },
      { key: 'zIndex', label: '层级', type: 'number' },
      {
        key: 'float',
        label: '浮动',
        type: 'select',
        options: [
          { label: '无', value: 'none' },
          { label: '左浮动', value: 'left' },
          { label: '右浮动', value: 'right' },
        ],
      },
      {
        key: 'clear',
        label: '清除浮动',
        type: 'select',
        options: [
          { label: '无', value: 'none' },
          { label: '左侧', value: 'left' },
          { label: '右侧', value: 'right' },
          { label: '两侧', value: 'both' },
        ],
      },
    ],
  },
  size: {
    name: '尺寸',
    icon: '📏',
    properties: [
      { key: 'width', label: '宽度', type: 'string' },
      { key: 'height', label: '高度', type: 'string' },
      { key: 'minWidth', label: '最小宽度', type: 'string' },
      { key: 'minHeight', label: '最小高度', type: 'string' },
      { key: 'maxWidth', label: '最大宽度', type: 'string' },
      { key: 'maxHeight', label: '最大高度', type: 'string' },
      {
        key: 'boxSizing',
        label: '盒模型',
        type: 'select',
        options: [
          { label: '内容盒', value: 'content-box' },
          { label: '边框盒', value: 'border-box' },
        ],
      },
    ],
  },
  spacing: {
    name: '间距',
    icon: '↔️',
    properties: [
      { key: 'margin', label: '外边距', type: 'string' },
      { key: 'marginTop', label: '上外边距', type: 'string' },
      { key: 'marginRight', label: '右外边距', type: 'string' },
      { key: 'marginBottom', label: '下外边距', type: 'string' },
      { key: 'marginLeft', label: '左外边距', type: 'string' },
      { key: 'padding', label: '内边距', type: 'string' },
      { key: 'paddingTop', label: '上内边距', type: 'string' },
      { key: 'paddingRight', label: '右内边距', type: 'string' },
      { key: 'paddingBottom', label: '下内边距', type: 'string' },
      { key: 'paddingLeft', label: '左内边距', type: 'string' },
    ],
  },
  typography: {
    name: '文字',
    icon: '🔤',
    properties: [
      { key: 'fontFamily', label: '字体', type: 'string' },
      { key: 'fontSize', label: '字号', type: 'string' },
      {
        key: 'fontWeight',
        label: '字重',
        type: 'select',
        options: [
          { label: '正常', value: 'normal' },
          { label: '粗体', value: 'bold' },
          { label: '100', value: '100' },
          { label: '200', value: '200' },
          { label: '300', value: '300' },
          { label: '400', value: '400' },
          { label: '500', value: '500' },
          { label: '600', value: '600' },
          { label: '700', value: '700' },
          { label: '800', value: '800' },
          { label: '900', value: '900' },
        ],
      },
      {
        key: 'fontStyle',
        label: '字体样式',
        type: 'select',
        options: [
          { label: '正常', value: 'normal' },
          { label: '斜体', value: 'italic' },
          { label: '倾斜', value: 'oblique' },
        ],
      },
      { key: 'lineHeight', label: '行高', type: 'string' },
      { key: 'letterSpacing', label: '字间距', type: 'string' },
      {
        key: 'textAlign',
        label: '文本对齐',
        type: 'select',
        options: [
          { label: '左对齐', value: 'left' },
          { label: '居中', value: 'center' },
          { label: '右对齐', value: 'right' },
          { label: '两端对齐', value: 'justify' },
        ],
      },
      {
        key: 'textDecoration',
        label: '文本装饰',
        type: 'select',
        options: [
          { label: '无', value: 'none' },
          { label: '下划线', value: 'underline' },
          { label: '上划线', value: 'overline' },
          { label: '删除线', value: 'line-through' },
        ],
      },
      {
        key: 'textTransform',
        label: '文本转换',
        type: 'select',
        options: [
          { label: '无', value: 'none' },
          { label: '大写', value: 'uppercase' },
          { label: '小写', value: 'lowercase' },
          { label: '首字母大写', value: 'capitalize' },
        ],
      },
      { key: 'color', label: '文字颜色', type: 'color' },
    ],
  },
  background: {
    name: '背景',
    icon: '🎨',
    properties: [
      { key: 'backgroundColor', label: '背景色', type: 'color' },
      { key: 'backgroundImage', label: '背景图', type: 'string' },
      {
        key: 'backgroundSize',
        label: '背景尺寸',
        type: 'select',
        options: [
          { label: '自动', value: 'auto' },
          { label: '覆盖', value: 'cover' },
          { label: '包含', value: 'contain' },
        ],
      },
      {
        key: 'backgroundRepeat',
        label: '背景重复',
        type: 'select',
        options: [
          { label: '重复', value: 'repeat' },
          { label: '不重复', value: 'no-repeat' },
          { label: 'X轴重复', value: 'repeat-x' },
          { label: 'Y轴重复', value: 'repeat-y' },
        ],
      },
      { key: 'backgroundPosition', label: '背景位置', type: 'string' },
    ],
  },
  border: {
    name: '边框',
    icon: '⬜',
    properties: [
      { key: 'border', label: '边框', type: 'string' },
      { key: 'borderWidth', label: '边框宽度', type: 'string' },
      {
        key: 'borderStyle',
        label: '边框样式',
        type: 'select',
        options: [
          { label: '无', value: 'none' },
          { label: '实线', value: 'solid' },
          { label: '虚线', value: 'dashed' },
          { label: '点线', value: 'dotted' },
          { label: '双线', value: 'double' },
        ],
      },
      { key: 'borderColor', label: '边框颜色', type: 'color' },
      { key: 'borderRadius', label: '圆角', type: 'string' },
      { key: 'borderTopLeftRadius', label: '左上圆角', type: 'string' },
      { key: 'borderTopRightRadius', label: '右上圆角', type: 'string' },
      { key: 'borderBottomLeftRadius', label: '左下圆角', type: 'string' },
      { key: 'borderBottomRightRadius', label: '右下圆角', type: 'string' },
    ],
  },
  flexbox: {
    name: '弹性布局',
    icon: '🔗',
    properties: [
      {
        key: 'flexDirection',
        label: '主轴方向',
        type: 'select',
        options: [
          { label: '水平', value: 'row' },
          { label: '水平反向', value: 'row-reverse' },
          { label: '垂直', value: 'column' },
          { label: '垂直反向', value: 'column-reverse' },
        ],
      },
      {
        key: 'flexWrap',
        label: '换行',
        type: 'select',
        options: [
          { label: '不换行', value: 'nowrap' },
          { label: '换行', value: 'wrap' },
          { label: '反向换行', value: 'wrap-reverse' },
        ],
      },
      {
        key: 'justifyContent',
        label: '主轴对齐',
        type: 'select',
        options: [
          { label: '起点对齐', value: 'flex-start' },
          { label: '终点对齐', value: 'flex-end' },
          { label: '居中', value: 'center' },
          { label: '两端对齐', value: 'space-between' },
          { label: '均匀分布', value: 'space-around' },
          { label: '平均分布', value: 'space-evenly' },
        ],
      },
      {
        key: 'alignItems',
        label: '交叉轴对齐',
        type: 'select',
        options: [
          { label: '起点对齐', value: 'flex-start' },
          { label: '终点对齐', value: 'flex-end' },
          { label: '居中', value: 'center' },
          { label: '基线对齐', value: 'baseline' },
          { label: '拉伸', value: 'stretch' },
        ],
      },
      {
        key: 'alignContent',
        label: '多行对齐',
        type: 'select',
        options: [
          { label: '起点对齐', value: 'flex-start' },
          { label: '终点对齐', value: 'flex-end' },
          { label: '居中', value: 'center' },
          { label: '两端对齐', value: 'space-between' },
          { label: '均匀分布', value: 'space-around' },
          { label: '拉伸', value: 'stretch' },
        ],
      },
      { key: 'flex', label: 'Flex', type: 'string' },
      { key: 'flexGrow', label: '放大比例', type: 'number' },
      { key: 'flexShrink', label: '缩小比例', type: 'number' },
      { key: 'flexBasis', label: '基准尺寸', type: 'string' },
      {
        key: 'alignSelf',
        label: '自身对齐',
        type: 'select',
        options: [
          { label: '自动', value: 'auto' },
          { label: '起点对齐', value: 'flex-start' },
          { label: '终点对齐', value: 'flex-end' },
          { label: '居中', value: 'center' },
          { label: '基线对齐', value: 'baseline' },
          { label: '拉伸', value: 'stretch' },
        ],
      },
    ],
  },
  effects: {
    name: '效果',
    icon: '✨',
    properties: [
      { key: 'opacity', label: '透明度', type: 'number', min: 0, max: 1, step: 0.1 },
      { key: 'boxShadow', label: '阴影', type: 'string' },
      { key: 'textShadow', label: '文字阴影', type: 'string' },
      { key: 'transform', label: '变换', type: 'string' },
      { key: 'transition', label: '过渡', type: 'string' },
      { key: 'filter', label: '滤镜', type: 'string' },
    ],
  },
  other: {
    name: '其他',
    icon: '🔧',
    properties: [
      {
        key: 'cursor',
        label: '鼠标样式',
        type: 'select',
        options: [
          { label: '默认', value: 'default' },
          { label: '指针', value: 'pointer' },
          { label: '文本', value: 'text' },
          { label: '移动', value: 'move' },
          { label: '禁用', value: 'not-allowed' },
          { label: '等待', value: 'wait' },
        ],
      },
      {
        key: 'overflow',
        label: '溢出处理',
        type: 'select',
        options: [
          { label: '可见', value: 'visible' },
          { label: '隐藏', value: 'hidden' },
          { label: '滚动', value: 'scroll' },
          { label: '自动', value: 'auto' },
        ],
      },
      {
        key: 'visibility',
        label: '可见性',
        type: 'select',
        options: [
          { label: '可见', value: 'visible' },
          { label: '隐藏', value: 'hidden' },
          { label: '折叠', value: 'collapse' },
        ],
      },
      {
        key: 'whiteSpace',
        label: '空白处理',
        type: 'select',
        options: [
          { label: '正常', value: 'normal' },
          { label: '不换行', value: 'nowrap' },
          { label: '保留', value: 'pre' },
        ],
      },
    ],
  },
};

// 根据元素类型获取适用的CSS属性
const getElementCssProperties = (elementType: string) => {
  // 基础属性，所有元素都有
  const baseCategories = ['layout', 'size', 'spacing', 'background', 'border', 'effects', 'other'];

  // 根据元素类型添加特定属性
  switch (elementType) {
    case 'div':
    case 'section':
    case 'article':
    case 'main':
    case 'aside':
    case 'header':
    case 'footer':
    case 'nav':
      return [...baseCategories, 'flexbox'];
    case 'p':
    case 'h1':
    case 'h2':
    case 'h3':
    case 'h4':
    case 'h5':
    case 'h6':
    case 'span':
    case 'label':
    case 'a':
      return [...baseCategories, 'typography'];
    case 'img':
      return ['layout', 'size', 'spacing', 'border', 'effects', 'other'];
    case 'input':
    case 'button':
    case 'textarea':
    case 'select':
      return [...baseCategories, 'typography'];
    default:
      return baseCategories;
  }
};

const PropertyPanel: React.FC = () => {
  const { selectedComponentId, componentTree, componentTypes } = useEditorStore((state) => state);
  const { syncComponentProps } = useCanvasSync();
  const { syncComponentPropsToCanvas, syncComponentStyleToCanvas } = useStoreSync();
  const [activeTab, setActiveTab] = useState('props');
  const [changedProperties, setChangedProperties] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');

  // 添加监听确保样式同步
  useEffect(() => {
    if (selectedComponentId !== null && selectedComponentId >= 0 && componentTree[selectedComponentId]) {
      // 强制重新渲染以更新样式
      setActiveTab(activeTab);
    }
  }, [selectedComponentId, componentTree, activeTab]);

  if (selectedComponentId === null || selectedComponentId < 0 || !componentTree[selectedComponentId]) {
    return <div className={`${editorStyles.container.panel}`}>请选择一个组件</div>;
  }

  // 获取组件元数据
  const component = componentTree[selectedComponentId];
  const originMetadata = componentTypes.find((type) => type.config.compName === component.config?.compName);
  const metadata = {
    ...originMetadata,
    styleProps: { ...originMetadata?.defaultProps?.styleProps, ...component.styleProps },
    compProps: { ...originMetadata?.defaultProps?.compProps, ...component.compProps },
  };

  // 确保正确获取组件样式
  const style = metadata?.styleProps || {};

  const handlePropChange = (propName: string, value: string | number | boolean) => {
    const newProps = {
      ...component?.compProps,
      [propName]: value,
    };

    // 同步到画布iframe
    syncComponentProps(selectedComponentId, newProps);

    // 使用新的消息系统同步
    syncComponentPropsToCanvas(selectedComponentId, newProps);

    // Track changed property
    const newChangedProperties = new Set(changedProperties);
    newChangedProperties.add(propName);
    setChangedProperties(newChangedProperties);

    // Clear highlight after 1 second
    setTimeout(() => {
      const updatedChangedProperties = new Set(newChangedProperties);
      updatedChangedProperties.delete(propName);
      setChangedProperties(updatedChangedProperties);
    }, 1000);
  };

  const handleStyleChange = (styleProp: string, value: string | number) => {
    const newStyle = {
      ...style,
      [styleProp]: value,
    };

    // Update style props in the store
    useEditorStore.getState().updateComponentStyleProps(selectedComponentId, newStyle);

    // 使用新的消息系统同步样式更新
    syncComponentStyleToCanvas(selectedComponentId, newStyle);

    // Track changed property
    const newChangedProperties = new Set(changedProperties);
    newChangedProperties.add(styleProp);
    setChangedProperties(newChangedProperties);

    // Clear highlight after 1 second
    setTimeout(() => {
      const updatedChangedProperties = new Set(newChangedProperties);
      updatedChangedProperties.delete(styleProp);
      setChangedProperties(updatedChangedProperties);
    }, 1000);
  };

  const renderPropField = (propConfig: PropConfig) => {
    const value = component?.compProps?.[propConfig.key] ?? propConfig.defaultValue;

    switch (propConfig.type) {
      case 'string':
        return (
          <input
            className={editorStyles.form.input}
            value={(value as string) || ''}
            onChange={(e) => handlePropChange(propConfig.key, e.target.value)}
            placeholder={`输入${propConfig.label}`}
          />
        );
      case 'number':
        return (
          <input
            type="number"
            className={editorStyles.form.inputNumber}
            value={(value as number) || ''}
            min={propConfig.min}
            max={propConfig.max}
            onChange={(e) => handlePropChange(propConfig.key, e.target.value ? Number(e.target.value) : 0)}
            placeholder={`输入${propConfig.label}`}
          />
        );
      case 'color':
        return (
          <div className="flex items-center">
            <input
              type="color"
              className="w-10 h-10 border border-gray-300 rounded-md cursor-pointer"
              value={(value as string) || '#000000'}
              onChange={(e) => handlePropChange(propConfig.key, e.target.value)}
            />
            <span className="ml-2 text-sm text-gray-600">{(value as string) || '#000000'}</span>
          </div>
        );
      case 'select':
        return (
          <Select
            value={(value as string) || ''}
            onValueChange={(val) => handlePropChange(propConfig.key, val)}
            className={editorStyles.select.triggerWithRadius}
          >
            {propConfig.options?.map((opt: { label: string; value: string | number }) => (
              <SelectItem key={String(opt.value)} value={String(opt.value)} className={`${editorStyles.dropdown.item} ${editorStyles.text.primary}`}>
                {opt.label}
              </SelectItem>
            ))}
          </Select>
        );
      case 'switch':
        return (
          <Switch
            className="w-10 h-5 bg-gray-300 rounded-full relative data-[state=checked]:bg-blue-500 transition-colors"
            checked={value as boolean}
            onCheckedChange={(val) => handlePropChange(propConfig.key, val)}
          />
        );
      case 'image':
        return (
          <input
            className={editorStyles.form.input}
            value={(value as string) || ''}
            onChange={(e) => handlePropChange(propConfig.key, e.target.value)}
            placeholder={`输入图片URL`}
          />
        );
      default:
        return null;
    }
  };

  const renderStyleField = (propConfig: {
    key: string;
    type: 'string' | 'number' | 'color' | 'select';
    label: string;
    options?: Array<{ label: string; value: string }>;
    min?: number;
    max?: number;
    step?: number;
  }) => {
    const value = (style as { [key: string]: string | number })[propConfig.key] || '';

    switch (propConfig.type) {
      case 'string':
        return (
          <input
            className={editorStyles.form.input}
            value={value as string}
            onChange={(e) => handleStyleChange(propConfig.key, e.target.value)}
            placeholder={`输入${propConfig.label}`}
          />
        );
      case 'number':
        return (
          <input
            type="number"
            className={editorStyles.form.inputNumber}
            value={(value as number) || ''}
            min={propConfig.min}
            max={propConfig.max}
            step={propConfig.step || 1}
            onChange={(e) => handleStyleChange(propConfig.key, e.target.value ? Number(e.target.value) : '')}
            placeholder={`输入${propConfig.label}`}
          />
        );
      case 'color':
        return (
          <div className="flex items-center">
            <input
              type="color"
              className="w-10 h-10 border border-gray-300 rounded-md cursor-pointer"
              value={(value as string) || '#000000'}
              onChange={(e) => handleStyleChange(propConfig.key, e.target.value)}
            />
            <span className="ml-2 text-sm text-gray-600">{value || '#000000'}</span>
          </div>
        );
      case 'select':
        return (
          <Select
            value={(value as string) || ''}
            onValueChange={(val) => handleStyleChange(propConfig.key, val)}
            className={editorStyles.select.triggerWithRadius}
          >
            {propConfig.options?.map((opt: { label: string; value: string | number }) => (
              <SelectItem key={String(opt.value)} value={String(opt.value)} className={`${editorStyles.dropdown.item} ${editorStyles.text.primary}`}>
                {opt.label}
              </SelectItem>
            ))}
          </Select>
        );
      default:
        return null;
    }
  };

  // 获取适用于当前组件的CSS属性类别
  const elementType = component.config?.compName.toLowerCase();
  const applicableCategories = getElementCssProperties(elementType!);

  // Filter categories and properties based on search term
  const filteredCategoriesItems = applicableCategories
    .map((categoryKey) => {
      const category = cssCategories[categoryKey as keyof typeof cssCategories];

      // If there's a search term, filter properties
      let filteredProperties = category.properties;
      if (searchTerm) {
        const lowerSearchTerm = searchTerm.toLowerCase();
        filteredProperties = category.properties.filter(
          (prop) => prop.key.toLowerCase().includes(lowerSearchTerm) || prop.label.toLowerCase().includes(lowerSearchTerm),
        );
      }

      // Only return category if it has matching properties
      if (filteredProperties.length > 0) {
        return {
          key: categoryKey,
          label: category.name,
          icon: category.icon,
          children: (
            <div className={editorStyles.propertyPanel.propertyGrid}>
              {filteredProperties.map((propConfig) => (
                <div
                  key={propConfig.key}
                  className={`${editorStyles.propertyPanel.propertyItem} ${
                    changedProperties.has(propConfig.key) ? 'bg-blue-50 border-l-4 border-blue-500 pl-3 -ml-4' : ''
                  }`}
                >
                  <label className={editorStyles.propertyPanel.propertyLabel}>{propConfig.label}</label>
                  {renderStyleField({
                    ...propConfig,
                    type: propConfig.type as 'string' | 'number' | 'color' | 'select',
                  })}
                </div>
              ))}
            </div>
          ),
        };
      }
      return null;
    })
    .filter(Boolean) as Array<{
    key: string;
    label: string;
    icon: React.ReactNode;
    children: React.ReactNode;
  }>;

  return (
    <div className={`${editorStyles.container.panel} ${editorStyles.text.primary}`}>
      <h3 className={`text-lg font-medium mb-4 ${editorStyles.text.primary}`}>{`${component.config?.name || '组件'}编辑`}</h3>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className={editorStyles.tabs.list}>
          <TabsTrigger
            value="props"
            className={`${editorStyles.tabs.trigger} ${editorStyles.text.secondary} data-[state=active]:${editorStyles.text.primary}`}
          >
            属性
          </TabsTrigger>
          <TabsTrigger
            value="styles"
            className={`${editorStyles.tabs.trigger} ${editorStyles.text.secondary} data-[state=active]:${editorStyles.text.primary}`}
          >
            样式
          </TabsTrigger>
        </TabsList>
        <TabsContent value="props">
          <div className={editorStyles.container.section}>
            {metadata?.config?.compProps.map((propConfig) => (
              <div
                key={propConfig.key}
                className={`${editorStyles.container.item} ${
                  changedProperties.has(propConfig.key) ? 'bg-blue-50 border-l-4 border-blue-500 pl-3 -ml-4' : ''
                }`}
              >
                <label className={`${editorStyles.form.label} ${editorStyles.text.primary}`}>{propConfig.label}</label>
                {renderPropField(propConfig)}
              </div>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="styles">
          <div className={editorStyles.container.section}>
            <div className="mb-4">
              <input
                type="text"
                className={editorStyles.form.input}
                placeholder="搜索CSS属性..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            {filteredCategoriesItems.map((item) => (
              <Collapsible key={item.key} defaultOpen={true}>
                <CollapsibleTrigger className={editorStyles.collapsible.trigger}>
                  <span className="flex items-center">
                    <span className="mr-2">{item.icon}</span>
                    {item.label}
                  </span>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="transform transition-transform duration-200 data-[state=open]:rotate-180"
                  >
                    <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="1.5" fill="none" />
                  </svg>
                </CollapsibleTrigger>
                <CollapsibleContent>{item.children}</CollapsibleContent>
              </Collapsible>
            ))}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <button
                className={`${editorStyles.form.button} ${editorStyles.form.buttonSecondary}`}
                onClick={() => {
                  // Create a copy of compProps without the style property
                  const compProps = component?.compProps || {};
                  const restProps = Object.fromEntries(Object.entries(compProps).filter(([key]) => key !== 'style'));
                  syncComponentProps(selectedComponentId, restProps);
                }}
              >
                清空样式
              </button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PropertyPanel;
