import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://rbhhgibgdzbferlkskcm.supabase.co'
const SUPABASE_ANON_KEY = 'sb_publishable_hQ_QT2mEHvPH_j8fQbcAwQ_w3RTl1PE'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
