
import { supabase } from '@/integrations/supabase/client';
import { masterOrchestrator, JobCreationRequest, CandidateEvaluationRequest } from './aiAgents';

interface SupabaseCandidate {
  id: string;
  name: string;
  email: string;
  skills: any[];
  experience_years: number;
  education: any[];
  current_position?: string;
  linkedin_profile_url?: string;
  phone?: string;
  created_at: string;
}

interface SupabaseJob {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  posted_date: string;
  is_active: boolean;
}

class SupabaseAgentService {
  private evaluationResults: any[] = [];
  private jobAds: any[] = [];

  async getCandidatesFromDatabase(): Promise<SupabaseCandidate[]> {
    console.log('[Supabase Agent] Fetching candidates from database');
    
    const { data, error } = await supabase
      .from('candidates')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[Supabase Agent] Error fetching candidates:', error);
      return [];
    }

    return data || [];
  }

  async getJobsFromDatabase(): Promise<SupabaseJob[]> {
    console.log('[Supabase Agent] Fetching jobs from database');
    
    const { data, error } = await supabase
      .from('crawled_jobs')
      .select('*')
      .eq('is_active', true)
      .order('posted_date', { ascending: false })
      .limit(10);

    if (error) {
      console.error('[Supabase Agent] Error fetching jobs:', error);
      return [];
    }

    return data || [];
  }

  async createJobAdFromDatabase(jobData: Partial<JobCreationRequest>) {
    console.log('[Supabase Agent] Creating job ad with real data integration');
    
    // Get similar jobs from database for context
    const existingJobs = await this.getJobsFromDatabase();
    
    const enrichedJobData: JobCreationRequest = {
      role: jobData.role || 'Software Engineer',
      company: jobData.company || 'Your Company',
      location: jobData.location || 'Remote',
      requirements: jobData.requirements || [
        'JavaScript/TypeScript',
        'React',
        'Node.js',
        '3+ years experience'
      ],
      additionalInfo: `Based on ${existingJobs.length} similar positions in our database`
    };

    const result = await masterOrchestrator.processMessage({
      id: Date.now().toString(),
      type: 'job_creation',
      payload: enrichedJobData,
      timestamp: new Date().toISOString(),
      agentId: 'supabase-integration'
    });

    this.jobAds.push({
      ...result,
      createdAt: new Date().toISOString(),
      source: 'supabase-integrated'
    });

    return result;
  }

  async evaluateCandidatesAgainstJobs() {
    console.log('[Supabase Agent] Evaluating real candidates against job requirements');
    
    const candidates = await this.getCandidatesFromDatabase();
    const jobs = await this.getJobsFromDatabase();

    if (candidates.length === 0 || jobs.length === 0) {
      console.log('[Supabase Agent] No candidates or jobs found for evaluation');
      return [];
    }

    const evaluations = [];

    for (const candidate of candidates.slice(0, 5)) { // Limit to first 5 for demo
      for (const job of jobs.slice(0, 2)) { // Limit to first 2 jobs
        const evaluationRequest: CandidateEvaluationRequest = {
          jobId: job.id,
          candidateData: {
            name: candidate.name,
            resume: this.buildResumeFromCandidate(candidate),
            skills: Array.isArray(candidate.skills) ? candidate.skills.map(s => typeof s === 'string' ? s : s.name || 'Unknown') : [],
            experience: `${candidate.experience_years || 0} years of experience in ${candidate.current_position || 'software development'}`
          }
        };

        const evaluation = await masterOrchestrator.processMessage({
          id: Date.now().toString(),
          type: 'candidate_evaluation',
          payload: evaluationRequest,
          timestamp: new Date().toISOString(),
          agentId: 'supabase-integration'
        });

        evaluations.push({
          ...evaluation,
          candidateId: candidate.id,
          candidateName: candidate.name,
          candidateEmail: candidate.email,
          jobTitle: job.title,
          jobCompany: job.company,
          skills: evaluationRequest.candidateData.skills,
          evaluatedAt: new Date().toISOString()
        });
      }
    }

    this.evaluationResults = evaluations;
    return evaluations;
  }

  private buildResumeFromCandidate(candidate: SupabaseCandidate): string {
    const skills = Array.isArray(candidate.skills) ? candidate.skills.map(s => typeof s === 'string' ? s : s.name || 'Unknown').join(', ') : 'Various technical skills';
    const education = Array.isArray(candidate.education) ? candidate.education.map(e => typeof e === 'string' ? e : e.degree || 'Education').join(', ') : 'Relevant education';
    
    return `
Name: ${candidate.name}
Email: ${candidate.email}
Current Position: ${candidate.current_position || 'Not specified'}
Experience: ${candidate.experience_years || 0} years
Skills: ${skills}
Education: ${education}
LinkedIn: ${candidate.linkedin_profile_url || 'Not provided'}
Phone: ${candidate.phone || 'Not provided'}
    `.trim();
  }

  getRecommendedCandidates() {
    return this.evaluationResults.filter(result => result.recommendation === 'accept');
  }

  getNonRecommendedCandidates() {
    return this.evaluationResults.filter(result => result.recommendation === 'reject');
  }

  getJobAds() {
    return this.jobAds;
  }

  async simulateCandidateApplication() {
    console.log('[Supabase Agent] Simulating new candidate application with real data');
    
    // Get a random candidate from database as template
    const candidates = await this.getCandidatesFromDatabase();
    if (candidates.length === 0) return null;

    const templateCandidate = candidates[Math.floor(Math.random() * candidates.length)];
    const jobs = await this.getJobsFromDatabase();
    
    if (jobs.length === 0) return null;

    const randomJob = jobs[Math.floor(Math.random() * jobs.length)];

    // Simulate variation in the candidate
    const simulatedCandidate = {
      ...templateCandidate,
      id: `sim_${Date.now()}`,
      name: `${templateCandidate.name} (Simulated)`,
      email: `simulated_${templateCandidate.email}`,
      experience_years: (templateCandidate.experience_years || 0) + Math.floor(Math.random() * 3)
    };

    const evaluation = await masterOrchestrator.processMessage({
      id: Date.now().toString(),
      type: 'candidate_evaluation',
      payload: {
        jobId: randomJob.id,
        candidateData: {
          name: simulatedCandidate.name,
          resume: this.buildResumeFromCandidate(simulatedCandidate),
          skills: Array.isArray(simulatedCandidate.skills) ? simulatedCandidate.skills.map(s => typeof s === 'string' ? s : s.name || 'Unknown') : [],
          experience: `${simulatedCandidate.experience_years} years of experience in ${simulatedCandidate.current_position || 'software development'}`
        }
      },
      timestamp: new Date().toISOString(),
      agentId: 'simulation'
    });

    const enrichedEvaluation = {
      ...evaluation,
      id: simulatedCandidate.id,
      candidateId: simulatedCandidate.id,
      candidateName: simulatedCandidate.name,
      candidateEmail: simulatedCandidate.email,
      jobTitle: randomJob.title,
      jobCompany: randomJob.company,
      skills: Array.isArray(simulatedCandidate.skills) ? simulatedCandidate.skills.map(s => typeof s === 'string' ? s : s.name || 'Unknown') : [],
      evaluatedAt: new Date().toISOString()
    };

    this.evaluationResults.push(enrichedEvaluation);
    
    return enrichedEvaluation;
  }
}

export const supabaseAgentService = new SupabaseAgentService();
