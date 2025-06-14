
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
  private async callAzureAI(prompt: string): Promise<string> {
    try {
      console.log('[Job Generator] Calling Azure AI Foundry for job generation');
      
      // Call Azure AI Foundry via Supabase edge function
      const response = await fetch('/api/azure-ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          type: 'job_generation'
        }),
      });

      if (!response.ok) {
        throw new Error(`Azure AI call failed: ${response.statusText}`);
      }

      const data = await response.json();
      return data.content;
    } catch (error) {
      console.error('[Job Generator] Azure AI call failed, using fallback:', error);
      return this.generateFallbackJobDescription();
    }
  }

  private generateFallbackJobDescription(): string {
    return `We are seeking a talented professional to join our innovative team. This role offers an exciting opportunity to work with cutting-edge technologies and contribute to meaningful projects.`;
  }

  async generateJobAd(request: JobCreationRequest): Promise<any> {
    console.log('[Job Generator] Creating job advertisement using Azure AI');
    
    const prompt = `Create a professional job advertisement for the following position:
    
Role: ${request.role}
Company: ${request.company}
Location: ${request.location}
Requirements: ${request.requirements.join(', ')}
Additional Info: ${request.additionalInfo || 'N/A'}

Please generate a compelling job description that includes:
1. An engaging overview of the role
2. Key responsibilities
3. Required qualifications
4. Company benefits
5. Application instructions

Make it professional yet appealing to attract top talent.`;

    const aiGeneratedDescription = await this.callAzureAI(prompt);
    
    const generatedAd = {
      title: request.role,
      company: request.company,
      location: request.location,
      description: aiGeneratedDescription,
      requirements: request.requirements,
      benefits: this.generateBenefits(),
      salary: 'Competitive package',
      employmentType: 'Full-time'
    };

    console.log('[Job Generator] Generated job ad with Azure AI:', generatedAd.title);
    return generatedAd;
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
  private async callAzureAI(prompt: string): Promise<any> {
    try {
      console.log('[Candidate Evaluator] Calling Azure AI Foundry for candidate evaluation');
      
      // Call Azure AI Foundry via Supabase edge function
      const response = await fetch('/api/azure-ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          type: 'candidate_evaluation'
        }),
      });

      if (!response.ok) {
        throw new Error(`Azure AI call failed: ${response.statusText}`);
      }

      const data = await response.json();
      return JSON.parse(data.content);
    } catch (error) {
      console.error('[Candidate Evaluator] Azure AI call failed, using fallback:', error);
      return null;
    }
  }

  async evaluateCandidate(request: CandidateEvaluationRequest): Promise<EvaluationResult> {
    console.log('[Candidate Evaluator] Analyzing candidate profile with Azure AI');
    
    const prompt = `Evaluate the following candidate for job suitability:

Candidate Name: ${request.candidateData.name}
Skills: ${request.candidateData.skills.join(', ')}
Experience: ${request.candidateData.experience}
Resume: ${request.candidateData.resume}

Please provide a JSON response with the following structure:
{
  "score": number (0-100),
  "recommendation": "accept" or "reject",
  "reasoning": "detailed explanation",
  "strengths": ["strength1", "strength2"],
  "weaknesses": ["weakness1", "weakness2"]
}

Evaluate based on:
1. Technical skills alignment
2. Experience level appropriateness
3. Cultural fit indicators
4. Growth potential`;

    const aiEvaluation = await this.callAzureAI(prompt);
    
    // Fallback to simple scoring if AI fails
    const fallbackScore = this.calculateFallbackScore(request.candidateData);
    
    const result: EvaluationResult = {
      candidateId: `candidate_${Date.now()}`,
      jobId: request.jobId,
      score: aiEvaluation?.score || fallbackScore.score,
      recommendation: aiEvaluation?.recommendation || fallbackScore.recommendation,
      reasoning: aiEvaluation?.reasoning || fallbackScore.reasoning,
      strengths: aiEvaluation?.strengths || fallbackScore.strengths,
      weaknesses: aiEvaluation?.weaknesses || fallbackScore.weaknesses
    };

    console.log('[Candidate Evaluator] Evaluation complete:', result.recommendation, result.score);
    return result;
  }

  private calculateFallbackScore(candidateData: any) {
    const skillMatch = this.calculateSkillMatch(candidateData.skills);
    const experienceScore = this.calculateExperienceScore(candidateData.experience);
    const overallScore = (skillMatch + experienceScore) / 2;
    
    return {
      score: Math.round(overallScore),
      recommendation: overallScore >= 70 ? 'accept' : 'reject',
      reasoning: this.generateReasoning(overallScore, skillMatch, experienceScore),
      strengths: this.identifyStrengths(candidateData),
      weaknesses: this.identifyWeaknesses(candidateData)
    };
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
