
import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ClipboardCheck, User, Clock, CheckCircle, XCircle, ArrowRight } from "lucide-react";
import { useAgentState } from "@/hooks/useAgentState";
import { useAssessmentCandidates } from "@/hooks/useAssessmentCandidates";
import AssessmentForm from "@/components/assessment/AssessmentForm";
import Navigation from "@/components/Navigation";
import { Link } from "react-router-dom";

const Assessment: React.FC = () => {
  const { recommendedCandidates } = useAgentState();
  const { assessments, startAssessment, submitAssessment, loading } = useAssessmentCandidates();
  const [selectedCandidate, setSelectedCandidate] = useState<any>(null);

  // Debug logging
  console.log('[Assessment] All recommended candidates:', recommendedCandidates);
  console.log('[Assessment] Number of recommended candidates:', recommendedCandidates.length);

  // Filter candidates who have passed AI interview and are eligible for assessment
  const eligibleCandidates = recommendedCandidates.filter(candidate => {
    const isEligible = candidate && 
                      candidate.candidateId && 
                      candidate.recommendation === 'recommend' && 
                      candidate.score >= 70;
    
    console.log('[Assessment] Candidate eligibility check:', {
      candidate: candidate?.candidateName || candidate?.name || candidate?.candidateId,
      hasId: !!candidate?.candidateId,
      recommendation: candidate?.recommendation,
      score: candidate?.score,
      isEligible
    });
    
    return isEligible;
  });

  // Candidates who haven't been through AI interview yet
  const nonInterviewedCandidates = recommendedCandidates.filter(candidate => 
    candidate && 
    candidate.candidateId && 
    (!candidate.score || candidate.score < 70 || candidate.recommendation !== 'recommend')
  );

  console.log('[Assessment] Eligible candidates:', eligibleCandidates.length);
  console.log('[Assessment] Non-interviewed candidates:', nonInterviewedCandidates.length);

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
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-100">
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
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-100">
      <Navigation />
      <div className="max-w-7xl mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <ClipboardCheck className="h-8 w-8 text-blue-600" />
            AI Assessment Center
          </h1>
          <p className="text-gray-600">
            AI-powered technical assessments for candidates who have passed the AI interview
          </p>
        </div>

        <div className="grid gap-6">
          {/* Start Assessment Button */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Start Assessment</h2>
            <p className="text-gray-600 mb-4">
              Start a demo assessment to see how the assessment system works
            </p>
            <Button 
              onClick={() => handleStartAssessment({ 
                candidateId: 'demo-candidate', 
                candidateName: 'Demo Candidate',
                score: 85,
                recommendation: 'recommend'
              })}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Start Assessment
            </Button>
          </Card>
          {/* Ready for Assessment */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Ready for assessment</h2>
            <div className="space-y-4">
              {/* Show candidates who haven't completed assessment yet */}
              {eligibleCandidates.filter(candidate => {
                const assessment = assessments.find(a => a.candidateId === candidate.candidateId);
                return !assessment || assessment.status !== 'completed';
              }).length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">
                    All eligible candidates have completed their assessments.
                  </p>
                </div>
              ) : (
                eligibleCandidates.filter(candidate => {
                  const assessment = assessments.find(a => a.candidateId === candidate.candidateId);
                  return !assessment || assessment.status !== 'completed';
                }).map((candidate) => (
                  <div key={candidate.candidateId} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-medium">{candidate.candidateName || `Candidate ${candidate.candidateId?.slice(0, 8) || 'Unknown'}`}</h3>
                        <p className="text-sm text-gray-500">Interview Score: {candidate.score}/100</p>
                      </div>
                      <Badge variant="outline" className="bg-green-50 text-green-700">
                        Interview Passed
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3">
                      <Button 
                        onClick={() => handleStartAssessment(candidate)}
                        disabled={loading}
                      >
                        Start Assessment
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>

          {/* Show message if there are candidates who need AI interview first */}
          {nonInterviewedCandidates.length > 0 && (
            <Card className="p-6 border-yellow-200 bg-yellow-50">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-yellow-800 mb-2">
                    Candidates Pending AI Interview
                  </h2>
                  <p className="text-yellow-700 mb-4">
                    {nonInterviewedCandidates.length} candidate(s) need to complete the AI interview before they can take the assessment.
                  </p>
                </div>
                <Link to="/ai-interview">
                  <Button className="flex items-center gap-2">
                    Go to AI Interview
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
              <div className="space-y-2 mt-4">
                {nonInterviewedCandidates.slice(0, 3).map((candidate) => (
                  <div key={candidate.candidateId} className="flex items-center gap-3 text-sm text-yellow-700">
                    <User className="h-4 w-4" />
                    <span>{candidate.candidateName || `Candidate ${candidate.candidateId?.slice(0, 8) || 'Unknown'}`}</span>
                    <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                      {candidate.score ? `Score: ${candidate.score}/100` : 'Not interviewed'}
                    </Badge>
                  </div>
                ))}
                {nonInterviewedCandidates.length > 3 && (
                  <p className="text-sm text-yellow-600 italic">
                    ... and {nonInterviewedCandidates.length - 3} more
                  </p>
                )}
              </div>
            </Card>
          )}

          {/* Completed Assessments */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Completed Assessments</h2>
            <div className="space-y-4">
              {assessments.filter(a => a.status === 'completed').length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">
                    No completed assessments yet.
                  </p>
                  <p className="text-sm text-gray-400">
                    Assessments will appear here once candidates complete them.
                  </p>
                </div>
              ) : (
                assessments.filter(a => a.status === 'completed').map((assessment) => {
                  const candidate = eligibleCandidates.find(c => c.candidateId === assessment.candidateId);
                  
                  return (
                    <div key={assessment.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-medium">{candidate?.candidateName || `Candidate ${assessment.candidateId?.slice(0, 8) || 'Unknown'}`}</h3>
                          <p className="text-sm text-gray-500">Assessment Score: {assessment.score}/100</p>
                          <p className="text-xs text-gray-400">Completed: {new Date(assessment.completedAt || '').toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          {assessment.verdict === 'passed' ? (
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-600" />
                          )}
                          <Badge variant={assessment.verdict === 'passed' ? 'default' : 'destructive'}>
                            {assessment.verdict} ({assessment.score}/100)
                          </Badge>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Assessment;
