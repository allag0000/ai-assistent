import React, { useState, useRef } from 'react';
import { 
  Upload, 
  Sparkles, 
  Image as ImageIcon, 
  Download, 
  RefreshCw, 
  Trash2, 
  Loader2, 
  AlertTriangle, 
  Box
} from 'lucide-react';
import { renderImage } from '../services/geminiService';

const Visualizer: React.FC = () => {
  const [sourceImage, setSourceImage] = useState<string | null>(null);
  const [renderedImage, setRenderedImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [isRendering, setIsRendering] = useState(false);
  const [quality, setQuality] = useState<'1K' | '2K' | '4K'>('1K');
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSourceImage(reader.result as string);
        setRenderedImage(null);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRender = async () => {
    if (!sourceImage || isRendering) return;
    setIsRendering(true);
    setError(null);
    try {
      const result = await renderImage(sourceImage, prompt, quality);
      if (result) setRenderedImage(result);
      else setError('تعذر إنشاء الرندر.');
    } catch (err: any) {
      setError('خطأ في الاتصال.');
    } finally {
      setIsRendering(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-slate-950 overflow-y-auto pb-24 px-4 pt-4 gap-4">
      {/* Viewport Sections */}
      <div className="grid grid-cols-1 gap-4">
        {/* Input Image */}
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-2">
              <Box size={12} /> الصورة المرفوعة
            </span>
            {sourceImage && (
              <button onClick={() => setSourceImage(null)} className="text-slate-500 hover:text-red-400">
                <Trash2 size={12} />
              </button>
            )}
          </div>
          <div 
            onClick={() => !sourceImage && fileInputRef.current?.click()}
            className={`aspect-video relative rounded-2xl border-2 border-dashed transition-all flex items-center justify-center overflow-hidden ${sourceImage ? 'border-transparent' : 'border-slate-800 bg-slate-900/50'}`}
          >
            {sourceImage ? (
              <img src={sourceImage} className="w-full h-full object-cover" alt="Source" />
            ) : (
              <div className="text-center">
                <Upload className="text-indigo-400 mx-auto mb-2" size={24} />
                <p className="text-[10px] text-slate-500 font-bold">رفع تصميمك</p>
              </div>
            )}
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
          </div>
        </div>

        {/* Output Image */}
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-2">
              <ImageIcon size={12} /> الرندر النهائي
            </span>
            {renderedImage && (
              <a href={renderedImage} download="render.png" className="text-indigo-400 flex items-center gap-1 text-[10px] font-bold">
                <Download size={12} /> تحميل
              </a>
            )}
          </div>
          <div className="aspect-video relative rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center overflow-hidden">
            {renderedImage ? (
              <img src={renderedImage} className="w-full h-full object-cover animate-in fade-in duration-500" alt="Result" />
            ) : isRendering ? (
              <div className="text-center">
                <div className="w-10 h-10 border-2 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mx-auto mb-2"></div>
                <p className="text-[10px] text-white font-bold">جاري الرندر...</p>
              </div>
            ) : (
              <ImageIcon className="text-slate-800" size={32} />
            )}
          </div>
        </div>
      </div>

      {/* Settings Section */}
      <div className="bg-slate-900/50 rounded-2xl p-4 border border-slate-800 space-y-4">
        <div>
          <label className="text-[10px] font-bold text-slate-500 uppercase block mb-2">وصف المشهد</label>
          <textarea 
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="مثال: واجهة مودرن، رخام أبيض، إضاءة ليلية..."
            className="w-full bg-slate-950 text-xs border border-slate-800 rounded-xl p-3 focus:ring-1 focus:ring-indigo-500/50 text-slate-200 min-h-[80px] outline-none"
          />
        </div>

        <div className="grid grid-cols-3 gap-2">
          {(['1K', '2K', '4K'] as const).map((q) => (
            <button
              key={q}
              onClick={() => setQuality(q)}
              className={`py-2 rounded-lg text-[10px] font-bold transition-all ${quality === q ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'bg-slate-950 text-slate-500 border border-slate-800'}`}
            >
              {q}
            </button>
          ))}
        </div>

        <button 
          onClick={handleRender}
          disabled={!sourceImage || isRendering}
          className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-800 disabled:text-slate-600 text-white text-xs font-bold py-3.5 rounded-xl transition-all shadow-xl shadow-indigo-500/20 flex items-center justify-center gap-2"
        >
          {isRendering ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
          بدء الرندر
        </button>

        {error && (
          <div className="p-2 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2">
            <AlertTriangle size={12} className="text-red-400 shrink-0" />
            <p className="text-[9px] text-red-400">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Visualizer;