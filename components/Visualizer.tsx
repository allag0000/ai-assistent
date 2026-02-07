
import React, { useState, useRef } from 'react';
import { 
  Upload, 
  Sparkles, 
  Image as ImageIcon, 
  Download, 
  RefreshCw, 
  Trash2, 
  CheckCircle2, 
  Loader2, 
  AlertTriangle, 
  Box,
  Maximize2
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
      if (result) {
        setRenderedImage(result);
      } else {
        setError('تعذر إنشاء الرندر. يرجى المحاولة مرة أخرى.');
      }
    } catch (err: any) {
      console.error(err);
      setError('حدث خطأ أثناء الاتصال بالخادم. تأكد من أن المفتاح نشط.');
    } finally {
      setIsRendering(false);
    }
  };

  const downloadImage = () => {
    if (!renderedImage) return;
    const link = document.createElement('a');
    link.href = renderedImage;
    link.download = `ask-amine-render-${Date.now()}.png`;
    link.click();
  };

  return (
    <div className="h-full flex flex-col md:flex-row bg-slate-900/40 p-6 gap-6 overflow-y-auto">
      {/* Configuration Panel */}
      <div className="w-full md:w-80 flex flex-col gap-6 shrink-0">
        <div className="glass-effect rounded-2xl p-6 border border-slate-800">
          <h3 className="text-white font-semibold mb-6 flex items-center gap-2">
            <Sparkles size={18} className="text-indigo-400" /> إعدادات الرندر
          </h3>
          
          <div className="space-y-6">
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase block mb-3">وصف المشهد (برومبت)</label>
              <textarea 
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="مثلاً: تصميم مودرن بألوان دافئة، إضاءة شمس نهارية..."
                className="w-full bg-slate-800 text-sm border border-slate-700 rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-slate-200 min-h-[120px] placeholder:text-slate-600 transition-all"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase block mb-3">الجودة النهائية</label>
              <div className="grid grid-cols-3 gap-2">
                {(['1K', '2K', '4K'] as const).map((q) => (
                  <button
                    key={q}
                    onClick={() => setQuality(q)}
                    className={`py-2 rounded-lg text-xs font-bold transition-all ${quality === q ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'bg-slate-800 text-slate-500 hover:bg-slate-700'}`}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-4">
              <button 
                onClick={handleRender}
                disabled={!sourceImage || isRendering}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-800 disabled:text-slate-600 text-white font-bold py-4 rounded-xl transition-all shadow-xl shadow-indigo-500/20 flex items-center justify-center gap-3 group active:scale-95"
              >
                {isRendering ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    جاري التحويل...
                  </>
                ) : (
                  <>
                    <RefreshCw size={20} className="group-hover:rotate-180 transition-transform duration-500" />
                    بدء الرندر الواقعي
                  </>
                )}
              </button>
              {error && (
                <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-2">
                  <AlertTriangle size={14} className="text-red-400 shrink-0 mt-0.5" />
                  <p className="text-[11px] text-red-400">{error}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="glass-effect rounded-2xl p-6 border border-slate-800 flex-1">
          <h4 className="text-xs font-bold text-slate-500 mb-4 uppercase">نصائح هندسية:</h4>
          <ul className="space-y-3 text-[11px] text-slate-400 leading-relaxed">
            <li className="flex gap-2">
              <CheckCircle2 size={12} className="text-emerald-500 shrink-0" />
              <span>ارفع صورة واضحة من زاوية عين الإنسان.</span>
            </li>
            <li className="flex gap-2">
              <CheckCircle2 size={12} className="text-emerald-500 shrink-0" />
              <span>حدد نوع الخامات في الوصف للحصول على لمعان واقعي.</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Viewport Area */}
      <div className="flex-1 flex flex-col gap-6">
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-0">
          <div className="flex flex-col gap-3 min-h-0">
            <div className="flex items-center justify-between px-2">
              <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                <Box size={14} /> سكرين شوت المودل
              </label>
              {sourceImage && (
                <button onClick={() => setSourceImage(null)} className="text-slate-500 hover:text-red-400 transition-colors">
                  <Trash2 size={14} />
                </button>
              )}
            </div>
            
            <div 
              onClick={() => !sourceImage && fileInputRef.current?.click()}
              className={`flex-1 relative glass-effect rounded-3xl border-2 border-dashed transition-all flex flex-col items-center justify-center p-6 cursor-pointer overflow-hidden ${sourceImage ? 'border-transparent' : 'border-slate-800 hover:border-indigo-500/50 bg-slate-800/20'}`}
            >
              {sourceImage ? (
                <img src={sourceImage} className="w-full h-full object-contain rounded-2xl shadow-2xl" alt="Source" />
              ) : (
                <div className="text-center group">
                  <div className="w-20 h-20 bg-indigo-600/10 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                    <Upload className="text-indigo-400" size={32} />
                  </div>
                  <h4 className="text-lg font-bold text-white mb-2">رفع صورة التصميم</h4>
                  <p className="text-sm text-slate-500">انقر هنا لاختيار صورة من جهازك</p>
                </div>
              )}
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
            </div>
          </div>

          <div className="flex flex-col gap-3 min-h-0 relative">
            <div className="flex items-center justify-between px-2">
              <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                <ImageIcon size={14} /> الرندر الواقعي
              </label>
              {renderedImage && (
                <button 
                  onClick={downloadImage}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded-lg transition-all shadow-lg shadow-indigo-500/20 flex items-center gap-2 text-[10px] font-bold"
                >
                  <Download size={14} /> تحميل الصورة
                </button>
              )}
            </div>

            <div className="flex-1 glass-effect rounded-3xl border border-slate-800 relative overflow-hidden bg-slate-950 flex items-center justify-center group">
              {renderedImage ? (
                <>
                  <img src={renderedImage} className="w-full h-full object-contain animate-in fade-in zoom-in duration-700" alt="Rendered" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                    <button onClick={downloadImage} className="p-4 bg-white/10 hover:bg-white/20 backdrop-blur rounded-full text-white transition-all scale-90 group-hover:scale-100">
                      <Download size={24} />
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center p-8">
                  {isRendering ? (
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mb-4"></div>
                      <h4 className="text-lg font-bold text-white mb-2">جاري المعالجة...</h4>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center opacity-40">
                      <ImageIcon className="text-slate-700 mb-4" size={64} />
                      <p className="text-sm text-slate-600">انتظر النتيجة هنا</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Visualizer;
