import OpenAI from 'openai';
import config from '../config/config';
import { encoding_for_model } from '@dqbd/tiktoken';
import { parseFile } from './fileParser'
const client = new OpenAI({
  apiKey: config.openAI.key as string,
});

// Chunk text by tokens
// function chunkText(text: string, maxTokens = 4000): string[] {
//   const encoder = encoding_for_model("gpt-4.1-nano-2025-04-14");
//   const tokens = encoder.encode(text);

//   const chunks: string[] = [];
//   let start = 0;

//   const decoder = new TextDecoder();

//   while (start < tokens.length) {
//     const end = Math.min(start + maxTokens, tokens.length);
//     const chunkTokens = tokens.slice(start, end);
//     const chunkText = decoder.decode(new Uint8Array(chunkTokens));
//     chunks.push(chunkText);
//     start = end;
//   }

//   encoder.free();
//   return chunks;
// }


// Call OpenAI to summarize a chunk
export async function summarizeText(chunk: string): Promise<string> {
  try {
    const response = await client.chat.completions.create({
      model: "gpt-4.1-nano-2025-04-14",
      messages: [
        { role: "system", content: "You are a helpful assistant that summarizes text." },
        { role: "user", content: `Please summarize the following text clearly and concisely, preserving key points and overall meaning. 

Make sure your summary is structured using meaningful **subheadings** and **paragraphs** for clarity and easy reading. Use a professional tone and format the response with line breaks between paragraphs and subheadings.

Here is the text to summarize:\n\n${chunk}` },
      ],
    });
    return response.choices[0]?.message.content || "";
  } catch (error) {
    console.error("Error summarizing chunk:", error);
    return ""; 
  }
}

// Recursive summarization flow
// export async function recursiveSummarize(text: string, maxTokens = 4000): Promise<string> {
//   const chunks = chunkText(text, maxTokens);
//   const summaries = await Promise.all(chunks.map(summarizeText));
//   const combinedSummary = summaries.join("\n\n");

//   if (combinedSummary.length > 1000) { 
//     return recursiveSummarize(combinedSummary, maxTokens);
//   } else {
//     return combinedSummary;
//   }
// }
