
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Star, TrendingUp, MessageSquare, Bot, CheckCircle } from "lucide-react";
import { useAgentState } from "@/hooks/useAgentState";
import Navigation from "@/components/Navigation";

const TalentPool = () => {
  const { recommendedCandidates, systemStatus } = useAgentState();

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      <Navigation />
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">AI-Recommended Talent Pool</h1>
            <p className="text-lg text-gray-600">Top candidates evaluated and recommended by our AI agents</p>
            
            {/* AI Status */}
            <div className="mt-4 flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Bot className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium">AI Evaluation Status:</span>
                <Badge className="bg-green-100 text-green-800">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Active
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-medium">{recommendedCandidates.length} Recommended Candidates</span>
              </div>
            </div>
          </div>

          {/* AI Insights Dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  Match Quality
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {recommendedCandidates.length > 0 ? 
                    Math.round(recommendedCandidates.reduce((sum, c) => sum + c.score, 0) / recommendedCandidates.length) + '%' 
                    : '0%'
                  }
                </div>
                <p className="text-sm text-gray-600">Average AI match score</p>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Star className="h-5 w-5 text-yellow-600" />
                  Top Skills
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-1">
                  {['React', 'TypeScript', 'Node.js', 'AWS'].map((skill, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                </div>
                <p className="text-sm text-gray-600 mt-2">Most common skills in pool</p>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Bot className="h-5 w-5 text-purple-600" />
                  AI Processing
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-600 mb-2">
                  {systemStatus === 'processing' ? 'Active' : 'Ready'}
                </div>
                <p className="text-sm text-gray-600">Evaluation engine status</p>
              </CardContent>
            </Card>
          </div>

          {/* Recommended Candidates */}
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Users className="h-6 w-6 text-green-600" />
                Recommended Candidates
              </CardTitle>
              <CardDescription>
                Candidates who passed AI evaluation and are recommended for interview
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recommendedCandidates.length === 0 ? (
                <div className="text-center py-12">
                  <Bot className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Candidates Yet</h3>
                  <p className="text-gray-600 mb-4">
                    AI agents are ready to evaluate candidates as they apply to your job postings.
                  </p>
                  <p className="text-sm text-gray-500">
                    Create a job advertisement to start receiving and evaluating applications.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {recommendedCandidates.map((candidate) => (
                    <Card key={candidate.id} className="border border-green-200 bg-green-50/50 hover:shadow-md transition-shadow">
                      <CardHeader className="pb-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg text-gray-900">{candidate.name}</CardTitle>
                            <CardDescription className="flex items-center gap-2 mt-1">
                              <Star className="h-4 w-4 text-yellow-500" />
                              <span className="font-semibold text-green-700">{candidate.score}% Match</span>
                            </CardDescription>
                          </div>
                          <Badge className="bg-green-100 text-green-800">
                            Recommended
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">AI Evaluation Summary</h4>
                          <p className="text-sm text-gray-700 bg-white/60 p-3 rounded border">
                            {candidate.reasoning}
                          </p>
                        </div>

                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">Key Skills</h4>
                          <div className="flex flex-wrap gap-1">
                            {candidate.skills?.map((skill: string, index: number) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">AI-Identified Strengths</h4>
                          <ul className="text-sm text-gray-700 space-y-1">
                            {candidate.strengths?.map((strength: string, index: number) => (
                              <li key={index} className="flex items-center gap-2">
                                <CheckCircle className="h-3 w-3 text-green-600" />
                                {strength}
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="flex justify-between items-center pt-4 border-t">
                          <span className="text-xs text-gray-500">
                            Evaluated: {new Date(candidate.evaluatedAt).toLocaleDateString()}
                          </span>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline">
                              <MessageSquare className="h-4 w-4 mr-1" />
                              Contact
                            </Button>
                            <Button size="sm" className="bg-green-600 hover:bg-green-700">
                              Interview
                            </Button>
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
