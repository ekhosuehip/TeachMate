import { InferenceClient } from '@huggingface/inference';
import config from '../config/config';

const hf = new InferenceClient(config.hfKey.key as string);

export function chunkText(text: string, maxWords = 500): string [] {
    const words = text.split(/\s+/)
    const chunks = []

    for (let i= 0; i <= words.length; i += maxWords){
        chunks.push(words.slice(i, i + maxWords).join(' '))
    }
    return chunks
}

/**
 * Summarizes a block of text using the distilBART model
 */
export async function summarizeText(text: string): Promise<string> {
  try {
    const summary = await hf.summarization({
      model: 'facebook/bart-large-cnn',
      inputs: text,
      parameters: {
        max_length: 150,
        min_length: 30,
        do_sample: false,
      },
    });

    return summary.summary_text;
  } catch (error) {
    console.error('Summarization error:', error);
    throw new Error('Failed to summarize text.');
  }
}
