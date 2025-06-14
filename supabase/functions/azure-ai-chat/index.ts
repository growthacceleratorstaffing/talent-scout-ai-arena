
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt } = await req.json();

    // Load Azure secrets from environment
    const azureApiKey = Deno.env.get('AZURE_OPENAI_API_KEY');
    const azureEndpoint = Deno.env.get('AZURE_OPENAI_ENDPOINT');

    if (!azureApiKey || !azureEndpoint) {
      return new Response(JSON.stringify({ error: "Azure API credentials not set." }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Prepare request to Azure OpenAI
    const azureRes = await fetch(azureEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": azureApiKey,
      },
      body: JSON.stringify({
        messages: [
          {
            role: "system",
            content: "You are a helpful HR and recruiting assistant."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 800,
        temperature: 0.7,
      }),
    });

    if (!azureRes.ok) {
      const errorText = await azureRes.text();
      console.error("Azure AI error:", azureRes.status, errorText);
      return new Response(JSON.stringify({ error: `Azure AI API error: ${azureRes.status}` }), {
        status: azureRes.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const resData = await azureRes.json();
    const answer = resData.choices?.[0]?.message?.content || resData.content || "No answer from AI";

    return new Response(
      JSON.stringify({ content: answer }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error("Error in azure-ai-chat function:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
