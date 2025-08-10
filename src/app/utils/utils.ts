import { ComponentData } from '../common/types';
import _ from 'lodash';

export function deleteNodeAndChildren(tree: Array<ComponentData | undefined>, nodeId: number) {
  // 创建一个 Set 用于存储所有需要删除的节点 ID
  const idsToDelete = new Set();

  // 辅助函数递归找到所有子节点
  function collectChildren(nodeId: number) {
    idsToDelete.add(nodeId);
    tree.forEach((node) => {
      if (node?.parentId === nodeId) {
        if (node.id !== undefined) {
          collectChildren(node.id); // 递归收集子节点
        }
      }
    });
  }

  // 收集目标节点及其所有子节点
  collectChildren(nodeId);

  // 需要删除的节点置空
  return tree.map((node) => {
    if (idsToDelete.has(node?.id)) {
      return undefined;
    }
    return node;
  });
}

/**
 * getPureText
 *
 * @see https://msdn.microsoft.com/zh-cn/library/ie/2yfce773
 * @see http://www.unicode.org/charts/
 *
 * @param  {string} str target text
 * @return {string}     pure text
 */
function getPureText(str: string) {
  // fix space
  const emptyTextMap: Record<string, number> = {};

  function replaceEmpty(word: string) {
    emptyTextMap[word] = 1;
    return '';
  }

  const pureText = String(str)
    .trim()
    .replace(/[\s]/g, replaceEmpty)
    // .replace(/[\f]/g, '')
    // .replace(/[\b]/g, '')
    // .replace(/[\n]/g, '')
    // .replace(/[\t]/g, '')
    // .replace(/[\r]/g, '')
    .replace(/[\u2028]/g, '')
    .replace(/[\u2029]/g, '');

  const emptyText = Object.keys(emptyTextMap).join('');

  return pureText + emptyText;
}

/**
 * getUniqText
 *
 * @param  {string} str target text
 * @return {string}     uniq text
 */
export function getUniqText(str: string) {
  return _.uniq(str.split('')).join('');
}

/**
 * basic chars
 *
 * "!"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\]^_`abcdefghijklmnopqrstuvwxyz{|}"
 *
 * @type {string}
 */
const basicText = String.fromCharCode.apply(this, _.range(33, 126));

/**
 * get subset text
 *
 * @param  {Object} opts opts
 * @return {string}      subset text
 */
export function getSubsetText(opts: { text: string; trim?: boolean; basicText?: boolean }) {
  let text = opts.text || '';

  // trim
  if (text && opts.trim) {
    text = getPureText(text);
  }

  // basicText
  if (opts.basicText) {
    text += basicText;
  }

  return getUniqText(text);
}

export function getUTF16CodePoints(str: string): number[] {
  const codePoints: number[] = [];

  for (let i = 0; i < str.length; i++) {
    // 使用 charCodeAt() 方法获取 UTF-16 代码单元
    const codeUnit = str.charCodeAt(i);

    // 检查是否是代理对的一部分（处理4字节的UTF-16字符）
    if (codeUnit >= 0xd800 && codeUnit <= 0xdbff) {
      // 高代理项
      const highSurrogate = codeUnit;
      const lowSurrogate = str.charCodeAt(i + 1);

      // 计算完整的代码点
      const codePoint = (highSurrogate - 0xd800) * 0x400 + (lowSurrogate - 0xdc00) + 0x10000;
      codePoints.push(codePoint);
      i++; // 跳过下一个代码单元（低代理项）
    } else {
      // 普通字符（2字节UTF-16）
      codePoints.push(codeUnit);
    }
  }

  return codePoints;
}
