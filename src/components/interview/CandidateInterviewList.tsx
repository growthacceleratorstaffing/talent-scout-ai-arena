
import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { User, Clock, CheckCircle, XCircle, Play } from "lucide-react";
import { Tables } from "@/integrations/supabase/types";

type Candidate = Tables<"candidates">;
type CandidateInterview = Tables<"candidate_interviews">;

interface CandidateWithInterview extends Candidate {
  interview?: CandidateInterview;
}

interface CandidateInterviewListProps {
  candidates: CandidateWithInterview[];
  onStartInterview: (candidateId: string, jobId: string) => void;
  onViewInterview: (interview: CandidateInterview) => void;
}

const getStageColor = (stage: string) => {
  switch (stage) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'in_progress':
      return 'bg-blue-100 text-blue-800';
    case 'completed':
      return 'bg-gray-100 text-gray-800';
    case 'passed':
      return 'bg-green-100 text-green-800';
    case 'failed':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getStageIcon = (stage: string) => {
  switch (stage) {
    case 'pending':
      return <Clock className="h-4 w-4" />;
    case 'in_progress':
      return <Play className="h-4 w-4" />;
    case 'completed':
    case 'passed':
      return <CheckCircle className="h-4 w-4" />;
    case 'failed':
      return <XCircle className="h-4 w-4" />;
    default:
      return <Clock className="h-4 w-4" />;
  }
};

export const CandidateInterviewList: React.FC<CandidateInterviewListProps> = ({
  candidates,
  onStartInterview,
  onViewInterview,
}) => {
  if (candidates.length === 0) {
    return (
      <Card className="p-8 text-center">
        <User className="h-12 w-12 mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No candidates for interviews
        </h3>
        <p className="text-gray-500">
          Recommended candidates will appear here for AI interviews.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {candidates.map((candidate) => (
        <Card key={candidate.id} className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-lg font-medium text-gray-900">
                  {candidate.name}
                </h3>
                <Badge className={getStageColor(candidate.interview?.stage || 'pending')}>
                  <div className="flex items-center gap-1">
                    {getStageIcon(candidate.interview?.stage || 'pending')}
                    {candidate.interview?.stage || 'pending'}
                  </div>
                </Badge>
                {candidate.interview?.score && (
                  <Badge variant="outline">
                    Score: {candidate.interview.score}
                  </Badge>
                )}
              </div>
              
              <div className="text-sm text-gray-600 space-y-1">
                <p><strong>Email:</strong> {candidate.email}</p>
                {candidate.current_position && (
                  <p><strong>Position:</strong> {candidate.current_position}</p>
                )}
                {candidate.company && (
                  <p><strong>Company:</strong> {candidate.company}</p>
                )}
                {candidate.location && (
                  <p><strong>Location:</strong> {candidate.location}</p>
                )}
                {candidate.interview?.verdict && (
                  <p><strong>Verdict:</strong> {candidate.interview.verdict}</p>
                )}
              </div>

              {candidate.interview?.started_at && (
                <div className="mt-3 text-xs text-gray-500">
                  <p>
                    Started: {new Date(candidate.interview.started_at).toLocaleString()}
                  </p>
                  {candidate.interview.completed_at && (
                    <p>
                      Completed: {new Date(candidate.interview.completed_at).toLocaleString()}
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="flex flex-col gap-2">
              {!candidate.interview || candidate.interview.stage === 'pending' ? (
                <Button
                  onClick={() => onStartInterview(candidate.id, "default-job-id")}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Start Interview
                </Button>
              ) : candidate.interview.stage === 'in_progress' ? (
                <Button
                  onClick={() => onViewInterview(candidate.interview!)}
                  variant="outline"
                >
                  Continue Interview
                </Button>
              ) : (
                <Button
                  onClick={() => onViewInterview(candidate.interview!)}
                  variant="outline"
                >
                  View Interview
                </Button>
              )}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};
