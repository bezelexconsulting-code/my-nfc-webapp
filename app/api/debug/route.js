import { NextResponse } from 'next/server';

export async function GET(request) {
  const currentUrl = new URL(request.url);
  const origin = `${currentUrl.protocol}//${currentUrl.host}`;
  return NextResponse.json({
    status: 'ok',
    origin,
    message: 'Debug API root. Use POST /api/debug/send-reset-email { email }',
    endpoints: {
      sendResetEmail: {
        method: 'POST',
        path: '/api/debug/send-reset-email',
        body: '{ "email": "example@example.com" }'
      }
    }
  });
}