
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

      let data: any = {};
      try {
        data = await res.json();
      } catch (jsonError) {
        setError(`Invalid response from AI service (status: ${res.status})`);
        setLoading(false);
        return;
      }

      if (!res.ok) {
        // Show backend error message if available, otherwise status code
        setError(data?.error ? `AI Error: ${data.error}` : `AI Error: ${res.status} ${res.statusText}`);
        setLoading(false);
        return;
      }
      if (data.error) {
        setError(`AI Error: ${data.error}`);
        setLoading(false);
        return;
      }
      setMessages(prev => [
        ...prev,
        { role: "assistant", content: data.content || data.generatedText || "AI returned no answer." }
      ]);
    } catch (e: any) {
      setError("Network error: " + (e?.message || "Unknown network problem."));
    } finally {
      setLoading(false);
    }
  };

  return { messages, sendMessage, loading, error };
};

