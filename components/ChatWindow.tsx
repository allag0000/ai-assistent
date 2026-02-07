import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, Loader2, Trash2 } from 'lucide-react';
import { Message, MessageRole } from '../types';
import { chatWithGemini } from '../services/geminiService';

const ChatWindow: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: MessageRole.ASSISTANT,
      content: 'مرحباً مهندس! أنا أمين. كيف أساعدك في مشروعك اليوم؟',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: MessageRole.USER,
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const history = messages.map(m => ({
        role: m.role === MessageRole.USER ? 'user' : 'model',
        parts: m.content
      }));
      
      const response = await chatWithGemini(input, history);
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: MessageRole.ASSISTANT,
        content: response || 'عذراً، حدث خطأ بسيط.',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-950">
      {/* Messages Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-5 scroll-smooth"
      >
        <div className="flex justify-center mb-4">
           <button onClick={() => setMessages([messages[0]])} className="text-[10px] bg-slate-800/50 text-slate-500 px-3 py-1 rounded-full border border-slate-700 hover:text-red-400 transition-colors flex items-center gap-1.5">
             <Trash2 size={10} /> مسح السجل
           </button>
        </div>

        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex items-start gap-2 ${msg.role === MessageRole.USER ? 'flex-row-reverse' : ''}`}
          >
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 shadow-sm ${msg.role === MessageRole.USER ? 'bg-indigo-600' : 'bg-slate-800 border border-slate-700'}`}>
              {msg.role === MessageRole.USER ? <User size={14} className="text-white" /> : <Bot size={14} className="text-indigo-400" />}
            </div>
            <div className={`flex flex-col gap-1 max-w-[80%] ${msg.role === MessageRole.USER ? 'items-end' : 'items-start'}`}>
              <div className={`p-3 rounded-2xl text-[13px] leading-relaxed ${msg.role === MessageRole.USER ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-slate-900 text-slate-200 rounded-tl-none border border-slate-800'}`}>
                {msg.content}
              </div>
              <span className="text-[9px] text-slate-600 font-medium px-1">
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex items-start gap-2">
            <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center">
              <Loader2 size={14} className="text-indigo-400 animate-spin" />
            </div>
            <div className="bg-slate-900 p-3 rounded-2xl rounded-tl-none border border-slate-800">
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 bg-indigo-500/50 rounded-full animate-bounce" />
                <div className="w-1.5 h-1.5 bg-indigo-500/50 rounded-full animate-bounce [animation-delay:-0.15s]" />
                <div className="w-1.5 h-1.5 bg-indigo-500/50 rounded-full animate-bounce [animation-delay:-0.3s]" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input Area - Optimized for Mobile */}
      <div className="p-3 bg-slate-950 border-t border-white/5 pb-24">
        <div className="flex items-center gap-2 bg-slate-900/50 border border-slate-800 p-1.5 rounded-2xl focus-within:border-indigo-500/50 transition-all">
          <textarea
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="اسأل أمين..."
            className="flex-1 bg-transparent text-slate-200 text-sm px-3 py-2 focus:outline-none resize-none placeholder:text-slate-600 max-h-24"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-800 disabled:text-slate-600 text-white p-2.5 rounded-xl transition-all shadow-lg shadow-indigo-500/10 shrink-0"
          >
            {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;