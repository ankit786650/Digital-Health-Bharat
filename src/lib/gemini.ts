// Gemini 2.5 Flash API utility for extracting medication details from an image
// Usage: await extractMedicationDetailsFromImage(file)

const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" + GEMINI_API_KEY;

/**
 * Converts a File/Blob to a base64 string
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string).split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Calls Gemini API with the prescription image and returns extracted medication details
 * @param file File object (image)
 * @returns Array of medication details or null
 */
export async function extractMedicationDetailsFromImage(file: File): Promise<any[] | null> {
  const base64Image = await fileToBase64(file);
  const prompt = `Extract all medication details (name, dosage, frequency, and any relevant info) from this prescription image. Return as a JSON array with fields: name, dosage, frequency, and any other details.`;

  const body = {
    contents: [
      {
        parts: [
          { text: prompt },
          { inlineData: { mimeType: file.type, data: base64Image } }
        ]
      }
    ]
  };

  const response = await fetch(GEMINI_API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });

  if (!response.ok) return null;
  const data = await response.json();
  // Gemini returns text, so try to parse JSON from the response
  try {
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    // Use a regex compatible with ES2017 (no /s flag)
    // This will match the first [ ... ] block, including newlines
    const match = text.match(/\[[\s\S]*?\]/);
    if (match) {
      return JSON.parse(match[0]);
    }
    return null;
  } catch {
    return null;
  }
}
