
import React, { useState, useRef } from 'react';
import { 
  Upload, 
  Download, 
  Loader2, 
  Trash2, 
  PenTool,
  Zap,
  Split,
  Settings,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
// @ts-ignore
import ImageTracer from 'https://esm.sh/imagetracerjs';
import { refineToLineArt, generateDxfPlan } from '../services/geminiService';

type Step = 'upload' | 'sketchify' | 'vectorize';

const VectorFactory: React.FC = () => {
  const [image, setImage] = useState<string | null>(null);
  const [lineArt, setLineArt] = useState<string | null>(null);
  const [svgContent, setSvgContent] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isExportingDxf, setIsExportingDxf] = useState(false);
  const [currentStep, setCurrentStep] = useState<Step>('upload');
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setLineArt(null);
        setSvgContent(null);
        setCurrentStep('upload');
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSketchify = async () => {
    if (!image || isProcessing) return;
    setIsProcessing(true);
    setError(null);
    try {
      // المرحلة الأولى: استخدام Gemini لتنظيف الصورة وتحويلها لأبيض وأسود عالي التباين
      const result = await refineToLineArt(image);
      if (result) {
        setLineArt(result);
        setCurrentStep('sketchify');
      }
    } catch (err: any) {
      if (err.message?.includes('429')) setError("تجاوزت حد الطلبات. يرجى الانتظار قليلاً.");
      else setError("خطأ في تنقية الخطوط");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleVectorize = async () => {
    if (!lineArt || isProcessing) return;
    setIsProcessing(true);
    setError(null);
    
    try {
      // المرحلة الثانية: التحويل الشعاعي البرمجي بكسل بكسل باستخدام ImageTracer
      // نقوم بتحويل الـ Base64 إلى SVG عبر خوارزمية التتبع
      const options = {
        ltres: 0.1,    // ضبط دقة الخطوط المستقيمة (أقل = أدق)
        qtres: 0.1,    // ضبط دقة المنحنيات
        pathomit: 8,   // تجاهل العناصر الصغيرة جداً (الضجيج)
        strokewidth: 1,
        colorsampling: 0, // أبيض وأسود فقط
        numberofcolors: 2
      };

      // تحويل الصورة برمجياً
      ImageTracer.imageToSVG(
        lineArt,
        (svgString: string) => {
          setSvgContent(svgString);
          setCurrentStep('vectorize');
          setIsProcessing(false);
        },
        options
      );
    } catch (err: any) {
      setError("فشل التحويل الشعاعي البرمجي.");
      setIsProcessing(false);
    }
  };

  const handleDxfExport = async () => {
    if (!svgContent || isExportingDxf) return;
    setIsExportingDxf(true);
    setError(null);
    try {
      // إرسال الـ SVG المولد بدقة عالية إلى Gemini لتحويله إلى DXF صالح للاوتوكاد
      const dxfText = await generateDxfPlan(svgContent);
      const cleanDxf = dxfText.replace(/```[a-z]*\n?/gi, '').replace(/```/g, '').trim();
      const blob = new Blob([cleanDxf], { type: 'application/dxf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = `plan_${Date.now()}.dxf`; a.click();
    } catch (err: any) {
      setError("خطأ في تصدير CAD");
    } finally {
      setIsExportingDxf(false);
    }
  };

  const reset = () => {
    setImage(null);
    setLineArt(null);
    setSvgContent(null);
    setCurrentStep('upload');
    setError(null);
  };

  return (
    <div className="h-full flex flex-col bg-slate-950 overflow-y-auto pb-32 px-5 pt-8 gap-6">
      <div className="text-center space-y-1">
        <h2 className="text-lg font-bold text-white flex items-center justify-center gap-2">
          <PenTool className="text-indigo-400" size={20} /> محول المخططات الذكي
        </h2>
        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">High-Precision Vectorization (Hybrid AI)</p>
      </div>

      <div className="flex flex-col gap-4">
        <div className="relative">
          <div className={`aspect-square relative rounded-3xl border-2 border-dashed flex flex-col items-center justify-center overflow-hidden transition-all ${image ? 'border-indigo-500 bg-slate-900 shadow-[0_0_30px_-10px_rgba(79,70,229,0.3)]' : 'border-slate-800 bg-slate-900/30'}`}>
            {!image ? (
              <div onClick={() => fileInputRef.current?.click()} className="text-center cursor-pointer p-10 group">
                <div className="w-16 h-16 bg-slate-800/50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-700 group-hover:border-indigo-500 transition-colors">
                  <Upload className="text-slate-500 group-hover:text-indigo-400" size={32} />
                </div>
                <p className="text-xs text-slate-500 font-bold">ارفع صورة المخطط أو المسودة</p>
                <p className="text-[9px] text-slate-600 mt-2 uppercase tracking-tighter">Support: JPG, PNG, WEBP</p>
              </div>
            ) : svgContent ? (
              <div className="w-full h-full bg-white p-6 flex items-center justify-center">
                 <div className="w-full h-full opacity-90 transition-opacity hover:opacity-100" dangerouslySetInnerHTML={{ __html: svgContent }} />
              </div>
            ) : lineArt ? (
              <img src={lineArt} className="w-full h-full object-contain p-2" alt="Cleaned Sketch" />
            ) : (
              <img src={image} className="w-full h-full object-contain p-4 opacity-50 grayscale" alt="Original" />
            )}
            
            {(isProcessing || isExportingDxf) && (
              <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md flex flex-col items-center justify-center gap-4">
                <div className="relative">
                  <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
                  <Zap className="absolute inset-0 m-auto text-indigo-400 animate-pulse" size={16} />
                </div>
                <div className="text-center">
                  <p className="text-[10px] text-white font-bold uppercase tracking-[0.2em]">
                    {currentStep === 'upload' ? 'تنقية الخطوط عبر AI' : 'توليد المسارات الشعاعية'}
                  </p>
                  <p className="text-[8px] text-slate-500 mt-1 italic">Processing High-Resolution Data...</p>
                </div>
              </div>
            )}
          </div>
          
          {image && !isProcessing && (
             <button onClick={reset} className="absolute -top-3 -right-3 bg-slate-900 border border-white/10 p-2.5 rounded-full text-slate-400 hover:text-red-400 transition-colors shadow-xl">
               <Trash2 size={16} />
             </button>
          )}
        </div>

        <div className="space-y-4">
          {currentStep === 'upload' && image && (
            <button onClick={handleSketchify} className="group w-full bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold py-5 rounded-2xl flex items-center justify-center gap-3 shadow-xl shadow-indigo-600/20 transition-all active:scale-95">
              <Split size={20} className="group-hover:rotate-12 transition-transform" /> 
              <span>1. تنقية المخطط (AI Cleaning)</span>
            </button>
          )}

          {currentStep === 'sketchify' && lineArt && (
            <button onClick={handleVectorize} className="group w-full bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold py-5 rounded-2xl flex items-center justify-center gap-3 shadow-xl shadow-emerald-600/20 transition-all active:scale-95">
              <Zap size={20} className="animate-pulse" /> 
              <span>2. تحويل شعاعي بدقة Pixel-Perfect</span>
            </button>
          )}

          {currentStep === 'vectorize' && svgContent && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 justify-center text-emerald-400 text-[10px] font-bold uppercase mb-2">
                <CheckCircle2 size={12} /> اكتمل التحويل الشعاعي بنجاح
              </div>
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => {
                    const blob = new Blob([svgContent], { type: 'image/svg+xml' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a'); a.href = url; a.download = `vector_plan_${Date.now()}.svg`; a.click();
                  }}
                  className="bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold py-5 rounded-2xl flex flex-col items-center justify-center gap-2 transition-all border border-white/5"
                >
                  <Download size={18} className="text-indigo-400" />
                  تحميل SVG
                </button>
                <button 
                  onClick={handleDxfExport} 
                  disabled={isExportingDxf} 
                  className="bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold py-5 rounded-2xl flex flex-col items-center justify-center gap-2 transition-all border border-white/5 disabled:opacity-50"
                >
                  <Settings size={18} className="text-amber-400" />
                  تصدير DXF (CAD)
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
      
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-[10px] text-center font-bold flex items-center gap-2 justify-center animate-in fade-in slide-in-from-bottom-2">
          <AlertCircle size={14} />
          {error}
        </div>
      )}

      {currentStep === 'upload' && !image && (
        <div className="p-6 bg-indigo-500/5 border border-indigo-500/10 rounded-3xl">
          <h4 className="text-[10px] font-bold text-indigo-400 uppercase mb-3 flex items-center gap-2">
            <Zap size={12} /> كيف يعمل النظام الهجين؟
          </h4>
          <ul className="space-y-2">
            <li className="flex gap-3 items-start">
              <span className="w-4 h-4 rounded-full bg-indigo-500/20 flex items-center justify-center text-[8px] text-indigo-400 font-bold shrink-0 mt-0.5">1</span>
              <p className="text-[10px] text-slate-400 leading-relaxed">يقوم <span className="text-slate-200">Gemini AI</span> بتحليل الصورة وإزالة التظليل والشوائب لتحويلها لخطوط نقية.</p>
            </li>
            <li className="flex gap-3 items-start">
              <span className="w-4 h-4 rounded-full bg-indigo-500/20 flex items-center justify-center text-[8px] text-indigo-400 font-bold shrink-0 mt-0.5">2</span>
              <p className="text-[10px] text-slate-400 leading-relaxed">تقوم خوارزمية <span className="text-slate-200">ImageTracer</span> بتتبع كل بكسل لتحويله لمسار هندسي (Vector Path) بدقة 0.1.</p>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default VectorFactory;
