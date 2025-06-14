import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Plus, Eye, Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface JobAd {
  id: string;
  title: string;
  description: string;
  requirements: string[];
  location: string;
  salary: string;
  createdAt: string;
  status: 'draft' | 'published' | 'archived';
}

const Ads = () => {
  const { toast } = useToast();
  const [isCreating, setIsCreating] = useState(false);
  const [jobDetails, setJobDetails] = useState({
    role: '',
    company: '',
    location: '',
    requirements: '',
    additional: ''
  });

  const [jobAds, setJobAds] = useState<JobAd[]>([
    {
      id: '1',
      title: 'Senior Full Stack Developer',
      description: 'We are seeking a talented Senior Full Stack Developer to join our dynamic team...',
      requirements: ['React', 'Node.js', '5+ years experience', 'TypeScript'],
      location: 'Amsterdam, Netherlands',
      salary: '€70,000 - €90,000',
      createdAt: '2024-06-10',
      status: 'published'
    },
    {
      id: '2',
      title: 'UX/UI Designer',
      description: 'Join our design team to create beautiful and intuitive user experiences...',
      requirements: ['Figma', 'Adobe Creative Suite', '3+ years experience', 'Portfolio'],
      location: 'Remote',
      salary: '€55,000 - €75,000',
      createdAt: '2024-06-08',
      status: 'draft'
    }
  ]);

  const handleCreateAd = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);

    // Simulate AI job ad creation
    setTimeout(() => {
      const newAd: JobAd = {
        id: Date.now().toString(),
        title: jobDetails.role,
        description: `We are looking for an exceptional ${jobDetails.role} to join ${jobDetails.company}. This role offers exciting opportunities to work with cutting-edge technologies and contribute to meaningful projects.`,
        requirements: jobDetails.requirements.split(',').map(req => req.trim()),
        location: jobDetails.location,
        salary: 'Competitive',
        createdAt: new Date().toISOString().split('T')[0],
        status: 'draft'
      };

      setJobAds(prev => [newAd, ...prev]);
      setJobDetails({ role: '', company: '', location: '', requirements: '', additional: '' });
      setIsCreating(false);

      toast({
        title: "Job Advertisement Created!",
        description: "AI has successfully generated your job advertisement.",
      });
    }, 2000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">AI Job Advertisement Creator</h1>
          <p className="text-lg text-gray-600">Create compelling job advertisements with AI assistance</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* AI Job Creator */}
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-xl">
                <Sparkles className="h-6 w-6 text-purple-600" />
                AI Job Advertisement Generator
              </CardTitle>
              <CardDescription>
                Provide basic details and let our AI create a professional job advertisement
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateAd} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Job Role</label>
                  <Input
                    placeholder="e.g., Senior Software Engineer"
                    value={jobDetails.role}
                    onChange={(e) => setJobDetails(prev => ({ ...prev, role: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Company Name</label>
                  <Input
                    placeholder="e.g., TechCorp Inc."
                    value={jobDetails.company}
                    onChange={(e) => setJobDetails(prev => ({ ...prev, company: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Location</label>
                  <Input
                    placeholder="e.g., Amsterdam, Netherlands"
                    value={jobDetails.location}
                    onChange={(e) => setJobDetails(prev => ({ ...prev, location: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Key Requirements (comma-separated)</label>
                  <Input
                    placeholder="e.g., React, TypeScript, 5+ years experience"
                    value={jobDetails.requirements}
                    onChange={(e) => setJobDetails(prev => ({ ...prev, requirements: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Additional Information</label>
                  <Textarea
                    placeholder="Any specific details about the role, company culture, benefits..."
                    value={jobDetails.additional}
                    onChange={(e) => setJobDetails(prev => ({ ...prev, additional: e.target.value }))}
                    rows={3}
                  />
                </div>
                <Button 
                  type="submit" 
                  disabled={isCreating}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                >
                  {isCreating ? (
                    <>
                      <Sparkles className="animate-spin h-4 w-4 mr-2" />
                      AI is creating your job ad...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Generate Job Advertisement
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* LinkedIn Integration Status */}
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-xl">LinkedIn Integration</CardTitle>
              <CardDescription>
                Connect your LinkedIn account to automatically post job advertisements
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-blue-900 mb-2">Integration Status</h4>
                <Badge className="bg-orange-100 text-orange-800">Authentication Required</Badge>
                <p className="text-sm text-blue-700 mt-2">
                  Connect your LinkedIn Developer account to enable automatic job posting
                </p>
              </div>
              <Button className="w-full" variant="outline">
                Connect LinkedIn Developer Account
              </Button>
              <div className="text-xs text-gray-500 space-y-1">
                <p>• Requires LinkedIn Marketing API access</p>
                <p>• Job posts will be published to your company page</p>
                <p>• Analytics and performance tracking included</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Existing Job Advertisements */}
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-xl">Your Job Advertisements</CardTitle>
            <CardDescription>
              Manage and track your published job advertisements
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {jobAds.map((ad) => (
                <Card key={ad.id} className="border border-gray-200 hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg line-clamp-2">{ad.title}</CardTitle>
                      <Badge className={getStatusColor(ad.status)}>
                        {ad.status}
                      </Badge>
                    </div>
                    <CardDescription className="text-sm line-clamp-3">
                      {ad.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Requirements:</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {ad.requirements.slice(0, 3).map((req, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {req}
                            </Badge>
                          ))}
                          {ad.requirements.length > 3 && (
                            <span className="text-xs text-gray-500">+{ad.requirements.length - 3} more</span>
                          )}
                        </div>
                      </div>
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>{ad.location}</span>
                        <span>{ad.salary}</span>
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t">
                        <span className="text-xs text-gray-500">Created: {ad.createdAt}</span>
                        <div className="flex gap-2">
                          <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-red-600">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Ads;
