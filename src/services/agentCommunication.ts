import { supabase } from '@/integrations/supabase/client';
import { supabaseAgentService } from './supabaseAgentService';
import { cleanJobDescription } from '@/utils/cleanJobDescription';

interface AgentState {
  activeJobs: any[];
  candidates: any[];
  evaluationResults: any[];
  systemStatus: 'idle' | 'processing' | 'error';
}

class AgentCommunicationService {
  private state: AgentState = {
    activeJobs: [],
    candidates: [],
    evaluationResults: [],
    systemStatus: 'idle'
  };

  private stateSubscribers: ((state: AgentState) => void)[] = [];

  constructor() {
    this.initializeWithSupabaseData();
  }

  private async initializeWithSupabaseData() {
    console.log('[Agent Communication] Initializing with Supabase data');
    this.setState({ systemStatus: 'processing' });
    
    try {
      // Load initial evaluations from Supabase data
      await supabaseAgentService.evaluateCandidatesAgainstJobs();
      
      // Clean up any existing jobs with JSON data
      const cleanedJobs = this.cleanUpJobAds([]);
      console.log('[Agent Communication] Jobs loaded from Supabase (expected initial):', cleanedJobs);

      this.setState({
        systemStatus: 'idle',
        evaluationResults: [
          ...supabaseAgentService.getRecommendedCandidates(),
          ...supabaseAgentService.getNonRecommendedCandidates()
        ],
        activeJobs: cleanedJobs
      });
      
      console.log('[Agent Communication] Initialized with real Supabase data');
      console.log('Recommended candidates:', supabaseAgentService.getRecommendedCandidates().length);
      console.log('Non-recommended candidates:', supabaseAgentService.getNonRecommendedCandidates().length);
      console.log('[Agent Communication] State after Supabase load:', this.state);
    } catch (error) {
      console.error('[Agent Communication] Error initializing:', error);
      this.setState({ systemStatus: 'error' });
    }
  }

  private cleanUpJobAds(jobs: any[]) {
    return jobs
      .map(job => {
        let desc = job.description;
        // Attempt to parse JSON if the description looks like JSON
        if (desc && typeof desc === "string") {
          try {
            if (desc.trim().startsWith("{") && desc.trim().endsWith("}")) {
              const parsed = JSON.parse(desc);
              // Prefer 'description' or flatten object
              if (parsed.description) desc = parsed.description;
              else desc = Object.values(parsed).join(" ");
            }
          } catch {
            // ignore
          }
        }
        desc = cleanJobDescription(desc);
        return { ...job, description: desc };
      })
      .filter(job => {
        // Remove jobs with empty or junk descriptions
        const desc = job.description?.toLowerCase?.() ?? '';
        if (
          !job.title ||
          !job.company ||
          desc === '' ||
          desc === 'undefined' ||
          desc === 'null'
        ) {
          console.log('[Agent Communication] Removing job with invalid/empty description:', job.title);
          return false;
        }
        return true;
      });
  }

  private cleanJobDescription(description: string) {
    // DEPRECATED: use utility instead
    return cleanJobDescription(description);
  }

  subscribeToState(callback: (state: AgentState) => void) {
    this.stateSubscribers.push(callback);
    // Immediately call with current state
    callback(this.state);
  }

  unsubscribeFromState(callback: (state: AgentState) => void) {
    const index = this.stateSubscribers.indexOf(callback);
    if (index > -1) {
      this.stateSubscribers.splice(index, 1);
    }
  }

  private setState(newState: Partial<AgentState>) {
    this.state = { ...this.state, ...newState };
    
    // Clean up jobs whenever state is updated
    if (newState.activeJobs) {
      this.state.activeJobs = this.cleanUpJobAds(this.state.activeJobs || []);
    }
    console.log('[Agent Communication] setState activeJobs:', this.state.activeJobs);

    this.stateSubscribers.forEach(callback => callback(this.state));
  }

