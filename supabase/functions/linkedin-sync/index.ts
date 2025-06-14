
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

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
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Get the user from the request
    const {
      data: { user },
    } = await supabaseClient.auth.getUser()

    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const { action, campaignData } = await req.json()
    console.log('LinkedIn sync action:', action)

    switch (action) {
      case 'sync-ad-accounts':
        return await syncAdAccounts(supabaseClient, user.id)
      
      case 'sync-campaigns':
        return await syncCampaigns(supabaseClient, user.id)
      
      case 'sync-leads':
        return await syncLeads(supabaseClient, user.id)
      
      case 'create-campaign':
        return await createCampaign(supabaseClient, user.id, campaignData)
      
      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
    }
  } catch (error) {
    console.error('LinkedIn sync error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

async function getLinkedInAccessToken() {
  const token = Deno.env.get('LINKEDIN_ACCESS_TOKEN')
  console.log('Access token available:', !!token)
  return token
}

async function makeLinkedInRequest(url: string, accessToken: string, method = 'GET', body?: any) {
  console.log('Making LinkedIn API request to:', url)
  
  const headers: Record<string, string> = {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
    'X-Restli-Protocol-Version': '2.0.0'
  }

  const response = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined
  })

  console.log('LinkedIn API response status:', response.status)
  
  if (!response.ok) {
    const errorText = await response.text()
    console.error('LinkedIn API error response:', errorText)
    throw new Error(`LinkedIn API error: ${response.status} - ${errorText}`)
  }

  return await response.json()
}

