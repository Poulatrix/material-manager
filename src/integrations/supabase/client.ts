// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://aliqbcqingmqnmnupomf.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFsaXFiY3FpbmdtcW5tbnVwb21mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk3OTg3OTgsImV4cCI6MjA1NTM3NDc5OH0.lDgnwALg0_wnNJtl7PWDqw86QCX2RMPJ6btiusmpKKk";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);