import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

/** False until VITE_SUPABASE_URL/VITE_SUPABASE_ANON_KEY are set (see .env.example). */
export const supabaseConfigured = Boolean(url && anonKey)

// Guarded so an unconfigured project renders the setup screen in App.jsx
// instead of throwing out of this module and white-screening the app.
export const supabase = supabaseConfigured ? createClient(url, anonKey) : null
