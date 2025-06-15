
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { toast } from "@/hooks/use-toast";
import { agentCommunicationService } from "@/services/agentCommunication";

type Candidate = Tables<"candidates">;
type CandidateInterview = Tables<"candidate_interviews">;

interface CandidateWithInterview extends Candidate {
  interview?: CandidateInterview;
}

export const useInterviewCandidates = () => {
  const [candidates, setCandidates] = useState<CandidateWithInterview[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCandidates = async () => {
    try {
      setLoading(true);
      
      // Get recommended candidates from the orchestration agent
      const recommendedCandidates = agentCommunicationService.getRecommendedCandidates();
      console.log('[useInterviewCandidates] Recommended candidates from agent:', recommendedCandidates);
      
      if (recommendedCandidates.length === 0) {
        setCandidates([]);
        setLoading(false);
        return;
      }

      // Get candidate IDs from the recommended candidates
      const candidateIds = recommendedCandidates.map(rc => rc.candidateId).filter(id => id && id !== 'undefined');

      if (candidateIds.length === 0) {
        setCandidates([]);
        setLoading(false);
        return;
      }

      // Fetch full candidate data from database
      const { data: candidatesData, error: candidatesError } = await supabase
        .from("candidates")
        .select("*")
        .in("id", candidateIds);

      if (candidatesError) {
        console.error("Error fetching candidates:", candidatesError);
        toast({
          title: "Error",
          description: "Failed to fetch candidates",
          variant: "destructive",
        });
        return;
      }

      // Get interview data for these candidates
      const { data: interviews, error: interviewsError } = await supabase
        .from("candidate_interviews")
        .select("*")
        .in("candidate_id", candidateIds);

      if (interviewsError) {
        console.error("Error fetching interviews:", interviewsError);
      }

      // Combine candidates with their interview data
      const candidatesWithInterviews: CandidateWithInterview[] = (candidatesData || []).map(candidate => ({
        ...candidate,
        interview: interviews?.find(interview => interview.candidate_id === candidate.id)
      }));

      setCandidates(candidatesWithInterviews);
    } catch (error) {
      console.error("Error in fetchCandidates:", error);
      toast({
        title: "Error",
        description: "Failed to fetch interview candidates",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const startInterview = async (candidateId: string, jobId: string) => {
    try {
      // Use the default job ID from recommended candidates
      const recommendedCandidate = agentCommunicationService.getRecommendedCandidates()
        .find(rc => rc.candidateId === candidateId);
      
      const actualJobId = recommendedCandidate?.jobId || jobId;

      const { error } = await supabase
        .from("candidate_interviews")
        .insert({
          candidate_id: candidateId,
          job_id: actualJobId,
          stage: "in_progress",
          started_at: new Date().toISOString(),
        });

      if (error) {
        console.error("Error starting interview:", error);
        toast({
          title: "Error",
          description: "Failed to start interview",
          variant: "destructive",
        });
        return;
      }

      // Update candidate stage
      const { error: updateError } = await supabase
        .from("candidates")
        .update({ interview_stage: "in_progress" })
        .eq("id", candidateId);

      if (updateError) {
        console.error("Error updating candidate stage:", updateError);
      }

      toast({
        title: "Success",
        description: "Interview started successfully",
      });

      // Refresh the list
      fetchCandidates();
    } catch (error) {
      console.error("Error in startInterview:", error);
      toast({
        title: "Error",
        description: "Failed to start interview",
        variant: "destructive",
      });
    }
  };

  const updateInterviewResult = async (
    candidateId: string,
    score: number,
    verdict: string,
    messages: any[]
  ) => {
    try {
      const finalStage = verdict === "approved" ? "passed" : "failed";
      
      const { error } = await supabase
        .from("candidate_interviews")
        .update({
          stage: "completed",
          score: score,
          verdict: finalStage,
          interview_messages: messages,
          completed_at: new Date().toISOString(),
        })
        .eq("candidate_id", candidateId);

      if (error) {
        console.error("Error updating interview:", error);
        return;
      }

      // Update candidate stage
      const { error: updateError } = await supabase
        .from("candidates")
        .update({ interview_stage: finalStage })
        .eq("id", candidateId);

      if (updateError) {
        console.error("Error updating candidate stage:", updateError);
      }

      // Refresh the list
      fetchCandidates();
    } catch (error) {
      console.error("Error in updateInterviewResult:", error);
    }
  };

  useEffect(() => {
    fetchCandidates();
  }, []);

  return {
    candidates,
    loading,
    startInterview,
    updateInterviewResult,
    refreshCandidates: fetchCandidates,
  };
};
