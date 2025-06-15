
import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ClipboardCheck, User, Clock, CheckCircle, XCircle } from "lucide-react";
import { useAgentState } from "@/hooks/useAgentState";
import { useAssessmentCandidates } from "@/hooks/useAssessmentCandidates";
import AssessmentForm from "@/components/assessment/AssessmentForm";
import Navigation from "@/components/Navigation";

const Assessment: React.FC = () => {
  const { recommendedCandidates } = useAgentState();
  const { assessments, startAssessment, submitAssessment, loading } = useAssessmentCandidates();
  const [selectedCandidate, setSelectedCandidate] = useState<any>(null);

  // Filter candidates who have passed AI interview and are eligible for assessment
  const eligibleCandidates = recommendedCandidates.filter(candidate => 
    candidate.recommendation === 'recommend' && candidate.score >= 70
  );

  const handleStartAssessment = async (candidate: any) => {
    await startAssessment(candidate);
    setSelectedCandidate(candidate);
  };

  const handleSubmitAssessment = async (candidateId: string, answers: any) => {
    await submitAssessment(candidateId, answers);
    setSelectedCandidate(null);
  };

  if (selectedCandidate) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-4xl mx-auto py-8 px-4">
          <AssessmentForm
            candidate={selectedCandidate}
            onSubmit={(answers) => handleSubmitAssessment(selectedCandidate.candidateId, answers)}
            onCancel={() => setSelectedCandidate(null)}
            loading={loading}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="max-w-7xl mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <ClipboardCheck className="h-8 w-8 text-blue-600" />
            AI Assessment Center
          </h1>
          <p className="text-gray-600">
            AI-powered technical assessments for recommended candidates
          </p>
        </div>

        <div className="grid gap-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Eligible Candidates</h2>
            <div className="space-y-4">
              {eligibleCandidates.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  No candidates ready for assessment. Complete AI interviews first.
                </p>
              ) : (
                eligibleCandidates.map((candidate) => {
                  const assessment = assessments.find(a => a.candidateId === candidate.candidateId);
                  
                  return (
                    <div key={candidate.candidateId} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-medium">{candidate.candidateName || `Candidate ${candidate.candidateId.slice(0, 8)}`}</h3>
                          <p className="text-sm text-gray-500">Interview Score: {candidate.score}/100</p>
                        </div>
                        <Badge variant="outline" className="bg-green-50 text-green-700">
                          Recommended
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3">
                        {assessment ? (
                          <div className="flex items-center gap-2">
                            {assessment.status === 'completed' ? (
                              <>
                                {assessment.verdict === 'passed' ? (
                                  <CheckCircle className="h-5 w-5 text-green-600" />
                                ) : (
                                  <XCircle className="h-5 w-5 text-red-600" />
                                )}
                                <Badge variant={assessment.verdict === 'passed' ? 'default' : 'destructive'}>
                                  {assessment.verdict} ({assessment.score}/100)
                                </Badge>
                              </>
                            ) : (
                              <>
                                <Clock className="h-5 w-5 text-yellow-600" />
                                <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
                                  In Progress
                                </Badge>
                              </>
                            )}
                          </div>
                        ) : (
                          <Button 
                            onClick={() => handleStartAssessment(candidate)}
                            disabled={loading}
                          >
                            Start Assessment
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </Card>

          {assessments.length > 0 && (
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Assessment Results</h2>
              <div className="space-y-4">
                {assessments.map((assessment) => (
                  <div key={assessment.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium">
                        Candidate {assessment.candidateId.slice(0, 8)}
                      </h3>
                      <Badge variant={assessment.verdict === 'passed' ? 'default' : 'destructive'}>
                        {assessment.verdict}
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-600">
                      <p>Score: {assessment.score}/100</p>
                      <p>Completed: {new Date(assessment.completedAt || '').toLocaleString()}</p>
                      {assessment.feedback && (
                        <p className="mt-2 italic">"{assessment.feedback}"</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Assessment;
