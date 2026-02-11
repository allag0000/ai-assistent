
// Import React to provide namespace for FC and ChangeEvent types
import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, Loader2, Trash2, Image as ImageIcon, X, Check, Copy } from 'lucide-react';
import { Message, MessageRole } from '../types';
import { chatWithGemini } from '../services/geminiService';

const ChatWindow: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: MessageRole.ASSISTANT, content: 'مرحباً مهندس. أنا ASK AMINE AI، مساعدك الهندسي المتكامل. يمكنك طرح الأسئلة أو رفع المخططات لتحليلها. كيف يمكنني مساعدتك؟', timestamp: new Date() }
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
    const codeRegex = /```(?:ruby|obj|svg|html)?([\s\S]*?)```/g;
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
            <span className="text-[10px] font-mono text-slate-500 uppercase">Code Block</span>
            <button 
              onClick={() => handleCopy(code, codeId)}
              className="text-slate-400 hover:text-indigo-400 transition-colors flex items-center gap-1 text-[10px]"
            >
              {copiedId === codeId ? <Check size={12} /> : <Copy size={12} />}
              {copiedId === codeId ? 'تم النسخ' : 'نسخ'}
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

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setSelectedImage(reader.result as string);
      reader.readAsDataURL(file);
    }
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
      
      const response = await chatWithGemini(currentInput || "تحليل الصورة المرفقة", history, currentImg || undefined);
      
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: MessageRole.ASSISTANT,
        content: response || 'No response.',
        timestamp: new Date()
      }]);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-950">
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-5">
        <div className="flex justify-center mb-4">
           <button onClick={() => setMessages([messages[0]])} className="text-[10px] bg-slate-800/50 text-slate-500 px-3 py-1 rounded-full border border-slate-700 hover:text-red-400 flex items-center gap-1.5 transition-all">
             <Trash2 size={10} /> مسح السجل
           </button>
        </div>

        {messages.map((msg) => (
          <div key={msg.id} className={`flex items-start gap-2 ${msg.role === MessageRole.USER ? 'flex-row-reverse' : ''}`}>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${msg.role === MessageRole.USER ? 'bg-indigo-600 shadow-lg shadow-indigo-600/20' : 'bg-slate-800 border border-slate-700'}`}>
              {msg.role === MessageRole.USER ? <User size={14} className="text-white" /> : <Bot size={14} className="text-indigo-400" />}
            </div>
            <div className={`flex flex-col gap-1 max-w-[85%] ${msg.role === MessageRole.USER ? 'items-end' : 'items-start'}`}>
              {msg.image && (
                <div className="relative group">
                  <img src={msg.image} className="w-64 rounded-xl border border-white/10 mb-1 shadow-2xl" alt="Media content" />
                </div>
              )}
              {msg.content && (
                <div className={`p-3 rounded-2xl text-[13px] leading-relaxed shadow-sm ${msg.role === MessageRole.USER ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-slate-900 text-slate-200 rounded-tl-none border border-slate-800'}`}>
                  {parseContent(msg.content, msg.id)}
                </div>
              )}
              <span className="text-[8px] text-slate-600 px-1 uppercase font-bold">{msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex items-start gap-2 animate-pulse">
            <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center">
              <Loader2 size={14} className="text-indigo-400 animate-spin" />
            </div>
            <div className="bg-slate-900 h-10 w-48 rounded-2xl border border-slate-800 flex items-center px-4 gap-2">
               <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">جاري معالجة طلبك...</span>
            </div>
          </div>
        )}
      </div>

      <div className="p-3 bg-slate-950 border-t border-white/5 pb-24">
        {selectedImage && (
          <div className="mb-2 relative w-16 h-16 group">
            <img src={selectedImage} className="w-full h-full object-cover rounded-lg border-2 border-indigo-500 shadow-lg" alt="Preview" />
            <button onClick={() => setSelectedImage(null)} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 shadow-lg border border-slate-950">
              <X size={10} />
            </button>
          </div>
        )}
        <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 p-1.5 rounded-2xl focus-within:border-indigo-500/50 transition-all shadow-inner">
          <button 
            onClick={() => fileInputRef.current?.click()} 
            className="p-2 text-slate-400 hover:text-indigo-400 transition-colors shrink-0"
            title="إرفاق صورة"
          >
            <ImageIcon size={20} />
          </button>
          <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageSelect} />
          
          <textarea
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
            placeholder="اسأل ASK AMINE AI عن أي موضوع هندسي..."
            className="flex-1 bg-transparent text-slate-200 text-sm px-2 py-2 focus:outline-none resize-none placeholder:text-slate-600"
          />

          <button
            onClick={handleSend}
            disabled={(!input.trim() && !selectedImage) || isLoading}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-800 disabled:text-slate-600 text-white p-2.5 rounded-xl transition-all shadow-lg shrink-0"
          >
            {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;
