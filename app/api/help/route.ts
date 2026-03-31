import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), '../SEARCH_HELP.md');
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ content: 'Help file not found.' }, { status: 404 });
    }
    const content = fs.readFileSync(filePath, 'utf-8');
    return NextResponse.json({ content });
  } catch (error) {
    return NextResponse.json({ content: 'Failed to read help file.' }, { status: 500 });
  }
}
