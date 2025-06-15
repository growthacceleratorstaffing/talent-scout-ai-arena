
import React, { useState } from "react";
import { Bot, User } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";

interface Message {
  role: "bot" | "user";
  content: string;
}

const aiPrompt = `You are an AI interview bot. Ask relevant, friendly interview questions, one at a time. Review candidate responses and adapt your questions accordingly. Try to assess skills and fit for a generic tech position.`;

const AiInterview: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { role: "bot", content: "Welcome! I'm your AI Interviewer. Let's get started: Can you briefly introduce yourself?" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg = { role: "user" as const, content: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/functions/v1/azure-ai-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt:
            aiPrompt +
            "\n\nLast user message: " +
            userMsg.content +
            "\n\nKeep the interview progressing, only one question or follow-up reply at a time.",
        }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        toast({
          title: "AI error",
          description: data.error || "Failed to get a response from the AI.",
          variant: "destructive",
        });
      } else {
        setMessages((prev) => [
          ...prev,
          { role: "bot", content: data.content || "..." }
        ]);
      }
    } catch (err: any) {
      toast({
        title: "Network error",
        description: err.message || "Couldn't connect to AI.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

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
              className={`flex items-start gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
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
                {msg.content}
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
      <div className="flex gap-2">
        <Textarea
          disabled={loading}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your answer..."
          className="min-h-[44px] resize-none"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              !loading && sendMessage();
            }
          }}
        />
        <Button
          onClick={sendMessage}
          className="h-fit"
          disabled={loading || !input.trim()}
        >
          {loading ? "AI is thinking..." : "Send"}
        </Button>
      </div>
    </div>
  );
};

export default AiInterview;
