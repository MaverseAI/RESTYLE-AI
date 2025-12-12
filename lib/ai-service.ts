import { GoogleGenAI } from "@google/genai";

export const getModelInstruction = (roomName: string, stylePrompt: string) => {
  return `You are an interior design AI. Your task is to RESTYLE this specific room photo into a ${roomName} without doing any construction work.

CRITICAL STRUCTURAL RULES (ZERO TOLERANCE):
1. **FROZEN ARCHITECTURE**: The room's shape, volume, and perspective must remain IDENTICAL.
   - DO NOT move, remove, or resize walls, windows, doors, niches, beams, or columns.
   - DO NOT expand the room. If the room is small, the design must fit inside the current boundaries.
   - The wall on the right/left and the window positions are absolute anchors. Do not touch them.
2. **PERSPECTIVE**: Maintain the exact camera angle, focal length, and field of view.

TRANSFORMATION LOGIC:
- **Scenario A: Changing Room Function** (e.g., Bedroom -> Kitchen):
  - clear the existing furniture (beds, sofas, etc.).
  - Install ${roomName} furniture/equipment ONLY where it fits within the existing floor space.
  - DO NOT hallucinate extra space to fit more items.
- **Scenario B: Same Room Function** (e.g., Bathroom -> Bathroom):
  - KEEP FIXED FIXTURES (toilets, showers, sinks, hookups) in their EXACT current x,y,z coordinates. Only change their aesthetic style/material.

DESIGN INSTRUCTION:
- Apply this style: ${stylePrompt}.
- Render photorealistic lighting and textures.
- Respect the existing natural light sources (windows) without changing their shape.`;
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
    // We use gemini-2.5-flash-image directly as it is the most stable model for general access
    // and avoids "Permission denied" errors often associated with the Pro preview model.
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: contents,
      config: config
    });

    return extractImageFromResponse(response);

  } catch (error: any) {
    console.error("AI Generation Error:", error);
    throw new Error(error.message || "Failed to generate image.");
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