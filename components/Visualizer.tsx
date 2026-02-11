import React, { useState, useRef } from 'react';
import { 
  Upload, 
  Image as ImageIcon, 
  Download, 
  RefreshCw, 
  Trash2, 
  Loader2, 
  AlertTriangle, 
  Box,
  Sparkles
} from 'lucide-react';
import { renderImage } from '../services/geminiService';

const Visualizer: React.FC = () => {
  const [sourceImage, setSourceImage] = useState<string | null>(null);
  const [renderedImage, setRenderedImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [isRendering, setIsRendering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('حجم الصورة كبير جداً. يرجى اختيار صورة أقل من 5 ميجابايت.');
        return;
      }
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
      const result = await renderImage(sourceImage, prompt);
      if (result) {
        setRenderedImage(result);
      } else {
        setError('فشل النموذج في إنتاج صورة. يرجى مراجعة الوصف أو جودة الصورة المرفوعة.');
      }
    } catch (err: any) {
      console.error(err);
      if (err.message === "PERMISSION_DENIED") {
        setError("خطأ في الصلاحيات (403): مفتاح API المستخدم لا يملك صلاحية الوصول لموديل الرندر. يرجى التأكد من تفعيل Generative AI API في مشروعك.");
      } else {
        setError('حدث خطأ أثناء الرندر. تأكد من اتصال الإنترنت والمحاولة لاحقاً.');
      }
    } finally {
      setIsRendering(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-slate-950 overflow-y-auto pb-24 px-4 pt-4 gap-4">
      <div className="grid grid-cols-1 gap-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-2">
              <Box size={12} /> مخطط المشروع / Sketch
            </span>
            {sourceImage && (
              <button onClick={() => setSourceImage(null)} className="text-slate-500 hover:text-red-400 transition-colors">
                <Trash2 size={12} />
              </button>
            )}
          </div>
          <div 
            onClick={() => !sourceImage && fileInputRef.current?.click()}
            className={`aspect-video relative rounded-2xl border-2 border-dashed transition-all flex items-center justify-center overflow-hidden cursor-pointer ${sourceImage ? 'border-transparent shadow-2xl' : 'border-slate-800 bg-slate-900/50 hover:bg-slate-900 hover:border-indigo-500/50'}`}
          >
            {sourceImage ? (
              <img src={sourceImage} className="w-full h-full object-cover" alt="Source" />
            ) : (
              <div className="text-center p-6">
                <div className="w-12 h-12 bg-indigo-500/10 rounded-xl flex items-center justify-center mx-auto mb-3 border border-indigo-500/20">
                  <Upload className="text-indigo-400" size={24} />
                </div>
                <p className="text-[10px] text-slate-400 font-bold">رفع التصميم الأساسي</p>
                <p className="text-[8px] text-slate-600 mt-1">PNG, JPG up to 5MB</p>
              </div>
            )}
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <span className="text-[10px] font-bold text-indigo-400 uppercase flex items-center gap-2">
              <ImageIcon size={12} /> الرندر الواقعي
            </span>
            {renderedImage && (
              <a href={renderedImage} download="render-amine.png" className="text-indigo-400 flex items-center gap-1 text-[10px] font-bold bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20">
                <Download size={12} /> تحميل النتيجة
              </a>
            )}
          </div>
          <div className="aspect-video relative rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center overflow-hidden shadow-2xl">
            {renderedImage ? (
              <img src={renderedImage} className="w-full h-full object-cover animate-in fade-in zoom-in-95 duration-500" alt="Result" />
            ) : isRendering ? (
              <div className="text-center p-8">
                <Loader2 size={32} className="text-indigo-500 animate-spin mx-auto mb-3" />
                <p className="text-xs text-white font-bold mb-1">جاري تحويل التصميم...</p>
                <p className="text-[9px] text-slate-500 italic">يتم تطبيق الخامات والإضاءة الواقعية</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <ImageIcon className="text-slate-800" size={40} />
                <p className="text-[9px] text-slate-600">اضغط على "بدء الرندر" للبدء</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-slate-900/50 rounded-2xl p-4 border border-slate-800 space-y-4">
        <div>
          <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-2 mb-2">
             <Sparkles size={12} /> وصف المواد (اختياري)
          </label>
          <textarea 
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="مثال: واجهة حديثة، رخام أسود، إضاءة ليلية خافتة..."
            className="w-full bg-slate-950 text-xs border border-slate-800 rounded-xl p-3 text-slate-200 min-h-[80px] outline-none focus:border-indigo-500/50 transition-all shadow-inner"
          />
        </div>

        <button 
          onClick={handleRender}
          disabled={!sourceImage || isRendering}
          className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-800 disabled:text-slate-600 text-white text-sm font-bold py-4 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2"
        >
          {isRendering ? <Loader2 size={18} className="animate-spin" /> : <RefreshCw size={18} />}
          بدء الرندر
        </button>

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-2 animate-in slide-in-from-top-2">
            <AlertTriangle size={14} className="text-red-400 shrink-0 mt-0.5" />
            <p className="text-[10px] text-red-400 leading-relaxed">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Visualizer;