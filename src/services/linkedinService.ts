
import { supabase } from '@/integrations/supabase/client';

export interface LinkedInAdAccount {
  id: string;
  linkedin_account_id: string;
  name: string;
  type: string;
  status: string;
  currency: string;
}

export interface LinkedInCampaign {
  id: string;
  linkedin_campaign_id: string;
  name: string;
  status: string;
  campaign_type: string;
  objective_type: string;
  budget_amount: number;
  budget_currency: string;
  impressions: number;
  clicks: number;
  spend: number;
  conversions: number;
  created_at: string;
  last_synced_at: string;
}

export interface LinkedInLead {
  id: string;
  linkedin_lead_id: string;
  campaign_id: string;
  linkedin_campaign_id: string;
  form_name: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  company: string;
  job_title: string;
  submitted_at: string;
  created_at: string;
}

export const linkedInService = {
  async syncAdAccounts() {
    const { data, error } = await supabase.functions.invoke('linkedin-sync', {
      body: { action: 'sync-ad-accounts' }
    });

    if (error) throw error;
    return data;
  },

  async syncCampaigns() {
    const { data, error } = await supabase.functions.invoke('linkedin-sync', {
      body: { action: 'sync-campaigns' }
    });

    if (error) throw error;
    return data;
  },

  async syncLeads() {
    const { data, error } = await supabase.functions.invoke('linkedin-sync', {
      body: { action: 'sync-leads' }
    });

    if (error) throw error;
    return data;
  },

  async createCampaign(campaignData: {
    name: string;
    accountId: string;
    type?: string;
    objectiveType?: string;
    dailyBudget: number;
    currency?: string;
  }) {
    const { data, error } = await supabase.functions.invoke('linkedin-sync', {
      body: { 
        action: 'create-campaign',
        campaignData
      }
    });

    if (error) throw error;
    return data;
  },

  async getAdAccounts(): Promise<LinkedInAdAccount[]> {
    const { data, error } = await supabase
      .from('linkedin_ad_accounts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getCampaigns(): Promise<LinkedInCampaign[]> {
    const { data, error } = await supabase
      .from('linkedin_campaigns')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getLeads(): Promise<LinkedInLead[]> {
    const { data, error } = await supabase
      .from('linkedin_leads')
      .select('*')
      .order('submitted_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getCampaignLeads(campaignId: string): Promise<LinkedInLead[]> {
    const { data, error } = await supabase
      .from('linkedin_leads')
      .select('*')
      .eq('campaign_id', campaignId)
      .order('submitted_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }
};
