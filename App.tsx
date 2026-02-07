
import React, { useState } from 'react';
import { 
  Menu, 
  X
} from 'lucide-react';
import Sidebar from './components/Sidebar';
import ChatWindow from './components/ChatWindow';
import Visualizer from './components/Visualizer';

// Custom SVG matching the new logo style
const HeaderLogo = () => (
  <svg viewBox="0 0 512 512" className="w-full h-full text-indigo-400" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M248 112v48h-48c-8.8 0-16 7.2-16 16v48h-32c-17.7 0-32 14.3-32 32v16h32v-16c0-4.4 3.6-8 8-8h32v48c0 8.8 7.2 16 16 16h48v48h16V112h-16zm64 64c-35.3 0-64 28.7-64 64s28.7 64 64 64s64-28.7 64-64s-28.7-64-64-64zm0 96c-17.7 0-32-14.3-32-32s14.3-32 32-32s32 14.3 32 32s-14.3 32-32 32z" />
  </svg>
);

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'chat' | 'visualizer'>('chat');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen bg-slate-950 text-slate-200 overflow-hidden font-sans">
      {/* Mobile Toggle */}
      <button 
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-slate-800 rounded-lg shadow-lg border border-slate-700"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar Component */}
      <Sidebar 
        isOpen={isSidebarOpen} 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
      />

      {/* Main Content */}
      <main className={`flex-1 flex flex-col transition-all duration-500 ease-in-out ${isSidebarOpen ? 'md:mr-72' : 'mr-0'}`}>
        {/* Header */}
        <header className="h-20 glass-effect flex items-center justify-between px-8 border-b border-white/5 sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 p-2 bg-indigo-500/10 rounded-xl flex items-center justify-center border border-indigo-500/20 shadow-inner">
              <HeaderLogo />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight text-white">
                {activeTab === 'chat' ? 'المساعد الهندسي' : 'مُصوّر الرندر'}
              </h2>
              <p className="text-[10px] text-slate-500 font-medium hidden sm:block">بواسطة الذكاء الاصطناعي - ask amine</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-emerald-500/10 text-emerald-400 px-3 py-1.5 rounded-xl border border-emerald-500/20 text-xs font-bold">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              أمين متصل الآن
            </div>
          </div>
        </header>

        {/* Dynamic View */}
        <div className="flex-1 overflow-hidden relative">
          {activeTab === 'chat' ? (
            <ChatWindow />
          ) : (
            <Visualizer />
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
