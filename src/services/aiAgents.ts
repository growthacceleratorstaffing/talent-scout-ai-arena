
interface AgentMessage {
  id: string;
  type: 'job_creation' | 'candidate_evaluation' | 'status_update';
  payload: any;
  timestamp: string;
  agentId: string;
}

interface JobCreationRequest {
  role: string;
  company: string;
  location: string;
  requirements: string[];
  additionalInfo?: string;
}

interface CandidateEvaluationRequest {
  jobId: string;
  candidateData: {
    name: string;
    resume: string;
    skills: string[];
    experience: string;
  };
}

interface EvaluationResult {
  candidateId: string;
  jobId: string;
  score: number;
  recommendation: 'accept' | 'reject';
  reasoning: string;
  strengths: string[];
  weaknesses: string[];
}

class MasterOrchestratorAgent {
  private messageQueue: AgentMessage[] = [];
  private jobGeneratorAgent: JobGeneratorAgent;
  private candidateEvaluatorAgent: CandidateEvaluatorAgent;
  
  constructor() {
    this.jobGeneratorAgent = new JobGeneratorAgent();
    this.candidateEvaluatorAgent = new CandidateEvaluatorAgent();
  }

  async processMessage(message: AgentMessage): Promise<any> {
    console.log(`[Orchestrator] Processing message: ${message.type}`, message);
    
    switch (message.type) {
      case 'job_creation':
        return await this.handleJobCreation(message.payload);
      case 'candidate_evaluation':
        return await this.handleCandidateEvaluation(message.payload);
      default:
        throw new Error(`Unknown message type: ${message.type}`);
    }
  }

  private async handleJobCreation(payload: JobCreationRequest) {
    console.log('[Orchestrator] Delegating to Job Generator Agent');
    const jobAd = await this.jobGeneratorAgent.generateJobAd(payload);
    
    // Simulate LinkedIn API posting
    const linkedInResult = await this.postToLinkedIn(jobAd);
    
    return {
      jobId: Date.now().toString(),
      jobAd,
      linkedInPostId: linkedInResult.postId,
      status: 'published'
    };
  }

  private async handleCandidateEvaluation(payload: CandidateEvaluationRequest) {
    console.log('[Orchestrator] Delegating to Candidate Evaluator Agent');
    return await this.candidateEvaluatorAgent.evaluateCandidate(payload);
  }

  private async postToLinkedIn(jobAd: any): Promise<{ postId: string }> {
    // Simulated LinkedIn API call
    console.log('[Orchestrator] Posting to LinkedIn:', jobAd.title);
    
    // In real implementation, this would use LinkedIn's Marketing API
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      postId: `linkedin_${Date.now()}`
    };
  }
}

class JobGeneratorAgent {
  async generateJobAd(request: JobCreationRequest): Promise<any> {
    console.log('[Job Generator] Creating job advertisement');
    
    // Simulate Azure AI Foundry API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const generatedAd = {
      title: request.role,
      company: request.company,
      location: request.location,
      description: this.generateDescription(request),
      requirements: request.requirements,
      benefits: this.generateBenefits(),
      salary: 'Competitive package',
      employmentType: 'Full-time'
    };

    console.log('[Job Generator] Generated job ad:', generatedAd.title);
    return generatedAd;
  }

  private generateDescription(request: JobCreationRequest): string {
    return `We are seeking a talented ${request.role} to join our innovative team at ${request.company}. 

This role offers an exciting opportunity to work with cutting-edge technologies and contribute to meaningful projects that impact our business and customers. You'll be part of a collaborative environment where your expertise will be valued and your professional growth supported.

Key Responsibilities:
• Lead development of high-quality software solutions
• Collaborate with cross-functional teams to deliver exceptional results
• Mentor junior team members and contribute to technical excellence
• Stay current with industry trends and best practices

Location: ${request.location}

Join us in shaping the future of technology while building a rewarding career in a supportive, dynamic environment.`;
  }

  private generateBenefits(): string[] {
    return [
      'Competitive salary and equity package',
      'Comprehensive health and dental insurance',
      'Flexible working arrangements',
      'Professional development budget',
      'Collaborative and inclusive work environment',
      'Cutting-edge technology stack'
    ];
  }
}

class CandidateEvaluatorAgent {
  async evaluateCandidate(request: CandidateEvaluationRequest): Promise<EvaluationResult> {
    console.log('[Candidate Evaluator] Analyzing candidate profile');
    
    // Simulate Azure AI Foundry evaluation
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Simple scoring algorithm (in real implementation, this would use Azure AI)
    const skillMatch = this.calculateSkillMatch(request.candidateData.skills);
    const experienceScore = this.calculateExperienceScore(request.candidateData.experience);
    const overallScore = (skillMatch + experienceScore) / 2;
    
    const result: EvaluationResult = {
      candidateId: `candidate_${Date.now()}`,
      jobId: request.jobId,
      score: Math.round(overallScore),
      recommendation: overallScore >= 70 ? 'accept' : 'reject',
      reasoning: this.generateReasoning(overallScore, skillMatch, experienceScore),
      strengths: this.identifyStrengths(request.candidateData),
      weaknesses: this.identifyWeaknesses(request.candidateData)
    };

    console.log('[Candidate Evaluator] Evaluation complete:', result.recommendation, result.score);
    return result;
  }

  private calculateSkillMatch(skills: string[]): number {
    // Simplified skill matching logic
    const requiredSkills = ['JavaScript', 'React', 'TypeScript', 'Node.js'];
    const matches = skills.filter(skill => 
      requiredSkills.some(required => 
        skill.toLowerCase().includes(required.toLowerCase())
      )
    ).length;
    
    return (matches / requiredSkills.length) * 100;
  }

  private calculateExperienceScore(experience: string): number {
    // Extract years of experience from text
    const yearMatch = experience.match(/(\d+)\s*years?/i);
    const years = yearMatch ? parseInt(yearMatch[1]) : 0;
    
    if (years >= 5) return 90;
    if (years >= 3) return 75;
    if (years >= 1) return 60;
    return 40;
  }

  private generateReasoning(overallScore: number, skillMatch: number, experienceScore: number): string {
    if (overallScore >= 70) {
      return `Strong candidate with ${skillMatch}% skill match and solid experience level (${experienceScore}/100). Demonstrates good alignment with job requirements.`;
    } else {
      return `Limited alignment with job requirements. Skill match: ${skillMatch}%, Experience level: ${experienceScore}/100. May benefit from additional training or experience.`;
    }
  }

  private identifyStrengths(candidate: any): string[] {
    const strengths = [];
    if (candidate.skills.length > 5) strengths.push('Diverse technical skill set');
    if (candidate.experience.includes('senior') || candidate.experience.includes('lead')) {
      strengths.push('Leadership experience');
    }
    if (candidate.skills.some((s: string) => s.toLowerCase().includes('react'))) {
      strengths.push('Modern frontend expertise');
    }
    return strengths.length > 0 ? strengths : ['Basic qualifications present'];
  }

  private identifyWeaknesses(candidate: any): string[] {
    const weaknesses = [];
    if (candidate.skills.length < 3) weaknesses.push('Limited technical breadth');
    if (!candidate.experience.includes('year')) weaknesses.push('Experience level not clearly specified');
    return weaknesses.length > 0 ? weaknesses : ['No significant gaps identified'];
  }
}

// Export singleton instances
export const masterOrchestrator = new MasterOrchestratorAgent();
export type { AgentMessage, JobCreationRequest, CandidateEvaluationRequest, EvaluationResult };
