import React, { useState } from 'react';
import { 
  MessageSquare, 
  Image as ImageIcon,
  Settings,
  Sparkles
} from 'lucide-react';
import ChatWindow from './components/ChatWindow';
import Visualizer from './components/Visualizer';

const HeaderLogo = () => (
  <svg viewBox="0 0 512 512" className="w-full h-full text-indigo-400" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M248 112v48h-48c-8.8 0-16 7.2-16 16v48h-32c-17.7 0-32 14.3-32 32v16h32v-16c0-4.4 3.6-8 8-8h32v48c0 8.8 7.2 16 16 16h48v48h16V112h-16zm64 64c-35.3 0-64 28.7-64 64s28.7 64 64 64s64-28.7 64-64s-28.7-64-64-64zm0 96c-17.7 0-32-14.3-32-32s14.3-32 32-32s32 14.3 32 32s-14.3 32-32 32z" />
  </svg>
);

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'chat' | 'visualizer'>('chat');

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-200 font-sans select-none" dir="rtl">
      {/* App Header - More Compact */}
      <header className="h-16 glass-effect flex items-center justify-between px-5 border-b border-white/5 shrink-0 z-20">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 p-1.5 bg-indigo-500/10 rounded-lg flex items-center justify-center border border-indigo-500/20 shadow-inner">
            <HeaderLogo />
          </div>
          <div>
            <h1 className="text-sm font-bold text-white tracking-tight">أمين - AI</h1>
            <div className="flex items-center gap-1.5 text-[9px] text-emerald-400 font-bold uppercase">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              متصل الآن
            </div>
          </div>
        </div>
        <button className="p-2 text-slate-400 hover:text-white transition-colors">
          <Settings size={18} />
        </button>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-hidden relative pb-20">
        {activeTab === 'chat' ? (
          <ChatWindow />
        ) : (
          <Visualizer />
        )}
      </main>

      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 h-20 glass-effect border-t border-white/5 flex items-center justify-around px-4 pb-2 z-30">
        <button 
          onClick={() => setActiveTab('chat')}
          className={`flex flex-col items-center gap-1 transition-all duration-300 ${activeTab === 'chat' ? 'text-indigo-400 scale-110' : 'text-slate-500'}`}
        >
          <div className={`p-2 rounded-xl transition-colors ${activeTab === 'chat' ? 'bg-indigo-500/10' : ''}`}>
            <MessageSquare size={22} />
          </div>
          <span className="text-[10px] font-bold">المحادثة</span>
        </button>

        <div className="relative -top-6">
           <div className="absolute inset-0 bg-indigo-600 blur-xl opacity-20 animate-pulse" />
           <div className="w-14 h-14 bg-indigo-600 rounded-full flex items-center justify-center shadow-xl shadow-indigo-600/40 border-4 border-slate-950 relative z-10">
              <Sparkles className="text-white" size={24} />
           </div>
        </div>

        <button 
          onClick={() => setActiveTab('visualizer')}
          className={`flex flex-col items-center gap-1 transition-all duration-300 ${activeTab === 'visualizer' ? 'text-indigo-400 scale-110' : 'text-slate-500'}`}
        >
          <div className={`p-2 rounded-xl transition-colors ${activeTab === 'visualizer' ? 'bg-indigo-500/10' : ''}`}>
            <ImageIcon size={22} />
          </div>
          <span className="text-[10px] font-bold">الرندر</span>
        </button>
      </nav>
    </div>
  );
};

export default App;