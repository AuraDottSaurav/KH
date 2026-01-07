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

        // Create system prompt with RAG context - STRICT knowledge base only
        const noDataFoundMessage = `I couldn't find any relevant information about this in our knowledge base yet. This topic may not have been added by the admin. Please reach out to your administrator if you believe this information should be available.`;

        const systemPrompt = context
            ? `You are a knowledge assistant for this platform. You MUST answer questions based EXCLUSIVELY on the context provided below. 

CRITICAL INSTRUCTIONS - FOLLOW THESE WITHOUT EXCEPTION:
1. You are FORBIDDEN from using ANY knowledge from your training data or general knowledge.
2. You can ONLY use information that appears in the CONTEXT section below.
3. If the user's question cannot be fully answered using ONLY the context below, respond with: "${noDataFoundMessage}"
4. Do NOT fill gaps with assumptions, inferences, or external knowledge.
5. Do NOT provide additional information beyond what is explicitly stated in the context.
6. If you are even slightly unsure whether information is in the context, say you don't have that information.
7. When answering, quote or closely paraphrase the context. Do not elaborate beyond it.
8. Never say "based on my knowledge" or similar phrases - you have NO knowledge outside this context.

CONTEXT FROM KNOWLEDGE BASE:
${context}

Remember: If it's not in the context above, you don't know it. Period.`
            : `You are a knowledge assistant for this platform. There is currently no knowledge indexed in this project.

For ANY question the user asks, respond with: "${noDataFoundMessage}"

You are NOT allowed to:
- Answer questions using your training data
- Have general conversations
- Provide any information not from this platform's knowledge base

Simply inform the user that no knowledge has been added yet and they should contact their administrator.`;

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
