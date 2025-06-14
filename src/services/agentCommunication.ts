
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
      
      this.setState({
        systemStatus: 'idle',
        evaluationResults: [
          ...supabaseAgentService.getRecommendedCandidates(),
          ...supabaseAgentService.getNonRecommendedCandidates()
        ],
        activeJobs: supabaseAgentService.getJobAds()
      });
      
      console.log('[Agent Communication] Initialized with real Supabase data');
    } catch (error) {
      console.error('[Agent Communication] Error initializing:', error);
      this.setState({ systemStatus: 'error' });
    }
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

      // Format the result to match the expected structure
      const formattedJobAd = {
        id: aiResult.jobId,
        title: aiResult.jobAd.title,
        company: aiResult.jobAd.company,
        location: aiResult.jobAd.location,
        description: aiResult.jobAd.description,
        requirements: aiResult.jobAd.requirements,
        benefits: aiResult.jobAd.benefits,
        salary: aiResult.jobAd.salary,
        employmentType: aiResult.jobAd.employmentType,
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
}

export const agentCommunicationService = new AgentCommunicationService();
