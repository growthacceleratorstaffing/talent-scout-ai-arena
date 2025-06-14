
export interface AgentMessage {
  id: string;
  type: 'job_creation' | 'candidate_evaluation' | 'system_status';
  payload: any;
  timestamp: string;
  agentId: string;
}
