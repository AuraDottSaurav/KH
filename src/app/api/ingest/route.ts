import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { openai } from '@ai-sdk/openai';
import { embed } from 'ai';

// POST /api/ingest - Ingest text, audio, or file content
export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const projectId = formData.get('projectId') as string;
        const type = formData.get('type') as 'text' | 'audio' | 'pdf';
        const content = formData.get('content') as string | null;
        const file = formData.get('file') as File | null;

        if (!projectId) {
            return NextResponse.json(
                { error: 'Project ID is required' },
                { status: 400 }
            );
        }

        const supabase = createServerClient();

        // Create initial knowledge item with 'processing' status
        const { data: knowledgeItem, error: insertError } = await supabase
            .from('knowledge_items')
            .insert({
                project_id: projectId,
                type,
                content: content || null,
                file_name: file?.name || null,
                status: 'processing',
            })
            .select()
            .single();

        if (insertError) throw insertError;

        // Process in background (for demo, we'll do it synchronously)
        try {
            let textContent = content;
            let fileUrl: string | null = null;

            // Handle file uploads
            if (file) {
                // Upload file to Supabase Storage
                const fileName = `${projectId}/${Date.now()}-${file.name}`;
                const { data: uploadData, error: uploadError } = await supabase.storage
                    .from('knowledge-files')
                    .upload(fileName, file);

                if (uploadError) throw uploadError;

                // Get public URL
                const { data: urlData } = supabase.storage
                    .from('knowledge-files')
                    .getPublicUrl(fileName);

                fileUrl = urlData.publicUrl;

                // Extract text based on file type
                if (type === 'pdf') {
                    // For PDF, we'll use pdf-parse
                    const arrayBuffer = await file.arrayBuffer();
                    const pdfParse = (await import('pdf-parse')).default;
                    const pdfData = await pdfParse(Buffer.from(arrayBuffer));
                    textContent = pdfData.text;
                } else if (type === 'audio') {
                    // For audio, transcribe using OpenAI Whisper
                    const transcribeResponse = await fetch(
                        `${request.nextUrl.origin}/api/transcribe`,
                        {
                            method: 'POST',
                            body: formData,
                        }
                    );
                    const transcribeData = await transcribeResponse.json();
                    textContent = transcribeData.text;
                }
            }

            if (!textContent || textContent.trim().length === 0) {
                throw new Error('No content to index');
            }

            // Generate embedding using OpenAI
            const { embedding } = await embed({
                model: openai.embedding('text-embedding-3-small'),
                value: textContent,
            });

            // Update knowledge item with content, embedding, and indexed status
            const { error: updateError } = await supabase
                .from('knowledge_items')
                .update({
                    content: textContent,
                    file_url: fileUrl,
                    embedding,
                    status: 'indexed',
                })
                .eq('id', knowledgeItem.id);

            if (updateError) throw updateError;

            return NextResponse.json({
                success: true,
                id: knowledgeItem.id,
                status: 'indexed',
            });
        } catch (processingError) {
            // Update status to error
            await supabase
                .from('knowledge_items')
                .update({
                    status: 'error',
                    error_message: processingError instanceof Error ? processingError.message : 'Unknown error',
                })
                .eq('id', knowledgeItem.id);

            throw processingError;
        }
    } catch (error) {
        console.error('Error ingesting content:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to ingest content' },
            { status: 500 }
        );
    }
}

// GET /api/ingest?projectId=xxx - Get knowledge items for a project
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const projectId = searchParams.get('projectId');

        if (!projectId) {
            return NextResponse.json(
                { error: 'Project ID is required' },
                { status: 400 }
            );
        }

        const supabase = createServerClient();

        const { data: items, error } = await supabase
            .from('knowledge_items')
            .select('id, project_id, content, file_url, file_name, type, status, created_at')
            .eq('project_id', projectId)
            .order('created_at', { ascending: false });

        if (error) throw error;

        return NextResponse.json({ items });
    } catch (error) {
        console.error('Error fetching knowledge items:', error);
        return NextResponse.json(
            { error: 'Failed to fetch knowledge items' },
            { status: 500 }
        );
    }
}
