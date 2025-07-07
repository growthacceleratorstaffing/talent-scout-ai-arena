
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

  // Initialize with mock assessments from agentCommunicationService
  useEffect(() => {
    const initializeMockAssessments = () => {
      const mockAssessments: Assessment[] = [
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
      setAssessments(mockAssessments);
    };

    initializeMockAssessments();
  }, []);

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
