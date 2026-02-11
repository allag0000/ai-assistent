
import React, { useState, useRef, useEffect } from 'react';
import { 
  Upload, 
  Download, 
  Loader2, 
  Cpu, 
  RotateCcw, 
  AlertCircle, 
  Zap,
  Layers,
  Maximize
} from 'lucide-react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { generate3DModelFile } from '../services/geminiService';

interface PrimitiveData {
  name: string;
  type: 'box' | 'cylinder' | 'sphere';
  dimensions: { width?: number; height?: number; depth?: number; radius?: number };
  position: { x: number; y: number; z: number };
  rotation?: { x: number; y: number; z: number };
  symmetry?: 'none' | 'quadrant' | 'mirror_x';
}

const ModelViewer: React.FC<{ modelData: { primitives: PrimitiveData[] } }> = ({ modelData }) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current || !modelData || !Array.isArray(modelData.primitives)) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x020617);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(5, 5, 5);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    scene.add(new THREE.AmbientLight(0xffffff, 0.5));
    const light1 = new THREE.DirectionalLight(0xffffff, 1);
    light1.position.set(5, 10, 7);
    scene.add(light1);
    
    const grid = new THREE.GridHelper(10, 10, 0x1e293b, 0x0f172a);
    scene.add(grid);

    const group = new THREE.Group();
    const material = new THREE.MeshPhysicalMaterial({ 
      color: 0x6366f1, 
      metalness: 0.1, 
      roughness: 0.5,
      clearcoat: 1.0,
      reflectivity: 0.5
    });

    const geometries: THREE.BufferGeometry[] = [];

    modelData.primitives.forEach((p) => {
      if (!p) return;

      const dims = p.dimensions || {};
      const pos = p.position || { x: 0, y: 0, z: 0 };
      const rot = p.rotation || { x: 0, y: 0, z: 0 };
      
      let geometry: THREE.BufferGeometry;
      
      switch(p.type) {
        case 'cylinder':
          geometry = new THREE.CylinderGeometry(dims.radius || 0.1, dims.radius || 0.1, dims.height || 1, 32);
          break;
        case 'sphere':
          geometry = new THREE.SphereGeometry(dims.radius || 0.5, 32, 32);
          break;
        default:
          geometry = new THREE.BoxGeometry(dims.width || 1, dims.height || 1, dims.depth || 1);
      }

      geometries.push(geometry);

      const createMesh = (targetPos: {x: number, y: number, z: number}) => {
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(targetPos.x, targetPos.y, targetPos.z);
        mesh.rotation.set(rot.x || 0, rot.y || 0, rot.z || 0);
        return mesh;
      };

      if (p.symmetry === 'quadrant') {
        const offsets = [[1, 1], [1, -1], [-1, 1], [-1, -1]];
        offsets.forEach(([mx, mz]) => {
          group.add(createMesh({ x: pos.x * mx, y: pos.y, z: pos.z * mz }));
        });
      } else if (p.symmetry === 'mirror_x') {
        group.add(createMesh(pos));
        group.add(createMesh({ x: -pos.x, y: pos.y, z: pos.z }));
      } else {
        group.add(createMesh(pos));
      }
    });

    scene.add(group);

    const animate = () => {
      const id = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
      return id;
    };
    const animId = animate();

    return () => {
      cancelAnimationFrame(animId);
      if (mountRef.current && renderer.domElement.parentNode === mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
      geometries.forEach(g => g.dispose());
      material.dispose();
    };
  }, [modelData]);

  return (
    <div className="relative w-full h-full rounded-[2rem] overflow-hidden bg-slate-900 border border-white/5 shadow-2xl">
      <div ref={mountRef} className="w-full h-full" />
      <div className="absolute top-4 right-4 flex flex-col gap-2">
         <div className="bg-slate-950/80 backdrop-blur-sm p-2 rounded-lg border border-white/10 flex items-center gap-2 text-[8px] font-bold text-indigo-400 uppercase tracking-widest">
            <Maximize size={10} /> LiDAR Analysis Active
         </div>
      </div>
    </div>
  );
};

