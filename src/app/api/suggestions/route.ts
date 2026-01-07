import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const projectId = searchParams.get('projectId');

        if (!projectId) {
            return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
        }

        const supabase = createServerClient();

        // Fetch recent knowledge items
        // We limit to 20 to get a pool to pick from
        const { data: items, error } = await supabase
            .from('knowledge_items')
            .select('file_name, content, type')
            .eq('project_id', projectId)
            .limit(20);

        if (error) {
            console.error('Error fetching knowledge items:', error);
            return NextResponse.json({ error: 'Failed to fetch suggestions' }, { status: 500 });
        }

        if (!items || items.length === 0) {
            return NextResponse.json({ suggestions: [] });
        }

        // Shuffle and pick 3
        const shuffled = items.sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, 3);

        const suggestions = selected.map((item, index) => {
            let fileName = item.file_name;

            // If filename is generic or missing, try to generate a better title from content
            if (!fileName || fileName === 'Document' || fileName === 'document') {
                if (item.content && item.content.length > 5) {
                    // Take first 3 words
                    const words = item.content.split(/\s+/).slice(0, 3).join(' ');
                    fileName = words.replace(/[^a-zA-Z0-9 ]/g, ''); // clean it up
                } else {
                    fileName = `Document ${index + 1}`;
                }
            }

            // Create a title like "SUMMARIZE [FILENAME]" or just the filename
            const cleanName = fileName.replace(/\.[^/.]+$/, "").trim(); // remove extension

            // Randomize the action verb for variety
            const actions = ['ANALYZE', 'SUMMARIZE', 'EXPLAIN', 'REVIEW'];
            const action = actions[Math.floor(Math.random() * actions.length)];

            const title = `${action} ${cleanName.substring(0, 15)}${cleanName.length > 15 ? '...' : ''}`.toUpperCase();

            // Create a description
            // If content is available, grab a snippet, else generic
            let desc = `Ask about details in ${fileName}.`;
            if (item.content) {
                // Take a longer snippet for the description
                desc = item.content.slice(0, 120).replace(/\s+/g, ' ').trim();
            }

            // Generate a natural question for the placeholder
            let placeholder = `Ask about ${cleanName}...`;
            if (action === 'SUMMARIZE') placeholder = `Summarize ${cleanName.substring(0, 20)}...`;
            else if (action === 'EXPLAIN') placeholder = `Explain the logic in ${cleanName.substring(0, 20)}...`;
            else if (action === 'ANALYZE') placeholder = `Analyze key points of ${cleanName.substring(0, 20)}...`;

            return {
                title: title,
                desc: `"${desc}..."`,
                prompt: `Tell me about ${cleanName} and its key details.`,
                placeholder: placeholder
            };
        });

        return NextResponse.json({ suggestions });

    } catch (error) {
        console.error('Error in suggestions API:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
