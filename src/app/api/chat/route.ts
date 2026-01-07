import { NextRequest } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { openai } from '@ai-sdk/openai';
import { streamText, embed } from 'ai';

export const maxDuration = 60;

// POST /api/chat - RAG-powered chat endpoint
export async function POST(request: NextRequest) {
    try {
        const { messages, projectId } = await request.json();

        if (!projectId) {
            return new Response(
                JSON.stringify({ error: 'Project ID is required' }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        if (!messages || !Array.isArray(messages) || messages.length === 0) {
            return new Response(
                JSON.stringify({ error: 'Messages are required' }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        const supabase = createServerClient();

        // Get the last user message
        const lastUserMessage = messages
            .slice()
            .reverse()
            .find((m: { role: string }) => m.role === 'user');

        if (!lastUserMessage) {
            return new Response(
                JSON.stringify({ error: 'No user message found' }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        // Generate embedding for the query
        const { embedding: queryEmbedding } = await embed({
            model: openai.embedding('text-embedding-3-small'),
            value: lastUserMessage.content,
        });

        // Query Supabase for relevant documents using vector similarity
        const { data: matchedDocs, error: matchError } = await supabase.rpc(
            'match_documents',
            {
                query_embedding: queryEmbedding,
                match_project_id: projectId,
                match_threshold: 0.5,
                match_count: 5,
            }
        );

        if (matchError) {
            console.error('Error matching documents:', matchError);
        }

        // Build context from matched documents
        let context = '';
        if (matchedDocs && matchedDocs.length > 0) {
            context = matchedDocs
                .map((doc: { content: string; similarity: number }) => doc.content)
                .join('\n\n---\n\n');
        }

        // Create system prompt with RAG context
        const systemPrompt = context
            ? `You are a helpful AI assistant with access to a specific knowledge base. Answer the user's questions based ONLY on the following context. If the context doesn't contain relevant information to answer the question, say "No relevant knowledge found in this project."

CONTEXT FROM KNOWLEDGE BASE:
${context}

IMPORTANT RULES:
1. Only use information from the context above
2. If asked about something not in the context, reply: "No relevant knowledge found in this project."
3. Be concise but thorough in your answers
4. Cite specific parts of the context when applicable`
            : `You are a helpful AI assistant. Unfortunately, there is no knowledge indexed in this project yet. If the user asks any questions about specific knowledge, reply: "No relevant knowledge found in this project." You can still have general conversations.`;

        // Stream the response using GPT-4o
        const result = streamText({
            model: openai('gpt-4o'),
            system: systemPrompt,
            messages,
        });

        return result.toDataStreamResponse();
    } catch (error) {
        console.error('Error in chat:', error);
        return new Response(
            JSON.stringify({ error: 'Failed to process chat request' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
}
