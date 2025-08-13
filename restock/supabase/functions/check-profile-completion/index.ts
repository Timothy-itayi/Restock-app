// supabase/functions/check-profile-completion/index.ts
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

interface CheckProfileRequest {
  clerkUserId: string;
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

  // Only allow POST requests
  if (req.method !== 'POST') {
    return createResponse({
      success: false,
      error: "Method not allowed. Use POST to check profile completion."
    }, 405);
  }

  try {
    // Initialize Supabase client with service role key
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseServiceKey) {
      return createResponse({
        success: false,
        error: "Server configuration error: Missing Supabase credentials"
      }, 500);
    }

    // Create admin client with service role privileges (bypasses RLS)
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Parse request body
    const body: CheckProfileRequest = await req.json();
    const { clerkUserId } = body;

    // Validate required fields
    if (!clerkUserId) {
      return createResponse({
        success: false,
        error: "Missing required field: clerkUserId"
      }, 400);
    }

    console.log('Checking profile completion for:', clerkUserId);

    // Check if user profile has store_name (indicates completion)
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('store_name')
      .eq('id', clerkUserId)
      .maybeSingle();

    if (error) {
      console.error('Database error:', error);
      return createResponse({
        success: false,
        error: "Database error",
        details: error.message
      }, 500);
    }

    // User has completed setup if they have a store_name
    const hasCompletedSetup = !!(data && data.store_name && data.store_name.trim() !== '');
    
    console.log('Profile completion check result:', {
      userId: clerkUserId,
      hasStoreName: !!(data && data.store_name),
      storeName: data?.store_name,
      hasCompletedSetup
    });

    return createResponse({
      success: true,
      hasCompletedSetup,
      storeName: data?.store_name || null
    });

  } catch (error) {
    console.error('Check profile completion function error:', error);
    
    return createResponse({
      success: false,
      error: "Internal server error",
      details: error.message,
      timestamp: new Date().toISOString()
    }, 500);
  }
});
