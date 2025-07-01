
// Chunk text by character length (approx. 3000 tokens ≈ 12,000 characters)
const chunkText = (text: string, maxChars = 12000): string[] => {
  const chunks: string[] = [];
  let start = 0;

  while (start < text.length) {
    const end = Math.min(start + maxChars, text.length);
    chunks.push(text.slice(start, end));
    start = end;
  }

  return chunks;
}

export default chunkText
