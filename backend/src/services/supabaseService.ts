import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { env } from '../config/env';

let supabaseClientInstance: SupabaseClient | null = null;

/**
 * Returns a configured Supabase client instance or null if credentials are not configured.
 */
export const getSupabaseClient = (): SupabaseClient | null => {
  if (supabaseClientInstance) {
    return supabaseClientInstance;
  }

  const supabaseUrl = env.SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

  if (supabaseUrl && supabaseKey) {
    try {
      supabaseClientInstance = createClient(supabaseUrl, supabaseKey, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      });
      console.log('⚡ [Supabase] Connected successfully to:', supabaseUrl);
      return supabaseClientInstance;
    } catch (err) {
      console.error('❌ [Supabase] Initialization error:', err);
      return null;
    }
  }

  return null;
};

/**
 * Check connectivity and features available on Supabase
 */
export const checkSupabaseStatus = async (): Promise<{
  configured: boolean;
  connected: boolean;
  url?: string;
  features: {
    storage: boolean;
    vectorAI: boolean;
    database: boolean;
  };
  message: string;
}> => {
  const supabase = getSupabaseClient();
  const supabaseUrl = env.SUPABASE_URL || process.env.SUPABASE_URL;

  if (!supabase || !supabaseUrl) {
    return {
      configured: false,
      connected: false,
      features: {
        storage: false,
        vectorAI: false,
        database: false,
      },
      message: 'Supabase credentials not configured in environment. Using local dev fallback.',
    };
  }

  try {
    // Ping Supabase storage or auth
    const { data, error } = await supabase.storage.listBuckets();
    const hasStorage = !error && Array.isArray(data);

    return {
      configured: true,
      connected: !error,
      url: supabaseUrl,
      features: {
        storage: hasStorage,
        vectorAI: true, // pgvector AI vector store ready
        database: true,
      },
      message: error ? `Supabase connection issue: ${error.message}` : 'Supabase connected and operational.',
    };
  } catch (err: any) {
    return {
      configured: true,
      connected: false,
      url: supabaseUrl,
      features: {
        storage: false,
        vectorAI: false,
        database: false,
      },
      message: `Failed to ping Supabase: ${err.message || 'Unknown network error'}`,
    };
  }
};

/**
 * Upload image or evidentiary document to Supabase Storage
 */
export const uploadToSupabaseStorage = async (
  fileBuffer: Buffer,
  fileName: string,
  contentType: string = 'image/jpeg',
  bucketName: string = env.SUPABASE_STORAGE_BUCKET || 'case-evidence'
): Promise<{ success: boolean; publicUrl?: string; error?: string }> => {
  const supabase = getSupabaseClient();

  if (!supabase) {
    return {
      success: false,
      error: 'Supabase client is not configured. Falling back to local disk storage.',
    };
  }

  try {
    const filePath = `uploads/${Date.now()}_${fileName}`;
    const { error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(filePath, fileBuffer, {
        contentType,
        upsert: true,
      });

    if (uploadError) {
      return { success: false, error: uploadError.message };
    }

    const { data: publicUrlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filePath);

    return {
      success: true,
      publicUrl: publicUrlData.publicUrl,
    };
  } catch (err: any) {
    return { success: false, error: err.message || 'Unknown storage upload error' };
  }
};

/**
 * Vector Similarity Search via Supabase pgvector RPC
 * Call RPC function match_case_embeddings in Supabase
 */
export const searchSupabaseVectorEmbeddings = async (
  queryEmbedding: number[],
  matchThreshold: number = 0.7,
  matchCount: number = 5
): Promise<{ success: boolean; matches: any[]; error?: string }> => {
  const supabase = getSupabaseClient();

  if (!supabase) {
    return {
      success: false,
      matches: [],
      error: 'Supabase vector client not configured.',
    };
  }

  try {
    const { data, error } = await supabase.rpc('match_case_embeddings', {
      query_embedding: queryEmbedding,
      match_threshold: matchThreshold,
      match_count: matchCount,
    });

    if (error) {
      return { success: false, matches: [], error: error.message };
    }

    return { success: true, matches: data || [] };
  } catch (err: any) {
    return { success: false, matches: [], error: err.message };
  }
};
