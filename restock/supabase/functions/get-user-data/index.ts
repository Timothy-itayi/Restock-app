// supabase/functions/get-user-data/index.ts
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

interface GetUserDataRequest {
  userId: string;
  dataType: 'sessions' | 'products' | 'suppliers' | 'all';
  includeFinished?: boolean;
}

function createResponse(data: any, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, apikey',
    },
  });
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, apikey',
      },
    });
  }

  if (req.method !== 'POST') {
    return createResponse({
      success: false,
      error: "Method not allowed. Use POST to get user data."
    }, 405);
  }

  try {
    // Initialize Supabase client with service role key
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseServiceKey) {
      return createResponse({
        success: false,
        error: "Server configuration error"
      }, 500);
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Parse request body
    const body: GetUserDataRequest = await req.json();
    const { userId, dataType, includeFinished = true } = body;

    // Validate user ID format (Clerk user IDs start with 'user_')
    if (!userId || !userId.startsWith('user_')) {
      return createResponse({
        success: false,
        error: "Invalid user ID format"
      }, 400);
    }

    console.log(`Getting ${dataType} data for user:`, userId);

    let result: any = {};

    // Get data based on type requested
    if (dataType === 'sessions' || dataType === 'all') {
      // Get user sessions
      const { data: sessions, error: sessionsError } = await supabaseAdmin
        .from('restock_sessions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (sessionsError) {
        console.error('Error fetching sessions:', sessionsError);
      } else {
        const unfinishedSessions = sessions?.filter(s => s.status !== 'sent') || [];
        const finishedSessions = sessions?.filter(s => s.status === 'sent') || [];
        
        result.sessions = {
          unfinished: unfinishedSessions,
          finished: includeFinished ? finishedSessions : [],
          total: sessions?.length || 0
        };
      }
    }

    if (dataType === 'products' || dataType === 'all') {
      // Get user products
      const { data: products, error: productsError } = await supabaseAdmin
        .from('products')
        .select('*')
        .eq('user_id', userId)
        .order('name');

      if (productsError) {
        console.error('Error fetching products:', productsError);
      } else {
        result.products = products || [];
      }
    }

    if (dataType === 'suppliers' || dataType === 'all') {
      // Get user suppliers
      const { data: suppliers, error: suppliersError } = await supabaseAdmin
        .from('suppliers')
        .select('*')
        .eq('user_id', userId)
        .order('name');

      if (suppliersError) {
        console.error('Error fetching suppliers:', suppliersError);
      } else {
        result.suppliers = suppliers || [];
      }
    }

    if (dataType === 'all') {
      // Get user profile for context
      const { data: profile, error: profileError } = await supabaseAdmin
        .from('users')
        .select('id, email, name, store_name, created_at')
        .eq('id', userId)
        .maybeSingle();

      if (!profileError && profile) {
        result.profile = profile;
      }
    }

    console.log(`Successfully retrieved ${dataType} data for user ${userId}`);

    return createResponse({
      success: true,
      data: result,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Get user data function error:', error);
    
    return createResponse({
      success: false,
      error: "Internal server error",
      details: error.message,
      timestamp: new Date().toISOString()
    }, 500);
  }
});
