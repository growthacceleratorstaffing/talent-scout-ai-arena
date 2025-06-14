import React, { useState, useRef, useEffect } from "react";
import { Bot, MessageSquare, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAIAgentChat } from "@/hooks/ai/useAIAgentChat";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const FloatingAIAgent = () => {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const { messages, sendMessage, loading, error } = useAIAgentChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  return (
    <>
      {/* Floating Button */}
      {!open && (
        <button
          aria-label="Open AI Assistant"
          className="fixed bottom-6 right-6 bg-blue-600 text-white rounded-full shadow-lg p-3 z-50 hover:bg-blue-700 transition"
          onClick={() => setOpen(true)}
        >
          <Bot className="w-6 h-6" />
        </button>
      )}
      {/* Chat Modal */}
      {open && (
        <div
          className="fixed inset-0 flex items-end justify-end z-50"
          style={{ pointerEvents: "none" }}
        >
          {/* Background overlay */}
          <div
            className="fixed inset-0 bg-black/30"
            style={{ pointerEvents: "auto" }}
            onClick={() => setOpen(false)}
          />
          <Card
            className="relative w-full sm:w-[350px] max-h-[70vh] flex flex-col shadow-2xl bg-white left-0 right-0 bottom-0 mb-6 mr-6"
            style={{
              pointerEvents: "auto",
              transition: "transform 0.2s",
            }}
          >
            <div className="flex items-center justify-between px-4 py-2 border-b">
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-blue-600" />
                <span className="font-semibold text-gray-900">Ask Me Anything</span>
              </div>
              <button
                aria-label="Close AI Assistant"
                onClick={() => setOpen(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-4 py-2 bg-gray-50">
              {messages.length === 0 && (
                <div className="flex flex-col items-center text-gray-400 pt-8 text-sm">
                  <MessageSquare className="w-8 h-8 mb-2" />
                  Ask me anything about jobs, candidates, or general questions!
                </div>
              )}
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={cn(
                    "mb-3 flex",
                    msg.role === "assistant" ? "justify-start" : "justify-end"
                  )}
                >
                  <div
                    className={cn(
                      "rounded px-3 py-2 text-sm max-w-[75%]",
                      msg.role === "assistant"
                        ? "bg-blue-100 text-blue-900 self-start"
                        : "bg-blue-600 text-white self-end"
                    )}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            <form
              className="flex px-4 pb-3 pt-2 gap-2"
              onSubmit={async e => {
                e.preventDefault();
                if (!input.trim() || loading) return;
                await sendMessage(input);
                setInput("");
              }}
            >
              <Input
                placeholder="Type your question..."
                value={input}
                onChange={e => setInput(e.target.value)}
                disabled={loading}
                className="text-sm focus-visible:ring-blue-400"
                autoFocus
              />
              <Button
                type="submit"
                disabled={loading || !input.trim()}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {loading ? (
                  <Bot className="w-4 h-4 animate-bounce" />
                ) : (
                  "Send"
                )}
              </Button>
            </form>
            {error && (
              <div className="text-xs text-red-500 px-4 pb-2">{error}</div>
            )}
          </Card>
        </div>
      )}
    </>
  );
};

export default FloatingAIAgent;
