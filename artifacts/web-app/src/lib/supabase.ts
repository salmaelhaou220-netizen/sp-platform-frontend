import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://rbhhgibgdzbferlkskcm.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJiaGhnaWJnZHpiZmVybGtza2NtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg1NDAxNzcsImV4cCI6MjA5NDExNjE3N30.dcUBhgGvXKl2JzAUKhOAFMCWas5L1tdnCtm7jlGV_XQ'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
