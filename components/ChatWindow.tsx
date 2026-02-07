
import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, Loader2, Paperclip, Trash2 } from 'lucide-react';
import { Message, MessageRole } from '../types';
import { chatWithGemini } from '../services/geminiService';

const ChatWindow: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: MessageRole.ASSISTANT,
      content: 'مرحباً! أنا أمين، مساعدك الهندسي. كيف يمكنني مساعدتك اليوم؟',
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
      // Fix: history items should have 'parts' as a string to match the service expectation
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

  const clearChat = () => {
    setMessages([messages[0]]);
  };

  return (
    <div className="flex flex-col h-full bg-slate-900/40">
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 scrollbar-thin scrollbar-thumb-slate-700"
      >
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex items-start gap-4 max-w-4xl mx-auto ${msg.role === MessageRole.USER ? 'flex-row-reverse' : ''}`}
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-md ${msg.role === MessageRole.USER ? 'bg-indigo-600' : 'bg-slate-800 border border-slate-700'}`}>
              {msg.role === MessageRole.USER ? <User size={20} className="text-white" /> : <Bot size={20} className="text-indigo-400" />}
            </div>
            <div className={`flex flex-col gap-2 ${msg.role === MessageRole.USER ? 'items-end' : 'items-start'}`}>
              <div className={`p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${msg.role === MessageRole.USER ? 'bg-indigo-600 text-white rounded-tr-none' : 'glass-effect text-slate-200 rounded-tl-none border border-slate-700/50'}`}>
                {msg.content.split('\n').map((line, i) => (
                  <p key={i} className={i > 0 ? 'mt-2' : ''}>{line}</p>
                ))}
              </div>
              <span className="text-[10px] text-slate-500 font-medium px-2">
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex items-start gap-4 max-w-4xl mx-auto">
            <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center shadow-md">
              <Loader2 size={20} className="text-indigo-400 animate-spin" />
            </div>
            <div className="glass-effect p-4 rounded-2xl rounded-tl-none border border-slate-700/50">
              <div className="flex gap-1.5">
                <div className="w-2 h-2 bg-indigo-500/50 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-indigo-500/50 rounded-full animate-bounce [animation-delay:-0.15s]" />
                <div className="w-2 h-2 bg-indigo-500/50 rounded-full animate-bounce [animation-delay:-0.3s]" />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 md:p-8 bg-slate-950/50 backdrop-blur-md border-t border-slate-800">
        <div className="max-w-4xl mx-auto flex items-end gap-4 relative">
          <button 
            onClick={clearChat}
            className="absolute -top-12 right-0 p-2 text-slate-500 hover:text-red-400 transition-colors flex items-center gap-2 text-xs"
          >
            <Trash2 size={14} /> مسح المحادثة
          </button>
          
          <div className="flex-1 relative group">
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
              placeholder="تحدث مع أمين..."
              className="w-full bg-slate-800/50 text-slate-200 text-sm rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 border border-slate-700 transition-all placeholder:text-slate-500 resize-none min-h-[56px] max-h-32"
            />
          </div>
          
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-800 disabled:text-slate-600 text-white p-4 rounded-2xl transition-all shadow-lg shadow-indigo-500/10 active:scale-95 flex items-center justify-center shrink-0"
          >
            <Send size={24} className={isLoading ? 'opacity-0' : ''} />
            {isLoading && <Loader2 size={24} className="absolute animate-spin" />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;
