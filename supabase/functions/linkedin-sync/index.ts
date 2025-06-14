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
  if (token) {
    console.log('Token length:', token.length)
    console.log('Token prefix:', token.substring(0, 20) + '...')
  }
  return token
}

async function validateToken(accessToken: string) {
  console.log('Validating LinkedIn access token with comprehensive checks...')
  
  try {
    // Test basic profile access first
    const profileResponse = await fetch('https://api.linkedin.com/v2/people/~:(id,firstName,lastName)', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'X-Restli-Protocol-Version': '2.0.0'
      }
    })

    console.log('Profile validation response status:', profileResponse.status)
    
    if (!profileResponse.ok) {
      const errorText = await profileResponse.text()
      console.error('Profile validation failed:', errorText)
      return { valid: false, error: `Profile API: ${profileResponse.status} - ${errorText}` }
    }

    const profileData = await profileResponse.json()
    console.log('Profile validation successful:', profileData.id)
    
    // Test Marketing API access with a simple endpoint
    console.log('Testing Marketing API access...')
    const marketingTestResponse = await fetch('https://api.linkedin.com/rest/adAccounts?q=search&search.test=true&count=1', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'X-Restli-Protocol-Version': '2.0.0',
        'LinkedIn-Version': '202409'
      }
    })

    console.log('Marketing API test response status:', marketingTestResponse.status)
    
    if (marketingTestResponse.status === 401) {
      return { 
        valid: false, 
        error: 'Access token does not have Marketing API permissions. Please ensure your LinkedIn app has Marketing API access and the token includes the required scopes (r_ads, r_ads_reporting).' 
      }
    }
    
    if (marketingTestResponse.status === 403) {
      return { 
        valid: false, 
        error: 'Marketing API access forbidden. Your LinkedIn app may not be approved for Marketing API access or you may not have permission to access advertising accounts.' 
      }
    }

    return { valid: true, profileId: profileData.id, hasMarketingAccess: marketingTestResponse.ok }
  } catch (error) {
    console.error('Token validation error:', error)
    return { valid: false, error: error.message }
  }
}

async function makeLinkedInRequest(url: string, accessToken: string, method = 'GET', body?: any) {
  console.log('Making LinkedIn API request to:', url)
  console.log('Method:', method)
  
  const headers: Record<string, string> = {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
    'X-Restli-Protocol-Version': '2.0.0',
    'LinkedIn-Version': '202409'
  }

  console.log('Request headers:', Object.keys(headers))

  const response = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined
  })

  console.log('LinkedIn API response status:', response.status)
  console.log('Response headers:', Object.fromEntries(response.headers.entries()))
  
  const responseText = await response.text()
  console.log('Raw response:', responseText)
  
  if (!response.ok) {
    console.error('LinkedIn API error response:', responseText)
    
    // Provide more specific error messages
    if (response.status === 401) {
      throw new Error(`LinkedIn API authentication failed (401). Please check if your access token is valid and has not expired. Response: ${responseText}`)
    }
    if (response.status === 403) {
      throw new Error(`LinkedIn API access forbidden (403). Your app may not have the required permissions for Marketing API. Response: ${responseText}`)
    }
    if (response.status === 429) {
      throw new Error(`LinkedIn API rate limit exceeded (429). Please wait before retrying. Response: ${responseText}`)
    }
    
    throw new Error(`LinkedIn API error: ${response.status} - ${responseText}`)
  }

  try {
    const responseData = JSON.parse(responseText)
    console.log('Response data structure:', Object.keys(responseData))
    return responseData
  } catch (parseError) {
    console.error('Failed to parse JSON response:', parseError)
    throw new Error(`Invalid JSON response from LinkedIn API: ${responseText}`)
  }
}

