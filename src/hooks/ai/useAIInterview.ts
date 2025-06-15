
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Message structure for UI display.
 */
export interface AIInterviewMessage {
  role: "bot" | "user";
  content: string;
  verdict?: "approved" | "non-recommended";
  score?: number;
  comment?: string;
}

/**
 * General and job-specific interview knowledge.
 */
const GENERAL_AI_KNOWLEDGE = `
You are an expert technical interviewer, up-to-date with modern best practices in interviewing software candidates and have deep knowledge of software engineering, technology industry expectations, hiring standards, and candidate evaluation.
Ask relevant, friendly, and up-to-date interview questions, one at a time.
If any job information is provided, challenge the fit for that specific job.
After each candidate response, provide:
  - Your next interview message/question.
  - A JSON verdict with a "score" (1-100), "verdict" ("approved" or "non-recommended"), and a short "comment".
Never simply copy/paste the candidate's text—always produce original, creative follow-ups and project ideas. If asked to "make up a project", invent a realistic sample project using your knowledge.
`;


export function useAIInterview(jobContext?: string) {
  const [messages, setMessages] = useState<AIInterviewMessage[]>([
    {
      role: "bot",
      content:
        "Welcome! I'm your AI Interviewer. Let's get started: Can you briefly introduce yourself?",
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Send a message to the AI interview service.
   */
  const sendMessage = async (input: string) => {
    if (!input.trim()) return;

    const userMsg: AIInterviewMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);
    setError(null);

    // Compose AI request: give both job context and general AI interview knowledge
    let prompt = `
${GENERAL_AI_KNOWLEDGE}
${jobContext ? `Job Opening:\n${jobContext}\n` : ""}

Chat history:
${messages
  .filter((m) => m.role === "user" || m.role === "bot")
  .map((m) =>
    m.role === "user" ? `Candidate: ${m.content}` : `AI: ${m.content}`
  )
  .join("\n")}
Candidate: ${input}

Instructions for AI Interviewer:
1. Write your next message for the candidate.
2. Beneath your message, respond ONLY with a code block in the following JSON format:
\`\`\`json
{
  "score": [1-100],
  "verdict": "approved" | "non-recommended",
  "comment": "[brief assessment]"
}
\`\`\`
Do NOT repeat previous verdicts or scores. Always adapt to the latest candidate answer. NEVER copy-paste the answer, always evaluate and generate an original response.
`;

    try {
      console.log('[useAIInterview] Calling azure-ai-chat function...');
      
      const { data, error: functionError } = await supabase.functions.invoke('azure-ai-chat', {
        body: { prompt }
      });

      if (functionError) {
        console.error('[useAIInterview] Function error:', functionError);
        setError(`AI Error: ${functionError.message}`);
        setLoading(false);
        return;
      }

      console.log('[useAIInterview] Response data:', data);

      if (data.error) {
        console.error('[useAIInterview] API error:', data.error);
        setError(`AI Error: ${data.error}`);
        setLoading(false);
        return;
      }

      // Parse the AI's response for JSON verdict
      let aiContent: string = (data.content || data.generatedText || "").trim();
      let nextMessage = "";
      let score;
      let verdict;
      let comment;

      // Try to extract AI JSON block
      const codeBlockRegex =
        /```json\s*({[\s\S]*?})\s*```/i;
      const match = aiContent.match(codeBlockRegex);

      if (match) {
        // AI followed instructions, extract message and JSON
        nextMessage = aiContent.replace(codeBlockRegex, "").trim();
        try {
          const verdictObj = JSON.parse(match[1]);
          score = verdictObj.score;
          verdict = verdictObj.verdict as "approved" | "non-recommended";
          comment = verdictObj.comment;
        } catch (e) {
          // JSON parsing bad: fail gracefully
          comment = "Could not parse AI verdict.";
        }
      } else {
        // Fallback: no verdict block, just show the reply
        nextMessage = aiContent;
      }

      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          content: nextMessage,
          verdict,
          score,
          comment,
        },
      ]);
    } catch (err: any) {
      console.error('[useAIInterview] Network error:', err);
      setError(
        "Network error: " +
          (err?.message || "Couldn't reach AI service (azure-ai-chat).")
      );
    } finally {
      setLoading(false);
    }
  };

  return { messages, sendMessage, loading, error };
}
