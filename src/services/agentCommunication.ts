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
          candidateName: 'Yassine Skoutti',
          recommendation: 'recommend',
          score: 97,
          jobId: 'job-001',
          interviewCompleted: true
        },
        {
          candidateId: 'candidate-002', 
          candidateName: 'Anna Saiapina',
          recommendation: 'recommend',
          score: 100,
          jobId: 'job-001',
          interviewCompleted: true
        },
        {
          candidateId: 'candidate-003',
          candidateName: 'Mohammed Nijas.K.K', 
          recommendation: 'recommend',
          score: 98,
          jobId: 'job-002',
          interviewCompleted: true
        },
        {
          candidateId: 'candidate-004',
          candidateName: 'Naresh Potla',
          recommendation: 'recommend',
          score: 100,
          jobId: 'job-001',
          interviewCompleted: true
        },
        {
          candidateId: 'candidate-005',
          candidateName: 'Volodymyr Yurkov',
          recommendation: 'recommend',
          score: 93,
          jobId: 'job-002',
          interviewCompleted: true
        },
        {
          candidateId: 'candidate-006',
          candidateName: 'Asmaa Sayed',
          recommendation: 'recommend',
          score: 99,
          jobId: 'job-001',
          interviewCompleted: true
        },
        {
          candidateId: 'candidate-007',
          candidateName: 'Usman Ghani',
          recommendation: 'recommend',
          score: 91,
          jobId: 'job-002',
          interviewCompleted: true
        },
        {
          candidateId: 'candidate-008',
          candidateName: 'Namindu Nadeeshan',
          recommendation: 'recommend',
          score: 95,
          jobId: 'job-001',
          interviewCompleted: true
        }
      ];

      // Add mock completed assessments with real names
      this.mockAssessments = [
        {
          id: 'assessment-001',
          candidateId: 'candidate-001',
          status: 'completed',
          score: 89,
          verdict: 'passed',
          feedback: 'Excellent technical skills and problem-solving abilities. Outstanding performance on algorithmic challenges.',
          startedAt: '2024-01-10T10:00:00Z',
          completedAt: '2024-01-10T11:30:00Z'
        },
        {
          id: 'assessment-002',
          candidateId: 'candidate-002',
          status: 'completed',
          score: 95,
          verdict: 'passed',
          feedback: 'Perfect technical execution with exceptional system design skills. Demonstrates deep understanding of software architecture.',
          startedAt: '2024-01-11T14:00:00Z',
          completedAt: '2024-01-11T15:45:00Z'
        },
        {
          id: 'assessment-003',
          candidateId: 'candidate-003',
          status: 'completed',
          score: 91,
          verdict: 'passed',
          feedback: 'Outstanding performance across all technical areas. Exceptional problem-solving and analytical thinking.',
          startedAt: '2024-01-12T09:00:00Z',
          completedAt: '2024-01-12T10:30:00Z'
        },
        {
          id: 'assessment-004',
          candidateId: 'candidate-004',
          status: 'completed',
          score: 96,
          verdict: 'passed',
          feedback: 'Perfect technical performance with exceptional coding skills and system design knowledge.',
          startedAt: '2024-01-13T11:00:00Z',
          completedAt: '2024-01-13T12:30:00Z'
        },
        {
          id: 'assessment-005',
          candidateId: 'candidate-005',
          status: 'completed',
          score: 87,
          verdict: 'passed',
          feedback: 'Strong technical skills with excellent analytical thinking. Demonstrates ability to work through complex problems.',
          startedAt: '2024-01-14T15:00:00Z',
          completedAt: '2024-01-14T16:30:00Z'
        },
        {
          id: 'assessment-006',
          candidateId: 'candidate-006',
          status: 'completed',
          score: 94,
          verdict: 'passed',
          feedback: 'Near-perfect performance with exceptional technical depth and leadership qualities.',
          startedAt: '2024-01-15T10:00:00Z',
          completedAt: '2024-01-15T11:15:00Z'
        },
        {
          id: 'assessment-007',
          candidateId: 'candidate-007',
          status: 'completed',
          score: 84,
          verdict: 'passed',
          feedback: 'Strong technical foundation with excellent teamwork and communication skills.',
          startedAt: '2024-01-16T14:00:00Z',
          completedAt: '2024-01-16T15:30:00Z'
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
    // Combine real Supabase candidates with mock passed candidates that have proper structure for assessments
    const supabaseCandidates = supabaseAgentService.getRecommendedCandidates();
    
    // Mock candidates with proper assessment structure using real names
    const mockPassedCandidates = [
      {
        id: 'candidate-001',
        candidateId: 'candidate-001',
        candidateName: 'Yassine Skoutti',
        name: 'Yassine Skoutti',
        recommendation: 'recommend',
        score: 97,
        jobId: 'job-001',
        interviewCompleted: true,
        reasoning: 'Outstanding technical performance with excellent problem-solving skills.',
        skills: ['React', 'TypeScript', 'Node.js'],
        strengths: ['Full-stack expertise', 'Strong communication', 'Leadership potential'],
        evaluatedAt: '2024-01-10T10:00:00Z'
      },
      {
        id: 'candidate-002',
        candidateId: 'candidate-002',
        candidateName: 'Anna Saiapina',
        name: 'Anna Saiapina',
        recommendation: 'recommend',
        score: 100,
        jobId: 'job-001',
        interviewCompleted: true,
        reasoning: 'Perfect score with exceptional technical depth and communication.',
        skills: ['JavaScript', 'Python', 'AWS'],
        strengths: ['Perfect interview score', 'System architecture', 'Team collaboration'],
        evaluatedAt: '2024-01-11T14:00:00Z'
      },
      {
        id: 'candidate-003',
        candidateId: 'candidate-003',
        candidateName: 'Mohammed Nijas.K.K', 
        name: 'Mohammed Nijas.K.K',
        recommendation: 'recommend',
        score: 98,
        jobId: 'job-002',
        interviewCompleted: true,
        reasoning: 'Excellent performance across all technical areas with strong analytical skills.',
        skills: ['React', 'Node.js', 'MongoDB'],
        strengths: ['Near-perfect score', 'Database expertise', 'Problem solving'],
        evaluatedAt: '2024-01-12T09:00:00Z'
      },
      {
        id: 'candidate-004',
        candidateId: 'candidate-004',
        candidateName: 'Naresh Potla',
        name: 'Naresh Potla',
        recommendation: 'recommend',
        score: 100,
        jobId: 'job-001',
        interviewCompleted: true,
        reasoning: 'Perfect technical performance with exceptional coding skills.',
        skills: ['Java', 'Spring', 'Docker'],
        strengths: ['Perfect interview score', 'Enterprise experience', 'DevOps knowledge'],
        evaluatedAt: '2024-01-13T11:00:00Z'
      },
      {
        id: 'candidate-005',
        candidateId: 'candidate-005',
        candidateName: 'Volodymyr Yurkov',
        name: 'Volodymyr Yurkov',
        recommendation: 'recommend',
        score: 93,
        jobId: 'job-002',
        interviewCompleted: true,
        reasoning: 'Strong technical foundation with excellent problem-solving approach.',
        skills: ['Vue.js', 'Python', 'PostgreSQL'],
        strengths: ['Senior-level experience', 'Full-stack development', 'System design'],
        evaluatedAt: '2024-01-14T15:00:00Z'
      },
      {
        id: 'candidate-006',
        candidateId: 'candidate-006',
        candidateName: 'Asmaa Sayed',
        name: 'Asmaa Sayed',
        recommendation: 'recommend',
        score: 99,
        jobId: 'job-001',
        interviewCompleted: true,
        reasoning: 'Near-perfect performance with exceptional technical depth.',
        skills: ['React', 'TypeScript', 'AWS'],
        strengths: ['Near-perfect score', 'Cloud expertise', 'Technical leadership'],
        evaluatedAt: '2024-01-15T10:00:00Z'
      },
      {
        id: 'candidate-007',
        candidateId: 'candidate-007',
        candidateName: 'Usman Ghani',
        name: 'Usman Ghani',
        recommendation: 'recommend',
        score: 91,
        jobId: 'job-002',
        interviewCompleted: true,
        reasoning: 'Strong technical skills with excellent communication and teamwork.',
        skills: ['Angular', 'Node.js', 'MongoDB'],
        strengths: ['Strong technical foundation', 'Team collaboration', 'Problem solving'],
        evaluatedAt: '2024-01-16T14:00:00Z'
      },
      {
        id: 'candidate-008',
        candidateId: 'candidate-008',
        candidateName: 'Namindu Nadeeshan',
        name: 'Namindu Nadeeshan',
        recommendation: 'recommend',
        score: 95,
        jobId: 'job-001',
        interviewCompleted: true,
        reasoning: 'Excellent technical performance with strong analytical thinking.',
        skills: ['React', 'Python', 'Docker'],
        strengths: ['High performance score', 'Full-stack skills', 'DevOps knowledge'],
        evaluatedAt: '2024-01-17T11:00:00Z'
      }
    ];
    
    return mockPassedCandidates; // Return only mock candidates for assessment demo
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
