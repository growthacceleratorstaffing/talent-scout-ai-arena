
import React, { useState, useRef, useEffect } from "react";
import { Bot, HelpCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAIAgentChat } from "@/hooks/ai/useAIAgentChat";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const AUTO_OPEN_KEY = "lovable-super-ai-agent-autopopped";
const AUTO_POP_DELAY_MS = 3000;

const SuperAIAgent = () => {
  const [open, setOpen] = useState(false);
  const [autoPopped, setAutoPopped] = useState(false);
  const [input, setInput] = useState("");
  const { messages, sendMessage, loading, error } = useAIAgentChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to newest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  // Auto-pop after 3 seconds, only once per session/page
  useEffect(() => {
    const alreadyPopped = sessionStorage.getItem(AUTO_OPEN_KEY);
    if (!alreadyPopped) {
      const timer = setTimeout(() => {
        setOpen(true);
        setAutoPopped(true);
        sessionStorage.setItem(AUTO_OPEN_KEY, "true");
      }, AUTO_POP_DELAY_MS);
      return () => clearTimeout(timer);
    }
  }, []);

  // Once agent manually opened or closed, clear autoPopped
  const handleOpen = () => {
    setOpen(true);
    setAutoPopped(false);
    sessionStorage.setItem(AUTO_OPEN_KEY, "true");
  };
  const handleClose = () => {
    setOpen(false);
    setAutoPopped(false);
  };

  return (
    <>
      {!open && (
        <button
          aria-label="Open Super AI Assistant"
          className="fixed bottom-6 right-6 bg-gradient-to-r from-emerald-200 to-blue-100 text-blue-800 rounded-full shadow-lg p-3 z-50 hover:bg-blue-200 transition flex items-center justify-center"
          onClick={handleOpen}
          style={{ boxShadow: "0 4px 32px 0 rgb(38 97 247 / 14%)" }}
        >
          <HelpCircle className="w-6 h-6 text-blue-700" />
        </button>
      )}
      {open && (
        <div
          className="fixed inset-0 flex items-end justify-end z-50"
          style={{ pointerEvents: "none" }}
        >
          <div
            className="fixed inset-0 bg-black/20"
            style={{ pointerEvents: "auto" }}
            onClick={handleClose}
          />
          <Card
            className="relative w-full sm:w-[350px] max-h-[70vh] flex flex-col shadow-2xl bg-blue-50 right-0 bottom-0 mb-6 mr-6 animate-scale-in"
            style={{
              pointerEvents: "auto",
              transition: "transform 0.2s",
            }}
          >
            <div className="flex items-center justify-between px-4 py-2 border-b bg-gradient-to-r from-emerald-200 to-blue-100">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-blue-800" />
                <span className="font-semibold text-gray-900">Super AI: Ask Me Anything</span>
              </div>
              <button
                aria-label="Close Super AI Assistant"
                onClick={handleClose}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-4 py-2 bg-blue-50">
              {messages.length === 0 && (
                <div className="flex flex-col items-center text-gray-400 pt-8 text-sm">
                  <Bot className="w-8 h-8 mb-2" />
                  Ask me absolutely anything! Get instant answers for your questions.
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
                        ? "bg-green-100 text-green-900 self-start"
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
                setAutoPopped(false);
              }}
            >
              <Input
                placeholder={autoPopped ? "Ask me anything..." : "Type any question..."}
                value={input}
                onChange={e => setInput(e.target.value)}
                disabled={loading}
                className="text-sm focus-visible:ring-green-400"
                autoFocus
              />
              <Button
                type="submit"
                disabled={loading || !input.trim()}
                className="bg-green-600 hover:bg-green-700"
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

export default SuperAIAgent;
