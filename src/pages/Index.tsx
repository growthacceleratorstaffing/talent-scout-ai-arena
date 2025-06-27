import React, { lazy } from 'react';
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
  Brain
} from "lucide-react";
import { Link } from 'react-router-dom';
import LazyWrapper from '@/components/LazyWrapper';

// Lazy load the monitoring dashboard to reduce initial bundle size
const OptimizedMonitoringDashboard = lazy(() => import('@/components/monitoring/OptimizedMonitoringDashboard'));

const Index = () => {
  const stats = {
    totalApplications: 156,
    recommended: 12,
    nonRecommended: 28,
    pendingReview: 116,
    activeJobs: 3,
    avgMatchScore: 67
  };

  const recentActivity = [
    {
      type: 'application',
      title: 'New application for Senior Full Stack Developer',
      candidate: 'Sarah Chen',
      score: 94,
      time: '2 hours ago',
      status: 'recommended'
    },
    {
      type: 'job',
      title: 'Job advertisement published',
      job: 'UX/UI Designer',
      time: '4 hours ago',
      status: 'published'
    },
    {
      type: 'evaluation',
      title: 'AI evaluation completed',
      candidate: 'Marcus Rodriguez',
      score: 91,
      time: '6 hours ago',
      status: 'recommended'
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Blue (Job Ads) */}
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

            {/* Green/Emerald (Talent Pool) */}
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

            {/* Orange/Red (Profiles) */}
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

              <Link to="/talent-pool">
                <Button className="w-full h-16 bg-gradient-to-r from-green-100 to-emerald-100 hover:from-green-200 hover:to-emerald-200 text-left justify-start text-emerald-900 font-semibold">
                  <div className="flex items-center gap-3">
                    <Users className="h-6 w-6" />
                    <div>
                      <div className="font-semibold">View Talent Pool</div>
                      <div className="text-sm opacity-90">Recommended candidates</div>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 ml-auto" />
                </Button>
              </Link>

              <Link to="/profiles">
                <Button className="w-full h-16 bg-gradient-to-r from-red-100 to-orange-100 hover:from-red-200 hover:to-orange-200 text-left justify-start text-orange-900 font-semibold">
                  <div className="flex items-center gap-3">
                    <UserX className="h-6 w-6" />
                    <div>
                      <div className="font-semibold">Review Profiles</div>
                      <div className="text-sm opacity-90">Non-recommended candidates</div>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 ml-auto" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* System Health Monitoring - Now Optimized */}
        <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-6 w-6 text-blue-500" />
              System Health & Monitoring
            </CardTitle>
            <CardDescription>
              Optimized real-time health checks and resource monitoring
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LazyWrapper>
              <OptimizedMonitoringDashboard />
            </LazyWrapper>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* AI System Status */}
          <Card className="shadow-lg border-0 bg-gradient-to-br from-blue-50 to-blue-100 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-6 w-6 text-blue-500" />
                AI System Status
              </CardTitle>
              <CardDescription>
                Azure AI Foundry integration and agent performance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Orchestrator Agent</span>
                  <Badge className="bg-green-100 text-green-800">Active</Badge>
                </div>
                <Progress value={95} className="h-2" />
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Job Ad Generator</span>
                  <Badge className="bg-green-100 text-green-800">Active</Badge>
                </div>
                <Progress value={88} className="h-2" />
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Candidate Evaluator</span>
                  <Badge className="bg-green-100 text-green-800">Active</Badge>
                </div>
                <Progress value={92} className="h-2" />
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">LinkedIn Integration</span>
                  <Badge className="bg-orange-100 text-orange-800">Pending Auth</Badge>
                </div>
                <Progress value={0} className="h-2" />
              </div>

              <div className="pt-4 border-t">
                <div className="flex items-center justify-between text-sm">
                  <span>System Performance</span>
                  <span className="font-semibold text-green-600">Excellent</span>
                </div>
                <div className="flex items-center justify-between text-sm mt-1">
                  <span>Last Updated</span>
                  <span className="text-gray-500">2 minutes ago</span>
                </div>
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
                Latest actions and AI evaluations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-white/40 hover:bg-white/70 transition-colors">
                    <div className={`w-2 h-2 rounded-full mt-2 ${
                      activity.status === 'recommended' ? 'bg-green-500' :
                      activity.status === 'published' ? 'bg-blue-500' : 'bg-orange-400'
                    }`} />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{activity.title}</p>
                      {activity.candidate && (
                        <p className="text-sm text-gray-600">
                          {activity.candidate} • Match Score: {activity.score}%
                        </p>
                      )}
                      {activity.job && (
                        <p className="text-sm text-gray-600">{activity.job}</p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;
