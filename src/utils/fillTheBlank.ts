import { openAIClient } from "../config/queue";

import { fillInBlank} from '../interfaces/ai'

export async function fillTheBlanks(chunks: string[]): Promise<fillInBlank[]> {
  const combinedText = chunks.join("\n\n");

  try {
    const response = await openAIClient.chat.completions.create({
      model: "gpt-4.1-nano-2025-04-14",
      messages: [
        {
          role: "system",
          content: "You are an AI tutor that generates high-quality fill-in-the-blank questions for student learning."
        },
        {
          role: "user",
          content: [
            "Generate exactly 15 fill-in-the-blank questions from the text below.",
            "",
            "Each question must include:",
            "- prompt: A sentence with one or more blanks (shown as '_____')",
            "- blanks: An array of missing words (in order)",
            "- answers: Same as blanks (can be repeated or enriched later)",
            "- hints: An array of helpful clues (same length as blanks)",
            "- difficulty: One of 'easy', 'medium', or 'hard'",
            "- choices (optional): Multiple choice options per blank (array of arrays)",
            "",
            "Return strictly valid JSON as an array like:",
            "[",
            "  {",
            "    \"prompt\": \"The VSEPR theory states that electron pairs arrange to minimize _____.\",",
            "    \"blanks\": [\"repulsion\"],",
            "    \"answers\": [\"repulsion\"],",
            "    \"hints\": [\"What do like charges do?\"],",
            "    \"difficulty\": \"easy\",",
            "    \"choices\": [[\"repulsion\", \"bonding\", \"compression\"]]",
            "  }",
            "]",
            "",
            "Do not include explanations or markdown.",
            "",
            "Here is the text:",
            combinedText
          ].join("\n")
        }
      ]
    });

    const content = response.choices[0]?.message.content || "";

    // Safe JSON parse
    return JSON.parse(content) as fillInBlank[];

  } catch (error) {
    console.error("❌ Error generating fill-in-the-blank questions:", error);
    return [];
  }
}
