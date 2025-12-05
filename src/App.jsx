import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Upload, Download, RefreshCw, Sliders, Image as ImageIcon, Zap, Layers, Circle, Grid, Activity, Move, Palette, Disc, MousePointer2, Hand, Settings, Menu, X, RotateCcw, Info, Square, Triangle, Eye, EyeOff, LayoutTemplate, Droplet, Check, ArrowRight, Crop, Lock, Maximize, AlertTriangle, ShieldCheck, Printer, Megaphone, Plus, ChevronUp, ChevronDown, HelpCircle, Mail } from 'lucide-react';

/**
 * IF Studio - Advanced Halftone & Spiral Image Engine
 * v12.0 - Independent Settings, Crop Optimization, and Mobile Download Tab.
 */

// --- Constants ---
const THEME_COLOR = '#3B82F6'; // Electric Blue

// --- Components ---

const Tooltip = ({ text }) => (
  <div className="group relative inline-block ml-2">
    <Info size={12} className="text-gray-400 hover:text-[#3B82F6] transition-colors cursor-help" />
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-40 p-2 bg-white border border-gray-200 text-[10px] text-gray-600 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 pointer-events-none text-center leading-relaxed">
      {text}
      <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-white" />
    </div>
  </div>
);

const Slider = ({ label, value, min, max, step, onChange, icon: Icon, highlight, formatValue, tooltip }) => (
  <div className="mb-3 md:mb-5 group">
    <div className="flex justify-between items-center mb-1">
      <div className={`flex items-center gap-1.5 text-xs md:text-sm font-semibold ${highlight ? 'text-blue-600' : 'text-gray-600'}`}>
        {Icon && <Icon size={14} className={`md:w-4 md:h-4 ${highlight ? "text-[#3B82F6]" : "text-gray-400"}`} />}
        {label}
        {tooltip && <Tooltip text={tooltip} />}
      </div>
      <span className="text-[10px] md:text-xs text-gray-500 font-mono bg-gray-100 px-1.5 py-0.5 rounded border border-gray-200">
        {formatValue ? formatValue(value) : (typeof value === 'number' ? value.toFixed(step < 1 ? 2 : 0) : value)}
      </span>
    </div>
    <div className="relative h-5 md:h-6 flex items-center">
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="absolute w-full h-1.5 md:h-2 bg-gray-200 rounded-full appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/50 z-10"
        style={{
            backgroundImage: `linear-gradient(${THEME_COLOR}, ${THEME_COLOR})`,
            backgroundSize: `${((value - min) * 100) / (max - min)}% 100%`,
            backgroundRepeat: 'no-repeat'
        }}
      />
      <style>{`
        input[type=range]::-webkit-slider-thumb {
            -webkit-appearance: none;
            height: 14px;
            width: 14px;
            border-radius: 50%;
            background: #ffffff;
            border: 2px solid #3B82F6;
            cursor: pointer;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            margin-top: 0px; 
        }
        input[type=range]::-moz-range-thumb {
            height: 14px;
            width: 14px;
            border: 2px solid #3B82F6;
            border-radius: 50%;
            background: #ffffff;
            cursor: pointer;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        @media (min-width: 768px) {
            input[type=range]::-webkit-slider-thumb { height: 18px; width: 18px; box-shadow: 0 2px 5px rgba(0,0,0,0.15); }
            input[type=range]::-moz-range-thumb { height: 18px; width: 18px; box-shadow: 0 2px 5px rgba(0,0,0,0.15); }
        }
      `}</style>
    </div>
  </div>
);

const ModeButton = ({ active, onClick, icon: Icon, label }) => (
  <button
    onClick={onClick}
    className={`flex-1 flex flex-col items-center justify-center py-2 px-1 md:py-3 md:px-2 rounded-xl transition-all border duration-200 active:scale-95 ${
      active
        ? 'bg-blue-50 border-blue-500 text-blue-600 shadow-sm ring-1 ring-blue-500'
        : 'bg-white border-gray-200 text-gray-500 hover:border-blue-300 hover:text-blue-500'
    }`}
  >
    <Icon size={20} className="mb-1 md:mb-1.5 md:w-6 md:h-6" />
    <span className="text-[10px] md:text-xs font-bold tracking-wide">{label}</span>
  </button>
);

const ShapeButton = ({ active, onClick, icon: Icon, label, rotateIcon }) => (
    <button
      onClick={onClick}
      className={`flex-1 flex items-center justify-center p-2 md:p-2.5 rounded-lg transition-all border duration-200 active:scale-95 ${
        active
          ? 'bg-blue-50 border-blue-500 text-blue-600'
          : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
      }`}
      title={label}
    >
      <Icon size={16} className={`md:w-[18px] md:h-[18px] ${rotateIcon ? "rotate-45" : ""}`} />
    </button>
  );

