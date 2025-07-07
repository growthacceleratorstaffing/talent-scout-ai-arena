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
  private mockAssessments: any[] = [];

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

      // Add some mock candidates who have passed AI interview for demonstration
      const mockPassedCandidates = [
        {
          candidateId: 'candidate-001',
          candidateName: 'Sarah Johnson',
          recommendation: 'recommend',
          score: 85,
          jobId: 'job-001',
          interviewCompleted: true
        },
        {
          candidateId: 'candidate-002', 
          candidateName: 'Mike Chen',
          recommendation: 'recommend',
          score: 78,
          jobId: 'job-001',
          interviewCompleted: true
        },
        {
          candidateId: 'candidate-003',
          candidateName: 'Emma Davis', 
          recommendation: 'recommend',
          score: 92,
          jobId: 'job-002',
          interviewCompleted: true
        },
        {
          candidateId: 'candidate-004',
          candidateName: 'John Smith',
          recommendation: 'recommend',
          score: 81,
          jobId: 'job-001',
          interviewCompleted: true
        },
        {
          candidateId: 'candidate-005',
          candidateName: 'Lisa Wang',
          recommendation: 'recommend',
          score: 89,
          jobId: 'job-002',
          interviewCompleted: true
        }
      ];

      // Add mock completed assessments
      this.mockAssessments = [
        {
          id: 'assessment-001',
          candidateId: 'candidate-001',
          status: 'completed',
          score: 87,
          verdict: 'passed',
          feedback: 'Excellent technical skills and problem-solving abilities. Strong communication and demonstrates deep understanding of software architecture.',
          startedAt: '2024-01-10T10:00:00Z',
          completedAt: '2024-01-10T11:30:00Z'
        },
        {
          id: 'assessment-002',
          candidateId: 'candidate-002',
          status: 'completed',
          score: 72,
          verdict: 'passed',
          feedback: 'Good technical foundation with solid coding skills. Shows potential for growth and learning.',
          startedAt: '2024-01-11T14:00:00Z',
          completedAt: '2024-01-11T15:45:00Z'
        },
        {
          id: 'assessment-003',
          candidateId: 'candidate-003',
          status: 'completed',
          score: 94,
          verdict: 'passed',
          feedback: 'Outstanding performance across all technical areas. Exceptional problem-solving and system design skills.',
          startedAt: '2024-01-12T09:00:00Z',
          completedAt: '2024-01-12T10:30:00Z'
        },
        {
          id: 'assessment-004',
          candidateId: 'candidate-004',
          status: 'completed',
          score: 58,
          verdict: 'failed',
          feedback: 'Shows basic understanding but lacks depth in key technical areas. Would benefit from additional training.',
          startedAt: '2024-01-13T11:00:00Z',
          completedAt: '2024-01-13T12:30:00Z'
        },
        {
          id: 'assessment-005',
          candidateId: 'candidate-005',
          status: 'completed',
          score: 79,
          verdict: 'passed',
          feedback: 'Strong technical skills with good analytical thinking. Demonstrates ability to work through complex problems.',
          startedAt: '2024-01-14T15:00:00Z',
          completedAt: '2024-01-14T16:30:00Z'
        }
      ];

      this.setState({
        systemStatus: 'idle',
        evaluationResults: [
          ...supabaseAgentService.getRecommendedCandidates(),
          ...supabaseAgentService.getNonRecommendedCandidates(),
          ...mockPassedCandidates
        ],
        activeJobs: cleanedJobs
      });
      
      console.log('[Agent Communication] Initialized with real Supabase data and mock passed candidates');
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
    // Combine real Supabase candidates with mock passed candidates
    const supabaseCandidates = supabaseAgentService.getRecommendedCandidates();
    const mockPassedCandidates = this.state.evaluationResults.filter(candidate => 
      candidate.candidateId && candidate.candidateId.startsWith('candidate-') && candidate.recommendation === 'recommend'
    );
    return [...supabaseCandidates, ...mockPassedCandidates];
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

  getMockAssessments() {
    return this.mockAssessments;
  }

  async startAssessment(assessmentData: any) {
    console.log('[Agent Communication] Starting AI assessment for candidate');
    this.setState({ systemStatus: 'processing' });

    try {
      // Use the master orchestrator to generate assessment questions
      const { masterOrchestrator } = await import('./aiAgents');

      const result = await masterOrchestrator.processMessage({
        id: Date.now().toString(),
        type: 'assessment_generation',
        payload: {
          candidateId: assessmentData.candidateId,
          candidateName: assessmentData.candidateName,
          jobId: assessmentData.jobId,
          interviewScore: assessmentData.interviewScore
        },
        timestamp: new Date().toISOString(),
        agentId: 'assessment-generator'
      });

      this.setState({ systemStatus: 'idle' });
      return result;
    } catch (error) {
      console.error('[Agent Communication] Error starting assessment:', error);
      this.setState({ systemStatus: 'error' });
      throw error;
    }
  }

  async submitAssessment(submissionData: any) {
    console.log('[Agent Communication] Submitting assessment for AI evaluation');
    this.setState({ systemStatus: 'processing' });

    try {
      // Use the master orchestrator to evaluate assessment answers
      const { masterOrchestrator } = await import('./aiAgents');

      const result = await masterOrchestrator.processMessage({
        id: Date.now().toString(),
        type: 'assessment_evaluation',
        payload: {
          candidateId: submissionData.candidateId,
          answers: submissionData.answers
        },
        timestamp: new Date().toISOString(),
        agentId: 'assessment-evaluator'
      });

      this.setState({ systemStatus: 'idle' });
      return result;
    } catch (error) {
      console.error('[Agent Communication] Error evaluating assessment:', error);
      this.setState({ systemStatus: 'error' });
      throw error;
    }
  }
}

export const agentCommunicationService = new AgentCommunicationService();
