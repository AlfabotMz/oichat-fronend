import { NextResponse } from 'next/server';
import { apiClient } from '@/lib/api';

export async function POST(request: Request) {
  try {
    const { instance, agentId } = await request.json();
    const response = await apiClient.createWhatsAppInstance({ instance, agentId });
    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Error in Next.js API route /api/whatsapp/create-instance:', error);
    return NextResponse.json({ error: error.message, details: (error as any).data }, { status: 500 });
  }
}
