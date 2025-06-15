
import { useState, useEffect } from 'react';
import { agentCommunicationService } from '@/services/agentCommunication';

interface Assessment {
  id: string;
  candidateId: string;
  status: 'pending' | 'in_progress' | 'completed';
  score?: number;
  verdict?: 'passed' | 'failed';
  feedback?: string;
  startedAt: string;
  completedAt?: string;
  assessmentData?: any;
}

export const useAssessmentCandidates = () => {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startAssessment = async (candidate: any) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await agentCommunicationService.startAssessment({
        candidateId: candidate.candidateId,
        candidateName: candidate.candidateName,
        jobId: candidate.jobId,
        interviewScore: candidate.score
      });

      const newAssessment: Assessment = {
        id: result.assessmentId,
        candidateId: candidate.candidateId,
        status: 'in_progress',
        startedAt: new Date().toISOString(),
        assessmentData: result.assessmentQuestions
      };

      setAssessments(prev => [...prev, newAssessment]);
      return result;
    } catch (err: any) {
      setError(err.message || 'Failed to start assessment');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const submitAssessment = async (candidateId: string, answers: any) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await agentCommunicationService.submitAssessment({
        candidateId,
        answers
      });

      setAssessments(prev => prev.map(assessment => 
        assessment.candidateId === candidateId 
          ? {
              ...assessment,
              status: 'completed',
              score: result.score,
              verdict: result.verdict,
              feedback: result.feedback,
              completedAt: new Date().toISOString()
            }
          : assessment
      ));

      return result;
    } catch (err: any) {
      setError(err.message || 'Failed to submit assessment');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    assessments,
    startAssessment,
    submitAssessment,
    loading,
    error
  };
};
