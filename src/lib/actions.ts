'use server';

import { GoogleGenerativeAI } from "@google/generative-ai";
import type { MedicationReminder } from '@/lib/types';

export interface ProcessPrescriptionResult {
  success: boolean;
  medications?: MedicationReminder[];
  error?: string;
}

const geminiApiKey = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;

if (!geminiApiKey) {
  console.error("GEMINI_API_KEY or GOOGLE_API_KEY environment variable is not set.");
  // For production, you might want to throw an error or handle this more gracefully.
  // For now, we'll allow the process to continue, but AI calls will likely fail.
}

const genAI = new GoogleGenerativeAI(geminiApiKey || ""); // Provide an empty string if key is not set, to allow compilation

export async function processPrescriptionImage(imageDataUrl: string): Promise<ProcessPrescriptionResult> {
  if (!imageDataUrl || !imageDataUrl.startsWith('data:image')) {
    return { success: false, error: "Invalid image data URL." };
  }

  if (!geminiApiKey) {
    return { success: false, error: "AI API key is not configured. Please set GOOGLE_API_KEY or GEMINI_API_KEY." };
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro-vision" }); // Use gemini-pro-vision for image input

    const result = await model.generateContent({
      contents: [
        {
          text: `Extract medication name, dosage, and frequency from this prescription image. Provide the output as a JSON array of objects, where each object has 'name', 'dosage', and 'timings' fields. For example: [{ "name": "MedicationName", "dosage": "Dosage", "timings": "Frequency" }]. If no medication details are found, return an empty JSON array []. Only return the JSON, no other text.`
        },
        {
          inlineData: {
            mimeType: imageDataUrl.substring(5, imageDataUrl.indexOf(';')), // Extract mime type from data URL
            data: imageDataUrl.substring(imageDataUrl.indexOf(',') + 1) // Extract base64 data
          }
        }
      ]
    });
    const response = await result.response;
    const text = response.text();

    console.log("Gemini API Response:", text); // Log the raw response for debugging

    let extractedMedications: MedicationReminder[] = [];
    try {
      // Attempt to parse the text as JSON. It's crucial that the model returns pure JSON.
      extractedMedications = JSON.parse(text);

      // Basic validation of the parsed JSON
      if (!Array.isArray(extractedMedications) || !extractedMedications.every(item => typeof item === 'object' && 'name' in item && 'dosage' in item && 'timings' in item)) {
        console.warn("Parsed JSON does not match expected MedicationReminder array structure.");
        return { success: false, error: "AI returned unexpected format. Please try again with a clearer image." };
      }

    } catch (jsonError) {
      console.error("Failed to parse AI response as JSON:", jsonError);
      return { success: false, error: "Failed to interpret AI response. Please try again or add manually." };
    }

    if (extractedMedications && extractedMedications.length > 0) {
      const newReminders: MedicationReminder[] = extractedMedications.map((med, index) => ({
        id: `ai-${Date.now()}-${index}`,
        name: med.name,
        dosage: med.dosage,
        timings: med.timings,
        isGenerated: true,
      }));
      return { success: true, medications: newReminders };
    }
    return { success: false, error: "No medication details could be extracted." };
  } catch (error) {
    console.error("Error processing prescription:", error);
    if (error instanceof Error) {
      return { success: false, error: `Failed to process prescription image: ${error.message}` };
    }
    return { success: false, error: "An unknown error occurred while processing the prescription." };
  }
}
