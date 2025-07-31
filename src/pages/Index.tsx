import React from 'react';
import Navigation from '@/components/Navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Sparkles, 
  Users, 
  UserCheck, 
  UserX, 
  TrendingUp, 
  Clock, 
  Target,
  ArrowRight,
  Zap,
  Brain,
  CheckCircle,
  XCircle,
  Star,
  Briefcase,
  Bot
} from "lucide-react";
import { Link } from 'react-router-dom';
import { useAgentState } from '@/hooks/useAgentState';
import { useAssessmentCandidates } from '@/hooks/useAssessmentCandidates';

const Index = () => {
  const { recommendedCandidates, nonRecommendedCandidates, activeJobs, systemStatus } = useAgentState();
  const { assessments } = useAssessmentCandidates();

  // Calculate real-time stats
  const passedAssessments = assessments.filter(assessment => 
    assessment.status === 'completed' && assessment.verdict === 'passed'
  );
  const failedAssessments = assessments.filter(assessment => 
    assessment.status === 'completed' && assessment.verdict === 'failed'
  );

  const stats = {
    totalApplications: recommendedCandidates.length + nonRecommendedCandidates.length,
    recommended: recommendedCandidates.length,
    passedAssessments: passedAssessments.length,
    rejectedCandidates: nonRecommendedCandidates.length + failedAssessments.length,
    activeJobs: activeJobs.length,
    avgMatchScore: recommendedCandidates.length > 0 ? 
      Math.round(recommendedCandidates.reduce((sum, c) => sum + c.score, 0) / recommendedCandidates.length) : 0
  };

  // Mock AI-generated matches for matching section
  const matches = [
    {
      id: 'match-001',
      candidateName: 'Sarah Johnson',
      candidateScore: 87,
      jobTitle: 'Senior Frontend Developer',
      company: 'TechCorp Inc.',
      matchScore: 92,
      status: 'pending'
    },
    {
      id: 'match-002',
      candidateName: 'Emma Davis',
      candidateScore: 94,
      jobTitle: 'Full Stack Engineer',
      company: 'StartupXYZ',
      matchScore: 89,
      status: 'pending'
    },
    {
      id: 'match-003',
      candidateName: 'Lisa Wang',
      candidateScore: 79,
      jobTitle: 'Senior Frontend Developer',
      company: 'TechCorp Inc.',
      matchScore: 85,
      status: 'matched'
    }
  ];

  const pendingMatches = matches.filter(m => m.status === 'pending').length;
  const completedMatches = matches.filter(m => m.status === 'matched').length;

  const recentActivity = [
    {
      type: 'application',
      title: 'New AI-recommended candidate',
      candidate: 'Sarah Chen',
      score: 94,
      time: '2 hours ago',
      status: 'recommended'
    },
    {
      type: 'assessment',
      title: 'Assessment completed',
      candidate: 'Emma Davis',
      score: 89,
      time: '4 hours ago',
      status: 'passed'
    },
    {
      type: 'match',
      title: 'AI match generated',
      candidate: 'Lisa Wang',
      score: 85,
      time: '6 hours ago',
      status: 'matched'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      <Navigation />
      
      <div className="max-w-7xl mx-auto p-6">
        {/* Hero Section */}
        <div className="mb-8">
          <div className="text-center mb-8">
            <h1 className="text-5xl font-bold text-gray-900 mb-4">
              AI-Powered Recruitment
              <span className="bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                {" "}Dashboard
              </span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Leverage Azure AI Foundry to automate candidate evaluation, create compelling job advertisements, 
              and make data-driven hiring decisions with our intelligent recruitment platform.
            </p>
          </div>

          {/* Main Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="shadow-lg border-0 bg-gradient-to-br from-blue-50 to-blue-100 text-blue-900">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-3xl font-bold">{stats.totalApplications}</div>
                    <div className="text-blue-700">Total Applications</div>
                  </div>
                  <Users className="h-12 w-12 text-blue-300" />
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg border-0 bg-gradient-to-br from-green-50 to-emerald-100 text-emerald-900">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-3xl font-bold">{stats.recommended}</div>
                    <div className="text-emerald-700">AI Recommended</div>
                  </div>
                  <UserCheck className="h-12 w-12 text-emerald-300" />
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg border-0 bg-gradient-to-br from-purple-50 to-purple-100 text-purple-900">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-3xl font-bold">{stats.passedAssessments}</div>
                    <div className="text-purple-700">Passed Assessments</div>
                  </div>
                  <CheckCircle className="h-12 w-12 text-purple-300" />
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg border-0 bg-gradient-to-br from-red-50 to-orange-100 text-orange-900">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-3xl font-bold">{stats.avgMatchScore}%</div>
                    <div className="text-orange-700">Avg Match Score</div>
                  </div>
                  <Target className="h-12 w-12 text-orange-300" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Quick Actions */}
        <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-6 w-6 text-yellow-500" />
              Quick Actions
            </CardTitle>
            <CardDescription>
              Jump to key tasks and manage your recruitment pipeline
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Link to="/ads">
                <Button className="w-full h-16 bg-gradient-to-r from-blue-100 to-blue-200 hover:from-blue-200 hover:to-blue-300 text-left justify-start text-blue-900 font-semibold">
                  <div className="flex items-center gap-3">
                    <Sparkles className="h-6 w-6" />
                    <div>
                      <div className="font-semibold">Create Job Ad</div>
                      <div className="text-sm opacity-90">AI-powered job posting</div>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 ml-auto" />
                </Button>
              </Link>

              <Link to="/applicants">
                <Button className="w-full h-16 bg-gradient-to-r from-green-100 to-emerald-100 hover:from-green-200 hover:to-emerald-200 text-left justify-start text-emerald-900 font-semibold">
                  <div className="flex items-center gap-3">
                    <UserCheck className="h-6 w-6" />
                    <div>
                      <div className="font-semibold">View Applicants</div>
                      <div className="text-sm opacity-90">{stats.recommended} recommended</div>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 ml-auto" />
                </Button>
              </Link>

              <Link to="/talent-pool">
                <Button className="w-full h-16 bg-gradient-to-r from-purple-100 to-purple-200 hover:from-purple-200 hover:to-purple-300 text-left justify-start text-purple-900 font-semibold">
                  <div className="flex items-center gap-3">
                    <Users className="h-6 w-6" />
                    <div>
                      <div className="font-semibold">Talent Pool</div>
                      <div className="text-sm opacity-90">{stats.passedAssessments} qualified</div>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 ml-auto" />
                </Button>
              </Link>

              <Link to="/matching">
                <Button className="w-full h-16 bg-gradient-to-r from-red-100 to-orange-100 hover:from-red-200 hover:to-orange-200 text-left justify-start text-orange-900 font-semibold">
                  <div className="flex items-center gap-3">
                    <Target className="h-6 w-6" />
                    <div>
                      <div className="font-semibold">AI Matching</div>
                      <div className="text-sm opacity-90">{pendingMatches} pending matches</div>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 ml-auto" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* AI Applicants Overview */}
          <Card className="shadow-lg border-0 bg-gradient-to-br from-green-50 to-emerald-100 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="h-6 w-6 text-emerald-600" />
                AI-Recommended Applicants
              </CardTitle>
              <CardDescription>
                Top candidates evaluated by AI agents
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Total Recommended</span>
                <Badge className="bg-emerald-100 text-emerald-800">{stats.recommended}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Average Match Score</span>
                <span className="font-semibold text-emerald-600">{stats.avgMatchScore}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">AI Engine Status</span>
                <Badge className="bg-green-100 text-green-800">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  {systemStatus === 'processing' ? 'Processing' : 'Ready'}
                </Badge>
              </div>
              <div className="pt-4 border-t">
                <Link to="/applicants">
                  <Button className="w-full bg-emerald-600 hover:bg-emerald-700">
                    View All Applicants
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Talent Pool Overview */}
          <Card className="shadow-lg border-0 bg-gradient-to-br from-blue-50 to-indigo-100 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-6 w-6 text-blue-600" />
                Talent Pool Status
              </CardTitle>
              <CardDescription>
                Assessment results and candidate pipeline
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Passed Assessments
                </span>
                <Badge className="bg-green-100 text-green-800">{stats.passedAssessments}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium flex items-center gap-2">
                  <XCircle className="h-4 w-4 text-red-600" />
                  Rejected Candidates
                </span>
                <Badge className="bg-red-100 text-red-800">{stats.rejectedCandidates}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Total Pool Size</span>
                <span className="font-semibold text-blue-600">{stats.passedAssessments + stats.rejectedCandidates}</span>
              </div>
              <div className="pt-4 border-t">
                <Link to="/talent-pool">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700">
                    View Talent Pool
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* AI Matching Overview */}
          <Card className="shadow-lg border-0 bg-gradient-to-br from-purple-50 to-pink-100 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-6 w-6 text-purple-600" />
                AI Job Matching
              </CardTitle>
              <CardDescription>
                Intelligent candidate-job matches
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Pending Matches</span>
                <Badge className="bg-blue-100 text-blue-800">{pendingMatches}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Completed Matches</span>
                <Badge className="bg-green-100 text-green-800">{completedMatches}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Qualified Pool</span>
                <span className="font-semibold text-purple-600">{stats.passedAssessments}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">AI Matching Status</span>
                <Badge className="bg-purple-100 text-purple-800">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Active
                </Badge>
              </div>
              <div className="pt-4 border-t">
                <Link to="/matching">
                  <Button className="w-full bg-purple-600 hover:bg-purple-700">
                    View Matches
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="shadow-lg border-0 bg-gradient-to-br from-red-50 to-orange-100 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-6 w-6 text-orange-600" />
                Recent Activity
              </CardTitle>
              <CardDescription>
                Latest AI evaluations and matches
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-white/40 hover:bg-white/70 transition-colors">
                    <div className={`w-2 h-2 rounded-full mt-2 ${
                      activity.status === 'recommended' ? 'bg-green-500' :
                      activity.status === 'passed' ? 'bg-blue-500' :
                      activity.status === 'matched' ? 'bg-purple-500' : 'bg-orange-400'
                    }`} />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{activity.title}</p>
                      <p className="text-sm text-gray-600">
                        {activity.candidate} • Score: {activity.score}%
                      </p>
                      <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {activity.status}
                    </Badge>
                  </div>
                ))}
              </div>
              <div className="pt-4 border-t">
                <div className="text-xs text-gray-500 text-center">
                  All activities are tracked and powered by AI
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer with Privacy Policy */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="text-center">
            <Link to="/privacy-policy">
              <Button variant="ghost" className="text-gray-500 hover:text-gray-700">
                Privacy Policy
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
