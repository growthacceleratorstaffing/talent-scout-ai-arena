
export interface AgentMessage {
  id: string;
  type: 'job_creation' | 'candidate_evaluation' | 'system_status' | 'assessment_generation' | 'assessment_evaluation';
  payload: any;
  timestamp: string;
  agentId: string;
}
