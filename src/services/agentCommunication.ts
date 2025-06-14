import { supabaseAgentService } from './supabaseAgentService';

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
    } catch (error) {
      console.error('[Agent Communication] Error initializing:', error);
      this.setState({ systemStatus: 'error' });
    }
  }

  private cleanUpJobAds(jobs: any[]) {
    return jobs
      .map(job => ({
        ...job,
        description: this.cleanJobDescription(job.description)
      }))
      .filter(job => {
        // Remove jobs if, after cleaning, the description is empty, 'undefined', or 'null'
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
    if (!description) return 'No description available.';
    
    // Remove JSON-like formatting and clean up the text
    let cleaned = description
      .replace(/[\{\}]/g, '') // Remove curly braces
      .replace(/["']/g, '') // Remove quotes
      .replace(/\\n/g, ' ') // Replace \n with spaces
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .replace(/^\w+:\s*/, '') // Remove property names like "description:"
      .trim();
    
    // If it's still problematic or too short, provide a fallback
    if (cleaned.length < 20 || cleaned.includes('undefined') || cleaned.includes('null')) {
      return 'Professional opportunity with competitive compensation and benefits.';
    }
    
    return cleaned;
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
      this.state.activeJobs = this.cleanUpJobAds(this.state.activeJobs);
    }
    
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

      // Format the result to match the expected structure with clean data
      const formattedJobAd = {
        id: aiResult.jobId,
        title: aiResult.jobAd.title,
        company: aiResult.jobAd.company,
        location: aiResult.jobAd.location,
        description: this.cleanJobDescription(aiResult.jobAd.description),
        requirements: Array.isArray(aiResult.jobAd.requirements) ? aiResult.jobAd.requirements : [],
        benefits: aiResult.jobAd.benefits || 'Competitive compensation and benefits package',
        salary: aiResult.jobAd.salary || 'Competitive salary',
        employmentType: aiResult.jobAd.employmentType || 'Full-time',
        status: aiResult.status,
        linkedInPostId: aiResult.linkedInPostId,
        createdAt: new Date().toLocaleDateString()
      };

      // Add to active jobs state
      this.setState({
        activeJobs: [...this.state.activeJobs, formattedJobAd],
        systemStatus: 'idle'
      });
      
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
        description: updates.description ? this.cleanJobDescription(updates.description) : job.description
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
