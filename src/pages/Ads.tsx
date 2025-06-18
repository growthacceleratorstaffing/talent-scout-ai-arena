import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Sparkles, Plus, Eye, Edit, Trash2, Bot, Zap, Brain, Users, MessageSquare, ClipboardCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAgentState } from "@/hooks/useAgentState";
import Navigation from "@/components/Navigation";
import { cleanJobDescription } from '@/utils/cleanJobDescription';

const Ads = () => {
  const { toast } = useToast();
  const { activeJobs, systemStatus, createJobAd, simulateCandidateApplication, deleteJobAd, updateJobAd } = useAgentState();
  const [isCreating, setIsCreating] = useState(false);
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editJobData, setEditJobData] = useState({
    title: '',
    company: '',
    location: '',
    description: '',
    requirements: '',
    salary: ''
  });
  const [jobDetails, setJobDetails] = useState({
    role: '',
    company: '',
    location: '',
    requirements: '',
    additional: ''
  });

  React.useEffect(() => {
    console.log('[Ads page] activeJobs in UI:', activeJobs);
  }, [activeJobs]);

  const handleCreateAd = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);

    try {
      const result = await createJobAd({
        role: jobDetails.role,
        company: jobDetails.company,
        location: jobDetails.location,
        requirements: jobDetails.requirements.split(',').map(req => req.trim()),
        additionalInfo: jobDetails.additional
      });

      setJobDetails({ role: '', company: '', location: '', requirements: '', additional: '' });

      toast({
        title: "Job Advertisement Created!",
        description: `Successfully generated and published your job ad for ${result.title}`,
      });

      // Simulate candidate applications after 3 seconds
      setTimeout(() => {
        simulateCandidateApplication(result.jobId);
        toast({
          title: "Candidates Applying!",
          description: "AI is now evaluating incoming applications for your job posting.",
        });
      }, 3000);

    } catch (error) {
      console.error('Error creating job ad:', error);
      toast({
        title: "Error",
        description: "Failed to create job advertisement. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleViewJob = (job: any) => {
    setSelectedJob(job);
    setIsViewDialogOpen(true);
  };

  const handleEditJob = (job: any) => {
    setSelectedJob(job);
    setEditJobData({
      title: job.title || '',
      company: job.company || '',
      location: job.location || '',
      description: job.description || '',
      requirements: Array.isArray(job.requirements) ? job.requirements.join(', ') : '',
      salary: job.salary || ''
    });
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedJob) return;
    
    try {
      await updateJobAd(selectedJob.id, {
        title: editJobData.title,
        company: editJobData.company,
        location: editJobData.location,
        description: editJobData.description,
        requirements: editJobData.requirements.split(',').map(req => req.trim()),
        salary: editJobData.salary
      });

      toast({
        title: "Job Updated",
        description: "The job advertisement has been updated successfully.",
      });
      setIsEditDialogOpen(false);
    } catch (error) {
      console.error('Error updating job:', error);
      toast({
        title: "Error",
        description: "Failed to update job advertisement. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteJob = async (jobId: string, jobTitle: string) => {
    try {
      await deleteJobAd(jobId);
      toast({
        title: "Job Deleted",
        description: `"${jobTitle}" has been deleted successfully.`,
        variant: "destructive"
      });
    } catch (error) {
      console.error('Error deleting job:', error);
      toast({
        title: "Error",
        description: "Failed to delete job advertisement. Please try again.",
        variant: "destructive"
      });
    }
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
    <div className="container mx-auto p-6 space-y-8">
      <Navigation />
      
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">AI Job Advertisement Creator</h1>
          <p className="text-lg text-gray-600">Create compelling job advertisements with Azure AI Foundry agents</p>
          
          {/* System Status Indicator */}
          <div className="mt-4 flex items-center gap-2">
            <Bot className="h-5 w-5 text-blue-600" />
            <span className="text-sm font-medium">Agent Status:</span>
            <Badge className={systemStatus === 'processing' ? 'bg-blue-100 text-blue-800' : 
                              systemStatus === 'error' ? 'bg-red-100 text-red-800' : 
                              'bg-green-100 text-green-800'}>
              {systemStatus === 'processing' && <Sparkles className="animate-spin h-3 w-3 mr-1" />}
              {systemStatus.charAt(0).toUpperCase() + systemStatus.slice(1)}
            </Badge>
          </div>
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
                Powered by Azure AI Foundry agents for intelligent job ad creation
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
                  disabled={isCreating || systemStatus === 'processing'}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                >
                  {isCreating ? (
                    <>
                      <Sparkles className="animate-spin h-4 w-4 mr-2" />
                      AI agents are creating your job ad...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Generate with AI Agents
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Enhanced Agent Architecture Status */}
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Zap className="h-6 w-6 text-orange-600" />
                Multi-Agent AI Architecture
              </CardTitle>
              <CardDescription>
                End-to-end recruitment automation with Azure AI Foundry
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-2 mb-1">
                    <Bot className="h-4 w-4 text-blue-600" />
                    <span className="font-semibold text-blue-900">Master Orchestrator</span>
                  </div>
                  <p className="text-sm text-blue-700">Coordinates all agent activities, API integrations, and workflow orchestration</p>
                </div>
                
                <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                  <div className="flex items-center gap-2 mb-1">
                    <Sparkles className="h-4 w-4 text-purple-600" />
                    <span className="font-semibold text-purple-900">Job Generator Agent</span>
                  </div>
                  <p className="text-sm text-purple-700">Creates compelling job advertisements with AI-enhanced content and project examples</p>
                </div>
                
                <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center gap-2 mb-1">
                    <MessageSquare className="h-4 w-4 text-green-600" />
                    <span className="font-semibold text-green-900">AI Interview Agent</span>
                  </div>
                  <p className="text-sm text-green-700">Conducts intelligent candidate interviews with dynamic questioning and evaluation</p>
                </div>

                <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                  <div className="flex items-center gap-2 mb-1">
                    <ClipboardCheck className="h-4 w-4 text-amber-600" />
                    <span className="font-semibold text-amber-900">Assessment Generator</span>
                  </div>
                  <p className="text-sm text-amber-700">Creates personalized technical assessments based on candidate performance</p>
                </div>
                
                <div className="p-3 bg-rose-50 rounded-lg border border-rose-200">
                  <div className="flex items-center gap-2 mb-1">
                    <Brain className="h-4 w-4 text-rose-600" />
                    <span className="font-semibold text-rose-900">Candidate Evaluator</span>
                  </div>
                  <p className="text-sm text-rose-700">Analyzes and scores candidates across interview and assessment phases</p>
                </div>

                <div className="p-3 bg-cyan-50 rounded-lg border border-cyan-200">
                  <div className="flex items-center gap-2 mb-1">
                    <Users className="h-4 w-4 text-cyan-600" />
                    <span className="font-semibold text-cyan-900">LinkedIn Integration</span>
                  </div>
                  <p className="text-sm text-cyan-700">Automates job posting and candidate sourcing via LinkedIn Developer API</p>
                </div>
              </div>
              
              <div className="text-xs text-gray-500 space-y-1 pt-3 border-t">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <p>Real-time agent communication via message queues</p>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <p>Azure OpenAI GPT-4 model integration</p>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                  <p>Automated candidate pipeline management</p>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                  <p>Dynamic assessment generation & evaluation</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Active Job Advertisements */}
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-xl">Your Job Advertisements</CardTitle>
            <CardDescription>
              Manage AI-generated job advertisements with real-time candidate evaluation
            </CardDescription>
          </CardHeader>
          <CardContent>
            {activeJobs.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Bot className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p>No job advertisements created yet.</p>
                <p className="text-sm">Use the AI generator above to create your first job ad.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {activeJobs.map((ad) => (
                  <Card key={ad.id} className="border border-gray-200 hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg line-clamp-2">{ad.title}</CardTitle>
                        <Badge className={getStatusColor(ad.status)}>
                          {ad.status}
                        </Badge>
                      </div>
                      <CardDescription className="text-sm">
                        <div className="space-y-1">
                          <p className="font-medium">{ad.company}</p>
                          <p className="text-gray-600">{ad.location}</p>
                          <p className="line-clamp-2">{cleanJobDescription(ad.description)}</p>
                        </div>
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Requirements:</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {ad.requirements?.slice(0, 3).map((req: string, index: number) => (
                              <Badge key={index} variant="secondary">
                                {req}
                              </Badge>
                            ))}
                            {ad.requirements?.length > 3 && (
                              <span className="text-xs text-gray-500">+{ad.requirements.length - 3} more</span>
                            )}
                          </div>
                        </div>
                        <div className="flex justify-between text-sm text-gray-600">
                          <span>{ad.employmentType || 'Full-time'}</span>
                          <span>{ad.salary}</span>
                        </div>
                        {ad.linkedInPostId && (
                          <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded">
                            LinkedIn Post: {ad.linkedInPostId}
                          </div>
                        )}
                        <div className="flex justify-between items-center pt-2 border-t">
                          <span className="text-xs text-gray-500">Created: {ad.createdAt}</span>
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="h-8 w-8 p-0"
                              onClick={() => handleViewJob(ad)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="h-8 w-8 p-0"
                              onClick={() => handleEditJob(ad)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-red-600">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Job Advertisement</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete "{ad.title}"? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction 
                                    onClick={() => handleDeleteJob(ad.id, ad.title)}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* View Job Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedJob?.title}</DialogTitle>
              <DialogDescription>{selectedJob?.company} • {selectedJob?.location}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Job Description</h4>
                <p className="text-sm text-gray-600">{cleanJobDescription(selectedJob?.description)}</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Requirements</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedJob?.requirements?.map((req: string, index: number) => (
                    <Badge key={index} variant="secondary">{req}</Badge>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Benefits</h4>
                <p className="text-sm text-gray-600">{selectedJob?.benefits}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-1">Salary</h4>
                  <p className="text-sm">{selectedJob?.salary}</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Employment Type</h4>
                  <p className="text-sm">{selectedJob?.employmentType}</p>
                </div>
              </div>
              {selectedJob?.linkedInPostId && (
                <div>
                  <h4 className="font-semibold mb-1">LinkedIn Post ID</h4>
                  <p className="text-sm font-mono bg-gray-100 p-2 rounded">{selectedJob.linkedInPostId}</p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Job Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Job Advertisement</DialogTitle>
              <DialogDescription>Update the job advertisement details</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Job Title</label>
                <Input
                  value={editJobData.title}
                  onChange={(e) => setEditJobData(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Company</label>
                <Input
                  value={editJobData.company}
                  onChange={(e) => setEditJobData(prev => ({ ...prev, company: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Location</label>
                <Input
                  value={editJobData.location}
                  onChange={(e) => setEditJobData(prev => ({ ...prev, location: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <Textarea
                  value={editJobData.description}
                  onChange={(e) => setEditJobData(prev => ({ ...prev, description: e.target.value }))}
                  rows={4}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Requirements (comma-separated)</label>
                <Input
                  value={editJobData.requirements}
                  onChange={(e) => setEditJobData(prev => ({ ...prev, requirements: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Salary</label>
                <Input
                  value={editJobData.salary}
                  onChange={(e) => setEditJobData(prev => ({ ...prev, salary: e.target.value }))}
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button onClick={handleSaveEdit} className="flex-1">Save Changes</Button>
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Ads;
