import { GoogleGenAI } from "@google/genai";

// المساعد ذكي جداً الآن - نستخدم Gemini 3 Flash للدردشة و 2.5 Flash Image للرندر
const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

/**
 * خدمة الدردشة الذكية - المهندس الاستشاري أمين
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
        systemInstruction: `أنت "أمين"، مهندس استشاري خبير بخبرة تزيد عن 20 عاماً في الهندسة المدنية، المعمارية، والتصميم الداخلي.
        
        قواعد التعامل مع المستخدم:
        1. ابدأ دائماً باحترافية. استخدم مصطلحات هندسية دقيقة (مثل: الإجهادات، العزوم، الكود السعودي SBC، الأحمال الحية والميتة، المخططات التنفيذية Shop Drawings).
        2. إذا سأل المستخدم سؤالاً إنشائياً، حذره دائماً بضرورة مراجعة مهندس مرخص قبل التنفيذ، ولكن قدم له الإطار النظري الصحيح.
        3. في التصميم المعماري والديكور، ركز على "الوظيفة تتبع الجمال" (Form follows Function) واقترح مواد حديثة وموفرة للطاقة.
        4. كن "ذكياً"؛ إذا كانت المعلومة ناقصة، اطلب من المستخدم توضيح (مثل: مساحة الأرض، نوع التربة، الميزانية).
        5. لغتك هي العربية الاحترافية والواضحة.`,
        temperature: 0.8,
        topP: 0.95,
      },
    });

    return response.text;
  } catch (error) {
    console.error("Gemini Chat Error:", error);
    return "عذراً يا مهندس، حدث خطأ تقني في الاتصال بمحرك الذكاء الاصطناعي. يرجى التأكد من مفتاح API أو المحاولة لاحقاً.";
  }
};

/**
 * خدمة الرندر البصري الاحترافي
 */
export const renderImage = async (base64Image: string, prompt: string, resolution: string) => {
  const ai = getAI();
  try {
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
            text: `أنت الآن محرك رندر عالي الجودة (High-End Rendering Engine). 
            قم بتحويل هذا المخطط أو الصورة إلى رندر واقعي جداً (Hyper-Realistic) بناءً على الوصف التالي: ${prompt}.
            ركز على:
            - الإضاءة العالمية (Global Illumination).
            - دقة الخامات (PBR Textures).
            - التفاصيل المعمارية الدقيقة.
            اجعل النتيجة تضاهي V-Ray أو Lumion.`,
          },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: "16:9",
        }
      }
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error) {
    console.error("Gemini Render Error:", error);
    throw new Error("فشل الرندر: " + (error instanceof Error ? error.message : "خطأ غير معروف"));
  }
};
