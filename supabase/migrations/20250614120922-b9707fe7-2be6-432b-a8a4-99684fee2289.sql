
-- Create table for LinkedIn campaigns
CREATE TABLE public.linkedin_campaigns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  linkedin_campaign_id TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  status TEXT NOT NULL,
  campaign_type TEXT,
  objective_type TEXT,
  budget_amount DECIMAL,
  budget_currency TEXT,
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  impressions BIGINT DEFAULT 0,
  clicks BIGINT DEFAULT 0,
  spend DECIMAL DEFAULT 0,
  conversions BIGINT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_synced_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create table for LinkedIn leads
CREATE TABLE public.linkedin_leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  linkedin_lead_id TEXT NOT NULL UNIQUE,
  campaign_id UUID REFERENCES public.linkedin_campaigns(id),
  linkedin_campaign_id TEXT,
  form_name TEXT,
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  phone TEXT,
  company TEXT,
  job_title TEXT,
  lead_data JSONB DEFAULT '{}',
  submitted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for LinkedIn ad accounts
CREATE TABLE public.linkedin_ad_accounts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  linkedin_account_id TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  type TEXT,
  status TEXT,
  currency TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS policies for LinkedIn campaigns
ALTER TABLE public.linkedin_campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own LinkedIn campaigns" 
  ON public.linkedin_campaigns 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own LinkedIn campaigns" 
  ON public.linkedin_campaigns 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own LinkedIn campaigns" 
  ON public.linkedin_campaigns 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own LinkedIn campaigns" 
  ON public.linkedin_campaigns 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Add RLS policies for LinkedIn leads
ALTER TABLE public.linkedin_leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own LinkedIn leads" 
  ON public.linkedin_leads 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own LinkedIn leads" 
  ON public.linkedin_leads 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own LinkedIn leads" 
  ON public.linkedin_leads 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own LinkedIn leads" 
  ON public.linkedin_leads 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Add RLS policies for LinkedIn ad accounts
ALTER TABLE public.linkedin_ad_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own LinkedIn ad accounts" 
  ON public.linkedin_ad_accounts 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own LinkedIn ad accounts" 
  ON public.linkedin_ad_accounts 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own LinkedIn ad accounts" 
  ON public.linkedin_ad_accounts 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own LinkedIn ad accounts" 
  ON public.linkedin_ad_accounts 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_linkedin_campaigns_user_id ON public.linkedin_campaigns(user_id);
CREATE INDEX idx_linkedin_campaigns_linkedin_id ON public.linkedin_campaigns(linkedin_campaign_id);
CREATE INDEX idx_linkedin_leads_user_id ON public.linkedin_leads(user_id);
CREATE INDEX idx_linkedin_leads_campaign_id ON public.linkedin_leads(campaign_id);
CREATE INDEX idx_linkedin_leads_linkedin_id ON public.linkedin_leads(linkedin_lead_id);
CREATE INDEX idx_linkedin_ad_accounts_user_id ON public.linkedin_ad_accounts(user_id);
CREATE INDEX idx_linkedin_ad_accounts_linkedin_id ON public.linkedin_ad_accounts(linkedin_account_id);
