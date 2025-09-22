import { supabase } from "./supabase";
import { customAlphabet } from "nanoid";

const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
const nanoid = customAlphabet(alphabet, 7);

export async function saveShared(content: string, customId?: string): Promise<string> {
    const id = customId || nanoid();
    const { error } = await supabase.from("notes").insert({ id, content });
    if (error) throw error;
    return id;
}

export async function loadShared(id: string): Promise<string | null> {
    const { data, error } = await supabase.from("notes").select("content").eq("id", id).maybeSingle();
    if (error) throw error;
    return data?.content ?? null;
}
