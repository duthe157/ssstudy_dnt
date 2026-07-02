import { NextResponse } from 'next/server';

/**
 * Health check endpoint
 * Trả về status 200 nếu server đang chạy
 */
export async function GET() {
  return NextResponse.json(
    {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    },
    { status: 200 }
  );
}

