
import React from 'react';
import { 
  MessageSquare, 
  Image as ImageIcon, 
  Settings, 
  Compass
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  activeTab: 'chat' | 'visualizer';
  setActiveTab: (tab: 'chat' | 'visualizer') => void;
}

// Custom SVG based on the user's brain-circuit icon
const BrainLogo = () => (
  <svg viewBox="0 0 512 512" className="w-full h-full text-white" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M256 16C123.5 16 16 123.5 16 256s107.5 240 240 240s240-107.5 240-240S388.5 16 256 16zm0 432c-106 0-192-86-192-192S150 64 256 64s192 86 192 192s-86 192-192 192zM128 256c0 17.7 14.3 32 32 32s32-14.3 32-32s-14.3-32-32-32s-32 14.3-32 32zm224 0c0 17.7 14.3 32 32 32s32-14.3 32-32s-14.3-32-32-32s-32 14.3-32 32zm-112 0c0 17.7 14.3 32 32 32s32-14.3 32-32s-14.3-32-32-32s-32 14.3-32 32zM192 160h32v32h-32v-32zm96 0h32v32h-32v-32zm-96 160h32v32h-32v-32zm96 0h32v32h-32v-32z" opacity="0.1"/>
    <path d="M248 112v48h-48c-8.8 0-16 7.2-16 16v48h-32c-17.7 0-32 14.3-32 32v16h32v-16c0-4.4 3.6-8 8-8h32v48c0 8.8 7.2 16 16 16h48v48h16V112h-16zm64 64c-35.3 0-64 28.7-64 64s28.7 64 64 64s64-28.7 64-64s-28.7-64-64-64zm0 96c-17.7 0-32-14.3-32-32s14.3-32 32-32s32 14.3 32 32s-14.3 32-32 32z" />
    <path d="M416 256c0-88.4-71.6-160-160-160v32c70.7 0 128 57.3 128 128s-57.3 128-128 128v32c88.4 0 160-71.6 160-160z" opacity="0.6"/>
  </svg>
);

const Sidebar: React.FC<SidebarProps> = ({ isOpen, activeTab, setActiveTab }) => {
  return (
    <aside className={`fixed inset-y-0 right-0 z-40 w-72 glass-effect border-l border-slate-800/50 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'} md:translate-x-0`}>
      <div className="h-full flex flex-col p-6">
        <div className="flex items-center gap-4 mb-10 group">
          <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-indigo-500/40 logo-glow group-hover:scale-105 transition-transform">
            <div className="w-8 h-8">
              <BrainLogo />
            </div>
          </div>
          <div>
            <h1 className="text-xl font-bold text-white leading-tight tracking-tight">ask amine</h1>
            <p className="text-[10px] text-indigo-400 uppercase tracking-widest font-bold">الخبير الهندسي</p>
          </div>
        </div>

        <nav className="space-y-3 flex-1">
          <button 
            onClick={() => setActiveTab('chat')}
            className={`w-full flex items-center gap-4 px-5 py-3.5 rounded-2xl transition-all duration-300 ${activeTab === 'chat' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-500/20' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'}`}
          >
            <MessageSquare size={20} />
            <span className="font-bold">المحادثة الذكية</span>
          </button>
          <button 
            onClick={() => setActiveTab('visualizer')}
            className={`w-full flex items-center gap-4 px-5 py-3.5 rounded-2xl transition-all duration-300 ${activeTab === 'visualizer' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-500/20' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'}`}
          >
            <ImageIcon size={20} />
            <span className="font-bold">رندر التصاميم</span>
          </button>
        </nav>

        <div className="mt-auto space-y-6">
          <div className="p-5 bg-indigo-500/5 rounded-3xl border border-indigo-500/10">
            <h3 className="text-xs font-bold text-indigo-400 mb-3 flex items-center gap-2">
              <Compass size={14} /> نصيحة اليوم
            </h3>
            <p className="text-[11px] text-slate-400 leading-relaxed italic">
              "الإبداع الهندسي يبدأ من فهم القيود قبل الحلول. اسأل أمين عن توزيع الأحمال أو خامات الواجهات."
            </p>
          </div>
          
          <div className="flex items-center gap-3 pt-4 border-t border-slate-800/50">
            <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-xs font-bold text-indigo-400 border border-slate-700">ME</div>
            <div>
              <p className="text-sm font-bold text-slate-200">المهندس المستخدم</p>
              <p className="text-[10px] text-slate-500 font-medium">حساب احترافي</p>
            </div>
            <Settings className="mr-auto text-slate-500 hover:text-slate-200 cursor-pointer transition-colors" size={18} />
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
