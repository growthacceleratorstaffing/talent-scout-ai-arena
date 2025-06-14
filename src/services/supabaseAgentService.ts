
import { supabase } from '@/integrations/supabase/client';

export interface SupabaseCandidate {
  id: string;
  email: string;
  name: string;
  current_position: string;
  company: string;
  experience_years: number;
  skills: any[]; // This will handle the Json type from Supabase
  linkedin_profile_url: string;
  location: string;
  phone: string;
  summary: string;
  education: any;
  workable_candidate_id: string;
  linkedin_id: string;
  created_at: string;
  last_synced_at: string;
  updated_at: string;
}

export interface SupabaseJob {
  id: string;
  title: string;
  department: string;
  location: string;
  employment_type: string;
  experience_level: string;
  salary_min: number;
  salary_max: number;
  description: string;
  requirements: any[];
  benefits: any[];
  workable_job_id: string;
  created_at: string;
  updated_at: string;
  published_at: string;
  expires_at: string;
}

export const getCandidatesFromSupabase = async (): Promise<SupabaseCandidate[]> => {
  try {
    const { data, error } = await supabase
      .from('candidates')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching candidates from Supabase:', error);
      return [];
    }

    // Transform the data to ensure skills is always an array
    const transformedData = data.map(candidate => ({
      ...candidate,
      skills: Array.isArray(candidate.skills) 
        ? candidate.skills 
        : candidate.skills 
          ? JSON.parse(candidate.skills as string) 
          : []
    }));

    return transformedData;
  } catch (error) {
    console.error('Error in getCandidatesFromSupabase:', error);
    return [];
  }
};

export const getJobsFromSupabase = async (): Promise<SupabaseJob[]> => {
  try {
    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching jobs from Supabase:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getJobsFromSupabase:', error);
    return [];
  }
};

export const getCandidateById = async (id: string): Promise<SupabaseCandidate | null> => {
  try {
    const { data, error } = await supabase
      .from('candidates')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching candidate by ID:', error);
      return null;
    }

    // Transform the data to ensure skills is always an array
    const transformedData = {
      ...data,
      skills: Array.isArray(data.skills) 
        ? data.skills 
        : data.skills 
          ? JSON.parse(data.skills as string) 
          : []
    };

    return transformedData;
  } catch (error) {
    console.error('Error in getCandidateById:', error);
    return null;
  }
};

export const getJobById = async (id: string): Promise<SupabaseJob | null> => {
  try {
    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching job by ID:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in getJobById:', error);
    return null;
  }
};
