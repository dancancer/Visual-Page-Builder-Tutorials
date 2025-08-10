import { NextRequest, NextResponse } from 'next/server';
import { getFont } from './fontService';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const fontName = searchParams.get('fontName');
  const text = searchParams.get('text');
  const fontData = await getFont(fontName!, text!);
  return NextResponse.json({
    success: true,
    data: fontData,
  });
}
