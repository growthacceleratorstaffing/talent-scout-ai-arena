
import { useState, useEffect } from 'react';
import { agentCommunicationService } from '@/services/agentCommunication';

interface AgentState {
  activeJobs: any[];
  candidates: any[];
  evaluationResults: any[];
  systemStatus: 'idle' | 'processing' | 'error';
}

export const useAgentState = () => {
  const [state, setState] = useState<AgentState>({
    activeJobs: [],
    candidates: [],
    evaluationResults: [],
    systemStatus: 'idle'
  });

  useEffect(() => {
    const handleStateChange = (newState: AgentState) => {
      setState(newState);
    };

    agentCommunicationService.subscribeToState(handleStateChange);

    return () => {
      agentCommunicationService.unsubscribeFromState(handleStateChange);
    };
  }, []);

  return {
    ...state,
    recommendedCandidates: agentCommunicationService.getRecommendedCandidates(),
    nonRecommendedCandidates: agentCommunicationService.getNonRecommendedCandidates(),
    createJobAd: agentCommunicationService.createJobAd.bind(agentCommunicationService),
    evaluateCandidate: agentCommunicationService.evaluateCandidate.bind(agentCommunicationService),
    simulateCandidateApplication: agentCommunicationService.simulateCandidateApplication.bind(agentCommunicationService),
    deleteJobAd: agentCommunicationService.deleteJobAd.bind(agentCommunicationService),
    updateJobAd: agentCommunicationService.updateJobAd.bind(agentCommunicationService),
  };
};
