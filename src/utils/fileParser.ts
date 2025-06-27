import fs from 'fs';
import mammoth from 'mammoth';
import Tesseract from 'tesseract.js';
import pdfParse from 'pdf-parse';
import PptxParser from "node-pptx-parser";
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';

const execPromise = promisify(exec);

async function parsePPTXFile(filePath: string): Promise<string> {
  const parser = new PptxParser(filePath);

  try {
    const textContent = await parser.extractText();
    const slideTexts = textContent.flatMap((slide: any) => slide.text);
    return slideTexts.join('\n\n');
  } catch (error) {
    console.error("❌ Failed to parse PPTX:", error);
    throw new Error("Failed to parse PPTX file");
  }
}

async function performOCR(imagePath: string): Promise<string> {
  const { data: { text } } = await Tesseract.recognize(imagePath, 'eng', {
    logger: m => console.log(m),
  });
  return text;
}

async function convertPDFToImage(pdfPath: string, outputDir: string): Promise<string[]> {
  const outputPrefix = path.join(outputDir, `page`);
  await execPromise(`pdftoppm -png "${pdfPath}" "${outputPrefix}"`);
  
  const files = fs.readdirSync(outputDir);
  return files
    .filter(f => f.startsWith('page') && f.endsWith('.png'))
    .map(f => path.join(outputDir, f));
}

export async function parsePDF(filePath: string): Promise<string> {
  const buffer = fs.readFileSync(filePath);
  let extractedText = '';
  let ocrText = '';

  try {
    const data = await pdfParse(buffer);
    extractedText = data.text?.trim() || '';
  } catch (error) {
    console.error('Error with pdf-parse:', error);
  }

  if (extractedText.length >= 50) {
    return extractedText;
  }

  console.log('🔎 Insufficient text from pdf-parse, running OCR...');

  const tmpDir = path.dirname(filePath);

  try {
    const imagePaths = await convertPDFToImage(filePath, tmpDir);

    for (const imgPath of imagePaths) {
      console.log(`🖼 Running OCR on ${imgPath}`);
      const text = await performOCR(imgPath);
      ocrText += `\n${text}`;
    }

    ocrText = ocrText.trim();

  } catch (error) {
    console.error('⚠️ OCR process failed:', error);
  }

  const combinedText = `${extractedText}\n\n${ocrText}`.trim();

  if (combinedText.length < 50) {
    throw new Error('Failed to extract sufficient text from PDF using both parsing and OCR');
  }

  return combinedText;
}

async function parseDOCX(filePath: string): Promise<string> {
  try {
    const result = await mammoth.extractRawText({ path: filePath });
    return result.value.trim();
  } catch (error) {
    console.error("❌ Failed to parse DOCX:", error);
    throw new Error("Failed to parse DOCX file");
  }
}

export async function parseFile(filePath: string, mimeType: string): Promise<string> {
  switch (mimeType) {
    case 'application/pdf':
      return await parsePDF(filePath);
    case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
      return await parseDOCX(filePath);
    case 'application/vnd.openxmlformats-officedocument.presentationml.presentation':
      return await parsePPTXFile(filePath);
    default:
      throw new Error(`Unsupported MIME type: ${mimeType}`);
  }
}
