-- =============================================
-- Knowledge Hub Database Schema
-- Run this in your Supabase SQL Editor
-- =============================================

-- Enable required extensions
create extension if not exists vector;

-- =============================================
-- Table: projects
-- Stores project/workspace information
-- =============================================
create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamp with time zone default now()
);

-- Index for faster project lookups
create index if not exists idx_projects_created_at on projects(created_at desc);

-- =============================================
-- Table: knowledge_items  
-- Stores all knowledge entries with embeddings
-- =============================================
create table if not exists knowledge_items (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  content text,
  file_url text,
  file_name text,
  embedding vector(1536), -- OpenAI text-embedding-3-small dimension
  type text not null check (type in ('text', 'audio', 'pdf')),
  status text not null default 'processing' check (status in ('processing', 'indexed', 'error')),
  error_message text,
  created_at timestamp with time zone default now()
);

-- Indexes for efficient queries
create index if not exists idx_knowledge_items_project_id on knowledge_items(project_id);
create index if not exists idx_knowledge_items_status on knowledge_items(status);
create index if not exists idx_knowledge_items_created_at on knowledge_items(created_at desc);

-- HNSW index for fast vector similarity search
create index if not exists idx_knowledge_items_embedding on knowledge_items 
using hnsw (embedding vector_cosine_ops);

-- =============================================
-- Function: match_documents
-- Semantic search using vector similarity
-- =============================================
create or replace function match_documents(
  query_embedding vector(1536),
  match_project_id uuid,
  match_threshold float default 0.5,
  match_count int default 5
)
returns table (
  id uuid,
  content text,
  similarity float
)
language sql stable
as $$
  select
    knowledge_items.id,
    knowledge_items.content,
    1 - (knowledge_items.embedding <=> query_embedding) as similarity
  from knowledge_items
  where 
    project_id = match_project_id
    and status = 'indexed'
    and embedding is not null
    and 1 - (knowledge_items.embedding <=> query_embedding) > match_threshold
  order by knowledge_items.embedding <=> query_embedding
  limit match_count;
$$;

-- =============================================
-- Storage Bucket: knowledge-files
-- Create via Supabase Dashboard or API
-- =============================================
-- Note: Create a storage bucket named 'knowledge-files' 
-- with public access for file uploads

-- =============================================
-- Row Level Security (RLS)
-- For production, enable RLS and add policies
-- =============================================
-- For development, we'll keep RLS disabled
-- In production, uncomment and customize:

-- alter table projects enable row level security;
-- alter table knowledge_items enable row level security;

-- create policy "Allow all for now" on projects for all using (true);
-- create policy "Allow all for now" on knowledge_items for all using (true);
