
import { GoogleGenAI } from "@google/genai";

/**
 * refineTextWithAI: Transforms digital or formal text into a natural, human-like 
 * conversational tone suitable for personal handwritten notes.
 */
export async function refineTextWithAI(text: string): Promise<string> {
  if (!text || text.trim().length === 0) return "";
  
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are an expert at making digital text feel human and personal. 
      Rewrite the following text to sound more natural, as if it was written by a person in a physical notebook. 
      Maintain all original facts and data, but adjust the flow and vocabulary to be slightly more conversational.
      
      CRITICAL RULES:
      1. Return ONLY the refined text. 
      2. Do NOT include any introductory or concluding remarks (e.g., "Here is your refined text").
      3. Do NOT use heavy markdown formatting like bolding or large headers.
      
      Text to refine:
      ${text}`,
      config: {
        temperature: 0.7,
        topP: 0.9,
      }
    });
    
    // Using the .text property as per guidelines
    return response.text?.trim() || text;
  } catch (error) {
    console.error("Gemini Service Error (Refinement):", error);
    return text; // Return original text as fallback
  }
}

/**
 * summarizeTextWithAI: Condenses lengthy text into clear, bullet-pointed study notes 
 * that fit perfectly on a single handwritten page.
 */
export async function summarizeTextWithAI(text: string): Promise<string> {
  if (!text || text.trim().length === 0) return "";

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Summarize the following text into concise, bulleted study notes. 
      The goal is to capture the essence of the content so it can be easily rewritten by hand for study or revision.
      
      CRITICAL RULES:
      1. Return ONLY the bullet points.
      2. Use a maximum of 5-7 bullets.
      3. No intro or outro text.
      
      Text to summarize:
      ${text}`,
      config: {
        temperature: 0.4, // Lower temperature for more focused summaries
      }
    });

    // Using the .text property as per guidelines
    return response.text?.trim() || text;
  } catch (error) {
    console.error("Gemini Service Error (Summarization):", error);
    return text; // Return original text as fallback
  }
}
