
import { useState } from "react";

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
 * Hook for managing an AI-powered interview.
 */
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

    // Compose AI request: context, latest messages, and scoring instruction
    let prompt = `You are an expert technical interviewer, following modern best practices for interviewing software candidates.
Ask relevant, friendly, modern interview questions, one at a time.
If any information about the job is provided below, use it to challenge their fit for this job.
Review candidate responses and adapt your questions accordingly.
After reading their response, provide:
- Your next interview message/question.
- A JSON verdict with a "score" (1-100), "verdict" ("approved" or "non-recommended"), and a short "comment".

${jobContext ? `Job Context:\n${jobContext}\n` : ""}

Chat history:
${messages
  .filter((m) => m.role === "user" || m.role === "bot")
  .map((m) =>
    m.role === "user" ? `Candidate: ${m.content}` : `AI: ${m.content}`
  )
  .join("\n")}
Candidate: ${input}

Instructions:
1. Write your next message for the candidate.
2. Beneath your message, respond ONLY with a code block in the following JSON format:

\`\`\`json
{
  "score": [1-100],
  "verdict": "approved" | "non-recommended",
  "comment": "[brief assessment]"
}
\`\`\`
`;

    try {
      const res = await fetch("/functions/v1/azure-ai-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      let data: any = {};
      try {
        data = await res.json();
      } catch (jsonErr) {
        setError(
          `AI error: Invalid response (status: ${res.status}). Please try again.`
        );
        setLoading(false);
        return;
      }

      if (!res.ok || data.error) {
        setError(
          data.error
            ? `AI Error: ${data.error}`
            : `AI service is not reachable (status: ${res.status})`
        );
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
