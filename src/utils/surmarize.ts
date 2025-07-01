import chunkText from './chunk';
import { openAIClient } from '../config/queue';

function getDifficultyPrompt(difficulty: string) {
  switch (difficulty) {
    case "easy":
      return "Write the summary in simple terms, suitable for a high school student. Use clear language, avoid jargon, and explain ideas step-by-step if needed.";
    case "medium":
      return "Write the summary in an informative, moderately technical tone suitable for college-level readers. Explain key points clearly with proper vocabulary.";
    case "hard":
      return "Write a short and concise, technical summary suitable for expert readers. Use domain-specific terminology where appropriate, and assume familiarity with the subject.";
  }
}

// Summarize a single chunk with difficulty-based instructions
async function summarizeText(chunk: string, difficulty: string): Promise<string> {
  try {
    const response = await openAIClient.chat.completions.create({
      model: "gpt-4.1-nano-2025-04-14",
      messages: [
        { role: "system", content: "You are a helpful assistant that summarizes text." },
        {
          role: "user",
          content: [
            "Please summarize the following text clearly and concisely, preserving key points and meaning.",
            "Make sure your summary is structured using meaningful **subheadings** and **paragraphs** for clarity.",
            getDifficultyPrompt(difficulty),
            "",
            "Here is the text to summarize:",
            "",
            chunk
          ].join("\n"),
        },
      ],
    });
    return response.choices[0]?.message.content || "";
  } catch (error) {
    console.error("Error summarizing chunk:", error);
    return "";
  }
}

// Recursive summarization
export async function recursiveSummarize(
  chunks: string[],
  depth = 0,
  maxChars = 12000,
  difficulty: string,
): Promise<string> {
  const summaries = await Promise.all(chunks.map(chunk => summarizeText(chunk, difficulty)));
  const combinedSummary = summaries.join("\n\n");

  if (combinedSummary.length > 2000 && depth < 3) {
    const nextChunks = chunkText(combinedSummary, 12000);
    return recursiveSummarize(nextChunks, maxChars, depth + 1, difficulty);
  } else {
    return combinedSummary;
  }
}
