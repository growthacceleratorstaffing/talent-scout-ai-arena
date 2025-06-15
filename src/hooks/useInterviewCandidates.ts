
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { toast } from "@/hooks/use-toast";

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
      
      // Get recommended candidates
      const { data: recommendedCandidates, error: candidatesError } = await supabase
        .from("candidates")
        .select("*")
        .in("id", 
          // Subquery to get candidate IDs from candidate_responses where status is 'recommended'
          // We'll need to fetch this separately due to Supabase limitations
        );

      if (candidatesError) {
        console.error("Error fetching candidates:", candidatesError);
        toast({
          title: "Error",
          description: "Failed to fetch candidates",
          variant: "destructive",
        });
        return;
      }

      // Get candidate responses to filter recommended ones
      const { data: responses, error: responsesError } = await supabase
        .from("candidate_responses")
        .select("candidate_id")
        .eq("status", "recommended");

      if (responsesError) {
        console.error("Error fetching responses:", responsesError);
        toast({
          title: "Error",
          description: "Failed to fetch candidate responses",
          variant: "destructive",
        });
        return;
      }

      const recommendedCandidateIds = responses?.map(r => r.candidate_id) || [];

      // Filter candidates to only recommended ones
      const { data: filteredCandidates, error: filteredError } = await supabase
        .from("candidates")
        .select("*")
        .in("id", recommendedCandidateIds);

      if (filteredError) {
        console.error("Error fetching filtered candidates:", filteredError);
        return;
      }

      // Get interview data for these candidates
      const { data: interviews, error: interviewsError } = await supabase
        .from("candidate_interviews")
        .select("*")
        .in("candidate_id", recommendedCandidateIds);

      if (interviewsError) {
        console.error("Error fetching interviews:", interviewsError);
      }

      // Combine candidates with their interview data
      const candidatesWithInterviews: CandidateWithInterview[] = (filteredCandidates || []).map(candidate => ({
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
      const { error } = await supabase
        .from("candidate_interviews")
        .insert({
          candidate_id: candidateId,
          job_id: jobId,
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
      const finalVerdict = verdict === "approved" ? "passed" : "failed";
      
      const { error } = await supabase
        .from("candidate_interviews")
        .update({
          stage: "completed",
          score: score,
          verdict: finalVerdict,
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
        .update({ interview_stage: finalVerdict })
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
