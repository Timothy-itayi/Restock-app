// supabase/functions/generate-email/index.ts
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

interface EmailRequest {
  supplier: string;
  email: string;
  products: Array<{
    name: string;
    quantity: number;
  }>;
  user: string;
  storeName: string;
  urgency?: 'normal' | 'urgent' | 'rush';
  tone?: 'professional' | 'friendly' | 'formal';
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  }

  try {
    const { supplier, email, products, user, storeName, urgency = 'normal', tone = 'professional' }: EmailRequest = await req.json();

    // Validate required fields
    if (!supplier || !email || !products || !user || !storeName) {
      return new Response(JSON.stringify({ 
        error: "Missing required fields: supplier, email, products, user, storeName" 
      }), {
        headers: { 
          "Content-Type": "application/json",
          'Access-Control-Allow-Origin': '*',
        },
        status: 400,
      });
    }

    // Build product list
    const productList = products.map(p => `• ${p.quantity}x ${p.name}`).join('\n');

    // Create optimized prompt for Gemma2 model
    const prompt = `Write a professional restock order email for a grocery store.

Context:
- Store: ${storeName}
- Supplier: ${supplier} (${email})
- Products: ${productList}
- Tone: ${tone}
- Urgency: ${urgency === 'urgent' ? 'urgent delivery needed' : urgency === 'rush' ? 'rush delivery required' : 'standard timeline'}

Requirements:
- Professional greeting with supplier name
- Clear product list with quantities
- Professional closing with store contact
- No pricing discussion
- Keep under 200 words

Format:
Subject: [Subject Line]

[Email Body]`;

    const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${Deno.env.get("GROQ_API_KEY")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gemma2-9b-it",
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 400,
        top_p: 1,
        stream: false,
      }),
    });

    if (!groqRes.ok) {
      const errorData = await groqRes.text();
      console.error('Groq API error:', errorData);
      return new Response(JSON.stringify({ 
        error: `Groq API error: ${groqRes.status}` 
      }), {
        headers: { 
          "Content-Type": "application/json",
          'Access-Control-Allow-Origin': '*',
        },
        status: 500,
      });
    }

    const groqData = await groqRes.json();
    const emailText = groqData.choices?.[0]?.message?.content ?? "No response generated.";

    // Parse subject and body from response
    const subjectMatch = emailText.match(/^Subject:\s*(.+)$/mi);
    const subject = subjectMatch ? subjectMatch[1].trim() : 'Restock Order Request';
    const body = emailText.replace(/^Subject:\s*.+$/mi, '').trim();

    return new Response(JSON.stringify({ 
      subject,
      body: emailText,
      emailText,
      confidence: 0.95,
      generationTime: Date.now(),
      model: "gemma2-9b-it"
    }), {
      headers: { 
        "Content-Type": "application/json",
        'Access-Control-Allow-Origin': '*',
      },
      status: 200,
    });
  } catch (err) {
    console.error('Function error:', err);
    return new Response(JSON.stringify({ 
      error: err.message || 'Internal server error' 
    }), {
      headers: { 
        "Content-Type": "application/json",
        'Access-Control-Allow-Origin': '*',
      },
      status: 500,
    });
  }
}); 