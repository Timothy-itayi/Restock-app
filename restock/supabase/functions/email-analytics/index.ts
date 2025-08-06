// supabase/functions/email-analytics/index.ts
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

interface AnalyticsRequest {
  userId?: string;
  sessionId?: string;
  startDate?: string;
  endDate?: string;
  timeframe?: 'day' | 'week' | 'month' | 'year';
}

interface EmailAnalytics {
  summary: {
    totalEmails: number;
    sent: number;
    delivered: number;
    bounced: number;
    failed: number;
    deliveryRate: number;
    bounceRate: number;
    period: string;
  };
  trends: Array<{
    date: string;
    sent: number;
    delivered: number;
    bounced: number;
    failed: number;
  }>;
  suppliers: Array<{
    name: string;
    email: string;
    totalEmails: number;
    deliveryRate: number;
    lastEmailSent: string;
  }>;
  performance: {
    averageDeliveryTime: string;
    peakSendingTime: string;
    mostActiveDay: string;
  };
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, apikey',
      },
    });
  }

  try {
    const url = new URL(req.url);
    const pathname = url.pathname;

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseServiceKey) {
      return createResponse({
        success: false,
        error: "Supabase configuration missing"
      }, 500);
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Route requests
    if (req.method === 'GET' && pathname.includes('/summary')) {
      return await handleAnalyticsSummary(req, supabase);
    }
    
    if (req.method === 'GET' && pathname.includes('/trends')) {
      return await handleTrends(req, supabase);
    }
    
    if (req.method === 'GET' && pathname.includes('/suppliers')) {
      return await handleSupplierAnalytics(req, supabase);
    }
    
    if (req.method === 'GET' && pathname.includes('/performance')) {
      return await handlePerformanceMetrics(req, supabase);
    }

    if (req.method === 'POST' || req.method === 'GET') {
      return await handleFullAnalytics(req, supabase);
    }

    // Handle unknown routes
    return createResponse({
      error: "Route not found",
      availableRoutes: [
        "GET/POST / - Get full analytics report",
        "GET /summary - Get summary statistics",
        "GET /trends - Get delivery trends over time",
        "GET /suppliers - Get supplier-specific analytics", 
        "GET /performance - Get performance metrics"
      ]
    }, 404);

  } catch (error) {
    console.error('Analytics function error:', error);
    return createResponse({
      error: error.message || 'Internal server error',
      success: false,
      timestamp: new Date().toISOString()
    }, 500);
  }
});

