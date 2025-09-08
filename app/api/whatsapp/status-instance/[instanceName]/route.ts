import { NextResponse } from 'next/server';
import { apiClient } from '@/lib/api';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const instanceName = url.pathname.split('/').pop();

    if (!instanceName) {
      return NextResponse.json({ error: "Instance name is required" }, { status: 400 });
    }

    const response: any = await apiClient.checkWhatsAppConnection(instanceName);

    const supabase = createClient();

    let newStatus: "CONNECTED" | "DISCONNECTED" | "PENDING" | "ERROR" = "PENDING";
    if (response.isConnected) {
      newStatus = "CONNECTED";
    } else if (response.error) {
      newStatus = "ERROR";
    } else {
      newStatus = "PENDING"; // Assuming if not connected and no error, it's still pending
    }

    const { error: dbError } = await supabase
      .from('whatsapp_connections')
      .update({ status: newStatus })
      .eq('instance_name', instanceName);

    if (dbError) {
      console.error("Error updating whatsapp_connections on status check:", dbError);
      // Do not return error here, as the primary goal is to return the connection status to the frontend
    }

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Error in Next.js API route /api/whatsapp/status-instance:', error);
    return NextResponse.json({ error: error.message, details: (error as any).data }, { status: 500 });
  }
}