async function syncAdAccounts(supabaseClient: any, userId: string) {
  console.log('=== Starting LinkedIn ad accounts sync for user:', userId)
  
  const accessToken = await getLinkedInAccessToken()
  if (!accessToken) {
    console.log('No LinkedIn access token found, returning empty result')
    return new Response(
      JSON.stringify({ 
        success: true, 
        count: 0, 
        message: 'No LinkedIn access token configured. Please set LINKEDIN_ACCESS_TOKEN in your Supabase secrets.'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  try {
    // Validate token with comprehensive checks
    const tokenValidation = await validateToken(accessToken)
    if (!tokenValidation.valid) {
      throw new Error(`Token validation failed: ${tokenValidation.error}`)
    }

    console.log('Token validated successfully for profile:', tokenValidation.profileId)
    console.log('Marketing API access:', tokenValidation.hasMarketingAccess ? 'Available' : 'Limited/Not Available')

    // Try the REST API endpoint first (recommended approach)
    const restEndpoint = 'https://api.linkedin.com/rest/adAccounts?q=search&count=50'
    
    try {
      console.log('Trying REST API endpoint:', restEndpoint)
      const accountsData = await makeLinkedInRequest(restEndpoint, accessToken)
      console.log('Success with REST API endpoint')
      
      // Handle the response structure
      const accounts = accountsData.elements || []
      console.log('Number of ad accounts found:', accounts.length)

      if (accounts.length === 0) {
        return new Response(
          JSON.stringify({ 
            success: true, 
            count: 0, 
            message: 'No ad accounts found. This could mean: 1) You have no LinkedIn ad accounts, 2) Your access token lacks Marketing API permissions, or 3) Your LinkedIn app is not approved for Marketing API access.'
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Store ad accounts in database
      let insertedCount = 0
      for (const account of accounts) {
        console.log('Processing account:', account)
        
        const accountData = {
          user_id: userId,
          linkedin_account_id: String(account.id || account.reference || 'unknown'),
          name: account.name || account.localizedName || 'Unknown Account',
          type: account.type || 'BUSINESS',
          status: account.status || 'ENABLED',
          currency: account.currency || 'USD'
        }

        console.log('Inserting account data:', accountData)

        const { error } = await supabaseClient
          .from('linkedin_ad_accounts')
          .upsert(accountData, { onConflict: 'user_id,linkedin_account_id' })
        
        if (error) {
          console.error('Error storing ad account:', error)
        } else {
          insertedCount++
          console.log('Successfully stored account:', accountData.linkedin_account_id)
        }
      }

      console.log('=== Ad accounts sync completed. Inserted/Updated:', insertedCount, 'Total found:', accounts.length)

      return new Response(
        JSON.stringify({ 
          success: true, 
          count: insertedCount, 
          total: accounts.length,
          message: `Successfully synced ${insertedCount} ad accounts`
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
      
    } catch (restError) {
      console.error('REST API failed, error:', restError.message)
      
      // If it's an authentication/permission error, don't try fallback endpoints
      if (restError.message.includes('401') || restError.message.includes('INVALID_ACCESS_TOKEN')) {
        throw restError
      }
      
      // For other errors, we could try fallback endpoints, but REST API is the current standard
      throw new Error(`LinkedIn API access failed: ${restError.message}`)
    }

  } catch (error) {
    console.error('=== Ad accounts sync failed:', error)
    
    // Provide helpful error messages based on the error type
    let userFriendlyMessage = error.message
    
    if (error.message.includes('401') || error.message.includes('INVALID_ACCESS_TOKEN')) {
      userFriendlyMessage = 'LinkedIn access token is invalid or expired. Please obtain a new access token with the required permissions (r_ads, r_ads_reporting) and update the LINKEDIN_ACCESS_TOKEN secret.'
    } else if (error.message.includes('403')) {
      userFriendlyMessage = 'Access to LinkedIn Marketing API is forbidden. Please ensure your LinkedIn app is approved for Marketing API access and has the required permissions.'
    }
    
    return new Response(
      JSON.stringify({ 
        error: `Ad accounts sync failed: ${userFriendlyMessage}`,
        details: error.message,
        troubleshooting: 'Check your LinkedIn access token and ensure it has Marketing API permissions (r_ads, r_ads_reporting). Your LinkedIn app must be approved for Marketing API access.'
      }),
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
    return new Response(
      JSON.stringify({ success: true, message: 'No LinkedIn access token found', count: 0 }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
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
    return new Response(
      JSON.stringify({ success: true, message: 'No LinkedIn access token found', count: 0 }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
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
