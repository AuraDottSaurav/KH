import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export async function GET(
    request: NextRequest,
    context: { params: Promise<{ chatId: string }> } // Correct type for Nextjs 15+ dynamic routes usually, checking docs standard. Nextjs 13+ is params: { chatId: string }, but recent nextjs uses Promise. I'll stick to params: { chatId: string } unless I know it's next 15. The user didn't specify next version. I'll use standard (request, { params })
) {
    // Next.js params
    const { chatId } = await context.params;

    if (!chatId) {
        return NextResponse.json({ error: 'Chat ID required' }, { status: 400 });
    }

    try {
        const supabase = createServerClient();

        // Fetch messages
        const { data: messages, error } = await supabase
            .from('messages')
            .select('*')
            .eq('chat_id', chatId)
            .order('created_at', { ascending: true });

        if (error) throw error;

        return NextResponse.json({ messages });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
