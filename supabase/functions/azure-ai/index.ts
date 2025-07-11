
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
    
    console.log('Azure config check:', {
      hasApiKey: !!azureApiKey,
      keyLength: azureApiKey?.length,
      keyStart: azureApiKey?.substring(0, 10) + '...'
    });

    if (!azureApiKey) {
      console.error('Missing Azure AI credentials');
      return new Response(
        JSON.stringify({ error: 'Azure AI credentials not configured' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('API key available:', !!azureApiKey);

    // Use the correct Azure OpenAI endpoint
    const azureUrl = 'https://aistudioaiservices773784968662.openai.azure.com/openai/deployments/gpt-4o/chat/completions?api-version=2024-02-15-preview';
    
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
