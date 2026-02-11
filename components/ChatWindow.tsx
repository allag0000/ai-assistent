
import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, Loader2, Image as ImageIcon, X, Check, Copy } from 'lucide-react';
import { Message, MessageRole } from '../types';
import { chatWithGemini } from '../services/geminiService';

const ChatWindow: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: MessageRole.ASSISTANT, content: 'مرحباً مهندس. كيف يمكنني مساعدتك في مشروعك الهندسي اليوم؟ يمكننا تحليل المخططات أو مناقشة مواد البناء.', timestamp: new Date() }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isLoading]);

  const handleCopy = (text: string, codeId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(codeId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const parseContent = (content: string, msgId: string) => {
    const codeRegex = /```(?:[a-z]*)?([\s\S]*?)```/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = codeRegex.exec(content)) !== null) {
      if (match.index > lastIndex) {
        parts.push(<p key={`text-${lastIndex}`} className="whitespace-pre-wrap">{content.substring(lastIndex, match.index)}</p>);
      }
      const code = match[1].trim();
      const codeId = `${msgId}-${match.index}`;
      parts.push(
        <div key={`code-${match.index}`} className="my-3 bg-slate-950 rounded-xl border border-slate-800 overflow-hidden group relative" dir="ltr">
          <div className="flex justify-between items-center px-4 py-2 bg-slate-900/50 border-b border-slate-800">
            <span className="text-[10px] font-mono text-slate-500 uppercase">Code Output</span>
            <button onClick={() => handleCopy(code, codeId)} className="text-slate-400 hover:text-indigo-400 transition-colors">
              {copiedId === codeId ? <Check size={12} /> : <Copy size={12} />}
            </button>
          </div>
          <pre className="p-4 overflow-x-auto font-mono text-xs text-emerald-400 leading-relaxed">
            <code>{code}</code>
          </pre>
        </div>
      );
      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < content.length) {
      parts.push(<p key={`text-${lastIndex}`} className="whitespace-pre-wrap">{content.substring(lastIndex)}</p>);
    }

    return parts.length > 0 ? parts : content;
  };

  const handleSend = async () => {
    if ((!input.trim() && !selectedImage) || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: MessageRole.USER,
      content: input,
      image: selectedImage || undefined,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    const currentInput = input;
    const currentImg = selectedImage;
    setInput('');
    setSelectedImage(null);
    setIsLoading(true);

    try {
      const history = messages.slice(-6).map(m => ({
        role: m.role === MessageRole.USER ? 'user' : 'model',
        parts: m.content
      }));
      
      const response = await chatWithGemini(currentInput || "تحليل هندسي للصورة", history, currentImg || undefined);
      
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: MessageRole.ASSISTANT,
        content: response || 'نعتذر، لم نتمكن من الحصول على رد هندسي دقيق.',
        timestamp: new Date()
      }]);
    } catch (err) {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: MessageRole.ASSISTANT,
        content: 'حدث خطأ تقني مؤقت في معالجة طلبك. يرجى المحاولة بعد قليل.',
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-950">
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-6">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === MessageRole.USER ? 'justify-start' : 'justify-end'}`}>
            <div className={`max-w-[85%] flex gap-3 ${msg.role === MessageRole.USER ? 'flex-row' : 'flex-row-reverse'}`}>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border shadow-sm ${msg.role === MessageRole.USER ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400' : 'bg-slate-800 border-slate-700 text-slate-400'}`}>
                {msg.role === MessageRole.USER ? <User size={16} /> : <Bot size={16} />}
              </div>
              <div className="space-y-1">
                <div className={`p-4 rounded-2xl text-sm leading-relaxed ${msg.role === MessageRole.USER ? 'bg-slate-900 border border-slate-800 text-slate-200 shadow-lg' : 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20'}`}>
                  {msg.image && <img src={msg.image} className="max-w-full rounded-lg mb-3 border border-white/10" />}
                  <div className="prose prose-invert max-w-none">
                    {parseContent(msg.content, msg.id)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-end pr-11">
             <div className="bg-indigo-600/10 border border-indigo-500/30 p-3 rounded-2xl flex items-center gap-3">
               <Loader2 size={14} className="animate-spin text-indigo-400" />
               <span className="text-[10px] text-indigo-300 font-bold uppercase tracking-widest">تحليل البيانات...</span>
             </div>
          </div>
        )}
      </div>

      <div className="p-4 bg-slate-950 border-t border-white/5 space-y-3">
        {selectedImage && (
          <div className="relative inline-block ml-2">
            <img src={selectedImage} className="w-16 h-16 object-cover rounded-xl border border-indigo-500/50 p-0.5" />
            <button onClick={() => setSelectedImage(null)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 border-2 border-slate-950 shadow-lg">
              <X size={10} />
            </button>
          </div>
        )}

        <div className="flex items-center gap-2">
          <button onClick={() => fileInputRef.current?.click()} className="w-12 h-12 rounded-xl border border-slate-800 bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-indigo-400 flex items-center justify-center transition-all shadow-inner">
            <ImageIcon size={20} />
          </button>
          <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              const reader = new FileReader();
              reader.onloadend = () => setSelectedImage(reader.result as string);
              reader.readAsDataURL(file);
            }
          }} />
          <div className="flex-1">
            <input 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="اكتب استفسارك الهندسي هنا..."
              className="w-full h-12 bg-slate-900 border border-slate-800 rounded-xl px-4 text-sm text-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
            />
          </div>
          <button 
            onClick={handleSend}
            disabled={(!input.trim() && !selectedImage) || isLoading}
            className="w-12 h-12 bg-indigo-600 text-white rounded-xl flex items-center justify-center disabled:bg-slate-800 disabled:text-slate-600 hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/20 active:scale-95"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;
