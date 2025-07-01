import { openAIClient } from '../config/queue';
import { QA } from '../interfaces/ai';

export async function cardQuestions(chunks: string[]): Promise<QA[]> {
  const combinedText = chunks.join("\n\n");

  try {
    const response = await openAIClient.chat.completions.create({
      model: "gpt-4.1-nano-2025-04-14",
      messages: [
        { role: "system", content: "You are an AI tutor that creates quiz questions and answers in JSON format." },
        {
          role: "user",
          content: [
            "Please generate exactly 20 clear and concise questions with their answers based on the following text.",
            "Return the response strictly as a JSON array of objects, each containing 'question' and 'answer' keys.",
            "Example format:",
            "[",
            "  { \"question\": \"What is X?\", \"answer\": \"X is...\" },",
            "  { \"question\": \"How does Y work?\", \"answer\": \"Y works by...\" }",
            "]",
            "",
            "Here is the text:",
            "",
            combinedText
          ].join("\n"),
        },
      ],
    });

    const content = response.choices[0]?.message.content || "";

    // Parse the JSON response
    const parsed = JSON.parse(content) as QA[];
    return parsed;
    
  } catch (error) {
    console.error("Error generating questions:", error);
    return [];
  }
}

