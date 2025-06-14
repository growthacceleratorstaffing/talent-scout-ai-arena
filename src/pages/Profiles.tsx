
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UserX, AlertTriangle, TrendingDown, MessageSquare, Bot, XCircle } from "lucide-react";
import { useAgentState } from "@/hooks/useAgentState";
import Navigation from "@/components/Navigation";

const Profiles = () => {
  const { nonRecommendedCandidates } = useAgentState();

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100">
      <Navigation />
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Non-Recommended Profiles</h1>
            <p className="text-lg text-gray-600">Candidates that didn't meet AI evaluation criteria</p>
            
            {/* AI Status */}
            <div className="mt-4 flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Bot className="h-5 w-5 text-orange-600" />
                <span className="text-sm font-medium">AI Analysis:</span>
                <Badge className="bg-orange-100 text-orange-800">
                  Below Threshold
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <UserX className="h-5 w-5 text-red-600" />
                <span className="text-sm font-medium">{nonRecommendedCandidates.length} Profiles</span>
              </div>
            </div>
          </div>

          {/* Analytics Dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <TrendingDown className="h-5 w-5 text-red-600" />
                  Average Score
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-600 mb-2">
                  {nonRecommendedCandidates.length > 0 ? 
                    Math.round(nonRecommendedCandidates.reduce((sum, c) => sum + c.score, 0) / nonRecommendedCandidates.length) + '%' 
                    : '0%'
                  }
                </div>
                <p className="text-sm text-gray-600">Below 70% threshold</p>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <AlertTriangle className="h-5 w-5 text-yellow-600" />
                  Common Gaps
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-1">
                  {['Experience Level', 'Technical Skills', 'Qualifications'].map((gap, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {gap}
                    </Badge>
                  ))}
                </div>
                <p className="text-sm text-gray-600 mt-2">Most common deficiencies</p>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Bot className="h-5 w-5 text-purple-600" />
                  AI Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-600 mb-2">
                  {nonRecommendedCandidates.length}
                </div>
                <p className="text-sm text-gray-600">Profiles analyzed</p>
              </CardContent>
            </Card>
          </div>

          {/* Non-Recommended Candidates */}
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <UserX className="h-6 w-6 text-red-600" />
                Non-Recommended Candidates
              </CardTitle>
              <CardDescription>
                Candidates who scored below the AI evaluation threshold
              </CardDescription>
            </CardHeader>
            <CardContent>
              {nonRecommendedCandidates.length === 0 ? (
                <div className="text-center py-12">
                  <Bot className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Profiles Yet</h3>
                  <p className="text-gray-600 mb-4">
                    All evaluated candidates so far have been recommended for the talent pool.
                  </p>
                  <p className="text-sm text-gray-500">
                    Non-recommended profiles will appear here when candidates don't meet the AI criteria.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {nonRecommendedCandidates.map((candidate) => (
                    <Card key={candidate.id} className="border border-red-200 bg-red-50/50 hover:shadow-md transition-shadow">
                      <CardHeader className="pb-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg text-gray-900">{candidate.name}</CardTitle>
                            <CardDescription className="flex items-center gap-2 mt-1">
                              <TrendingDown className="h-4 w-4 text-red-500" />
                              <span className="font-semibold text-red-700">{candidate.score}% Match</span>
                            </CardDescription>
                          </div>
                          <Badge className="bg-red-100 text-red-800">
                            Not Recommended
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
                          <h4 className="font-semibold text-gray-900 mb-2">Skills Profile</h4>
                          <div className="flex flex-wrap gap-1">
                            {candidate.skills?.map((skill: string, index: number) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        {candidate.strengths && candidate.strengths.length > 0 && (
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-2">Positive Aspects</h4>
                            <ul className="text-sm text-gray-700 space-y-1">
                              {candidate.strengths.map((strength: string, index: number) => (
                                <li key={index} className="flex items-center gap-2">
                                  <div className="w-2 h-2 rounded-full bg-green-500" />
                                  {strength}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">Areas for Improvement</h4>
                          <ul className="text-sm text-gray-700 space-y-1">
                            {candidate.weaknesses?.map((weakness: string, index: number) => (
                              <li key={index} className="flex items-center gap-2">
                                <XCircle className="h-3 w-3 text-red-600" />
                                {weakness}
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
                              Feedback
                            </Button>
                            <Button size="sm" variant="outline" className="text-orange-600 border-orange-200">
                              Re-evaluate
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

export default Profiles;
