// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://tqtzujkwwmaqlmleeyti.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRxdHp1amt3d21hcWxtbGVleXRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ2MzEwMjQsImV4cCI6MjA2MDIwNzAyNH0.NdLzjFNAttT4kGDUWu71Klz4xaVTqoCoFTSnEUyFSxs";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);