const ThreeDFactory: React.FC = () => {
  const [image, setImage] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [modelData, setModelData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [genStep, setGenStep] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setModelData(null);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!image || isGenerating) return;
    setIsGenerating(true);
    setError(null);
    
    try {
      setGenStep('Analysing Primitives...');
      const result = await generate3DModelFile(image, description);
      const data = JSON.parse(result);
      
      if (!data.primitives) throw new Error("لم يتم العثور على بيانات هندسية صالحة");

      setGenStep('Reconstructing Geometry...');
      setTimeout(() => {
        setModelData(data);
        setIsGenerating(false);
      }, 800);

    } catch (err: any) {
      setError("فشل التحليل الهندسي. تأكد من ضبط API_KEY في إعدادات Netlify.");
      setIsGenerating(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-slate-950 overflow-y-auto pb-32 px-5 pt-8 gap-6">
      <div className="text-center space-y-1">
        <h2 className="text-lg font-bold text-white flex items-center justify-center gap-2">
          <Layers className="text-indigo-400" size={20} /> مصنع النماذج LiDAR
        </h2>
        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">تحليل الكتلة وإعادة البناء الهندسي</p>
      </div>

      {!modelData ? (
        <div 
          onClick={() => !image && fileInputRef.current?.click()}
          className={`aspect-square relative rounded-[2.5rem] border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all ${image ? 'border-indigo-500 bg-indigo-500/5' : 'border-slate-800 bg-slate-900/30 hover:border-indigo-500'}`}
        >
          {image ? (
            <img src={image} className="w-full h-full object-contain p-4 rounded-[2.5rem]" alt="Preview" />
          ) : (
            <div className="text-center space-y-2">
              <div className="w-14 h-14 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-2 border border-slate-700">
                <Upload className="text-slate-500" size={24} />
              </div>
              <p className="text-[10px] text-slate-500 font-bold">ارفع صورة الأثاث أو القطعة</p>
            </div>
          )}
          <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
        </div>
      ) : (
        <div className="aspect-square">
          <ModelViewer modelData={modelData} />
        </div>
      )}

      {isGenerating ? (
        <div className="p-10 text-center bg-slate-900/50 rounded-3xl border border-indigo-500/20">
          <div className="relative w-12 h-12 mx-auto mb-4">
             <div className="absolute inset-0 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
             <Cpu className="absolute inset-0 m-auto text-indigo-400 animate-pulse" size={16} />
          </div>
          <p className="text-xs text-white font-bold tracking-widest uppercase mb-1">{genStep}</p>
          <p className="text-[8px] text-slate-500 font-medium">Symmetry & Topology Logic Applied</p>
        </div>
      ) : modelData ? (
        <div className="flex gap-4">
          <button 
            onClick={() => alert("سيتم تصدير ملف OBJ نظيف قريباً بناءً على هذه الإحداثيات.")}
            className="flex-1 bg-indigo-600 text-white text-xs font-bold py-5 rounded-2xl flex items-center justify-center gap-2 shadow-xl"
          >
            <Download size={18} /> تحميل OBJ نظيف
          </button>
          <button onClick={() => setModelData(null)} className="bg-slate-800 text-slate-400 px-6 rounded-2xl">
            <RotateCcw size={20} />
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <textarea 
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="وصف القطعة (مثال: كرسي مكتب بـ 5 أرجل، طاولة خشبية مستديرة...)"
            className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-4 text-xs text-slate-200 outline-none focus:border-indigo-500 h-24"
          />
          <button 
            onClick={handleGenerate}
            disabled={!image}
            className="w-full bg-indigo-600 disabled:bg-slate-800 text-white text-sm font-bold py-5 rounded-2xl flex items-center justify-center gap-2 shadow-lg"
          >
            <Zap size={20} /> بدء التحليل الهندسي
          </button>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-[10px] text-center font-bold flex items-center gap-2 justify-center">
          <AlertCircle size={14} />
          {error}
        </div>
      )}
    </div>
  );
};

export default ThreeDFactory;
