import * as opentype from 'opentype.js';

// Define types
interface AnchorOptions {
  horizontal: string;
  vertical: string;
}

interface Metrics {
  x: number;
  y: number;
  baseline: number;
  width: number;
  height: number;
  ascender: number;
  descender: number;
}

interface TextToSVGOptions {
  fontSize?: number;
  kerning?: boolean;
  letterSpacing?: number;
  tracking?: number;
  anchor?: string;
  x?: number;
  y?: number;
  attributes?: Record<string, string>;
}

// Private method
function parseAnchorOption(anchor: string): AnchorOptions {
  let horizontal: RegExpMatchArray | never[] | string = anchor.match(/left|center|right/gi) || [];
  horizontal = horizontal.length === 0 ? 'left' : horizontal[0];

  let vertical: RegExpMatchArray | never[] | string = anchor.match(/baseline|top|bottom|middle/gi) || [];
  vertical = vertical.length === 0 ? 'baseline' : vertical[0];

  return { horizontal, vertical };
}

export default class TextToSVG {
  private font: opentype.Font;

  constructor(font: opentype.Font) {
    this.font = font;
  }

  static loadSync(file: string): TextToSVG {
    return new TextToSVG(opentype.loadSync(file));
  }

  static load(url: string, cb: (err: Error | null, textToSVG: TextToSVG | null) => void): void {
    opentype.load(url, (err, font) => {
      if (err !== null) {
        return cb(err, null);
      }

      return cb(null, new TextToSVG(font!));
    });
  }

  getWidth(text: string, options: TextToSVGOptions): number {
    const fontSize = options.fontSize || 72;
    const kerning = 'kerning' in options ? options.kerning : true;
    const fontScale = (1 / this.font.unitsPerEm) * fontSize;

    let width = 0;
    const glyphs = this.font.stringToGlyphs(text);
    for (let i = 0; i < glyphs.length; i++) {
      const glyph = glyphs[i];

      if (glyph.advanceWidth) {
        width += glyph.advanceWidth * fontScale;
      }

      if (kerning && i < glyphs.length - 1) {
        const kerningValue = this.font.getKerningValue(glyph, glyphs[i + 1]);
        width += kerningValue * fontScale;
      }

      if (options.letterSpacing) {
        width += options.letterSpacing * fontSize;
      } else if (options.tracking) {
        width += (options.tracking / 1000) * fontSize;
      }
    }
    return width;
  }

  getHeight(fontSize: number): number {
    const fontScale = (1 / this.font.unitsPerEm) * fontSize;
    return (this.font.ascender - this.font.descender) * fontScale;
  }

  getMetrics(text: string, options: TextToSVGOptions = {}): Metrics {
    const fontSize = options.fontSize || 72;
    const anchor = parseAnchorOption(options.anchor || '');

    const width = this.getWidth(text, options);
    const height = this.getHeight(fontSize);

    const fontScale = (1 / this.font.unitsPerEm) * fontSize;
    const ascender = this.font.ascender * fontScale;
    const descender = this.font.descender * fontScale;

    let x = options.x || 0;
    switch (anchor.horizontal) {
      case 'left':
        x -= 0;
        break;
      case 'center':
        x -= width / 2;
        break;
      case 'right':
        x -= width;
        break;
      default:
        throw new Error(`Unknown anchor option: ${anchor.horizontal}`);
    }

    let y = options.y || 0;
    switch (anchor.vertical) {
      case 'baseline':
        y -= ascender;
        break;
      case 'top':
        y -= 0;
        break;
      case 'middle':
        y -= height / 2;
        break;
      case 'bottom':
        y -= height;
        break;
      default:
        throw new Error(`Unknown anchor option: ${anchor.vertical}`);
    }

    const baseline = y + ascender;

    return {
      x,
      y,
      baseline,
      width,
      height,
      ascender,
      descender,
    };
  }

  getD(text: string, options: TextToSVGOptions = {}): string {
    const fontSize = options.fontSize || 72;
    const kerning = 'kerning' in options ? options.kerning : true;
    const letterSpacing = 'letterSpacing' in options ? options.letterSpacing : 0;
    const tracking = 'tracking' in options ? options.tracking : 0;
    const metrics = this.getMetrics(text, options);
    const path = this.font.getPath(text, metrics.x, metrics.baseline, fontSize, { kerning, letterSpacing, tracking });

    return path.toPathData(2);
  }

  getPath(text: string, options: TextToSVGOptions = {}): string {
    const attributes = Object.keys(options.attributes || {})
      .map((key) => `${key}="${options.attributes![key]}"`)
      .join(' ');
    const d = this.getD(text, options);

    if (attributes) {
      return `<path ${attributes} d="${d}"/>`;
    }

    return `<path d="${d}"/>`;
  }

  getSVG(text: string, options: TextToSVGOptions = {}): string {
    const metrics = this.getMetrics(text, options);
    let svg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 ${metrics.width} ${metrics.height}">`;
    svg += this.getPath(text, options);
    svg += '</svg>';

    return svg;
  }

  getDebugSVG(text: string, options: TextToSVGOptions = {}): string {
    options = JSON.parse(JSON.stringify(options));

    options.x = options.x || 0;
    options.y = options.y || 0;
    const metrics = this.getMetrics(text, options);
    const box = {
      width: Math.max(metrics.x + metrics.width, 0) - Math.min(metrics.x, 0),
      height: Math.max(metrics.y + metrics.height, 0) - Math.min(metrics.y, 0),
    };
    const origin = {
      x: box.width - Math.max(metrics.x + metrics.width, 0),
      y: box.height - Math.max(metrics.y + metrics.height, 0),
    };

    // Shift text based on origin
    options.x += origin.x;
    options.y += origin.y;

    let svg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${box.width}" height="${box.height}">`;
    svg += `<path fill="none" stroke="red" stroke-width="1" d="M0,${origin.y}L${box.width},${origin.y}"/>`; // X Axis
    svg += `<path fill="none" stroke="red" stroke-width="1" d="M${origin.x},0L${origin.x},${box.height}"/>`; // Y Axis
    svg += this.getPath(text, options);
    svg += '</svg>';

    return svg;
  }
}
