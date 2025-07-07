
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, type } = await req.json();
    console.log('Azure AI request type:', type);
    console.log('Prompt length:', prompt.length);

    // Get Azure AI credentials from environment
    const azureApiKey = Deno.env.get('AZURE_OPENAI_API_KEY');
    const azureEndpoint = Deno.env.get('AZURE_OPENAI_ENDPOINT');

    if (!azureApiKey || !azureEndpoint) {
      console.error('Missing Azure AI credentials');
      return new Response(
        JSON.stringify({ error: 'Azure AI credentials not configured' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('Azure endpoint:', azureEndpoint);
    console.log('API key available:', !!azureApiKey);

    // Prepare the request to Azure OpenAI - fix endpoint format
    const deploymentName = Deno.env.get('AZURE_OPENAI_DEPLOYMENT_NAME') || 'gpt-4o';
    
    // Check if endpoint already includes the full URL structure
    const azureUrl = azureEndpoint.includes('/openai/deployments/') 
      ? azureEndpoint 
      : `${azureEndpoint}/openai/deployments/${deploymentName}/chat/completions?api-version=2024-02-15-preview`;
    
    console.log('Making request to Azure URL:', azureUrl);
    
    const azureResponse = await fetch(azureUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': azureApiKey,
      },
      body: JSON.stringify({
        messages: [
          {
            role: 'system',
            content: type === 'job_generation' 
              ? 'You are a professional HR assistant specializing in creating compelling job advertisements.'
              : 'You are an expert HR evaluator specializing in candidate assessment. Always respond with valid JSON format when requested.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 1000,
        temperature: 0.7,
      }),
    });

    if (!azureResponse.ok) {
      const errorText = await azureResponse.text();
      console.error('Azure AI API error:', azureResponse.status, errorText);
      return new Response(
        JSON.stringify({ error: `Azure AI API error: ${azureResponse.status}` }),
        { 
          status: azureResponse.status, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const azureData = await azureResponse.json();
    console.log('Azure AI response received');

    const content = azureData.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error('No content received from Azure AI');
    }

    return new Response(
      JSON.stringify({ content }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Azure AI function error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
