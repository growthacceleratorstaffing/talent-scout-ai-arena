import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Target, Users, Briefcase, CheckCircle, ArrowRight, Bot } from "lucide-react";
import { useAgentState } from "@/hooks/useAgentState";
import { useAssessmentCandidates } from "@/hooks/useAssessmentCandidates";
import { usePagination } from "@/hooks/usePagination";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import Navigation from "@/components/Navigation";

const Matching = () => {
  const { activeJobs } = useAgentState();
  const { assessments } = useAssessmentCandidates();

  // Get passed candidates
  const passedCandidates = assessments.filter(assessment => 
    assessment.status === 'completed' && assessment.verdict === 'passed'
  );

  // Mock AI-generated matches
  const matches = [
    {
      id: 'match-001',
      candidateId: 'candidate-001',
      candidateName: 'Sarah Johnson',
      candidateScore: 87,
      jobId: 'job-001',
      jobTitle: 'Senior Frontend Developer',
      company: 'TechCorp Inc.',
      matchScore: 92,
      matchReason: 'Excellent technical skills align perfectly with React/TypeScript requirements. Strong problem-solving abilities and 5+ years experience.',
      status: 'pending'
    },
    {
      id: 'match-002',
      candidateId: 'candidate-003',
      candidateName: 'Emma Davis',
      candidateScore: 94,
      jobId: 'job-002',
      jobTitle: 'Full Stack Engineer',
      company: 'StartupXYZ',
      matchScore: 89,
      matchReason: 'Outstanding performance with comprehensive full-stack knowledge. Perfect fit for startup environment.',
      status: 'pending'
    },
    {
      id: 'match-003',
      candidateId: 'candidate-005',
      candidateName: 'Lisa Wang',
      candidateScore: 79,
      jobId: 'job-001',
      jobTitle: 'Senior Frontend Developer',
      company: 'TechCorp Inc.',
      matchScore: 85,
      matchReason: 'Strong analytical skills and technical foundation. Good cultural fit for team-oriented environment.',
      status: 'matched'
    }
  ];

  const {
    currentPage,
    totalPages,
    paginatedData: paginatedMatches,
    goToPage,
    goToPrevious,
    goToNext,
    hasNext,
    hasPrevious,
    totalItems,
    startIndex,
    endIndex
  } = usePagination({
    data: matches,
    itemsPerPage: 50
  });

  const pendingMatches = matches.filter(m => m.status === 'pending').length;
  const completedMatches = matches.filter(m => m.status === 'matched').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100">
      <Navigation />
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">AI Job Matching</h1>
            <p className="text-lg text-gray-600">Intelligent matching of qualified candidates to open positions</p>
            
            {totalItems > 0 && (
              <div className="mt-2 text-sm text-gray-500">
                Showing {startIndex}-{endIndex} of {totalItems} matches
              </div>
            )}
            
            <div className="mt-4 flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Bot className="h-5 w-5 text-purple-600" />
                <span className="text-sm font-medium">AI Matching Status:</span>
                <Badge className="bg-purple-100 text-purple-800">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Active
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-medium">{totalItems} Total Matches</span>
              </div>
            </div>
          </div>

          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Target className="h-5 w-5 text-blue-600" />
                  Pending Matches
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {pendingMatches}
                </div>
                <p className="text-sm text-gray-600">Awaiting review</p>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  Completed Matches
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {completedMatches}
                </div>
                <p className="text-sm text-gray-600">Successfully matched</p>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Users className="h-5 w-5 text-purple-600" />
                  Qualified Pool
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-600 mb-2">
                  {passedCandidates.length}
                </div>
                <p className="text-sm text-gray-600">Passed assessments</p>
              </CardContent>
            </Card>
          </div>

          {/* Matches List */}
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Target className="h-6 w-6 text-purple-600" />
                AI-Generated Matches
              </CardTitle>
              <CardDescription>
                Intelligent candidate-job matches based on skills, experience, and cultural fit
              </CardDescription>
            </CardHeader>
            <CardContent>
              {totalItems === 0 ? (
                <div className="text-center py-12">
                  <Bot className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Matches Yet</h3>
                  <p className="text-gray-600 mb-4">
                    AI will generate matches as candidates pass assessments and jobs are posted.
                  </p>
                </div>
              ) : (
                <>
                  <div className="space-y-6">
                    {paginatedMatches.map((match) => (
                      <Card key={match.id} className="border border-purple-200 bg-purple-50/30 hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                                <Users className="h-6 w-6 text-purple-600" />
                              </div>
                              <div>
                                <h3 className="text-lg font-semibold text-gray-900">{match.candidateName}</h3>
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                  <span>Assessment Score: {match.candidateScore}%</span>
                                  <ArrowRight className="h-4 w-4" />
                                  <span>Match Score: {match.matchScore}%</span>
                                </div>
                              </div>
                            </div>
                            <Badge className={
                              match.status === 'matched' 
                                ? "bg-green-100 text-green-800" 
                                : "bg-blue-100 text-blue-800"
                            }>
                              {match.status === 'matched' ? 'Matched' : 'Pending Review'}
                            </Badge>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                                <Briefcase className="h-4 w-4" />
                                Position Details
                              </h4>
                              <div className="bg-white/60 p-3 rounded border">
                                <p className="font-medium">{match.jobTitle}</p>
                                <p className="text-sm text-gray-600">{match.company}</p>
                              </div>
                            </div>

                            <div>
                              <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                                <Bot className="h-4 w-4" />
                                AI Match Analysis
                              </h4>
                              <div className="bg-white/60 p-3 rounded border">
                                <p className="text-sm text-gray-700">{match.matchReason}</p>
                              </div>
                            </div>
                          </div>

                          <div className="flex justify-between items-center mt-6 pt-4 border-t">
                            <div className="text-xs text-gray-500">
                              Generated by AI • Match confidence: {match.matchScore}%
                            </div>
                            <div className="flex gap-2">
                              {match.status === 'pending' ? (
                                <>
                                  <Button size="sm" variant="outline">
                                    Reject Match
                                  </Button>
                                  <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                                    Approve Match
                                  </Button>
                                </>
                              ) : (
                                <Button size="sm" className="bg-green-600 hover:bg-green-700">
                                  Contact Candidate
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                  
                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="mt-8 flex justify-center">
                      <Pagination>
                        <PaginationContent>
                          <PaginationItem>
                            <PaginationPrevious 
                              onClick={goToPrevious}
                              className={!hasPrevious ? "pointer-events-none opacity-50" : "cursor-pointer"}
                            />
                          </PaginationItem>
                          
                          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                            const page = i + 1;
                            return (
                              <PaginationItem key={page}>
                                <PaginationLink
                                  onClick={() => goToPage(page)}
                                  isActive={currentPage === page}
                                  className="cursor-pointer"
                                >
                                  {page}
                                </PaginationLink>
                              </PaginationItem>
                            );
                          })}
                          
                          <PaginationItem>
                            <PaginationNext 
                              onClick={goToNext}
                              className={!hasNext ? "pointer-events-none opacity-50" : "cursor-pointer"}
                            />
                          </PaginationItem>
                        </PaginationContent>
                      </Pagination>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Matching;