import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Star, TrendingUp, TrendingDown, MessageSquare, Bot, CheckCircle, XCircle, ClipboardCheck } from "lucide-react";
import { useAgentState } from "@/hooks/useAgentState";
import { useAssessmentCandidates } from "@/hooks/useAssessmentCandidates";
import Navigation from "@/components/Navigation";

const TalentPool = () => {
  const { nonRecommendedCandidates } = useAgentState();
  const { assessments } = useAssessmentCandidates();

  // Get passed assessments
  const passedAssessments = assessments.filter(assessment => 
    assessment.status === 'completed' && assessment.verdict === 'passed'
  );

  // Get failed assessments  
  const failedAssessments = assessments.filter(assessment => 
    assessment.status === 'completed' && assessment.verdict === 'failed'
  );

  // Combine all candidates with their status
  const allCandidates = [
    ...passedAssessments.map(assessment => ({
      id: assessment.candidateId,
      name: `Candidate ${assessment.candidateId?.slice(0, 8) || 'Unknown'}`,
      score: assessment.score || 0,
      status: 'passed' as const,
      feedback: assessment.feedback,
      evaluatedAt: assessment.completedAt || new Date().toISOString(),
      type: 'assessment'
    })),
    ...failedAssessments.map(assessment => ({
      id: assessment.candidateId,
      name: `Candidate ${assessment.candidateId?.slice(0, 8) || 'Unknown'}`,
      score: assessment.score || 0,
      status: 'failed' as const,
      feedback: assessment.feedback,
      evaluatedAt: assessment.completedAt || new Date().toISOString(),
      type: 'assessment'
    })),
    ...nonRecommendedCandidates.map(candidate => ({
      id: candidate.id,
      name: candidate.name,
      score: candidate.score,
      status: 'rejected' as const,
      reasoning: candidate.reasoning,
      evaluatedAt: candidate.evaluatedAt,
      skills: candidate.skills,
      weaknesses: candidate.weaknesses,
      type: 'profile'
    }))
  ];

  const passedCount = passedAssessments.length;
  const rejectedCount = nonRecommendedCandidates.length + failedAssessments.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navigation />
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Talent Pool</h1>
            <p className="text-lg text-gray-600">Final talent pool with passed assessments and rejected candidates</p>
            
            {/* Status Overview */}
            <div className="mt-4 flex items-center gap-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium">{passedCount} Passed</span>
              </div>
              <div className="flex items-center gap-2">
                <XCircle className="h-5 w-5 text-red-600" />
                <span className="text-sm font-medium">{rejectedCount} Rejected</span>
              </div>
            </div>
          </div>

          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  Passed Assessment
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {passedCount}
                </div>
                <p className="text-sm text-gray-600">Ready for hiring</p>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <XCircle className="h-5 w-5 text-red-600" />
                  Rejected
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-600 mb-2">
                  {rejectedCount}
                </div>
                <p className="text-sm text-gray-600">Did not meet criteria</p>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Users className="h-5 w-5 text-blue-600" />
                  Total Pool
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {allCandidates.length}
                </div>
                <p className="text-sm text-gray-600">All processed candidates</p>
              </CardContent>
            </Card>
          </div>

          {/* Candidates List */}
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Users className="h-6 w-6 text-blue-600" />
                All Candidates
              </CardTitle>
              <CardDescription>
                Complete talent pool with final status
              </CardDescription>
            </CardHeader>
            <CardContent>
              {allCandidates.length === 0 ? (
                <div className="text-center py-12">
                  <Bot className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Candidates Yet</h3>
                  <p className="text-gray-600 mb-4">
                    Candidates will appear here after they complete assessments or are processed by AI.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {allCandidates.map((candidate) => (
                    <Card key={candidate.id} className={`border ${
                      candidate.status === 'passed' 
                        ? 'border-green-200 bg-green-50/50' 
                        : 'border-red-200 bg-red-50/50'
                    } hover:shadow-md transition-shadow`}>
                      <CardHeader className="pb-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg text-gray-900">{candidate.name}</CardTitle>
                            <CardDescription className="flex items-center gap-2 mt-1">
                              {candidate.status === 'passed' ? (
                                <>
                                  <CheckCircle className="h-4 w-4 text-green-500" />
                                  <span className="font-semibold text-green-700">{candidate.score}% Score</span>
                                </>
                              ) : (
                                <>
                                  <XCircle className="h-4 w-4 text-red-500" />
                                  <span className="font-semibold text-red-700">{candidate.score}% Score</span>
                                </>
                              )}
                            </CardDescription>
                          </div>
                          <Badge className={
                            candidate.status === 'passed' 
                              ? "bg-green-100 text-green-800" 
                              : "bg-red-100 text-red-800"
                          }>
                            {candidate.status === 'passed' ? 'Passed' : 
                             candidate.status === 'failed' ? 'Failed Assessment' : 'Rejected'}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">
                            {candidate.type === 'assessment' ? 'Assessment Feedback' : 'AI Evaluation'}
                          </h4>
                          <p className="text-sm text-gray-700 bg-white/60 p-3 rounded border">
                            {candidate.type === 'assessment' ? 
                              ('feedback' in candidate ? candidate.feedback : 'No feedback available') : 
                              ('reasoning' in candidate ? candidate.reasoning : 'No reasoning available')
                            }
                          </p>
                        </div>

                        {candidate.type === 'profile' && 'skills' in candidate && candidate.skills && candidate.skills.length > 0 && (
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-2">Skills</h4>
                            <div className="flex flex-wrap gap-1">
                              {candidate.skills.map((skill: string, index: number) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {skill}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="flex justify-between items-center pt-4 border-t">
                          <span className="text-xs text-gray-500">
                            {candidate.type === 'assessment' ? 'Completed' : 'Evaluated'}: {new Date(candidate.evaluatedAt).toLocaleDateString()}
                          </span>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline">
                              <MessageSquare className="h-4 w-4 mr-1" />
                              {candidate.status === 'passed' ? 'Contact' : 'Feedback'}
                            </Button>
                            {candidate.status === 'passed' && (
                              <Button size="sm" className="bg-green-600 hover:bg-green-700">
                                Hire
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TalentPool;