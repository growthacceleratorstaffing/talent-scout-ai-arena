
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, MapPin, Calendar, Search, Filter, RefreshCw, Eye } from "lucide-react";

interface NonRecommendedCandidate {
  id: string;
  name: string;
  title: string;
  avatar: string;
  location: string;
  experience: string;
  skills: string[];
  matchScore: number;
  aiRating: number;
  education: string;
  email: string;
  appliedDate: string;
  jobAppliedFor: string;
  rejectionReasons: string[];
  feedback: string;
}

const Profiles = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReason, setSelectedReason] = useState('all');

  const nonRecommendedCandidates: NonRecommendedCandidate[] = [
    {
      id: '1',
      name: 'John Mitchell',
      title: 'Junior Developer',
      avatar: '/placeholder.svg',
      location: 'Manchester, UK',
      experience: '1 year',
      skills: ['HTML', 'CSS', 'JavaScript', 'jQuery'],
      matchScore: 45,
      aiRating: 2.3,
      education: 'Bootcamp Graduate',
      email: 'john.mitchell@email.com',
      appliedDate: '2024-06-08',
      jobAppliedFor: 'Senior Full Stack Developer',
      rejectionReasons: ['Insufficient Experience', 'Skill Gap', 'Seniority Mismatch'],
      feedback: 'Candidate shows potential but lacks the required senior-level experience and modern framework knowledge for this position.'
    },
    {
      id: '2',
      name: 'Lisa Wang',
      title: 'Marketing Specialist',
      avatar: '/placeholder.svg',
      location: 'Toronto, Canada',
      experience: '3 years',
      skills: ['Marketing', 'SEO', 'Content Strategy', 'Analytics'],
      matchScore: 15,
      aiRating: 1.8,
      education: 'BA Marketing - University of Toronto',
      email: 'lisa.wang@email.com',
      appliedDate: '2024-06-07',
      jobAppliedFor: 'Senior Full Stack Developer',
      rejectionReasons: ['Wrong Field', 'No Technical Skills', 'Career Pivot'],
      feedback: 'Candidate appears to be exploring a career change but lacks any technical background required for this role.'
    },
    {
      id: '3',
      name: 'Robert Taylor',
      title: 'Legacy System Developer',
      avatar: '/placeholder.svg',
      location: 'Phoenix, USA',
      experience: '8 years',
      skills: ['COBOL', 'Mainframe', 'DB2', 'JCL'],
      matchScore: 35,
      aiRating: 2.7,
      education: 'BSc Computer Science - ASU',
      email: 'robert.taylor@email.com',
      appliedDate: '2024-06-06',
      jobAppliedFor: 'Senior Full Stack Developer',
      rejectionReasons: ['Outdated Skills', 'Technology Mismatch', 'Modernization Gap'],
      feedback: 'Extensive experience but primarily in legacy technologies. Would require significant retraining for modern web development.'
    },
    {
      id: '4',
      name: 'Sophie Johnson',
      title: 'QA Tester',
      avatar: '/placeholder.svg',
      location: 'Melbourne, Australia',
      experience: '4 years',
      skills: ['Manual Testing', 'Test Cases', 'Bug Tracking', 'Regression Testing'],
      matchScore: 25,
      aiRating: 2.1,
      education: 'Diploma in Software Testing',
      email: 'sophie.johnson@email.com',
      appliedDate: '2024-06-05',
      jobAppliedFor: 'UX/UI Designer',
      rejectionReasons: ['Role Mismatch', 'No Design Skills', 'Portfolio Missing'],
      feedback: 'Strong testing background but no design experience or portfolio to demonstrate UI/UX capabilities.'
    },
    {
      id: '5',
      name: 'David Chen',
      title: 'Student',
      avatar: '/placeholder.svg',
      location: 'Singapore',
      experience: '0 years',
      skills: ['Python', 'Java', 'MySQL', 'Git'],
      matchScore: 55,
      aiRating: 3.1,
      education: 'Final Year - NUS Computer Science',
      email: 'david.chen@email.com',
      appliedDate: '2024-06-04',
      jobAppliedFor: 'Senior Full Stack Developer',
      rejectionReasons: ['No Professional Experience', 'Student Status', 'Junior Level'],
      feedback: 'Promising technical foundation but lacks professional experience required for senior-level position. Better suited for junior/entry-level roles.'
    }
  ];

  const getScoreColor = (score: number) => {
    if (score >= 60) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const getReasonColor = (reason: string) => {
    const colors: { [key: string]: string } = {
      'Insufficient Experience': 'bg-orange-100 text-orange-800',
      'Skill Gap': 'bg-red-100 text-red-800',
      'Wrong Field': 'bg-purple-100 text-purple-800',
      'Outdated Skills': 'bg-yellow-100 text-yellow-800',
      'Role Mismatch': 'bg-blue-100 text-blue-800',
      'No Professional Experience': 'bg-gray-100 text-gray-800',
      'Seniority Mismatch': 'bg-indigo-100 text-indigo-800',
      'Technology Mismatch': 'bg-pink-100 text-pink-800'
    };
    return colors[reason] || 'bg-gray-100 text-gray-800';
  };

  const filteredCandidates = nonRecommendedCandidates.filter(candidate => {
    const matchesSearch = candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         candidate.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         candidate.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesReason = selectedReason === 'all' || 
                         candidate.rejectionReasons.some(reason => reason.toLowerCase().includes(selectedReason.toLowerCase()));
    
    return matchesSearch && matchesReason;
  });

  const rejectionReasons = Array.from(new Set(nonRecommendedCandidates.flatMap(c => c.rejectionReasons)));

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Non-Recommended Profiles</h1>
          <p className="text-lg text-gray-600">Candidates that didn't meet the AI criteria with detailed feedback</p>
        </div>

        {/* Filters and Search */}
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm mb-8">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search candidates by name, title, or skills..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <select
                  value={selectedReason}
                  onChange={(e) => setSelectedReason(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Reasons</option>
                  {rejectionReasons.map(reason => (
                    <option key={reason} value={reason}>{reason}</option>
                  ))}
                </select>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  More Filters
                </Button>
                <Button variant="outline" size="sm">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Re-evaluate
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Analytics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-red-600">{filteredCandidates.length}</div>
                <div className="text-sm text-gray-600">Not Recommended</div>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600">
                  {Math.round(filteredCandidates.reduce((acc, c) => acc + c.matchScore, 0) / filteredCandidates.length)}%
                </div>
                <div className="text-sm text-gray-600">Avg Match Score</div>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">
                  {rejectionReasons.length}
                </div>
                <div className="text-sm text-gray-600">Rejection Reasons</div>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">
                  {Math.round(filteredCandidates.filter(c => c.matchScore >= 40).length / filteredCandidates.length * 100)}%
                </div>
                <div className="text-sm text-gray-600">Potential Fits</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Candidate Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {filteredCandidates.map((candidate) => (
            <Card key={candidate.id} className="shadow-lg border-0 bg-white/80 backdrop-blur-sm hover:shadow-xl transition-shadow border-l-4 border-l-red-400">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={candidate.avatar} alt={candidate.name} />
                      <AvatarFallback className="bg-gradient-to-br from-red-500 to-orange-600 text-white text-lg">
                        {candidate.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-xl">{candidate.name}</CardTitle>
                      <CardDescription className="text-base">{candidate.title}</CardDescription>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {candidate.location}
                        </span>
                        <span>{candidate.experience} exp</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-2xl font-bold ${getScoreColor(candidate.matchScore)}`}>
                      {candidate.matchScore}%
                    </div>
                    <div className="text-sm text-gray-600">Match Score</div>
                    <div className="flex items-center gap-1 mt-1">
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                      <span className="text-sm text-red-600">Not Recommended</span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Match Analysis</h4>
                  <Progress value={candidate.matchScore} className="mb-2" />
                  <div className="text-sm text-gray-600">
                    AI Rating: {candidate.aiRating}/5.0
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2 text-red-700">Rejection Reasons</h4>
                  <div className="flex flex-wrap gap-2">
                    {candidate.rejectionReasons.map((reason, index) => (
                      <Badge key={index} className={getReasonColor(reason)}>
                        {reason}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Current Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {candidate.skills.map((skill, index) => (
                      <Badge key={index} variant="outline" className="text-gray-600">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Education:</span>
                    <p className="text-gray-600">{candidate.education}</p>
                  </div>
                  <div>
                    <span className="font-medium">Applied For:</span>
                    <p className="text-gray-600">{candidate.jobAppliedFor}</p>
                  </div>
                </div>

                <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                  <h4 className="font-semibold mb-2 text-red-900">AI Feedback</h4>
                  <p className="text-sm text-red-800">{candidate.feedback}</p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="h-4 w-4" />
                    Applied: {candidate.appliedDate}
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      <Eye className="h-4 w-4 mr-2" />
                      View Full Profile
                    </Button>
                    <Button size="sm" variant="outline" className="text-blue-600 border-blue-300 hover:bg-blue-50">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Re-evaluate
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Profiles;
