import { GoogleGenAI } from "@google/genai";

// ملاحظة للمطور: يتم توفير API_KEY تلقائياً في هذه البيئة
const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * خدمة الدردشة الذكية - مهندس خبير
 */
export const chatWithGemini = async (message: string, history: any[]) => {
  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        ...history.map(h => ({
          role: h.role,
          parts: [{ text: h.parts }]
        })),
        { role: "user", parts: [{ text: message }] }
      ],
      config: {
        systemInstruction: `أنت "أمين"، مساعد ذكاء اصطناعي وخبير هندسي استشاري. 
        تخصصك يشمل: الهندسة المدنية، المعمارية، التصميم الداخلي، والديكور. 
        يجب أن تكون إجاباتك:
        1. احترافية ودقيقة تقنياً.
        2. باللغة العربية بأسلوب سهل ومحبب.
        3. قدم نصائح حول الكود الهندسي، المواد، والتصميم الجمالي.
        4. إذا سُئلت عن أمور غير هندسية، حاول ربطها بالهندسة أو اعتذر بلباقة موضحاً تخصصك.`,
        temperature: 0.7,
      },
    });

    return response.text;
  } catch (error) {
    console.error("Gemini Chat Error:", error);
    return "عذراً، واجهت مشكلة في معالجة طلبك الهندسي. يرجى المحاولة مرة أخرى.";
  }
};

/**
 * خدمة الرندر البصري - تحويل الصور
 */
export const renderImage = async (base64Image: string, prompt: string, resolution: string) => {
  const ai = getAI();
  try {
    // استخراج بيانات base64 الصافية
    const base64Data = base64Image.split(',')[1];
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Data,
              mimeType: 'image/png',
            },
          },
          {
            text: `قم بعمل رندر هندسي احترافي لهذه الصورة بناءً على الوصف التالي: ${prompt}. 
            اجعل النتيجة واقعية جداً (Photorealistic) وبجودة عالية، مع مراعاة الإضاءة والمواد المستخدمة في العمارة الحديثة.`,
          },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: "16:9",
        }
      }
    });

    // البحث عن جزء الصورة في الرد
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error) {
    console.error("Gemini Render Error:", error);
    throw error;
  }
};
