-- Script SQL untuk membuat tabel "apps" di Supabase
-- Buka Supabase Dashboard -> Project Anda -> SQL Editor -> Tempel dan Jalankan (Run)

CREATE TABLE IF NOT EXISTS public.apps (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    model TEXT DEFAULT 'gemini-3.8-flash',
    tier TEXT DEFAULT 'FREE',
    status TEXT DEFAULT 'draft',
    messages JSONB DEFAULT '[]'::jsonb,
    user_email TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Mengaktifkan Row Level Security (RLS)
ALTER TABLE public.apps ENABLE ROW LEVEL SECURITY;

-- Kebijakan Akses: Izinkan membaca dan menyimpan data
CREATE POLICY "Allow public all access to apps" 
ON public.apps 
FOR ALL 
USING (true) 
WITH CHECK (true);
