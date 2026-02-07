
import { GoogleGenAI } from "@google/genai";

// API key is obtained exclusively from process.env.API_KEY
// We create the instance inside the service to ensure it always picks up the latest environment config.
const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY as string });

export const ARCH_SYSTEM_INSTRUCTION = `
You are "Amine" (أمين), a world-class senior engineer and architectural consultant.
Your expertise covers:
1. Advanced SketchUp workflows, Ruby API, and professional rendering techniques.
2. Civil and structural engineering principles.
3. Interior design, spatial planning, and material science.

Your mission is to help the user solve complex engineering problems and perfect their architectural designs.
Keep your responses professional, concise, and in Arabic. Be the "expert friend" to the engineer.
`;

export const chatWithGemini = async (message: string, history: {role: string, parts: string}[]) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview', // Upgraded to Pro for complex engineering tasks
    contents: [
      // Correctly map history parts as text strings
      ...history.map(h => ({ role: h.role, parts: [{ text: h.parts }] })),
      { role: 'user', parts: [{ text: message }] }
    ],
    config: {
      systemInstruction: ARCH_SYSTEM_INSTRUCTION,
      temperature: 0.7,
      thinkingConfig: { thinkingBudget: 4000 } // Added a small thinking budget for better reasoning
    },
  });
  return response.text;
};

export const renderImage = async (base64Image: string, prompt: string, resolution: '1K' | '2K' | '4K' = '1K') => {
  const ai = getAI();
  
  // High-end prompt enhancement for Pro Image model
  const enhancedPrompt = `High-end professional architectural visualization. Realistic materials, soft cinematic lighting, 8k resolution, photorealistic textures, global illumination. Scene: ${prompt}`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-image-preview', // Upgraded to Pro Image for 1K/2K/4K support
    contents: {
      parts: [
        {
          inlineData: {
            data: base64Image.split(',')[1],
            mimeType: 'image/png',
          },
        },
        { text: enhancedPrompt },
      ],
    },
    config: {
      imageConfig: {
        aspectRatio: "16:9",
        imageSize: resolution // Now utilizing the user's resolution choice
      },
    },
  });

  // Iterate to find the image part in the response
  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  return null;
};
