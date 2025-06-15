
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
    const deploymentName = Deno.env.get('AZURE_OPENAI_DEPLOYMENT_NAME') || 'gpt-4';

    console.log('Azure config check:', {
      hasApiKey: !!azureApiKey,
      hasEndpoint: !!azureEndpoint,
      deploymentName: deploymentName
    });

    if (!azureApiKey || !azureEndpoint) {
      return new Response(JSON.stringify({ error: "Azure API credentials not configured. Please set AZURE_OPENAI_API_KEY and AZURE_OPENAI_ENDPOINT." }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Construct the proper Azure OpenAI endpoint URL
    const azureUrl = `${azureEndpoint}/openai/deployments/${deploymentName}/chat/completions?api-version=2023-12-01-preview`;
    
    console.log('Making request to Azure URL:', azureUrl);

    // Prepare request to Azure OpenAI
    const azureRes = await fetch(azureUrl, {
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

    console.log('Azure response status:', azureRes.status);

    if (!azureRes.ok) {
      const errorText = await azureRes.text();
      console.error("Azure AI error:", azureRes.status, errorText);
      
      // Provide more specific error messages
      if (azureRes.status === 404) {
        return new Response(JSON.stringify({ 
          error: `Azure deployment not found. Check if deployment name '${deploymentName}' exists and endpoint is correct.` 
        }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      
      return new Response(JSON.stringify({ error: `Azure AI API error: ${azureRes.status} - ${errorText}` }), {
        status: azureRes.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const resData = await azureRes.json();
    console.log('Azure response received successfully');
    
    const answer = resData.choices?.[0]?.message?.content || "No answer from AI";

    return new Response(
      JSON.stringify({ content: answer }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error("Error in azure-ai-chat function:", err);
    return new Response(JSON.stringify({ error: `Function error: ${err.message}` }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
