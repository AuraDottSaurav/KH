# Knowledge Hub

A full-stack Knowledge Transfer Platform built with Next.js 14, Supabase, and OpenAI.

## Features

- **Admin Knowledge Hub** (`/admin`): Dump multi-modal knowledge (text, voice, files) into project buckets
- **User Query Interface** (`/chat/[projectId]`): Query knowledge via chat or voice using RAG
- **Voice I/O**: Speech-to-text input and text-to-speech responses
- **Semantic Search**: pgvector-powered vector similarity search

## Tech Stack

- **Frontend**: Next.js 14 (App Router), Tailwind CSS, Framer Motion
- **Backend/DB**: Supabase (PostgreSQL + pgvector)
- **AI**: Vercel AI SDK, OpenAI GPT-4o, Whisper STT, TTS

## Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up Supabase**:
   - Create a new Supabase project
   - Run `supabase/schema.sql` in the SQL Editor
   - Create a storage bucket named `knowledge-files`

3. **Configure environment**:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_key
   OPENAI_API_KEY=your_openai_key
   ```

4. **Run development server**:
   ```bash
   npm run dev
   ```

## Usage

1. Go to `/admin` to create projects and add knowledge
2. Go to `/projects` to select a project
3. Go to `/chat/[projectId]` to query the knowledge

## API Routes

- `POST /api/projects` - Create project
- `GET /api/projects` - List projects
- `POST /api/ingest` - Ingest text/files with embeddings
- `POST /api/chat` - RAG-powered chat
- `POST /api/transcribe` - Speech-to-text
- `POST /api/speak` - Text-to-speech
