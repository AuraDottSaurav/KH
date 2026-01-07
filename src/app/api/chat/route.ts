import { NextRequest } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { openai } from '@ai-sdk/openai';
import { streamText, embed } from 'ai';

export const maxDuration = 60;

// Helper: Extract keywords from user query for fallback search
function extractKeywords(query: string): string[] {
    // Remove common stop words and extract meaningful keywords
    const stopWords = new Set([
        'a', 'an', 'the', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
        'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
        'should', 'may', 'might', 'can', 'to', 'of', 'in', 'for', 'on', 'with',
        'at', 'by', 'from', 'as', 'into', 'through', 'about', 'what', 'which',
        'who', 'whom', 'this', 'that', 'these', 'those', 'am', 'or', 'and',
        'but', 'if', 'then', 'so', 'than', 'too', 'very', 'just', 'how', 'why',
        'when', 'where', 'there', 'here', 'all', 'each', 'every', 'both', 'few',
        'more', 'most', 'other', 'some', 'such', 'no', 'not', 'only', 'own',
        'same', 'any', 'tell', 'me', 'i', 'my', 'you', 'your', 'we', 'our'
    ]);

    return query
        .toLowerCase()
        .replace(/[^\w\s]/g, ' ')
        .split(/\s+/)
        .filter(word => word.length > 2 && !stopWords.has(word));
}