const ColorPicker = ({ label, value, onChange, disabled }) => (
    <div className={`flex items-center justify-between p-2 md:p-3 rounded-xl border border-gray-200 bg-gray-50/50 transition-colors ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-blue-300'}`}>
        <span className="text-xs md:text-sm font-medium text-gray-600">{label}</span>
        <div className="flex items-center gap-2 md:gap-3">
            <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">{value}</span>
            <div className="relative w-6 h-6 md:w-8 md:h-8 rounded-full overflow-hidden border border-gray-300 shadow-sm ring-1 ring-white cursor-pointer hover:scale-105 transition-transform">
                <input 
                    type="color" 
                    value={value} 
                    onChange={(e) => onChange(e.target.value)}
                    disabled={disabled}
                    className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] cursor-pointer p-0 border-0"
                />
            </div>
        </div>
    </div>
);

const Toggle = ({ label, active, onToggle, icon: Icon, description }) => (
  <button
    onClick={onToggle}
    className={`w-full flex items-center justify-between p-2.5 md:p-3 rounded-xl border transition-all duration-200 text-left active:scale-[0.99] ${
      active
        ? 'bg-blue-50 border-blue-200 text-blue-700'
        : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
    }`}
  >
    <div className="flex items-center gap-2 md:gap-3">
        {Icon && <Icon size={16} className={`md:w-[18px] md:h-[18px] ${active ? "text-blue-600" : "text-gray-400"}`} />}
        <div>
            <span className="text-xs md:text-sm font-semibold block">{label}</span>
            {description && <span className="text-[10px] opacity-70 font-normal block mt-0.5">{description}</span>}
        </div>
    </div>
    <div className={`w-8 h-4 md:w-10 md:h-5 rounded-full relative transition-colors duration-300 flex-shrink-0 ${active ? 'bg-[#3B82F6]' : 'bg-gray-300'}`}>
      <div className={`absolute top-0.5 md:top-1 w-3 h-3 md:w-3 md:h-3 bg-white rounded-full transition-transform duration-300 shadow-sm ${active ? 'translate-x-4 md:translate-x-6' : 'translate-x-0.5 md:translate-x-1'}`} />
    </div>
  </button>
);

const StatusToast = ({ toast, onClose }) => {
    if (!toast || !toast.message) return null;
    const isError = toast.type === 'error';
    return (
        <div className={`absolute top-16 md:top-6 left-1/2 -translate-x-1/2 z-[70] px-4 py-2 md:px-6 md:py-3 rounded-full shadow-xl backdrop-blur flex items-center gap-2 md:gap-3 animate-in slide-in-from-top-4 fade-in duration-300 max-w-[90%] w-auto mx-auto ${isError ? 'bg-red-500 text-white' : 'bg-emerald-600 text-white'}`}>
            {isError ? <AlertTriangle size={16} /> : <Check size={16} />}
            <span className="text-xs md:text-sm font-medium whitespace-nowrap">{toast.message}</span>
            <button onClick={onClose} className="p-0.5 md:p-1 hover:bg-white/20 rounded-full transition-colors">
                <X size={14} />
            </button>
        </div>
    )
}

