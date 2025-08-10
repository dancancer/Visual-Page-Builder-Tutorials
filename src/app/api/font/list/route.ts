import { NextResponse } from 'next/server';
import { getFontList } from '../fontService';

export async function GET() {
  const fontList = await getFontList();
  return NextResponse.json({
    success: true,
    data: fontList,
  });
}