  async createJobAd(jobData: any) {
    console.log('[Agent Communication] Creating job ad with AI agents');
    this.setState({ systemStatus: 'processing' });

    try {
      // Create job ad using AI agents (this calls Azure AI)
      const { masterOrchestrator } = await import('./aiAgents');

      const aiResult = await masterOrchestrator.processMessage({
        id: Date.now().toString(),
        type: 'job_creation',
        payload: jobData,
        timestamp: new Date().toISOString(),
        agentId: 'master'
      });

      const formattedJobAd = {
        id: aiResult.jobId,
        title: aiResult.jobAd.title,
        company: aiResult.jobAd.company,
        location: aiResult.jobAd.location,
        description: cleanJobDescription(aiResult.jobAd.description),
        requirements: Array.isArray(aiResult.jobAd.requirements) ? aiResult.jobAd.requirements : [],
        benefits: aiResult.jobAd.benefits || 'Competitive compensation and benefits package',
        salary: aiResult.jobAd.salary || 'Competitive salary',
        employmentType: aiResult.jobAd.employmentType || 'Full-time',
        status: aiResult.status,
        linkedInPostId: aiResult.linkedInPostId,
        createdAt: new Date().toLocaleDateString()
      };

      // Post to LinkedIn after generation
      try {
        console.log('[Agent Communication] Posting job ad to LinkedIn...');
        const { data: linkedInResult, error: linkedInError } = await supabase.functions.invoke('linkedin-post-job', {
          body: {
            jobAd: formattedJobAd
          }
        });
        
        if (linkedInError || !linkedInResult?.success) {
          throw new Error(linkedInResult?.error || linkedInError?.message || 'Unknown error posting to LinkedIn');
        }
        
        console.log('[Agent Communication] Job ad posted to LinkedIn:', linkedInResult);
        formattedJobAd.linkedInPostId = linkedInResult.linkedInResponse?.id || formattedJobAd.linkedInPostId;
      } catch (err) {
        console.error('[Agent Communication] Failed to post job to LinkedIn:', err);
        // Optionally show a toast in the UI by bubbling up the error
        // For now, just continue
      }

      this.setState({
        activeJobs: [...this.state.activeJobs, formattedJobAd],
        systemStatus: 'idle'
      });
      console.log('[Agent Communication] After creation, activeJobs:', this.state.activeJobs);

      console.log('[Agent Communication] Job ad created and added to active jobs:', formattedJobAd.title);
      return formattedJobAd;
    } catch (error) {
      console.error('[Agent Communication] Error creating job ad:', error);
      this.setState({ systemStatus: 'error' });
      throw error;
    }
  }

  async evaluateCandidate(candidateData: any) {
    console.log('[Agent Communication] Evaluating candidate with real data');
    this.setState({ systemStatus: 'processing' });
    
    try {
      const evaluations = await supabaseAgentService.evaluateCandidatesAgainstJobs();
      
      this.setState({
        evaluationResults: evaluations,
        systemStatus: 'idle'
      });
      
      return evaluations[evaluations.length - 1]; // Return latest evaluation
    } catch (error) {
      console.error('[Agent Communication] Error evaluating candidate:', error);
      this.setState({ systemStatus: 'error' });
      throw error;
    }
  }

  async simulateCandidateApplication() {
    console.log('[Agent Communication] Simulating candidate application');
    this.setState({ systemStatus: 'processing' });
    
    try {
      const newEvaluation = await supabaseAgentService.simulateCandidateApplication();
      
      if (newEvaluation) {
        this.setState({
          evaluationResults: [...this.state.evaluationResults, newEvaluation],
          systemStatus: 'idle'
        });
      }
      
      return newEvaluation;
    } catch (error) {
      console.error('[Agent Communication] Error simulating application:', error);
      this.setState({ systemStatus: 'error' });
      throw error;
    }
  }

  getRecommendedCandidates() {
    return supabaseAgentService.getRecommendedCandidates();
  }

  getNonRecommendedCandidates() {
    return supabaseAgentService.getNonRecommendedCandidates();
  }

  async deleteJobAd(jobId: string) {
    // Removes the job ad from state by id
    const filteredJobs = this.state.activeJobs.filter((job) => job.id !== jobId);
    this.setState({
      activeJobs: filteredJobs
    });
    // You could also remove from Supabase here if needed
    return true;
  }

  async updateJobAd(jobId: string, updates: any) {
    // Updates the job ad with the given id
    const updatedJobs = this.state.activeJobs.map(job =>
      job.id === jobId ? {
        ...job,
        ...updates,
        description: updates.description ? cleanJobDescription(updates.description) : job.description
      } : job
    );
    this.setState({
      activeJobs: updatedJobs
    });
    // You could also update Supabase here if needed
    return updatedJobs.find(job => job.id === jobId);
  }
}

export const agentCommunicationService = new AgentCommunicationService();
