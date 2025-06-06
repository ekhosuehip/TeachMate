import fs from 'fs';
import path from 'path';
import mammoth from 'mammoth';
import pdfParse from 'pdf-parse';
import PptxParser from "node-pptx-parser";

async function parsePPTXFile(filePath: string) {
  const parser = new PptxParser(filePath);

  try {
    // Extract text from all slides
    const textContent = await parser.extractText();

    // Flatten all slide texts into a single array of strings
    const slideTexts = textContent.flatMap((slide: any) => slide.text);

    // Join all texts with double line breaks
    return slideTexts.join('\n\n');
  } catch (error) {
    console.error("Error:", error);
    throw new Error("Failed to parse PPTX file");
  }
}

// PDF Parsing
async function parsePDF(filePath: string) {
  const buffer = fs.readFileSync(filePath);
  
  try {
    const data = await pdfParse(buffer);
    return data.text;
  } catch (error) {
    console.log(error)
    throw new Error("Failed to parse PDF file");
  }
}

// DOCX Parsing
async function parseDOCX(filePath: string) {
    try {
        const result = await mammoth.extractRawText({ path: filePath });
        return result.value;
    } catch (error) {
        console.log(error);
        throw new Error("Failed to parse DOCX file");
    }
}

// Unified Parser
export async function parseFile(filePath: string): Promise<string> {
  const ext = path.extname(filePath).toLowerCase();

  switch (ext) {
    case '.pdf':
      return await parsePDF(filePath);
    case '.docx':
      return await parseDOCX(filePath);
    case '.pptx':
      return await parsePPTXFile(filePath);
    default:
      throw new Error(`Unsupported file type: ${ext}`);
  }
}