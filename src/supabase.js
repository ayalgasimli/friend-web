import { createClient } from '@supabase/supabase-js'

// Use environment variables for credentials (create .env file with these values)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://csomkgvkxmabngcmarwn.supabase.co'
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNzb21rZ3ZreG1hYm5nY21hcnduIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg1NjY2ODIsImV4cCI6MjA4NDE0MjY4Mn0.-Hib7wnxWdJPLlhsqr4gjyRtgMYZOVlGioRA09bm328'

export const supabase = createClient(supabaseUrl, supabaseKey)
