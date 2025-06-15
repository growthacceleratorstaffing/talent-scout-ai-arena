
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const GENERAL_CHATBOT_KNOWLEDGE = `
You are an expert, modern HR assistant and technical evaluator specializing in job interviews.
You know how to ask relevant questions, assess skills, and challenge candidates with creative sample projects. If someone requests you to "make up a project" or "invent a project", use your job- and industry-specific knowledge to create an original, fictitious project that fits the role and never copy-paste the user's words.
Always evaluate responses and give a verdict as follows:
Respond with:
  - Your next message.
  - A code block in this JSON format:
\`\`\`json
{
  "score": [1-100],
  "verdict": "approved" | "non-recommended",
  "comment": "[1-2 sentence assessment]"
}
\`\`\`
Never skip the verdict. Never repeat previous verdicts. Do not copy user text verbatim.
`;

interface Msg {
  role: "assistant" | "user";
  content: string;
  verdict?: "approved" | "non-recommended";
  score?: number;
  comment?: string;
}

export const useAIAgentChat = (jobContext?: string) => {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = async (input: string) => {
    setLoading(true);
    setError(null);

    setMessages(prev => [...prev, { role: "user", content: input }]);

    // AI prompt with general context and job context
    let prompt = `
${GENERAL_CHATBOT_KNOWLEDGE}
${jobContext ? "Job Context:\n" + jobContext + "\n" : ""}
Conversation:
${messages
  .map((m) =>
    m.role === "user"
      ? `Candidate: ${m.content}`
      : `AI: ${m.content}`
  )
  .join("\n")}
Candidate: ${input}
`;

    try {
      console.log('[useAIAgentChat] Calling azure-ai-chat function...');
      
      const { data, error: functionError } = await supabase.functions.invoke('azure-ai-chat', {
        body: { prompt }
      });

      if (functionError) {
        console.error('[useAIAgentChat] Function error:', functionError);
        setError(`AI Error: ${functionError.message}`);
        setLoading(false);
        return;
      }

      console.log('[useAIAgentChat] Response data:', data);

      if (data.error) {
        console.error('[useAIAgentChat] API error:', data.error);
        setError(`AI Error: ${data.error}`);
        setLoading(false);
        return;
      }

      // Extract content and verdict block
      let aiContent: string = (data.content || data.generatedText || "").trim();
      let nextMessage = "";
      let score;
      let verdict;
      let comment;

      const codeBlockRegex =
        /```json\s*({[\s\S]*?})\s*```/i;
      const match = aiContent.match(codeBlockRegex);

      if (match) {
        nextMessage = aiContent.replace(codeBlockRegex, "").trim();
        try {
          const verdictObj = JSON.parse(match[1]);
          score = verdictObj.score;
          verdict = verdictObj.verdict as "approved" | "non-recommended";
          comment = verdictObj.comment;
        } catch (e) {
          comment = "Could not parse AI verdict.";
        }
      } else {
        nextMessage = aiContent;
      }

      setMessages(prev => [
        ...prev,
        {
          role: "assistant",
          content: nextMessage,
          verdict,
          score,
          comment,
        }
      ]);
    } catch (e: any) {
      console.error('[useAIAgentChat] Network error:', e);
      setError("Network error: " + (e?.message || "Unknown network problem."));
    } finally {
      setLoading(false);
    }
  };

  return { messages, sendMessage, loading, error };
};