// Helper: Check if query is vague/broad
function isVagueQuery(query: string): boolean {
    const trimmedQuery = query.trim().toLowerCase();

    // NEVER trigger disambiguation for option selection queries
    // Detect: "1", "2", "first", "second", "option 1", "the first one", etc.
    const selectionPatterns = [
        /^[1-9]$/,                                    // Just a number: "1", "2"
        /^(option|number|choice|#)\s*[1-9]/i,         // "option 1", "number 2", "#1"
        /^(first|second|third|fourth|fifth)(\s+one)?$/i,  // "first", "second one"
        /^the\s+(first|second|third|fourth|fifth)(\s+one)?$/i,  // "the first one"
        /^[1-9]\s*(st|nd|rd|th)?\s*(one|option)?$/i,  // "1st", "2nd one"
    ];

    if (selectionPatterns.some(pattern => pattern.test(trimmedQuery))) {
        console.log(`[Knowledge Search] Detected option selection: "${trimmedQuery}"`);
        return false; // This is selecting an option, not a vague query
    }

    // NEVER trigger disambiguation for follow-up selection queries
    const followUpPatterns = [
        /^tell me (more )?about[:\s]/i,
        /^more (info|details|information) (on|about)[:\s]/i,
        /^explain[:\s]/i,
        /^what (is|are)[:\s]/i,
        /^show me[:\s]/i,
        /^i (want|choose|pick|select)/i,              // "I want the first one"
        /^(give me|show|expand)/i,                    // "give me details on 1"
    ];

    if (followUpPatterns.some(pattern => pattern.test(trimmedQuery))) {
        return false; // This is a specific selection, not vague
    }

    // Vague patterns that should trigger disambiguation
    const vaguePatterns = [
        /^(what|tell me|show|give|list).{0,10}(about|all|everything|topics?|covered|available|have)$/i,
        /^(what).{0,5}(is|are).{0,5}(this|here|available)$/i,
        /^(summarize|overview|summary)$/i,
        /^(help|info|information)$/i,
        /^(what do you (know|have))$/i,
    ];

    const keywords = extractKeywords(query);

    // Very short query with generic words
    // BUT NOT if it's just a number or looks like a selection
    if (keywords.length <= 1 && !query.includes(':') && !/^\d+$/.test(trimmedQuery)) {
        return true;
    }

    // Matches vague patterns
    return vaguePatterns.some(pattern => pattern.test(trimmedQuery));
}



// Helper: Extract distinct topics from matched documents
function extractDistinctTopics(documents: { id: string; content: string }[]): { id: string; title: string; preview: string }[] {
    const topics: { id: string; title: string; preview: string }[] = [];

    for (const doc of documents.slice(0, 5)) { // Max 5 topics
        const content = doc.content || '';
        const lines = content.split('\n').filter(l => l.trim());

        // Try to extract a title from first line or create one
        let title = lines[0]?.slice(0, 60) || 'Untitled Topic';
        if (title.length === 60) title += '...';

        // Get preview from remaining content
        const preview = lines.slice(1).join(' ').slice(0, 120) || content.slice(0, 120);

        topics.push({
            id: doc.id,
            title: title.replace(/^#+\s*/, ''), // Remove markdown headers
            preview: preview + (preview.length >= 120 ? '...' : ''),
        });
    }

    return topics;
}

// POST /api/chat - RAG-powered chat endpoint with exhaustive search
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

        const userQuery = lastUserMessage.content;
        console.log(`[Knowledge Search] User query: "${userQuery}"`);
        console.log(`[Knowledge Search] Project ID: ${projectId}`);

        // Step 1: Generate embedding for the query
        const { embedding: queryEmbedding } = await embed({
            model: openai.embedding('text-embedding-3-small'),
            value: userQuery,
        });

        // Step 2: Vector similarity search with LOW threshold (0.1) and HIGH count (20)
        const { data: vectorMatches, error: matchError } = await supabase.rpc(
            'match_documents',
            {
                query_embedding: queryEmbedding,
                match_project_id: projectId,
                match_threshold: 0.1,  // Very permissive - catch weak semantic matches
                match_count: 20,       // Get more context
            }
        );

        if (matchError) {
            console.error('[Knowledge Search] Vector search error:', matchError);
        }

        console.log(`[Knowledge Search] Vector search found ${vectorMatches?.length || 0} documents`);
        if (vectorMatches && vectorMatches.length > 0) {
            console.log('[Knowledge Search] Top similarities:',
                vectorMatches.slice(0, 5).map((d: { similarity: number }) => d.similarity.toFixed(3))
            );
        }

        // Step 3: Keyword-based fallback search
        // Always run this to ensure we don't miss exact keyword matches
        const keywords = extractKeywords(userQuery);
        console.log(`[Knowledge Search] Extracted keywords: ${keywords.join(', ')}`);

        let keywordMatches: { id: string; content: string }[] = [];

        if (keywords.length > 0) {
            // Search for any document containing any of the keywords
            const keywordConditions = keywords.map(kw => `content.ilike.%${kw}%`);

            const { data: kwResults, error: kwError } = await supabase
                .from('knowledge_items')
                .select('id, content')
                .eq('project_id', projectId)
                .eq('status', 'indexed')
                .not('content', 'is', null)
                .or(keywordConditions.join(','))
                .limit(20);

            if (kwError) {
                console.error('[Knowledge Search] Keyword search error:', kwError);
            } else {
                keywordMatches = kwResults || [];
                console.log(`[Knowledge Search] Keyword search found ${keywordMatches.length} documents`);
            }
        }

        // Step 4: Merge and deduplicate results (prefer vector matches for ordering)
        const seenIds = new Set<string>();
        const allMatches: { id: string; content: string; source: string }[] = [];

        // Add vector matches first (they have similarity scores)
        if (vectorMatches && vectorMatches.length > 0) {
            for (const doc of vectorMatches) {
                if (!seenIds.has(doc.id)) {
                    seenIds.add(doc.id);
                    allMatches.push({ id: doc.id, content: doc.content, source: 'vector' });
                }
            }
        }

        // Add keyword matches that weren't already found
        for (const doc of keywordMatches) {
            if (!seenIds.has(doc.id)) {
                seenIds.add(doc.id);
                allMatches.push({ id: doc.id, content: doc.content, source: 'keyword' });
            }
        }

        console.log(`[Knowledge Search] Total unique documents for context: ${allMatches.length}`);

        // Step 5: Check for disambiguation scenario
        // If query is vague AND we have multiple distinct documents, show options
        const queryIsVague = isVagueQuery(userQuery);
        console.log(`[Knowledge Search] Query is vague: ${queryIsVague}`);

        if (queryIsVague && allMatches.length > 1) {
            const topics = extractDistinctTopics(allMatches);
            console.log(`[Knowledge Search] Returning disambiguation with ${topics.length} topics`);

            // Build a natural language prompt for disambiguation
            // AI will format this nicely instead of showing raw JSON
            const topicList = topics.map((t, i) => `${i + 1}. **${t.title}**\n   ${t.preview}`).join('\n\n');

            const disambiguationPrompt = `The user asked a broad question. I found ${topics.length} different topics in the knowledge base. 

Please respond with a friendly message asking which topic they'd like to explore. Format the options as a numbered list with the title in bold and a brief preview. Here are the topics:

${topicList}

Respond naturally, like: "I found a few topics that might match what you're looking for:

1. **Topic Title**
   Brief preview...

2. **Topic Title**
   Brief preview...

Which one would you like to know more about? Just say the number or topic name!"`;

            const result = streamText({
                model: openai('gpt-4o'),
                system: 'You are a helpful knowledge assistant. Format the disambiguation options clearly and invite the user to choose one.',
                messages: [{ role: 'user', content: disambiguationPrompt }],
            });

            return result.toDataStreamResponse();
        }



        // Step 6: Build context from all matched documents
        let context = '';
        if (allMatches.length > 0) {
            context = allMatches
                .map(doc => doc.content)
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
9. SEARCH THE ENTIRE CONTEXT THOROUGHLY before saying information is not available.
10. The context may contain the answer in different words - look for semantic matches, not just exact phrases.

CONTEXT FROM KNOWLEDGE BASE (${allMatches.length} documents):
${context}

Remember: If it's not in the context above, you don't know it. Period. But SEARCH THOROUGHLY before concluding that.`
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
