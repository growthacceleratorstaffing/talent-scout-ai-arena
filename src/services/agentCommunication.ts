
import { masterOrchestrator, AgentMessage, JobCreationRequest, CandidateEvaluationRequest } from './aiAgents';

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

  private listeners: Array<(state: AgentState) => void> = [];

  subscribeToState(listener: (state: AgentState) => void) {
    this.listeners.push(listener);
    // Immediately call with current state
    listener(this.state);
  }

  unsubscribeFromState(listener: (state: AgentState) => void) {
    this.listeners = this.listeners.filter(l => l !== listener);
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener({ ...this.state }));
  }

  async createJobAd(jobRequest: JobCreationRequest) {
    this.state.systemStatus = 'processing';
    this.notifyListeners();

    try {
      const message: AgentMessage = {
        id: Date.now().toString(),
        type: 'job_creation',
        payload: jobRequest,
        timestamp: new Date().toISOString(),
        agentId: 'orchestrator'
      };

      const result = await masterOrchestrator.processMessage(message);
      
      this.state.activeJobs.unshift({
        ...result.jobAd,
        id: result.jobId,
        linkedInPostId: result.linkedInPostId,
        status: result.status,
        createdAt: new Date().toISOString().split('T')[0]
      });

      this.state.systemStatus = 'idle';
      this.notifyListeners();

      return result;
    } catch (error) {
      this.state.systemStatus = 'error';
      this.notifyListeners();
      throw error;
    }
  }

  async evaluateCandidate(candidateRequest: CandidateEvaluationRequest) {
    this.state.systemStatus = 'processing';
    this.notifyListeners();

    try {
      const message: AgentMessage = {
        id: Date.now().toString(),
        type: 'candidate_evaluation',
        payload: candidateRequest,
        timestamp: new Date().toISOString(),
        agentId: 'orchestrator'
      };

      const result = await masterOrchestrator.processMessage(message);
      
      // Add to evaluation results
      this.state.evaluationResults.push(result);
      
      // Add to appropriate candidate list
      const candidateWithEvaluation = {
        ...candidateRequest.candidateData,
        id: result.candidateId,
        jobId: result.jobId,
        score: result.score,
        recommendation: result.recommendation,
        reasoning: result.reasoning,
        strengths: result.strengths,
        weaknesses: result.weaknesses,
        evaluatedAt: new Date().toISOString()
      };

      this.state.candidates.unshift(candidateWithEvaluation);
      this.state.systemStatus = 'idle';
      this.notifyListeners();

      return result;
    } catch (error) {
      this.state.systemStatus = 'error';
      this.notifyListeners();
      throw error;
    }
  }

  getRecommendedCandidates() {
    return this.state.candidates.filter(c => c.recommendation === 'accept');
  }

  getNonRecommendedCandidates() {
    return this.state.candidates.filter(c => c.recommendation === 'reject');
  }

  getActiveJobs() {
    return this.state.activeJobs;
  }

  getSystemStatus() {
    return this.state.systemStatus;
  }

  // Simulate incoming candidate applications
  async simulateCandidateApplication(jobId: string) {
    const mockCandidates = [
      {
        name: 'Sarah Chen',
        resume: 'Senior Software Engineer with 6 years of experience in React, TypeScript, and Node.js. Led multiple high-impact projects.',
        skills: ['React', 'TypeScript', 'Node.js', 'GraphQL', 'AWS', 'Docker'],
        experience: '6 years of full-stack development experience, including 2 years in senior roles'
      },
      {
        name: 'Michael Rodriguez',
        resume: 'Full-stack developer with expertise in modern web technologies. Strong background in agile development.',
        skills: ['JavaScript', 'Vue.js', 'Python', 'PostgreSQL'],
        experience: '3 years of web development experience'
      },
      {
        name: 'Emily Johnson',
        resume: 'Junior developer passionate about learning new technologies. Recent bootcamp graduate.',
        skills: ['HTML', 'CSS', 'JavaScript', 'React'],
        experience: '1 year of professional development experience'
      }
    ];

    for (const candidate of mockCandidates) {
      await this.evaluateCandidate({
        jobId,
        candidateData: candidate
      });
      
      // Add delay between evaluations
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }
}

export const agentCommunicationService = new AgentCommunicationService();
