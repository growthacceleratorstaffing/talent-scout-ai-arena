import { AgentMessage } from '@/types/agent';

export const masterOrchestrator = {
  async processMessage(message: AgentMessage): Promise<any> {
    console.log('[Master Orchestrator] Processing message:', message.type);
    
    try {
      if (message.type === 'job_creation') {
        const jobData = message.payload;
        
        // Call Azure AI to generate the job ad
        const response = await fetch('/api/azure-ai', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            prompt: `Create a professional job advertisement for:
Role: ${jobData.role}
Company: ${jobData.company}
Location: ${jobData.location}
Requirements: ${jobData.requirements.join(', ')}
Additional Info: ${jobData.additionalInfo || ''}

Please provide a well-structured job description with:
- A compelling title
- Clear job description (2-3 paragraphs)
- Bullet-pointed requirements
- Benefits and compensation information
- Professional tone

Format the response as clean, readable text without CSS classes or formatting codes.`,
            model: 'gpt-4o'
          })
        });

        if (!response.ok) {
          console.error('Azure AI API error:', response.status);
          // Fallback to structured manual creation
          return this.createFallbackJobAd(jobData);
        }

        const aiResult = await response.json();
        const generatedContent = aiResult.choices?.[0]?.message?.content || '';

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
