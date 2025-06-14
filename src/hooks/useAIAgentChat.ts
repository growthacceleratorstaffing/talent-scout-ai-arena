
import { useState } from "react";

// API endpoint for chat (ensure the Azure chat function is deployed at this endpoint or update as needed)
const CHAT_API_URL = "/functions/v1/azure-ai-chat";

interface Msg {
  role: "assistant" | "user";
  content: string;
}

export const useAIAgentChat = () => {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = async (prompt: string) => {
    setLoading(true);
    setError(null);
    // Add user's message
    setMessages(prev => [...prev, { role: "user", content: prompt }]);
    try {
      const res = await fetch(CHAT_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ prompt })
      });
      const data = await res.json();
      if (data.error) {
        setError(`AI Error: ${data.error}`);
        return;
      }
      setMessages(prev => [
        ...prev,
        { role: "assistant", content: data.content || data.generatedText || "AI returned no answer." }
      ]);
    } catch (e: any) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return { messages, sendMessage, loading, error };
};
