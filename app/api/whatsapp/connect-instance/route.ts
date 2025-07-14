import { NextResponse } from 'next/server';
import { apiClient } from '@/lib/api';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const { instance, agentId } = await request.json();
    const response = await apiClient.connectWhatsApp(instance);

    const cookieStore = cookies();
    const supabase = createClient(cookieStore);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
    }

    // Ensure response.data exists before accessing .code
    const connectionCode = response.data?.code || null;

    // Upsert into whatsapp_connections table
    const { error: dbError } = await supabase
      .from('whatsapp_connections')
      .upsert({
        user_id: user.id,
        agent_id: agentId,
        instance_name: instance,
        connection_code: connectionCode,
        status: 'PENDING',
      }, { onConflict: 'instance_name' }); // Conflict on instance_name to update existing

    if (dbError) {
      console.error("Error upserting into whatsapp_connections on connect:", dbError);
      return NextResponse.json({ error: dbError.message }, { status: 500 });
    }

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Error in Next.js API route /api/whatsapp/connect-instance:', error);
    return NextResponse.json({ error: error.message, details: (error as any).data }, { status: 500 });
  }
}
