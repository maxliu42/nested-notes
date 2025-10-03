import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error(
        `Missing Supabase credentials. ` +
            `URL: ${SUPABASE_URL ? "set" : "MISSING"}, ` +
            `Key: ${SUPABASE_ANON_KEY ? "set" : "MISSING"}. ` +
            `Check that VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in your .env or GitHub secrets.`
    );
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false },
});

export type NoteRow = {
    id: string;
    content: string;
    created_at: string;
};
