
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

    const { action } = await req.json()
    console.log('LinkedIn sync action:', action)

    switch (action) {
      case 'sync-ad-accounts':
        return await syncAdAccounts(supabaseClient, user.id)
      
      case 'sync-campaigns':
        return await syncCampaigns(supabaseClient, user.id)
      
      case 'sync-leads':
        return await syncLeads(supabaseClient, user.id)
      
      case 'create-campaign':
        const { campaignData } = await req.json()
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
  // This would typically be stored per user after OAuth
  // For now, using environment variable
  return Deno.env.get('LINKEDIN_ACCESS_TOKEN')
}

async function syncAdAccounts(supabaseClient: any, userId: string) {
  console.log('Syncing LinkedIn ad accounts for user:', userId)
  
  const accessToken = await getLinkedInAccessToken()
  if (!accessToken) {
    throw new Error('LinkedIn access token not found')
  }

  // Fetch ad accounts from LinkedIn API
  const response = await fetch('https://api.linkedin.com/v2/adAccountsV2', {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'X-Restli-Protocol-Version': '2.0.0'
    }
  })

  if (!response.ok) {
    throw new Error(`LinkedIn API error: ${response.status}`)
  }

  const data = await response.json()
  console.log('LinkedIn ad accounts response:', data)

  // Store ad accounts in database
  for (const account of data.elements || []) {
    await supabaseClient
      .from('linkedin_ad_accounts')
      .upsert({
        user_id: userId,
        linkedin_account_id: account.id.toString(),
        name: account.name,
        type: account.type,
        status: account.status,
        currency: account.currency
      })
  }

  return new Response(
    JSON.stringify({ success: true, count: data.elements?.length || 0 }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function syncCampaigns(supabaseClient: any, userId: string) {
  console.log('Syncing LinkedIn campaigns for user:', userId)
  
  const accessToken = await getLinkedInAccessToken()
  if (!accessToken) {
    throw new Error('LinkedIn access token not found')
  }

  // Get user's ad accounts first
  const { data: adAccounts } = await supabaseClient
    .from('linkedin_ad_accounts')
    .select('linkedin_account_id')
    .eq('user_id', userId)

  if (!adAccounts || adAccounts.length === 0) {
    return new Response(
      JSON.stringify({ success: true, message: 'No ad accounts found. Please sync ad accounts first.' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  let totalCampaigns = 0

  for (const account of adAccounts) {
    // Fetch campaigns for each ad account
    const response = await fetch(`https://api.linkedin.com/v2/campaignsV2?q=search&search.account.values[0]=urn:li:sponsoredAccount:${account.linkedin_account_id}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'X-Restli-Protocol-Version': '2.0.0'
      }
    })

    if (!response.ok) {
      console.error(`LinkedIn API error for account ${account.linkedin_account_id}: ${response.status}`)
      continue
    }

    const data = await response.json()
    console.log('LinkedIn campaigns response:', data)

    // Store campaigns in database
    for (const campaign of data.elements || []) {
      await supabaseClient
        .from('linkedin_campaigns')
        .upsert({
          user_id: userId,
          linkedin_campaign_id: campaign.id.toString(),
          name: campaign.name,
          status: campaign.status,
          campaign_type: campaign.type,
          objective_type: campaign.objectiveType,
          budget_amount: campaign.dailyBudget?.amount,
          budget_currency: campaign.dailyBudget?.currencyCode,
          created_at: new Date(campaign.createdAt).toISOString(),
          last_synced_at: new Date().toISOString()
        })
      
      totalCampaigns++
    }
  }

  return new Response(
    JSON.stringify({ success: true, count: totalCampaigns }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function syncLeads(supabaseClient: any, userId: string) {
  console.log('Syncing LinkedIn leads for user:', userId)
  
  const accessToken = await getLinkedInAccessToken()
  if (!accessToken) {
    throw new Error('LinkedIn access token not found')
  }

  // Get user's campaigns
  const { data: campaigns } = await supabaseClient
    .from('linkedin_campaigns')
    .select('id, linkedin_campaign_id')
    .eq('user_id', userId)

  if (!campaigns || campaigns.length === 0) {
    return new Response(
      JSON.stringify({ success: true, message: 'No campaigns found. Please sync campaigns first.' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  let totalLeads = 0

  for (const campaign of campaigns) {
    // Fetch lead gen forms for each campaign
    const formsResponse = await fetch(`https://api.linkedin.com/v2/leadGenForms?q=owner&owner=urn:li:sponsoredCampaign:${campaign.linkedin_campaign_id}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'X-Restli-Protocol-Version': '2.0.0'
      }
    })

    if (!formsResponse.ok) {
      console.error(`LinkedIn API error for campaign ${campaign.linkedin_campaign_id}: ${formsResponse.status}`)
      continue
    }

    const formsData = await formsResponse.json()

    // For each form, fetch the leads
    for (const form of formsData.elements || []) {
      const leadsResponse = await fetch(`https://api.linkedin.com/v2/leadGenFormResponses?q=form&form=urn:li:leadGenForm:${form.id}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'X-Restli-Protocol-Version': '2.0.0'
        }
      })

      if (!leadsResponse.ok) {
        console.error(`LinkedIn API error for form ${form.id}: ${leadsResponse.status}`)
        continue
      }

      const leadsData = await leadsResponse.json()

      // Store leads in database
      for (const lead of leadsData.elements || []) {
        const leadData = {
          user_id: userId,
          linkedin_lead_id: lead.id.toString(),
          campaign_id: campaign.id,
          linkedin_campaign_id: campaign.linkedin_campaign_id,
          form_name: form.name,
          lead_data: lead.responses || {},
          submitted_at: new Date(lead.submittedAt).toISOString()
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

        await supabaseClient
          .from('linkedin_leads')
          .upsert(leadData)
        
        totalLeads++
      }
    }
  }

  return new Response(
    JSON.stringify({ success: true, count: totalLeads }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function createCampaign(supabaseClient: any, userId: string, campaignData: any) {
  console.log('Creating LinkedIn campaign for user:', userId, campaignData)
  
  const accessToken = await getLinkedInAccessToken()
  if (!accessToken) {
    throw new Error('LinkedIn access token not found')
  }

  // Create campaign via LinkedIn API
  const response = await fetch('https://api.linkedin.com/v2/campaignsV2', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'X-Restli-Protocol-Version': '2.0.0'
    },
    body: JSON.stringify({
      name: campaignData.name,
      account: `urn:li:sponsoredAccount:${campaignData.accountId}`,
      status: 'DRAFT',
      type: campaignData.type || 'SPONSORED_CONTENT',
      objectiveType: campaignData.objectiveType || 'LEAD_GENERATION',
      dailyBudget: {
        amount: campaignData.dailyBudget,
        currencyCode: campaignData.currency || 'USD'
      }
    })
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(`LinkedIn API error: ${response.status} - ${JSON.stringify(errorData)}`)
  }

  const data = await response.json()
  console.log('LinkedIn campaign created:', data)

  // Store campaign in database
  await supabaseClient
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

  return new Response(
    JSON.stringify({ success: true, campaign: data }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}
