
import React, { useState } from "react";
import { Bot, User, Star } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { useAIInterview } from "@/hooks/ai/useAIInterview";

const jobKnowledge =
  "Role: Software Engineer\n" +
  "Company: ExampleTech\n" +
  "Location: Amsterdam\n" +
  "Tech: Full Stack, React, Node.js, Azure\n" +
  "Seniority: Medior–Senior\n" +
  "Key requirements: problem solving, teamwork, clear communication, delivering code to production.\n";

const AiInterview: React.FC = () => {
  // Here you can optionally pull real job context from props or global state!
  const { messages, sendMessage, loading, error } = useAIInterview(jobKnowledge);
  const [input, setInput] = useState("");

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

  return (
    <div className="max-w-2xl mx-auto py-8 px-2">
      <h1 className="text-2xl font-bold mb-2 flex items-center gap-2">
        <Bot className="h-5 w-5" />
        AI Interview
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
                {/* Show verdict only for bot messages after first greeting */}
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
          if (!loading && input.trim()) {
            sendMessage(input);
            setInput("");
          }
        }}
      >
        <Textarea
          disabled={loading}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your answer..."
          className="min-h-[44px] resize-none"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              if (!loading && input.trim()) {
                sendMessage(input);
                setInput("");
              }
            }
          }}
        />
        <Button className="h-fit" disabled={loading || !input.trim()}>
          {loading ? "AI is thinking..." : "Send"}
        </Button>
      </form>
      <p className="text-xs text-gray-500 mt-2">
        The AI is using job and general knowledge from Azure AI Foundry to conduct this interview.
      </p>
    </div>
  );
};

export default AiInterview;
