
import { GoogleGenAI, Type } from "@google/genai";

const IMAGE_MODEL = 'gemini-2.5-flash-image';
const FLASH_MODEL = 'gemini-3-flash-preview';

/**
 * دالة مساعدة للحصول على مثيل AI محدث دائماً
 */
// Use process.env.API_KEY directly as per guidelines
const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

async function retryRequest<T>(fn: () => Promise<T>, retries = 2, delay = 2000): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    const errorMsg = error?.message || "";
    const isQuotaError = errorMsg.includes('429') || errorMsg.includes('RESOURCE_EXHAUSTED');
    
    if (isQuotaError && retries > 0) {
      await new Promise(resolve => setTimeout(resolve, delay));
      return retryRequest(fn, retries - 1, delay * 1.5);
    }
    throw error;
  }
}

export const renderImage = async (base64Image: string, prompt: string) => {
  return retryRequest(async () => {
    const ai = getAI();
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
  });
};

export const refineToLineArt = async (base64Image: string) => {
  return retryRequest(async () => {
    const ai = getAI();
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
  });
};

export const chatWithGemini = async (message: string, history: any[], imageBase64?: string) => {
  return retryRequest(async () => {
    const ai = getAI();
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
        systemInstruction: `أنت "ASK AMINE AI"، مساعد هندسي تقني خبير. أجب بلغة هندسية احترافية.`,
        temperature: 0.7,
      },
    });
    return response.text;
  });
};

export const generate3DModelFile = async (base64Image: string, description: string) => {
  return retryRequest(async () => {
    const ai = getAI();
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
                  }
                }
              }
            }
          }
        }
      }
    });

    return response.text;
  });
};

export const generateDxfPlan = async (svgCode: string) => {
  return retryRequest(async () => {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: FLASH_MODEL,
      contents: {
        parts: [
          { text: `Convert this SVG vector to a standard ASCII DXF R12 format. SVG: ${svgCode}.` }
        ]
      },
      config: { temperature: 0.1 }
    });
    return response.text;
  });
};