const AboutModal = ({ isOpen, onClose }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
           <div className="bg-white rounded-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto shadow-2xl flex flex-col relative animate-in zoom-in-95 duration-200">
              <button onClick={onClose} className="absolute top-3 right-3 p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors text-gray-500"><X size={18}/></button>
              
              <div className="p-6 md:p-8 space-y-5">
                 <div className="text-center space-y-2">
                     <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg shadow-blue-200">
                         <Activity className="text-white" size={20}/>
                     </div>
                     <h2 className="text-xl md:text-2xl font-bold text-gray-900">IF Studio <span className="text-gray-400 text-base md:text-lg font-normal block md:inline">(insert fabrication)</span></h2>
                     <p className="text-xs md:text-sm text-gray-500 max-w-xs mx-auto">A simple creative tool turning ordinary images into bold, stylized artwork.</p>
                 </div>

                 <div className="space-y-3 text-xs md:text-sm text-gray-600 leading-relaxed border-t border-gray-100 pt-4">
                    <p>Built for makers, designers, and anyone who wants fast visual effects without complicated software. Generate spiral art, halftone patterns, and other experimental styles in just a few steps.</p>
                    <p className="font-semibold text-emerald-600 bg-emerald-50 p-2 rounded-lg text-center">All downloads are free for both personal and commercial use.</p>
                 </div>

                 <div className="grid grid-cols-1 gap-3">
                     <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                         <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2 text-xs md:text-sm"><Settings size={14} className="text-blue-500"/> What this platform offers</h3>
                         <ul className="text-[10px] md:text-xs text-gray-500 space-y-1 list-disc list-inside">
                             <li>Clean, high-quality outputs</li>
                             <li>Adjustable density, contrast, and styling controls</li>
                             <li>Ready-to-use files for laser cutting, CNC routing, vinyl work, print, and 3D printing</li>
                             <li>Works directly in your browser, no signup required</li>
                         </ul>
                     </div>
                     <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                         <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2 text-xs md:text-sm"><Hand size={14} className="text-purple-500"/> Who it’s for</h3>
                         <p className="text-[10px] md:text-xs text-gray-500 leading-relaxed">People who enjoy creating. Whether you're running a workshop, crafting at home, or experimenting with digital art, IF Studio keeps the process simple.</p>
                     </div>
                 </div>

                 <div className="text-[10px] md:text-xs text-gray-400 pt-4 border-t border-gray-100 text-center space-y-1">
                     <p>Designed and maintained by IF Studio as an independent creative project.</p>
                     <p>Every feature is built with the goal of helping makers turn ideas into visuals quickly.</p>
                     <div className="pt-2">
                        <p className="font-bold text-gray-500">Contact</p>
                        <p className="font-mono text-blue-500">Mail: insertfabrication</p>
                     </div>
                 </div>
              </div>
           </div>
        </div>
    )
}

// --- Helper Functions ---
const hexToRgb = (hex) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 0, g: 0, b: 0 };
};

// --- Main Application ---