async function syncAdAccounts(supabaseClient: any, userId: string) {
  console.log('Syncing LinkedIn ad accounts for user:', userId)
  
  const accessToken = await getLinkedInAccessToken()
  if (!accessToken) {
    throw new Error('LinkedIn access token not found')
  }

  try {
    // Test API access first with a simple profile call
    console.log('Testing API access...')
    const profileData = await makeLinkedInRequest('https://api.linkedin.com/v2/people/~', accessToken)
    console.log('Profile test successful:', profileData.id)

    // Fetch ad accounts from LinkedIn API
    const data = await makeLinkedInRequest('https://api.linkedin.com/v2/adAccountsV2', accessToken)
    console.log('LinkedIn ad accounts response:', data)

    // Store ad accounts in database
    let insertedCount = 0
    for (const account of data.elements || []) {
      const { error } = await supabaseClient
        .from('linkedin_ad_accounts')
        .upsert({
          user_id: userId,
          linkedin_account_id: account.id.toString(),
          name: account.name || 'Unknown Account',
          type: account.type || 'BUSINESS',
          status: account.status || 'ENABLED',
          currency: account.currency || 'USD'
        })
      
      if (error) {
        console.error('Error storing ad account:', error)
      } else {
        insertedCount++
      }
    }

    return new Response(
      JSON.stringify({ success: true, count: insertedCount, total: data.elements?.length || 0 }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Ad accounts sync failed:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
}

async function syncCampaigns(supabaseClient: any, userId: string) {
  console.log('Syncing LinkedIn campaigns for user:', userId)
  
  const accessToken = await getLinkedInAccessToken()
  if (!accessToken) {
    throw new Error('LinkedIn access token not found')
  }

  try {
    // Get user's ad accounts first
    const { data: adAccounts } = await supabaseClient
      .from('linkedin_ad_accounts')
      .select('linkedin_account_id')
      .eq('user_id', userId)

    if (!adAccounts || adAccounts.length === 0) {
      return new Response(
        JSON.stringify({ success: true, message: 'No ad accounts found. Please sync ad accounts first.', count: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Found ad accounts:', adAccounts.length)
    let totalCampaigns = 0

    for (const account of adAccounts) {
      try {
        // Fetch campaigns for each ad account
        const campaignUrl = `https://api.linkedin.com/v2/campaignsV2?q=search&search.account.values[0]=urn:li:sponsoredAccount:${account.linkedin_account_id}`
        const data = await makeLinkedInRequest(campaignUrl, accessToken)
        
        console.log(`Campaigns for account ${account.linkedin_account_id}:`, data.elements?.length || 0)

        // Store campaigns in database
        for (const campaign of data.elements || []) {
          const { error } = await supabaseClient
            .from('linkedin_campaigns')
            .upsert({
              user_id: userId,
              linkedin_campaign_id: campaign.id.toString(),
              name: campaign.name || 'Unnamed Campaign',
              status: campaign.status || 'DRAFT',
              campaign_type: campaign.type || 'SPONSORED_CONTENT',
              objective_type: campaign.objectiveType || 'LEAD_GENERATION',
              budget_amount: campaign.dailyBudget?.amount || 0,
              budget_currency: campaign.dailyBudget?.currencyCode || 'USD',
              created_at: campaign.createdAt ? new Date(campaign.createdAt).toISOString() : new Date().toISOString(),
              last_synced_at: new Date().toISOString()
            })
          
          if (error) {
            console.error('Error storing campaign:', error)
          } else {
            totalCampaigns++
          }
        }
      } catch (error) {
        console.error(`Error syncing campaigns for account ${account.linkedin_account_id}:`, error)
      }
    }

    return new Response(
      JSON.stringify({ success: true, count: totalCampaigns }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Campaigns sync failed:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
}

async function syncLeads(supabaseClient: any, userId: string) {
  console.log('Syncing LinkedIn leads for user:', userId)
  
  const accessToken = await getLinkedInAccessToken()
  if (!accessToken) {
    throw new Error('LinkedIn access token not found')
  }

  try {
    // Get user's campaigns
    const { data: campaigns } = await supabaseClient
      .from('linkedin_campaigns')
      .select('id, linkedin_campaign_id')
      .eq('user_id', userId)

    if (!campaigns || campaigns.length === 0) {
      return new Response(
        JSON.stringify({ success: true, message: 'No campaigns found. Please sync campaigns first.', count: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Found campaigns:', campaigns.length)
    let totalLeads = 0

    for (const campaign of campaigns) {
      try {
        // Fetch lead gen forms for each campaign
        const formsUrl = `https://api.linkedin.com/v2/leadGenForms?q=owner&owner=urn:li:sponsoredCampaign:${campaign.linkedin_campaign_id}`
        const formsData = await makeLinkedInRequest(formsUrl, accessToken)

        console.log(`Forms for campaign ${campaign.linkedin_campaign_id}:`, formsData.elements?.length || 0)

        // For each form, fetch the leads
        for (const form of formsData.elements || []) {
          try {
            const leadsUrl = `https://api.linkedin.com/v2/leadGenFormResponses?q=form&form=urn:li:leadGenForm:${form.id}`
            const leadsData = await makeLinkedInRequest(leadsUrl, accessToken)

            console.log(`Leads for form ${form.id}:`, leadsData.elements?.length || 0)

            // Store leads in database
            for (const lead of leadsData.elements || []) {
              const leadData: any = {
                user_id: userId,
                linkedin_lead_id: lead.id.toString(),
                campaign_id: campaign.id,
                linkedin_campaign_id: campaign.linkedin_campaign_id,
                form_name: form.name || 'Unknown Form',
                lead_data: lead.responses || {},
                submitted_at: lead.submittedAt ? new Date(lead.submittedAt).toISOString() : new Date().toISOString()
              }

              // Extract common fields from responses
              if (lead.responses) {
                for (const response of lead.responses) {
                  switch (response.questionId) {
                    case 'firstName':
                      leadData.first_name = response.answer
                      break
                    case 'lastName':
                      leadData.last_name = response.answer
                      break
                    case 'emailAddress':
                      leadData.email = response.answer
                      break
                    case 'phoneNumber':
                      leadData.phone = response.answer
                      break
                    case 'company':
                      leadData.company = response.answer
                      break
                    case 'jobTitle':
                      leadData.job_title = response.answer
                      break
                  }
                }
              }

              const { error } = await supabaseClient
                .from('linkedin_leads')
                .upsert(leadData)
              
              if (error) {
                console.error('Error storing lead:', error)
              } else {
                totalLeads++
              }
            }
          } catch (error) {
            console.error(`Error fetching leads for form ${form.id}:`, error)
          }
        }
      } catch (error) {
        console.error(`Error fetching forms for campaign ${campaign.linkedin_campaign_id}:`, error)
      }
    }

    return new Response(
      JSON.stringify({ success: true, count: totalLeads }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Leads sync failed:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
}

async function createCampaign(supabaseClient: any, userId: string, campaignData: any) {
  console.log('Creating LinkedIn campaign for user:', userId, campaignData)
  
  const accessToken = await getLinkedInAccessToken()
  if (!accessToken) {
    throw new Error('LinkedIn access token not found')
  }

  try {
    // Create campaign via LinkedIn API
    const requestBody = {
      name: campaignData.name,
      account: `urn:li:sponsoredAccount:${campaignData.accountId}`,
      status: 'DRAFT',
      type: campaignData.type || 'SPONSORED_CONTENT',
      objectiveType: campaignData.objectiveType || 'LEAD_GENERATION',
      dailyBudget: {
        amount: campaignData.dailyBudget,
        currencyCode: campaignData.currency || 'USD'
      }
    }

    const data = await makeLinkedInRequest('https://api.linkedin.com/v2/campaignsV2', accessToken, 'POST', requestBody)
    console.log('LinkedIn campaign created:', data)

    // Store campaign in database
    const { error } = await supabaseClient
      .from('linkedin_campaigns')
      .insert({
        user_id: userId,
        linkedin_campaign_id: data.id.toString(),
        name: campaignData.name,
        status: 'DRAFT',
        campaign_type: campaignData.type || 'SPONSORED_CONTENT',
        objective_type: campaignData.objectiveType || 'LEAD_GENERATION',
        budget_amount: campaignData.dailyBudget,
        budget_currency: campaignData.currency || 'USD',
        last_synced_at: new Date().toISOString()
      })

    if (error) {
      console.error('Error storing created campaign:', error)
    }

    return new Response(
      JSON.stringify({ success: true, campaign: data }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Campaign creation failed:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
}
