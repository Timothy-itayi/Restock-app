// supabase/functions/create-user-profile/index.ts
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

interface CreateProfileRequest {
  clerkUserId: string;
  email: string;
  storeName: string;
  name?: string;
  authMethod: 'email' | 'google' | 'sso';
}

interface ProfileResponse {
  success: boolean;
  data?: any;
  error?: string;
  details?: string;
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
      error: "Method not allowed. Use POST to create user profiles."
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
    const body: CreateProfileRequest = await req.json();
    const { clerkUserId, email, storeName, name, authMethod } = body;

    // Validate required fields
    if (!clerkUserId || !email || !storeName) {
      return createResponse({
        success: false,
        error: "Missing required fields",
        details: "clerkUserId, email, and storeName are required"
      }, 400);
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return createResponse({
        success: false,
        error: "Invalid email format"
      }, 400);
    }

    // Validate store name length
    if (storeName.trim().length < 2) {
      return createResponse({
        success: false,
        error: "Store name must be at least 2 characters long"
      }, 400);
    }

    console.log('Creating user profile:', {
      clerkUserId,
      email,
      storeName: storeName.trim(),
      name: name?.trim(),
      authMethod
    });

    // Step 1: Check if email is already taken by another user
    const { data: existingByEmail, error: emailCheckError } = await supabaseAdmin
      .from('users')
      .select('id, email')
      .eq('email', email)
      .maybeSingle();

    if (emailCheckError) {
      console.error('Email check error:', emailCheckError);
      return createResponse({
        success: false,
        error: "Database error during email validation",
        details: emailCheckError.message
      }, 500);
    }

    // If email exists and belongs to different user, reject
    if (existingByEmail && existingByEmail.id !== clerkUserId) {
      return createResponse({
        success: false,
        error: "EMAIL_TAKEN",
        details: "An account already exists with this email address"
      }, 409);
    }

    // Step 2: Check if user profile already exists
    const { data: existingUser, error: userCheckError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', clerkUserId)
      .maybeSingle();

    if (userCheckError) {
      console.error('User check error:', userCheckError);
      return createResponse({
        success: false,
        error: "Database error during user validation",
        details: userCheckError.message
      }, 500);
    }

    // If user already exists, return existing profile
    if (existingUser) {
      console.log('User profile already exists:', existingUser.id);
      return createResponse({
        success: true,
        data: existingUser,
        message: "User profile already exists"
      });
    }

    // Step 3: Create new user profile
    console.log('Creating new user profile...');
    const newUserData = {
      id: clerkUserId,
      email: email.toLowerCase().trim(),
      name: name?.trim() || null,
      store_name: storeName.trim(),
      created_at: new Date().toISOString(),
    };

    const { data: newUser, error: insertError } = await supabaseAdmin
      .from('users')
      .insert(newUserData)
      .select()
      .single();

    if (insertError) {
      console.error('Profile creation error:', insertError);
      
      // Handle specific error cases
      if (insertError.code === '23505') { // Unique constraint violation
        return createResponse({
          success: false,
          error: "DUPLICATE_USER",
          details: "User profile already exists or email is taken"
        }, 409);
      }
      
      return createResponse({
        success: false,
        error: "Failed to create user profile",
        details: insertError.message
      }, 500);
    }

    console.log('User profile created successfully:', newUser.id);

    // Step 4: Log successful profile creation for audit
    try {
      await supabaseAdmin
        .from('audit_logs')
        .insert({
          user_id: clerkUserId,
          action: 'CREATE_PROFILE',
          table_name: 'users',
          record_id: clerkUserId,
          new_values: newUserData,
          ip_address: req.headers.get('x-forwarded-for') || 'unknown',
          user_agent: req.headers.get('user-agent') || 'unknown',
        });
    } catch (auditError) {
      // Don't fail the request if audit logging fails
      console.warn('Audit logging failed:', auditError);
    }

    return createResponse({
      success: true,
      data: newUser,
      message: "User profile created successfully"
    });

  } catch (error) {
    console.error('Create user profile function error:', error);
    
    return createResponse({
      success: false,
      error: "Internal server error",
      details: error.message,
      timestamp: new Date().toISOString()
    }, 500);
  }
});
