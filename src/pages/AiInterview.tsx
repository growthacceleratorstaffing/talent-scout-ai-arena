
import React, { useState } from "react";
import { Bot, User, Star, ArrowLeft } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { useAIInterview } from "@/hooks/ai/useAIInterview";
import { CandidateInterviewList } from "@/components/interview/CandidateInterviewList";
import { useInterviewCandidates } from "@/hooks/useInterviewCandidates";
import { Tables } from "@/integrations/supabase/types";

type CandidateInterview = Tables<"candidate_interviews">;

const jobKnowledge =
  "Role: Software Engineer\n" +
  "Company: ExampleTech\n" +
  "Location: Amsterdam\n" +
  "Tech: Full Stack, React, Node.js, Azure\n" +
  "Seniority: Medior–Senior\n" +
  "Key requirements: problem solving, teamwork, clear communication, delivering code to production.\n";

const AiInterview: React.FC = () => {
  const [currentCandidateId, setCurrentCandidateId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  
  const { 
    candidates, 
    loading, 
    startInterview, 
    updateInterviewResult 
  } = useInterviewCandidates();
  
  const { messages, sendMessage, loading: aiLoading, error } = useAIInterview(jobKnowledge);

  // Show any error toasts
  React.useEffect(() => {
    if (error) {
      toast({
        title: "AI Interview Error",
        description: error,
        variant: "destructive",
      });
    }
  }, [error]);

  // Track interview completion and update results
  React.useEffect(() => {
    if (currentCandidateId && messages.length > 2) {
      const lastBotMessage = messages.filter(m => m.role === "bot").pop();
      if (lastBotMessage?.verdict && lastBotMessage?.score) {
        updateInterviewResult(
          currentCandidateId,
          lastBotMessage.score,
          lastBotMessage.verdict,
          messages
        );
      }
    }
  }, [messages, currentCandidateId, updateInterviewResult]);

  const handleStartInterview = async (candidateId: string, jobId: string) => {
    await startInterview(candidateId, jobId);
    setCurrentCandidateId(candidateId);
  };

  const handleViewInterview = (interview: CandidateInterview) => {
    setCurrentCandidateId(interview.candidate_id);
    // If interview is in progress, we can continue it
    // If completed, we can view the messages (would need to load them)
  };

  const handleBackToCandidates = () => {
    setCurrentCandidateId(null);
  };

  // If we're conducting an interview, show the interview interface
  if (currentCandidateId) {
    const currentCandidate = candidates.find(c => c.id === currentCandidateId);
    
    return (
      <div className="max-w-2xl mx-auto py-8 px-2">
        <div className="flex items-center gap-2 mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBackToCandidates}
            className="flex items-center gap-1"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Candidates
          </Button>
        </div>
        
        <h1 className="text-2xl font-bold mb-2 flex items-center gap-2">
          <Bot className="h-5 w-5" />
          AI Interview - {currentCandidate?.name}
        </h1>
        
        <Card className="p-4 mb-4 min-h-[320px]">
          <div className="space-y-3">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex items-start gap-2 ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {msg.role === "bot" && (
                  <span className="bg-blue-50 p-2 rounded-full">
                    <Bot size={18} />
                  </span>
                )}
                <div
                  className={`rounded-lg px-3 py-2 ${
                    msg.role === "bot"
                      ? "bg-blue-50 text-gray-900"
                      : "bg-green-100 text-gray-800"
                  } max-w-[80%]`}
                >
                  <div>{msg.content}</div>
                  {!!msg.verdict && (
                    <div className="flex items-center gap-1 mt-2 text-xs font-semibold">
                      <Star
                        className={`h-4 w-4 ${
                          msg.verdict === "approved"
                            ? "text-green-600"
                            : "text-red-500"
                        }`}
                      />
                      <span
                        className={
                          msg.verdict === "approved"
                            ? "text-green-800"
                            : "text-red-600"
                        }
                      >
                        {msg.verdict === "approved" ? "Approved" : "Non-recommended"}
                      </span>
                      {typeof msg.score === "number" && (
                        <span className="ml-2">
                          Score: <span className="font-mono">{msg.score}</span>
                        </span>
                      )}
                      {msg.comment && (
                        <span className="ml-2 italic text-gray-500">
                          {msg.comment}
                        </span>
                      )}
                    </div>
                  )}
                </div>
                {msg.role === "user" && (
                  <span className="bg-green-200 p-2 rounded-full">
                    <User size={18} />
                  </span>
                )}
              </div>
            ))}
          </div>
        </Card>
        
        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (!aiLoading && input.trim()) {
              sendMessage(input);
              setInput("");
            }
          }}
        >
          <Textarea
            disabled={aiLoading}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your answer..."
            className="min-h-[44px] resize-none"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                if (!aiLoading && input.trim()) {
                  sendMessage(input);
                  setInput("");
                }
              }
            }}
          />
          <Button className="h-fit" disabled={aiLoading || !input.trim()}>
            {aiLoading ? "AI is thinking..." : "Send"}
          </Button>
        </form>
        
        <p className="text-xs text-gray-500 mt-2">
          The AI is using job and general knowledge from Azure AI Foundry to conduct this interview.
        </p>
      </div>
    );
  }

  // Show candidates list
  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6 flex items-center gap-3">
        <Bot className="h-8 w-8" />
        AI Interview Management
      </h1>
      
      <div className="mb-6">
        <p className="text-gray-600">
          Recommended candidates who need to go through the AI interview process.
        </p>
      </div>

      {loading ? (
        <Card className="p-8 text-center">
          <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Loading candidates...</p>
        </Card>
      ) : (
        <CandidateInterviewList
          candidates={candidates}
          onStartInterview={handleStartInterview}
          onViewInterview={handleViewInterview}
        />
      )}
    </div>
  );
};

export default AiInterview;
