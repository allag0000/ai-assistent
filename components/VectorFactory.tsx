
import React, { useState, useRef } from 'react';
import { 
  Upload, 
  Download, 
  Trash2, 
  PenTool,
  Zap,
  Split,
  Settings,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
// @ts-ignore
import ImageTracer from 'imagetracerjs';
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
      const result = await refineToLineArt(image);
      if (result) {
        setLineArt(result);
        setCurrentStep('sketchify');
      }
    } catch (err: any) {
      setError("تعذر تنقية خطوط المخطط. تأكد من وضوح الصورة المرفوعة.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleVectorize = async () => {
    if (!lineArt || isProcessing) return;
    setIsProcessing(true);
    
    try {
      const options = {
        ltres: 0.1,
        qtres: 0.1,
        pathomit: 8,
        strokewidth: 1,
        colorsampling: 0,
        numberofcolors: 2
      };

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
      setError("فشل التحويل إلى صيغة شعاعية (Vector).");
      setIsProcessing(false);
    }
  };

  const handleDxfExport = async () => {
    if (!svgContent || isExportingDxf) return;
    setIsExportingDxf(true);
    try {
      const dxfText = await generateDxfPlan(svgContent);
      const cleanDxf = dxfText.replace(/```[a-z]*\n?/gi, '').replace(/```/g, '').trim();
      const blob = new Blob([cleanDxf], { type: 'application/dxf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = `plan_${Date.now()}.dxf`; a.click();
    } catch (err: any) {
      setError("خطأ في إنشاء ملف CAD. يرجى مراجعة المخطط.");
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
        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">تحويل عالي الدقة (Hybrid AI)</p>
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
                <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
                <p className="text-[10px] text-white font-bold uppercase tracking-[0.2em]">جاري معالجة البيانات...</p>
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
            <button onClick={handleSketchify} className="group w-full bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold py-5 rounded-2xl flex items-center justify-center gap-3 shadow-xl transition-all">
              <Split size={20} /> 
              <span>1. تنقية المخطط (AI Cleaning)</span>
            </button>
          )}

          {currentStep === 'sketchify' && lineArt && (
            <button onClick={handleVectorize} className="group w-full bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold py-5 rounded-2xl flex items-center justify-center gap-3 shadow-xl transition-all">
              <Zap size={20} /> 
              <span>2. تحويل شعاعي (Vectorize)</span>
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
                    const a = document.createElement('a'); a.href = url; a.download = `vector_${Date.now()}.svg`; a.click();
                  }}
                  className="bg-slate-800 text-white text-xs font-bold py-5 rounded-2xl flex flex-col items-center justify-center gap-2"
                >
                  <Download size={18} /> تحميل SVG
                </button>
                <button onClick={handleDxfExport} disabled={isExportingDxf} className="bg-slate-800 text-white text-xs font-bold py-5 rounded-2xl flex flex-col items-center justify-center gap-2">
                  <Settings size={18} /> تصدير DXF
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
      
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-[10px] text-center font-bold">
          <AlertCircle size={14} className="inline ml-2" />
          {error}
        </div>
      )}
    </div>
  );
};

export default VectorFactory;
