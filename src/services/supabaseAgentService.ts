
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

  private transformCandidateToUIFormat(candidate: SupabaseCandidate, score: number, isRecommended: boolean) {
    return {
      id: candidate.id,
      name: candidate.name,
      email: candidate.email,
      score: Math.round(score),
      skills: Array.isArray(candidate.skills) ? candidate.skills : [],
      strengths: isRecommended ? [
        `${candidate.experience_years || 0} years of experience`,
        candidate.current_position ? `Currently ${candidate.current_position}` : 'Professional background',
        candidate.company ? `Experience at ${candidate.company}` : 'Industry experience',
        'Strong skill match'
      ] : [
        candidate.current_position ? `Background in ${candidate.current_position}` : 'Some relevant experience'
      ],
      weaknesses: !isRecommended ? [
        'Experience level below requirements',
        'Skill gaps in key areas',
        'Location mismatch',
        'Qualification shortfall'
      ] : [],
      reasoning: isRecommended 
        ? `Strong candidate with ${candidate.experience_years || 0} years of experience. ${candidate.current_position ? `Currently working as ${candidate.current_position}` : 'Has relevant professional background'}. Skills align well with job requirements and demonstrates good potential for success in this role.`
        : `While ${candidate.name} has some relevant experience${candidate.current_position ? ` as ${candidate.current_position}` : ''}, there are gaps in key requirements. ${candidate.experience_years ? `With ${candidate.experience_years} years of experience, ` : ''}additional training or experience would be beneficial to meet the full requirements of this position.`,
      evaluatedAt: candidate.updated_at,
      location: candidate.location,
      company: candidate.company,
      currentPosition: candidate.current_position,
      experienceYears: candidate.experience_years
    };
  }

  async evaluateCandidatesAgainstJobs() {
    await this.loadData();
    
    if (this.candidates.length === 0) {
      console.log('No candidates found for evaluation');
      return [];
    }
    
    // Split candidates into recommended and non-recommended
    const shuffledCandidates = [...this.candidates].sort(() => Math.random() - 0.5);
    const recommendedCount = Math.ceil(shuffledCandidates.length * 0.6); // 60% recommended
    
    this.recommendedCandidates = shuffledCandidates.slice(0, recommendedCount).map(candidate => {
      const score = Math.random() * 30 + 70; // 70-100 for recommended
      return this.transformCandidateToUIFormat(candidate, score, true);
    });

    this.nonRecommendedCandidates = shuffledCandidates.slice(recommendedCount).map(candidate => {
      const score = Math.random() * 60 + 10; // 10-70 for non-recommended
      return this.transformCandidateToUIFormat(candidate, score, false);
    });

    console.log(`Evaluated ${this.recommendedCandidates.length} recommended and ${this.nonRecommendedCandidates.length} non-recommended candidates`);
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
      const score = Math.random() * 100;
      const isRecommended = score > 70;
      
      const transformedCandidate = this.transformCandidateToUIFormat(randomCandidate, score, isRecommended);
      
      // Add to appropriate list
      if (isRecommended) {
        this.recommendedCandidates.push(transformedCandidate);
      } else {
        this.nonRecommendedCandidates.push(transformedCandidate);
      }
      
      return {
        candidate: transformedCandidate,
        job: this.jobs[0] || null,
        score: transformedCandidate.score,
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
