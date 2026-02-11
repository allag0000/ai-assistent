
import { GoogleGenAI, Type } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY || API_KEY === "") {
  console.warn("API_KEY is missing. Please set it in Netlify Environment Variables.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY || '' });

const IMAGE_MODEL = 'gemini-2.5-flash-image';
const FLASH_MODEL = 'gemini-3-flash-preview';

export const renderImage = async (base64Image: string, prompt: string) => {
  try {
    const mimeType = base64Image.match(/data:(.*?);/)?.[1] || 'image/jpeg';
    const base64Data = base64Image.split(',')[1];
    
    const response = await ai.models.generateContent({
      model: IMAGE_MODEL,
      contents: {
        parts: [
          { inlineData: { data: base64Data, mimeType } },
          { text: prompt || "تحويل هذا المخطط المعماري إلى رندر واقعي عالي الدقة." }
        ]
      }
    });

    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
      }
    }
    return null;
  } catch (error: any) {
    console.error("Gemini Render Error:", error);
    throw error;
  }
};

export const refineToLineArt = async (base64Image: string) => {
  try {
    const mimeType = base64Image.match(/data:(.*?);/)?.[1] || 'image/png';
    const base64Data = base64Image.split(',')[1];
    
    const response = await ai.models.generateContent({
      model: IMAGE_MODEL,
      contents: {
        parts: [
          { inlineData: { data: base64Data, mimeType } },
          { text: "ACT AS A TECHNICAL DRAFTSMAN. Convert to STRICT high-contrast black and white line drawing." }
        ]
      }
    });

    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
      }
    }
    return null;
  } catch (error) {
    throw error;
  }
};

export const chatWithGemini = async (message: string, history: any[], imageBase64?: string) => {
  try {
    const parts: any[] = [{ text: message }];
    if (imageBase64) {
      const mimeType = imageBase64.match(/data:(.*?);/)?.[1] || 'image/jpeg';
      const base64Data = imageBase64.split(',')[1];
      parts.push({ inlineData: { data: base64Data, mimeType } });
    }
    
    const response = await ai.models.generateContent({
      model: FLASH_MODEL,
      contents: [...history.map(h => ({ role: h.role, parts: [{ text: h.parts }] })), { role: "user", parts }],
      config: {
        systemInstruction: `أنت "ASK AMINE AI"، مساعد هندسي تقني محترف.`,
        temperature: 0.7,
      },
    });
    return response.text;
  } catch (error: any) {
    return "عذراً، حدث خطأ في الاتصال. تأكد من إعدادات API Key.";
  }
};

export const generate3DModelFile = async (base64Image: string, description: string) => {
  try {
    const mimeType = base64Image.match(/data:(.*?);/)?.[1] || 'image/png';
    const base64Data = base64Image.split(',')[1];
    
    const response = await ai.models.generateContent({
      model: FLASH_MODEL,
      contents: {
        parts: [
          { inlineData: { data: base64Data, mimeType } },
          { text: `Analyze this object for 3D reconstruction. Description: ${description}` }
        ]
      },
      config: { 
        temperature: 0.1,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            primitives: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  type: { type: Type.STRING },
                  dimensions: {
                    type: Type.OBJECT,
                    properties: {
                      width: { type: Type.NUMBER },
                      height: { type: Type.NUMBER },
                      depth: { type: Type.NUMBER },
                      radius: { type: Type.NUMBER }
                    }
                  },
                  position: {
                    type: Type.OBJECT,
                    properties: {
                      x: { type: Type.NUMBER },
                      y: { type: Type.NUMBER },
                      z: { type: Type.NUMBER }
                    }
                  },
                  rotation: {
                    type: Type.OBJECT,
                    properties: {
                      x: { type: Type.NUMBER },
                      y: { type: Type.NUMBER },
                      z: { type: Type.NUMBER }
                    }
                  },
                  symmetry: { type: Type.STRING }
                }
              }
            }
          }
        }
      }
    });

    return response.text;
  } catch (error: any) {
    console.error("3D Generation Error:", error);
    throw error;
  }
};

export const generateDxfPlan = async (svgCode: string) => {
  try {
    const response = await ai.models.generateContent({
      model: FLASH_MODEL,
      contents: {
        parts: [
          { text: `Convert to valid ASCII DXF. SVG: ${svgCode}.` }
        ]
      },
      config: { temperature: 0.1 }
    });
    return response.text;
  } catch (error: any) {
    throw error;
  }
};