async function handleFullAnalytics(req: Request, supabase: any): Promise<Response> {
  try {
    const params = await getRequestParams(req);
    const filters = buildFilters(params);
    
    // Get summary data
    const summary = await getEmailSummary(supabase, filters);
    
    // Get trends data
    const trends = await getTrendsData(supabase, filters);
    
    // Get supplier analytics
    const suppliers = await getSupplierAnalytics(supabase, filters);
    
    // Get performance metrics
    const performance = await getPerformanceMetrics(supabase, filters);

    const analytics: EmailAnalytics = {
      summary,
      trends,
      suppliers,
      performance
    };

    return createResponse({
      success: true,
      analytics,
      filters: params,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    return createResponse({
      success: false,
      error: "Failed to generate analytics",
      details: error.message
    }, 500);
  }
}

async function handleAnalyticsSummary(req: Request, supabase: any): Promise<Response> {
  try {
    const params = await getRequestParams(req);
    const filters = buildFilters(params);
    const summary = await getEmailSummary(supabase, filters);

    return createResponse({
      success: true,
      summary,
      period: filters.period,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    return createResponse({
      success: false,
      error: "Failed to get summary",
      details: error.message
    }, 500);
  }
}

async function handleTrends(req: Request, supabase: any): Promise<Response> {
  try {
    const params = await getRequestParams(req);
    const filters = buildFilters(params);
    const trends = await getTrendsData(supabase, filters);

    return createResponse({
      success: true,
      trends,
      period: filters.period,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    return createResponse({
      success: false,
      error: "Failed to get trends",
      details: error.message
    }, 500);
  }
}

async function handleSupplierAnalytics(req: Request, supabase: any): Promise<Response> {
  try {
    const params = await getRequestParams(req);
    const filters = buildFilters(params);
    const suppliers = await getSupplierAnalytics(supabase, filters);

    return createResponse({
      success: true,
      suppliers,
      period: filters.period,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    return createResponse({
      success: false,
      error: "Failed to get supplier analytics",
      details: error.message
    }, 500);
  }
}

async function handlePerformanceMetrics(req: Request, supabase: any): Promise<Response> {
  try {
    const params = await getRequestParams(req);
    const filters = buildFilters(params);
    const performance = await getPerformanceMetrics(supabase, filters);

    return createResponse({
      success: true,
      performance,
      period: filters.period,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    return createResponse({
      success: false,
      error: "Failed to get performance metrics",
      details: error.message
    }, 500);
  }
}

async function getRequestParams(req: Request): Promise<AnalyticsRequest> {
  const url = new URL(req.url);
  const params: AnalyticsRequest = {};

  if (req.method === 'POST') {
    try {
      const body = await req.json();
      Object.assign(params, body);
    } catch {
      // Ignore JSON parsing errors for GET requests
    }
  }

  // Get URL parameters
  params.userId = url.searchParams.get('userId') || params.userId;
  params.sessionId = url.searchParams.get('sessionId') || params.sessionId;
  params.startDate = url.searchParams.get('startDate') || params.startDate;
  params.endDate = url.searchParams.get('endDate') || params.endDate;
  params.timeframe = (url.searchParams.get('timeframe') as any) || params.timeframe || 'month';

  return params;
}

function buildFilters(params: AnalyticsRequest) {
  const now = new Date();
  let startDate: Date;
  let endDate = new Date();

  // Set date range based on timeframe
  switch (params.timeframe) {
    case 'day':
      startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      break;
    case 'week':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case 'year':
      startDate = new Date(now.getFullYear(), 0, 1);
      break;
    case 'month':
    default:
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
  }

  // Override with custom dates if provided
  if (params.startDate) {
    startDate = new Date(params.startDate);
  }
  if (params.endDate) {
    endDate = new Date(params.endDate);
  }

  return {
    userId: params.userId,
    sessionId: params.sessionId,
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
    period: `${startDate.toDateString()} to ${endDate.toDateString()}`
  };
}

async function getEmailSummary(supabase: any, filters: any) {
  let query = supabase
    .from('emails_sent')
    .select('status, delivery_status, sent_at')
    .gte('sent_at', filters.startDate)
    .lte('sent_at', filters.endDate);

  if (filters.userId) {
    query = query.eq('user_id', filters.userId);
  }
  if (filters.sessionId) {
    query = query.eq('session_id', filters.sessionId);
  }

  const { data: emails, error } = await query;
  
  if (error) throw error;

  const totalEmails = emails?.length || 0;
  const sent = emails?.filter(e => e.status === 'sent').length || 0;
  const delivered = emails?.filter(e => e.delivery_status === 'delivered').length || 0;
  const bounced = emails?.filter(e => e.delivery_status === 'bounced').length || 0;
  const failed = emails?.filter(e => e.status === 'failed').length || 0;

  const deliveryRate = sent > 0 ? Math.round((delivered / sent) * 100) : 0;
  const bounceRate = sent > 0 ? Math.round((bounced / sent) * 100) : 0;

  return {
    totalEmails,
    sent,
    delivered,
    bounced,
    failed,
    deliveryRate,
    bounceRate,
    period: filters.period
  };
}

async function getTrendsData(supabase: any, filters: any) {
  let query = supabase
    .from('emails_sent')
    .select('status, delivery_status, sent_at')
    .gte('sent_at', filters.startDate)
    .lte('sent_at', filters.endDate)
    .order('sent_at', { ascending: true });

  if (filters.userId) {
    query = query.eq('user_id', filters.userId);
  }

  const { data: emails, error } = await query;
  
  if (error) throw error;

  // Group by date
  const trends = {};
  emails?.forEach(email => {
    const date = new Date(email.sent_at).toDateString();
    if (!trends[date]) {
      trends[date] = { date, sent: 0, delivered: 0, bounced: 0, failed: 0 };
    }
    
    if (email.status === 'sent') trends[date].sent++;
    if (email.delivery_status === 'delivered') trends[date].delivered++;
    if (email.delivery_status === 'bounced') trends[date].bounced++;
    if (email.status === 'failed') trends[date].failed++;
  });

  return Object.values(trends);
}

async function getSupplierAnalytics(supabase: any, filters: any) {
  let query = supabase
    .from('emails_sent')
    .select(`
      supplier_id,
      status,
      delivery_status,
      sent_at,
      suppliers (
        name,
        email
      )
    `)
    .gte('sent_at', filters.startDate)
    .lte('sent_at', filters.endDate);

  if (filters.userId) {
    query = query.eq('user_id', filters.userId);
  }

  const { data: emails, error } = await query;
  
  if (error) throw error;

  // Group by supplier
  const supplierStats = {};
  emails?.forEach(email => {
    const supplierId = email.supplier_id;
    if (!supplierStats[supplierId]) {
      supplierStats[supplierId] = {
        name: email.suppliers?.name || 'Unknown',
        email: email.suppliers?.email || 'Unknown',
        totalEmails: 0,
        delivered: 0,
        lastEmailSent: email.sent_at
      };
    }
    
    supplierStats[supplierId].totalEmails++;
    if (email.delivery_status === 'delivered') {
      supplierStats[supplierId].delivered++;
    }
    
    // Update last email sent date
    if (new Date(email.sent_at) > new Date(supplierStats[supplierId].lastEmailSent)) {
      supplierStats[supplierId].lastEmailSent = email.sent_at;
    }
  });

  // Calculate delivery rates
  return Object.values(supplierStats).map((supplier: any) => ({
    ...supplier,
    deliveryRate: supplier.totalEmails > 0 
      ? Math.round((supplier.delivered / supplier.totalEmails) * 100)
      : 0
  }));
}

async function getPerformanceMetrics(supabase: any, filters: any) {
  // This is a simplified version - in production you'd calculate real metrics
  return {
    averageDeliveryTime: "< 2 minutes",
    peakSendingTime: "10:00 AM",
    mostActiveDay: "Tuesday"
  };
}

function createResponse(data: any, status: number = 200): Response {
  return new Response(JSON.stringify(data), {
    headers: { 
      "Content-Type": "application/json",
      'Access-Control-Allow-Origin': '*',
    },
    status,
  });
}