
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Star, MapPin, Calendar, Search, Filter, Download, Mail, Phone } from "lucide-react";

interface Candidate {
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
  phone: string;
  linkedinUrl: string;
  appliedDate: string;
  jobAppliedFor: string;
  summary: string;
}

const TalentPool = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedJob, setSelectedJob] = useState('all');

  const recommendedCandidates: Candidate[] = [
    {
      id: '1',
      name: 'Sarah Chen',
      title: 'Senior Full Stack Developer',
      avatar: '/placeholder.svg',
      location: 'Amsterdam, Netherlands',
      experience: '6 years',
      skills: ['React', 'Node.js', 'TypeScript', 'AWS', 'MongoDB'],
      matchScore: 94,
      aiRating: 4.8,
      education: 'MSc Computer Science - TU Delft',
      email: 'sarah.chen@email.com',
      phone: '+31 6 12345678',
      linkedinUrl: 'linkedin.com/in/sarahchen',
      appliedDate: '2024-06-12',
      jobAppliedFor: 'Senior Full Stack Developer',
      summary: 'Experienced full-stack developer with expertise in modern web technologies and cloud platforms.'
    },
    {
      id: '2',
      name: 'Marcus Rodriguez',
      title: 'DevOps Engineer',
      avatar: '/placeholder.svg',
      location: 'Barcelona, Spain',
      experience: '5 years',
      skills: ['Docker', 'Kubernetes', 'AWS', 'Python', 'CI/CD'],
      matchScore: 91,
      aiRating: 4.7,
      education: 'BSc Software Engineering - UPC',
      email: 'marcus.rodriguez@email.com',
      phone: '+34 612345678',
      linkedinUrl: 'linkedin.com/in/marcusrodriguez',
      appliedDate: '2024-06-11',
      jobAppliedFor: 'Senior Full Stack Developer',
      summary: 'DevOps specialist with strong background in containerization and cloud infrastructure.'
    },
    {
      id: '3',
      name: 'Emma Thompson',
      title: 'Senior UX Designer',
      avatar: '/placeholder.svg',
      location: 'London, UK',
      experience: '7 years',
      skills: ['Figma', 'Adobe XD', 'User Research', 'Prototyping', 'Design Systems'],
      matchScore: 89,
      aiRating: 4.6,
      education: 'MA Design - Royal College of Art',
      email: 'emma.thompson@email.com',
      phone: '+44 7123456789',
      linkedinUrl: 'linkedin.com/in/emmathompson',
      appliedDate: '2024-06-10',
      jobAppliedFor: 'UX/UI Designer',
      summary: 'Creative UX designer with extensive experience in user-centered design and design systems.'
    },
    {
      id: '4',
      name: 'Ahmed Hassan',
      title: 'Frontend Developer',
      avatar: '/placeholder.svg',
      location: 'Berlin, Germany',
      experience: '4 years',
      skills: ['React', 'Vue.js', 'JavaScript', 'CSS', 'Webpack'],
      matchScore: 87,
      aiRating: 4.5,
      education: 'BSc Computer Science - TU Berlin',
      email: 'ahmed.hassan@email.com',
      phone: '+49 30 12345678',
      linkedinUrl: 'linkedin.com/in/ahmedhassan',
      appliedDate: '2024-06-09',
      jobAppliedFor: 'Senior Full Stack Developer',
      summary: 'Frontend specialist with strong JavaScript skills and modern framework expertise.'
    }
  ];

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBg = (score: number) => {
    if (score >= 90) return 'bg-green-100';
    if (score >= 80) return 'bg-blue-100';
    if (score >= 70) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  const filteredCandidates = recommendedCandidates.filter(candidate => {
    const matchesSearch = candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         candidate.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         candidate.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesJob = selectedJob === 'all' || candidate.jobAppliedFor === selectedJob;
    
    return matchesSearch && matchesJob;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Recommended Talent Pool</h1>
          <p className="text-lg text-gray-600">AI-curated candidates with high job fit scores</p>
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
                  value={selectedJob}
                  onChange={(e) => setSelectedJob(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Positions</option>
                  <option value="Senior Full Stack Developer">Senior Full Stack Developer</option>
                  <option value="UX/UI Designer">UX/UI Designer</option>
                </select>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  More Filters
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* AI Analytics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">{filteredCandidates.length}</div>
                <div className="text-sm text-gray-600">Recommended</div>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">
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
                  {(filteredCandidates.reduce((acc, c) => acc + c.aiRating, 0) / filteredCandidates.length).toFixed(1)}
                </div>
                <div className="text-sm text-gray-600">Avg AI Rating</div>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600">
                  {Math.round(filteredCandidates.filter(c => c.matchScore >= 90).length / filteredCandidates.length * 100)}%
                </div>
                <div className="text-sm text-gray-600">Excellent Fit</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Candidate Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {filteredCandidates.map((candidate) => (
            <Card key={candidate.id} className="shadow-lg border-0 bg-white/80 backdrop-blur-sm hover:shadow-xl transition-shadow">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={candidate.avatar} alt={candidate.name} />
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-lg">
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
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">AI Evaluation</h4>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < Math.floor(candidate.aiRating)
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                      <span className="text-sm font-medium ml-1">{candidate.aiRating}</span>
                    </div>
                    <Progress value={candidate.matchScore} className="flex-1" />
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Skills Match</h4>
                  <div className="flex flex-wrap gap-2">
                    {candidate.skills.map((skill, index) => (
                      <Badge key={index} className="bg-blue-100 text-blue-800 hover:bg-blue-200">
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

                <div>
                  <span className="font-medium">Summary:</span>
                  <p className="text-gray-600 text-sm mt-1">{candidate.summary}</p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="h-4 w-4" />
                    Applied: {candidate.appliedDate}
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      <Mail className="h-4 w-4 mr-2" />
                      Email
                    </Button>
                    <Button size="sm" className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700">
                      <Phone className="h-4 w-4 mr-2" />
                      Contact
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

export default TalentPool;
