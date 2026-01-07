import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

// GET /api/projects - List all projects
export async function GET() {
    try {
        const supabase = createServerClient();

        const { data: projects, error } = await supabase
            .from('projects')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        return NextResponse.json({ projects });
    } catch (error) {
        console.error('Error fetching projects:', error);
        return NextResponse.json(
            { error: 'Failed to fetch projects' },
            { status: 500 }
        );
    }
}

// POST /api/projects - Create a new project
export async function POST(request: NextRequest) {
    try {
        const { name } = await request.json();

        if (!name || typeof name !== 'string' || name.trim().length === 0) {
            return NextResponse.json(
                { error: 'Project name is required' },
                { status: 400 }
            );
        }

        const supabase = createServerClient();

        const { data: project, error } = await supabase
            .from('projects')
            .insert({ name: name.trim() })
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ project }, { status: 201 });
    } catch (error) {
        console.error('Error creating project:', error);
        return NextResponse.json(
            { error: 'Failed to create project' },
            { status: 500 }
        );
    }
}

// DELETE /api/projects - Delete a project by ID
export async function DELETE(request: NextRequest) {
    try {
        const { id } = await request.json();

        if (!id || typeof id !== 'string') {
            return NextResponse.json(
                { error: 'Project ID is required' },
                { status: 400 }
            );
        }

        const supabase = createServerClient();

        // Delete associated knowledge items first
        await supabase
            .from('knowledge_items')
            .delete()
            .eq('project_id', id);

        // Delete associated chats
        await supabase
            .from('chats')
            .delete()
            .eq('project_id', id);

        // Delete the project
        const { error } = await supabase
            .from('projects')
            .delete()
            .eq('id', id);

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting project:', error);
        return NextResponse.json(
            { error: 'Failed to delete project' },
            { status: 500 }
        );
    }
}
