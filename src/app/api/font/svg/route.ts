import { NextRequest, NextResponse } from 'next/server';
import { getSvg } from '../fontService';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const fontName = searchParams.get('fontName');
  const text = searchParams.get('text');
  const svgData = await getSvg(text!, fontName!);
  return NextResponse.json({
    success: true,
    data: svgData,
  });
}
