import OpenAI from 'openai';
import config from '../config/config';
import { parseFile } from './fileParser';

const client = new OpenAI({
  apiKey: config.openAI.key as string,
});

// Chunk text by character length (approx. 3000 tokens ≈ 12,000 characters)
function chunkText(text: string, maxChars = 12000): string[] {
  const chunks: string[] = [];
  let start = 0;

  while (start < text.length) {
    const end = Math.min(start + maxChars, text.length);
    chunks.push(text.slice(start, end));
    start = end;
  }

  return chunks;
}

// Call OpenAI to summarize a chunk
async function summarizeText(chunk: string): Promise<string> {
  try {
    const response = await client.chat.completions.create({
      model: "gpt-4.1-nano-2025-04-14",
      messages: [
        { role: "system", content: "You are a helpful assistant that summarizes text." },
        {
          role: "user",
          content: [
            "Please summarize the following text clearly and concisely, preserving key points and overall meaning.",
            "Make sure your summary is structured using meaningful **subheadings** and **paragraphs** for clarity and easy reading.",
            "Use a professional tone and format the response with line breaks between paragraphs and subheadings.",
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

// Recursive summarization flow
export async function recursiveSummarize(text: string, maxChars = 12000, depth = 0): Promise<string> {
  const chunks = chunkText(text, maxChars);
  const summaries = await Promise.all(chunks.map(summarizeText));
  const combinedSummary = summaries.join("\n\n");

  if (combinedSummary.length > 2000 && depth < 3) {
    return recursiveSummarize(combinedSummary, maxChars, depth + 1);
  } else {
    return combinedSummary;
  }
}

