
import React, { useState, useRef } from 'react';
// Added Sparkles as SparkIcon to the lucide-react imports to fix the "Cannot find name 'SparkIcon'" error.
import { Upload, Image as ImageIcon, Download, RefreshCw, Trash2, Loader2, AlertTriangle, Box, Sparkles as SparkIcon } from 'lucide-react';
import { renderImage } from '../services/geminiService';

const Visualizer: React.FC = () => {
  const [sourceImage, setSourceImage] = useState<string | null>(null);
  const [renderedImage, setRenderedImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [isRendering, setIsRendering] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSourceImage(reader.result as string);
        setRenderedImage(null);
        setErrorMessage(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRender = async () => {
    if (!sourceImage || isRendering) return;
    setIsRendering(true);
    setErrorMessage(null);
    try {
      const result = await renderImage(sourceImage, prompt);
      if (result) {
        setRenderedImage(result);
      } else {
        setErrorMessage('تعذر إنشاء الرندر. حاول تغيير الوصف.');
      }
    } catch (err: any) {
      setErrorMessage('حدث ضغط على النظام. يرجى المحاولة بعد لحظات.');
    } finally {
      setIsRendering(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-slate-950 overflow-y-auto pb-28 px-5 pt-6 gap-6">
      <div className="grid grid-cols-1 gap-6">
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <Box size={12} /> مخطط المشروع / المسودة
            </span>
            {sourceImage && (
              <button onClick={() => setSourceImage(null)} className="text-slate-500 hover:text-red-400 p-1">
                <Trash2 size={14} />
              </button>
            )}
          </div>
          <div 
            onClick={() => !sourceImage && fileInputRef.current?.click()}
            className={`aspect-video relative rounded-3xl border-2 border-dashed transition-all flex items-center justify-center overflow-hidden cursor-pointer ${sourceImage ? 'border-transparent shadow-2xl ring-1 ring-white/10' : 'border-slate-800 bg-slate-900/40 hover:border-indigo-500/50 hover:bg-slate-900/60'}`}
          >
            {sourceImage ? (
              <img src={sourceImage} className="w-full h-full object-cover" />
            ) : (
              <div className="text-center p-6 space-y-3">
                <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center mx-auto border border-indigo-500/20">
                  <Upload className="text-indigo-400" size={24} />
                </div>
                <p className="text-[10px] text-slate-400 font-bold uppercase">اضغط لرفع المخطط</p>
              </div>
            )}
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest flex items-center gap-2">
              <ImageIcon size={12} /> المحاكاة الواقعية الذكية
            </span>
            {renderedImage && (
              <a href={renderedImage} download="render-ask-amine.png" className="text-emerald-400 flex items-center gap-1.5 text-[9px] font-bold bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                <Download size={12} /> حفظ الصورة
              </a>
            )}
          </div>
          <div className="aspect-video relative rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-center overflow-hidden shadow-2xl ring-1 ring-white/5">
            {renderedImage ? (
              <img src={renderedImage} className="w-full h-full object-cover animate-in fade-in duration-700" />
            ) : isRendering ? (
              <div className="text-center space-y-4">
                <div className="relative">
                  <Loader2 size={40} className="text-indigo-500 animate-spin mx-auto" />
                  <SparkIcon className="absolute inset-0 m-auto text-indigo-300 animate-pulse" size={16} />
                </div>
                <div>
                  <p className="text-xs text-white font-bold tracking-wide">جاري تطبيق الخامات...</p>
                  <p className="text-[9px] text-slate-500 mt-1 uppercase tracking-tighter">AI Materials Engine active</p>
                </div>
              </div>
            ) : (
              <div className="opacity-10 scale-150 rotate-12 grayscale">
                 <ImageIcon size={80} className="text-indigo-500" />
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-slate-900/60 rounded-[2.5rem] p-5 border border-white/5 space-y-4 shadow-xl">
        <div className="space-y-3">
          <textarea 
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="صف الخامات والإضاءة (مثال: واجهة زجاجية، رخام إيطالي، إضاءة ذهبية...)"
            className="w-full bg-slate-950 text-xs border border-slate-800 rounded-2xl p-4 text-slate-200 min-h-[80px] outline-none focus:border-indigo-500/50 transition-all placeholder:text-slate-700"
          />
        </div>

        <button 
          onClick={handleRender}
          disabled={!sourceImage || isRendering}
          className="w-full h-14 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-800 disabled:text-slate-600 text-white text-sm font-bold rounded-2xl shadow-xl shadow-indigo-600/20 transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
        >
          {isRendering ? <Loader2 size={20} className="animate-spin" /> : <RefreshCw size={20} />}
          إنشاء الرندر الهندسي
        </button>

        {errorMessage && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-1">
            <AlertTriangle size={14} className="text-red-400 shrink-0" />
            <p className="text-[10px] text-red-400 font-medium">{errorMessage}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Visualizer;
