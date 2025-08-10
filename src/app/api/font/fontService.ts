import { Font } from 'fonteditor-core';
import fs from 'fs';
import path from 'path';
import { getSubsetText, getUTF16CodePoints } from '@/app/utils/utils';
import TextToSVG from '@/app/utils/textToSVG';

const fontMapping: Record<string, string> = {
  造字工房明黑体: '造字工房明黑体.ttf',
  方正正大黑简体: 'FZZDHJW.TTF',
  方正综艺简体: 'FZZYJW.TTF',
};

// svg 缓存
const svgCache: Record<string, Record<string, string>> = {};
const pathPrefix = 'public/fonts';
const projectRoot = process.cwd();

function getFontPathByName(fontName: string) {
  const fontFileName = fontMapping[fontName];
  if (!fs.existsSync(`${projectRoot}/${pathPrefix}/${fontFileName}`)) {
    console.log('-------------', `${projectRoot}/${pathPrefix}/${fontFileName}`);
    throw new Error('字体文件不存在');
  }
  return `${projectRoot}/${pathPrefix}/${fontFileName}`;
}

export async function getFont(fontName: string, charSubset: string) {
  if (fontName) {
    const fontPath = getFontPathByName(fontName);
    console.log('fontPath', fontPath);
    const subset = getUTF16CodePoints(getSubsetText({ text: charSubset }));
    console.log('subset', subset);
    // read font file
    const rBuffer = fs.readFileSync(path.resolve(fontPath));
    // 裁剪出woff字体
    const font = Font.create(rBuffer, {
      type: 'ttf', // support ttf, woff, woff2, eot, otf, svg
      subset,
      hinting: true, // save font hinting
      compound2simple: true, // transform ttf compound glyf to simple
      combinePath: false, // for svg path
    });

    // 生成base64
    const res = font.toBase64({
      type: 'woff', // support ttf, woff, woff2, eot, svg
    });
    return res;
  }
  return null;
}

async function getSvg(text: string, fontName: string, cache = true, fontSize = 24, colorStr = 'black') {
  const RegExp = /^[0-9A-F]{6}$/i;
  let color = colorStr;
  if (RegExp.test(color)) {
    color = '#' + color;
  } else {
    color = 'black';
  }

  const filePath = await getFontPathByName(fontName);

  if (fs.existsSync(filePath)) {
    // 先尝试从缓存拉取
    if (cache && svgCache[filePath] && svgCache[filePath][text]) {
      return svgCache[filePath][text];
    }
    const textToSVG = TextToSVG.loadSync(path.resolve(filePath));
    const attributes = { fill: color };
    const options = { x: 0, y: 0, fontSize, anchor: 'top', attributes };
    const svg = textToSVG.getSVG(text, options);
    if (cache) {
      svgCache[filePath] = { ...(svgCache[filePath] || {}), [text]: svg };
    }
    return svg;
  }
  return text;
}

export async function getFontList() {
  const fontList: { name: string; svg: string }[] = [];
  for (const key in fontMapping) {
    const svg = await getSvg(key, key);
    fontList.push({ name: key, svg });
  }
  console.log('fontList', fontList);
  return fontList;
}
