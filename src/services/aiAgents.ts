import { AgentMessage } from '../types/agent';
import { supabase } from '@/integrations/supabase/client';

// Helper: Detect "make up a project" intent and insert creative project generation into the AI prompt.
function enhancePromptForProjectInstructions(originalPrompt: string, jobData: any) {
  if (
    /make (up )?(a )?(new )?project/i.test(originalPrompt) ||
    /example project|sample project|invent a project/i.test(originalPrompt)
  ) {
    // Add explicit instruction for the AI to invent a creative, detailed example project.
    return originalPrompt + `

---
If asked to make up, invent, or create a project that matches the job role, generate a realistic, fully invented example project relevant to the job. 
Describe the project briefly (max 5 sentences): include goals, main tech used, what the project achieved, and why it matters for the role.
NEVER copy/paste the user's text literally—always make up a new realistic project yourself.
---`;
  }
  return originalPrompt;
}

export const masterOrchestrator = {
  async processMessage(message: AgentMessage): Promise<any> {
    console.log('[Master Orchestrator] Processing message:', message.type);
    
    try {
      if (message.type === 'job_creation') {
        const jobData = message.payload;

        // Enhance the prompt for project-generation requests
        // (Assume the jobData.additionalInfo could have such a request)
        let aiPrompt = `Create a professional job advertisement for:
Role: ${jobData.role}
Company: ${jobData.company}
Location: ${jobData.location}
Requirements: ${Array.isArray(jobData.requirements) ? jobData.requirements.join(', ') : jobData.requirements}
Additional Info: ${jobData.additionalInfo || ''}

Please provide a well-structured job description with:
- A compelling title
- Clear job description (2-3 paragraphs)
- Bullet-pointed requirements
- Benefits and compensation information
- Professional tone

If you are asked to make up/sample/invent a project, generate a novel, realistic project relevant to the job (no repetition, don't copy user's text).
`;

        // Enhance if the user prompt specifically asks for a "project"
        aiPrompt = enhancePromptForProjectInstructions(aiPrompt, jobData);

        // Call Azure AI via the Supabase Edge Function
        console.log('[Master Orchestrator] Calling azure-ai-chat function...');
        
        const { data, error: functionError } = await supabase.functions.invoke('azure-ai-chat', {
          body: { prompt: aiPrompt }
        });

        if (functionError) {
          console.error('[Master Orchestrator] Function error:', functionError);
          // Fallback to structured manual creation
          return this.createFallbackJobAd(jobData);
        }

        if (data.error) {
          console.error('[Master Orchestrator] API error:', data.error);
          // Fallback to structured manual creation
          return this.createFallbackJobAd(jobData);
        }

        // Accept content from possible AI schema differences
        const generatedContent = data.content || data.generatedText || '';

        // Parse the AI response into structured data
        const jobAd = this.parseAIJobResponse(generatedContent, jobData);
        
        const result = {
          jobId: `job_${Date.now()}`,
          jobAd,
          status: 'published',
          linkedInPostId: `li_${Math.random().toString(36).substr(2, 9)}`,
          timestamp: new Date().toISOString()
        };

        console.log('[Master Orchestrator] Job ad created successfully');
        return result;
      }

      // Handle other message types
      if (message.type === 'candidate_evaluation') {
        console.log('[Master Orchestrator] Evaluating candidate');
        // Simulate evaluation process
        return {
          candidateId: message.payload.candidateId,
          jobId: message.payload.jobId,
          score: Math.random() * 100,
          feedback: "Candidate has a strong background in required skills.",
          recommendation: Math.random() > 0.5 ? 'recommend' : 'consider',
          timestamp: new Date().toISOString()
        };
      }
      
      if (message.type === 'system_status') {
        return {
          status: 'operational',
          message: 'All systems functioning normally',
          timestamp: new Date().toISOString()
        };
      }
    } catch (error) {
      console.error('[Master Orchestrator] Error processing message:', error);
      
      // Fallback for job creation
      if (message.type === 'job_creation') {
        return this.createFallbackJobAd(message.payload);
      }
      
      throw error;
    }
  },

  createFallbackJobAd(jobData: any) {
    console.log('[Master Orchestrator] Using fallback job ad creation');
    
    const jobAd = {
      title: `${jobData.role} - ${jobData.company}`,
      company: jobData.company,
      location: jobData.location,
      description: `We are looking for a talented ${jobData.role} to join our team at ${jobData.company}. This is an exciting opportunity to work with cutting-edge technologies and make a real impact.

The ideal candidate will be passionate about technology and innovation, with a strong background in the required skills. You'll be working in a collaborative environment where your contributions will be valued and recognized.

${jobData.additionalInfo ? `Additional Information: ${jobData.additionalInfo}` : ''}`,
      requirements: Array.isArray(jobData.requirements) ? jobData.requirements : jobData.requirements.split(',').map((req: string) => req.trim()),
      benefits: "Competitive salary, health benefits, flexible working hours, professional development opportunities, modern office environment",
      salary: "Competitive salary based on experience",
      employmentType: "Full-time"
    };

    return {
      jobId: `job_${Date.now()}`,
      jobAd,
      status: 'published',
      linkedInPostId: `li_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString()
    };
  },

  parseAIJobResponse(content: string, originalData: any) {
    // Clean the content and structure it properly
    const cleanContent = content.replace(/['"]/g, '"').replace(/\n{3,}/g, '\n\n');
    
    // Extract sections from AI response
    const sections = cleanContent.split('\n\n');
    let description = '';
    let benefits = '';
    
    // Find description and benefits in the AI response
    for (const section of sections) {
      if (section.length > 50 && !section.includes('Requirements:') && !section.includes('Benefits:')) {
        if (!description) {
          description = section.trim();
        }
      } else if (section.toLowerCase().includes('benefit') || section.toLowerCase().includes('compensation')) {
        benefits = section.replace(/^.*?benefits?:?\s*/i, '').trim();
      }
    }

    return {
      title: `${originalData.role} - ${originalData.company}`,
      company: originalData.company,
      location: originalData.location,
      description: description || `Join our team as a ${originalData.role} at ${originalData.company}. We're looking for a skilled professional to contribute to our growing organization.`,
      requirements: Array.isArray(originalData.requirements) ? originalData.requirements : originalData.requirements.split(',').map((req: string) => req.trim()),
      benefits: benefits || "Competitive compensation package, health benefits, flexible working arrangements, professional development opportunities",
      salary: "Competitive salary based on experience",
      employmentType: "Full-time"
    };
  }
};

export const jobGeneratorAgent = {
  async generateJobAd(jobData: any): Promise<any> {
    console.log('[Job Generator] Creating job ad');
    return {
      title: `${jobData.role} at ${jobData.company}`,
      description: `Exciting opportunity for a ${jobData.role} at ${jobData.company}`,
      requirements: jobData.requirements,
      benefits: "Competitive salary and benefits package",
      timestamp: new Date().toISOString()
    };
  }
};

export const candidateEvaluatorAgent = {
  async evaluateCandidate(candidateData: any, jobData: any): Promise<any> {
    console.log('[Candidate Evaluator] Evaluating candidate');
    return {
      candidateId: candidateData.id,
      jobId: jobData.id,
      score: Math.random() * 100,
      feedback: "Candidate has relevant experience and skills.",
      recommendation: Math.random() > 0.5 ? 'recommend' : 'consider',
      timestamp: new Date().toISOString()
    };
  }
};
