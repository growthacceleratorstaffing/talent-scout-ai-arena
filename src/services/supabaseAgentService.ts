
import { supabase } from '@/integrations/supabase/client';

export interface SupabaseCandidate {
  id: string;
  email: string;
  name: string;
  current_position: string | null;
  company: string | null;
  experience_years: number | null;
  skills: any[];
  linkedin_profile_url: string | null;
  location: string | null;
  phone: string | null;
  education: any;
  workable_candidate_id: string | null;
  linkedin_id: string | null;
  created_at: string;
  last_synced_at: string | null;
  updated_at: string;
}

export interface SupabaseCrawledJob {
  id: string;
  title: string;
  company: string;
  location: string | null;
  job_type: string | null;
  description: string | null;
  salary: string | null;
  url: string;
  source: string;
  posted_date: string | null;
  crawled_at: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
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

export const getJobsFromSupabase = async (): Promise<SupabaseCrawledJob[]> => {
  try {
    const { data, error } = await supabase
      .from('crawled_jobs')
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

export const getJobById = async (id: string): Promise<SupabaseCrawledJob | null> => {
  try {
    const { data, error } = await supabase
      .from('crawled_jobs')
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

// Mock implementation for AI agent functionality
class SupabaseAgentService {
  private candidates: SupabaseCandidate[] = [];
  private jobs: SupabaseCrawledJob[] = [];
  private recommendedCandidates: any[] = [];
  private nonRecommendedCandidates: any[] = [];

  async loadData() {
    this.candidates = await getCandidatesFromSupabase();
    this.jobs = await getJobsFromSupabase();
    console.log(`Loaded ${this.candidates.length} candidates and ${this.jobs.length} jobs from Supabase`);
  }

  async evaluateCandidatesAgainstJobs() {
    await this.loadData();
    
    // Simple mock evaluation logic
    this.recommendedCandidates = this.candidates.slice(0, Math.ceil(this.candidates.length / 2)).map(candidate => ({
      candidate,
      job: this.jobs[0] || null,
      score: Math.random() * 40 + 60, // 60-100 for recommended
      reasons: ['Strong technical skills', 'Relevant experience', 'Good cultural fit']
    }));

    this.nonRecommendedCandidates = this.candidates.slice(Math.ceil(this.candidates.length / 2)).map(candidate => ({
      candidate,
      job: this.jobs[0] || null,
      score: Math.random() * 50 + 10, // 10-60 for non-recommended
      reasons: ['Skills gap', 'Insufficient experience', 'Location mismatch']
    }));

    return [...this.recommendedCandidates, ...this.nonRecommendedCandidates];
  }

  async createJobAdFromDatabase(jobData: any) {
    console.log('Creating job ad with data:', jobData);
    return {
      id: Math.random().toString(36).substr(2, 9),
      ...jobData,
      created_at: new Date().toISOString()
    };
  }

  async simulateCandidateApplication() {
    if (this.candidates.length === 0) {
      await this.loadData();
    }

    if (this.candidates.length > 0) {
      const randomCandidate = this.candidates[Math.floor(Math.random() * this.candidates.length)];
      return {
        candidate: randomCandidate,
        job: this.jobs[0] || null,
        score: Math.random() * 100,
        reasons: ['New application', 'Auto-evaluation completed']
      };
    }

    return null;
  }

  getRecommendedCandidates() {
    return this.recommendedCandidates;
  }

  getNonRecommendedCandidates() {
    return this.nonRecommendedCandidates;
  }

  getJobAds() {
    return this.jobs;
  }
}

export const supabaseAgentService = new SupabaseAgentService();