export default function IFStudio() {
  // --- State ---
  const [imageSrc, setImageSrc] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [toast, setToast] = useState({ message: null, type: 'info' });
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showAbout, setShowAbout] = useState(false);
  
  // Mobile Navigation State
  const [activeTab, setActiveTab] = useState('pattern'); 

  // Workflow State
  const [step, setStep] = useState('upload'); 
  
  // App Config (SHARED)
  const [mode, setMode] = useState('spiral'); 
  const [frameShape, setFrameShape] = useState('circle'); 
  const [compareMode, setCompareMode] = useState(false); 
  const [transparentBg, setTransparentBg] = useState(false); 
  
  // Independent Mode Settings
  const [modeSettings, setModeSettings] = useState({
      spiral: { rings: 60, thickness: 0.5, rotation: 0, dotShape: 'circle' },
      lines:  { rings: 60, thickness: 0.5, rotation: 0, dotShape: 'circle' },
      dots:   { rings: 60, thickness: 0.5, rotation: 0, dotShape: 'circle' }
  });

  // Helper to update current mode's settings
  const updateSetting = (key, value) => {
      setModeSettings(prev => ({
          ...prev,
          [mode]: { ...prev[mode], [key]: value }
      }));
  };

  // Getters for current mode (Clean syntax in render)
  const rings = modeSettings[mode].rings;
  const lineThickness = modeSettings[mode].thickness;
  const rotation = modeSettings[mode].rotation;
  const dotShape = modeSettings[mode].dotShape;
  
  // 3D Print Settings
  const [is3DMode, setIs3DMode] = useState(false);
  const [printWidth, setPrintWidth] = useState(200); 
  const [minThickness, setMinThickness] = useState(0.32); 
  
  // Physics (Layout)
  const [scale, setScale] = useState(1); 
  const [panX, setPanX] = useState(50); 
  const [panY, setPanY] = useState(50); 
  const [centerHole, setCenterHole] = useState(0); 
  
  // Image Prep
  const [contrast, setContrast] = useState(1.0);
  const [brightness, setBrightness] = useState(0);
  const [invert, setInvert] = useState(false);
  
  // Colors
  const [fgColor, setFgColor] = useState('#000000');

  // Drag
  const [isDragging, setIsDragging] = useState(false);
  const lastMousePos = useRef({ x: 0, y: 0 });

  // Refs
  const canvasRef = useRef(null);
  const sourceImageRef = useRef(null);
  const containerRef = useRef(null);
  
  // CACHE: Helper canvas for reuse to prevent garbage collection lag
  const helperCanvasRef = useRef(null);

  // --- Actions ---
  useEffect(() => {
      if (window.innerWidth < 768) {
          setSidebarOpen(false);
          setActiveTab(null); 
      }
  }, []);

  const showToast = (msg, type = 'info') => {
      setToast({ message: msg, type });
      if (type !== 'error') {
          setTimeout(() => setToast({ message: null, type: 'info' }), 3000);
      }
  };

  const resetView = () => {
      setPanX(50); setPanY(50); setScale(1); setCenterHole(0);
      showToast("View Reset");
  };

  const resetPatternSettings = () => {
      updateSetting('rings', 60);
      updateSetting('thickness', 0.5);
      updateSetting('rotation', 0);
      if (mode === 'dots') updateSetting('dotShape', 'circle');
      showToast("Pattern Reset");
  };

  const handleMobileTabClick = (tab) => {
      if (activeTab === tab) {
          setActiveTab(null); 
      } else {
          setActiveTab(tab);
      }
  };

  const handleCanvasClick = () => {
      if (window.innerWidth < 768) {
          setActiveTab(null); 
      }
  };

  const handleDoubleClick = () => {
      if (imageSrc && step === 'edit') {
          setStep('crop');
          showToast("Editing Crop...");
      }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setToast({ message: null, type: 'info' });
    
    if (!file.type.startsWith('image/')) {
        showToast("Invalid file type. JPG/PNG only.", 'error');
        return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        sourceImageRef.current = img;
        setImageSrc(event.target.result);
        resetView();
        setStep('crop'); 
        if (window.innerWidth < 768) setActiveTab(null);
      };
      img.onerror = () => showToast("Failed to process image.", 'error');
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  // --- Drag Handling ---
  const handleStart = (e) => {
    if (!imageSrc) return;
    if (step !== 'crop') {
        handleCanvasClick();
        return; 
    }
    setIsDragging(true);
    const pos = e.touches ? e.touches[0] : e;
    lastMousePos.current = { x: pos.clientX, y: pos.clientY };
  };

  const handleMove = (e) => {
    if (!isDragging || !imageSrc || step !== 'crop') return;
    const pos = e.touches ? e.touches[0] : e;
    const deltaX = pos.clientX - lastMousePos.current.x;
    const deltaY = pos.clientY - lastMousePos.current.y;
    lastMousePos.current = { x: pos.clientX, y: pos.clientY };
    const sensitivity = e.touches ? 0.25 : 0.15;
    setPanX(prev => Math.min(100, Math.max(0, prev + deltaX * sensitivity)));
    setPanY(prev => Math.min(100, Math.max(0, prev + deltaY * sensitivity)));
  };

  const handleEnd = () => setIsDragging(false);

  const handleTouchStart = (e) => {
      if (!imageSrc) return;
      handleStart(e);
  };

  // --- Render Core ---
  const renderFrame = (ctx, targetW, targetH, isExport = false) => {
    try {
        const img = sourceImageRef.current;
        if (!img) return;
        
        // 1. Determine Output Size
        // If cropping, use smaller size for smoothness
        const nativeSize = Math.min(img.width, img.height);
        
        let w, h;
        if (step === 'crop' && !isExport) {
            // PERFORMANCE: Cap crop preview at 800px to ensure smooth drag
            const cap = 800;
            w = Math.min(nativeSize, cap);
            h = w;
        } else {
            // Full res for export or edit preview
            w = isExport ? nativeSize : Math.max(1, targetW);
            h = w;
        }
        
        const fg = hexToRgb(fgColor);
        
        ctx.clearRect(0, 0, w, h);

        // PERFORMANCE: Reuse canvas
        if (!helperCanvasRef.current) helperCanvasRef.current = document.createElement('canvas');
        const tempCanvas = helperCanvasRef.current;
        if (tempCanvas.width !== w || tempCanvas.height !== h) { tempCanvas.width = w; tempCanvas.height = h; }
        const tCtx = tempCanvas.getContext('2d');
        
        const imgAspect = img.width / img.height;
        let drawW, drawH;
        if (imgAspect > 1) { drawH = h * scale; drawW = drawH * imgAspect; } 
        else { drawW = w * scale; drawH = drawW / imgAspect; }

        const shiftX = ((panX - 50) / 100) * w * 2;
        const shiftY = ((panY - 50) / 100) * h * 2;
        const centerX = w / 2;
        const centerY = h / 2;
        const drawX = centerX - (drawW / 2) + shiftX;
        const drawY = centerY - (drawH / 2) + shiftY;

        tCtx.save();
        tCtx.imageSmoothingEnabled = isExport ? true : !isDragging;
        tCtx.imageSmoothingQuality = isExport ? 'high' : (isDragging ? 'low' : 'medium');
        tCtx.clearRect(0, 0, w, h);
        tCtx.drawImage(img, drawX, drawY, drawW, drawH);
        tCtx.restore();

        if (step === 'crop') {
            ctx.drawImage(tempCanvas, 0, 0);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.85)'; 
            ctx.beginPath();
            ctx.rect(0, 0, w, h); 
     
