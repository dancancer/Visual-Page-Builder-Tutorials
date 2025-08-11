/**
 * 计算文本组件的最小尺寸
 * @param styleProps 组件的样式属性
 * @returns { width: number, height: number } 文本的最小尺寸
 */
export function calculateTextDimensions(text: string, styleProps: React.CSSProperties = {}): { width: number; height: number } {
  // 创建一个离屏元素用于测量
  const offscreenElement = document.createElement('p');

  // 设置样式以匹配文本组件的样式
  if (styleProps.fontSize) {
    offscreenElement.style.fontSize = String(styleProps.fontSize);
  }
  if (styleProps.fontWeight) {
    offscreenElement.style.fontWeight = String(styleProps.fontWeight);
  }
  if (styleProps.fontFamily) {
    offscreenElement.style.fontFamily = String(styleProps.fontFamily);
  }
  if (styleProps.lineHeight) {
    offscreenElement.style.lineHeight = String(styleProps.lineHeight);
  }
  offscreenElement.style.position = 'absolute';
  offscreenElement.style.left = '-9999px';
  offscreenElement.style.top = '-9999px';
  offscreenElement.style.visibility = 'hidden';

  // 设置文本内容
  offscreenElement.textContent = text || ' ';

  // 将元素添加到文档中以进行测量
  document.body.appendChild(offscreenElement);

  // 获取尺寸
  const width = Math.ceil(offscreenElement.getBoundingClientRect().width);
  const height = Math.ceil(offscreenElement.getBoundingClientRect().height);

  // 移除离屏元素
  document.body.removeChild(offscreenElement);

  return { width, height };
}

/**
 * 根据文本内容和样式计算文本组件的推荐尺寸
 * @param text 文本内容
 * @param styleProps 组件的样式属性
 * @returns { width: number, height: number } 推荐的尺寸
 */
export function getTextComponentSize(text: string, styleProps: React.CSSProperties = {}): { width: number; height: number } {
  return calculateTextDimensions(text, styleProps);
}

export const BaseFontFamily = 'Arial,sans-serif';

// utils/injectWebFont.ts
const injectedFontId = 'custom-webfont-style';

/**
 * 注入 Base64 WebFont 到页面
 * @param fontName 字体名称（CSS中使用的名字）
 * @param fontDataUrl Base64 Data URL，例如 "data:font/woff2;base64,xxxx"
 * @param fontWeight 可选，默认 normal
 * @param fontStyle 可选，默认 normal
 */
export function injectWebFont(fontName: string, fontDataUrl: string, fontWeight: string = 'normal', fontStyle: string = 'normal') {
  // 清理旧的字体样式
  const oldStyle = document.getElementById(injectedFontId + fontName);
  if (oldStyle) {
    oldStyle.remove();
  }

  // 创建新的 <style> 标签
  const style = document.createElement('style');
  style.id = injectedFontId + fontName;
  style.type = 'text/css';
  style.textContent = `
    @font-face {
      font-family: "${fontName}";
      src: url("${fontDataUrl}") format("woff2");
      font-weight: ${fontWeight};
      font-style: ${fontStyle};
    }
  `;

  document.head.appendChild(style);
}
