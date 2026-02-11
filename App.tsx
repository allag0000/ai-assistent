
import React, { useState } from 'react';
import { 
  MessageSquare as MsgIcon, 
  Image as ImgIcon, 
  Box as BoxIcon, 
  Sparkles as SparkIcon, 
  PenTool as PlanIcon
} from 'lucide-react';
import ChatWindow from './components/ChatWindow';
import Visualizer from './components/Visualizer';
import ThreeDFactory from './components/ThreeDFactory';
import VectorFactory from './components/VectorFactory';

const HeaderLogo = () => (
  <svg viewBox="0 0 512 512" className="w-full h-full text-indigo-400" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M248 112v48h-48c-8.8 0-16 7.2-16 16v48h-32c-17.7 0-32 14.3-32 32v16h32v-16c0-4.4 3.6-8 8-8h32v48c0 8.8 7.2 16 16 16h48v48h16V112h-16zm64 64c-35.3 0-64 28.7-64 64s28.7 64 64 64s64-28.7 64-64s-28.7-64-64-64zm0 96c-17.7 0-32-14.3-32-32s14.3-32 32-32s32 14.3 32 32s-14.3 32-32 32z" />
  </svg>
);

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'chat' | 'visualizer' | '3dfactory' | 'plans'>('chat');

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-200 font-sans select-none" dir="rtl">
      <header className="h-16 glass-effect flex items-center justify-between px-6 border-b border-white/5 shrink-0 z-20">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 p-2 bg-indigo-500/10 rounded-xl flex items-center justify-center border border-indigo-500/20 shadow-inner">
            <HeaderLogo />
          </div>
          <div>
            <h1 className="text-base font-bold text-white tracking-tight">ASK AMINE AI</h1>
            <div className="flex items-center gap-1.5 text-[9px] text-emerald-400 font-bold uppercase tracking-wider">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
              النظام الهندسي نشط
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/50 border border-white/5 text-[10px] text-slate-400 font-medium">
          V 2.0 Pro
        </div>
      </header>

      <main className="flex-1 overflow-hidden relative pb-20">
        {activeTab === 'chat' && <ChatWindow />}
        {activeTab === 'visualizer' && <Visualizer />}
        {activeTab === '3dfactory' && <ThreeDFactory />}
        {activeTab === 'plans' && <VectorFactory />}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 h-20 glass-effect border-t border-white/5 flex items-center justify-around px-2 pb-2 z-30">
        <button onClick={() => setActiveTab('chat')} className={`flex flex-col items-center gap-1.5 transition-all duration-300 ${activeTab === 'chat' ? 'text-indigo-400 scale-110' : 'text-slate-500'}`}>
          <div className={`p-2.5 rounded-2xl transition-all ${activeTab === 'chat' ? 'bg-indigo-500/15 shadow-[0_0_20px_rgba(99,102,241,0.2)]' : ''}`}>
            <MsgIcon size={20} />
          </div>
          <span className="text-[9px] font-bold">الدردشة</span>
        </button>
        
        <button onClick={() => setActiveTab('visualizer')} className={`flex flex-col items-center gap-1.5 transition-all duration-300 ${activeTab === 'visualizer' ? 'text-indigo-400 scale-110' : 'text-slate-500'}`}>
          <div className={`p-2.5 rounded-2xl transition-all ${activeTab === 'visualizer' ? 'bg-indigo-500/15 shadow-[0_0_20px_rgba(99,102,241,0.2)]' : ''}`}>
            <ImgIcon size={20} />
          </div>
          <span className="text-[9px] font-bold">الرندر</span>
        </button>

        <div className="relative -top-6 group">
           <div className="absolute inset-0 bg-indigo-600 blur-2xl opacity-20 group-hover:opacity-40 transition-opacity" />
           <div className="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center shadow-2xl shadow-indigo-600/40 border-4 border-slate-950 relative z-10 transform active:scale-90 transition-transform cursor-pointer">
              <SparkIcon className="text-white" size={28} />
           </div>
        </div>

        <button onClick={() => setActiveTab('plans')} className={`flex flex-col items-center gap-1.5 transition-all duration-300 ${activeTab === 'plans' ? 'text-indigo-400 scale-110' : 'text-slate-500'}`}>
          <div className={`p-2.5 rounded-2xl transition-all ${activeTab === 'plans' ? 'bg-indigo-500/15 shadow-[0_0_20px_rgba(99,102,241,0.2)]' : ''}`}>
            <PlanIcon size={20} />
          </div>
          <span className="text-[9px] font-bold">المخططات</span>
        </button>

        <button onClick={() => setActiveTab('3dfactory')} className={`flex flex-col items-center gap-1.5 transition-all duration-300 ${activeTab === '3dfactory' ? 'text-indigo-400 scale-110' : 'text-slate-500'}`}>
          <div className={`p-2.5 rounded-2xl transition-all ${activeTab === '3dfactory' ? 'bg-indigo-500/15 shadow-[0_0_20px_rgba(99,102,241,0.2)]' : ''}`}>
            <BoxIcon size={20} />
          </div>
          <span className="text-[9px] font-bold">مصنع 3D</span>
        </button>
      </nav>
    </div>
  );
};

export default App;
