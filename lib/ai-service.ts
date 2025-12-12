import { GoogleGenAI } from "@google/genai";

export const getModelInstruction = (roomName: string, stylePrompt: string) => {
  return `Rewrite the interior design of this ${roomName} to match the following style: ${stylePrompt}. 
  Keep the structural elements (walls, windows, doors) but change furniture, colors, and decor. 
  Output a high-quality photorealistic image of the redesigned room.`;
};

// The App.tsx constructs a specific payload structure.
export const generateImageWithRetry = async (payload: any) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const contents = payload.contents[0]; 

  // Config with permissive safety settings
  const config = {
    safetySettings: [
      { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
      { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
      { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
      { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" }
    ]
  };

  try {
    // Priority 1: Gemini Nano Banana Pro (gemini-3-pro-image-preview)
    // Note: The prompt explicitly asked for this model first.
    console.log("Attempting generation with gemini-3-pro-image-preview");
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: contents,
      config: config
    });

    return extractImageFromResponse(response);

  } catch (error: any) {
    console.warn("gemini-3-pro-image-preview failed, falling back to gemini-2.5-flash-image", error);
    
    // Priority 2: Gemini Nano Banana (gemini-2.5-flash-image) - Fallback
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: contents,
        config: config
      });
      return extractImageFromResponse(response);
    } catch (fallbackError: any) {
      console.error("AI Generation Error (Fallback):", fallbackError);
      throw new Error(fallbackError.message || "Failed to generate image.");
    }
  }
};

const extractImageFromResponse = (response: any) => {
  if (response.candidates && response.candidates[0].content && response.candidates[0].content.parts) {
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData && part.inlineData.data) {
         return `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
      }
    }
  }
  console.warn("Model returned:", response);
  throw new Error("No image generated in the response.");
};