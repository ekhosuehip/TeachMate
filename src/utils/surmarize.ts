import { InferenceClient } from '@huggingface/inference';
import config from '../config/config';


import { pipeline } from '@xenova/transformers';

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



export const runSummarizer = async (chunk: string) => {
  const summarizer = await pipeline('summarization', 'Xenova/t5-small');

  const result = await summarizer(chunk, {
    max_length: 50,
    min_length: 5,
  });

  console.log('Summary:', result[0]);
};



// export async function summarizeText(text: string): Promise<string> {
//   try {
//     const summary = await hf.summarization({
//       model: 'sshleifer/distilbart-cnn-12-6',
//       inputs: text,
//       parameters: {
//         max_length: 150,
//         min_length: 30,
//         do_sample: false,
//       },
//     });

//     return summary.summary_text;
//   } catch (error) {
//     console.error('Summarization error:', error);
//     throw new Error('Failed to summarize text.');
//   }
// }