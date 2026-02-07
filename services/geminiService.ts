/**
 * محاكي الخدمة الهندسية - يعمل بدون API
 */

const engineeringResponses = [
  "بناءً على خبرتي الهندسية، أنصحك دائماً بالتأكد من توزيع الأحمال في المخطط الإنشائي قبل البدء في التفاصيل المعمارية.",
  "بالنسبة لاستفسارك، يفضل استخدام خرسانة ذات ديمومة عالية في المناطق الرطبة لضمان عمر أطول للمنشأة.",
  "في تصميم الإضاءة، حاول دائماً دمج الإضاءة الطبيعية مع الإضاءة المخفية (Cove Lighting) لإعطاء مساحة بصرية أكبر.",
  "إذا كنت تستخدم SketchUp، أنصحك بتنظيم الموديل باستخدام الـ Tags والـ Components لتسهيل عملية الرندر لاحقاً.",
  "التصميم المودرن يعتمد بشكل كبير على البساطة واستخدام الخامات الطبيعية مثل الرخام والخشب الدافئ.",
  "تأكد دائماً من مطابقة المخططات المعمارية مع المخططات الميكانيكية والكهربائية (MEP) لتجنب التعارضات في الموقع."
];

const keywordResponses: Record<string, string> = {
  "خرسانة": "عند التعامل مع الخرسانة، تأكد من نسبة الخلط وتجربة الهبوط (Slump Test) لضمان الجودة المطلوبة.",
  "ديكور": "في الديكور الداخلي، التوازن بين الألوان الباردة والدافئة هو سر النجاح في أي فراغ معماري.",
  "رندر": "للحصول على أفضل رندر، ركز على جودة الخامات (Textures) وتوزيع الإضاءة الواقعية بدلاً من زيادة الإعدادات.",
  "تصميم": "التصميم الجيد هو الذي يجمع بين الجمال الوظيفي والاستغلال الأمثل للمساحات المتاحة.",
  "سكيتش": "برنامج SketchUp رائع للنمذجة السريعة، خاصة إذا استخدمت معه إضافات مثل Enscape أو V-Ray."
};

export const chatWithGemini = async (message: string, history: any[]) => {
  // محاكاة تأخير بسيط لجعل التجربة تبدو واقعية
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const lowerMsg = message.toLowerCase();
  for (const key in keywordResponses) {
    if (lowerMsg.includes(key)) return keywordResponses[key];
  }

  // رد عشوائي إذا لم توجد كلمة مفتاحية
  return engineeringResponses[Math.floor(Math.random() * engineeringResponses.length)];
};

export const renderImage = async (base64Image: string, prompt: string, resolution: string) => {
  // محاكاة عملية الرندر محلياً
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  // في نسخة المحاكاة، سنعيد نفس الصورة مع إضافة تأثير بسيط عبر Canvas
  return new Promise<string>((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return resolve(base64Image);
      
      canvas.width = img.width;
      canvas.height = img.height;
      
      // رسم الصورة الأصلية
      ctx.drawImage(img, 0, 0);
      
      // إضافة فلتر بسيط "تحسين هندسي"
      ctx.globalCompositeOperation = 'overlay';
      ctx.fillStyle = 'rgba(99, 102, 241, 0.1)'; // لمسة زرقاء خفيفة
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // إضافة فلتر إضاءة
      ctx.globalCompositeOperation = 'soft-light';
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      resolve(canvas.toDataURL('image/png'));
    };
    img.src = base64Image;
  });
};
