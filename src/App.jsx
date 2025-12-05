import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Upload, Download, RefreshCw, Sliders, Image as ImageIcon, Zap, Layers, Circle, Grid, Activity, Move, Palette, Disc, MousePointer2, Hand, Settings, Menu, X, RotateCcw, Info, Square, Triangle, Eye, EyeOff, LayoutTemplate, Droplet, Check, ArrowRight, Crop, Lock, Maximize, AlertTriangle, ShieldCheck, Printer, Megaphone, Plus, ChevronUp, ChevronDown, HelpCircle, Mail } from 'lucide-react';

/**
 * IF Studio - Advanced Halftone & Spiral Image Engine
 * v12.1 - Fixed State Collisions & Mode Memory Logic.
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
  
  // App Config
  const [mode, setMode] = useState('spiral'); 
  const [frameShape, setFrameShape] = useState('circle'); 
  const [compareMode, setCompareMode] = useState(false); 
  const [transparentBg, setTransparentBg] = useState(false); 
  
  // Independent Mode Settings (NEW)
  const [modeSettings, setModeSettings] = useState({
      spiral: { rings: 60, thickness: 0.5, rotation: 0, dotShape: 'circle' },
      lines:  { rings: 60, thickness: 0.5, rotation: 0, dotShape: 'circle' },
      dots:   { rings: 60, thickness: 0.5, rotation: 0, dotShape: 'circle' }
  });

  // Derived Values (The "Getters")
  const rings = modeSettings[mode].rings;
  const lineThickness = modeSettings[mode].thickness;
  const rotation = modeSettings[mode].rotation;
  const dotShape = modeSettings[mode].dotShape;

  // Update Helper
  const updateSetting = (key, value) => {
      setModeSettings(prev => ({
          ...prev,
          [mode]: { ...prev[mode], [key]: value }
      }));
  };
  
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
  const bgColor = '#ffffff';

  // Drag
  const [isDragging, setIsDragging] = useState(false);
  const lastMousePos = useRef({ x: 0, y: 0 });

  // Refs
  const canvasRef = useRef(null);
  const sourceImageRef = useRef(null);
  const containerRef = useRef(null);
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
            if (frameShape === 'circle') ctx.arc(centerX, centerY, w/2, 0, Math.PI * 2, true);
            else ctx.rect(centerX - w/2, centerY - h/2, w, h); 
            ctx.fill('evenodd'); 
            
            ctx.strokeStyle = THEME_COLOR;
            ctx.lineWidth = 2;
            ctx.beginPath();
            if (frameShape === 'circle') ctx.arc(centerX, centerY, w/2 - 1, 0, Math.PI * 2);
            else ctx.rect(1, 1, w-2, h-2);
            ctx.stroke();
            return; 
        }

        if (compareMode && !isExport) {
            ctx.save();
            if (frameShape === 'circle') {
                ctx.beginPath();
                ctx.arc(centerX, centerY, w/2, 0, Math.PI * 2);
                ctx.clip();
            }
            ctx.drawImage(tempCanvas, 0, 0);
            ctx.restore();
            return;
        }

        const sourceData = tCtx.getImageData(0, 0, w, h).data;
        const outputData = new Uint8ClampedArray(w * h * 4);

        const maxDim = w;
        const PI = Math.PI;
        const PI2 = Math.PI * 2;
        const effectiveRings = Math.max(1, rings); 
        const radRotation = (rotation * PI) / 180;
        
        const maxRadiusSq = (maxDim/2) * (maxDim/2);
        const holeRadiusSq = centerHole > 0 ? ((maxDim/2) * (centerHole/100))**2 : -1;
        const squareLimit = maxDim / 2;

        const fgR = fg.r, fgG = fg.g, fgB = fg.b;
        const pxPerMm = w / printWidth;
        const minFeaturePx = is3DMode ? (minThickness * pxPerMm) : 0;

        for (let y = 0; y < h; y++) {
          for (let x = 0; x < w; x++) {
            const index = (y * w + x) * 4;
            const setTransparent = () => { outputData[index+3] = 0; };

            const dx = x - centerX;
            const dy = y - centerY;
            const distSq = dx*dx + dy*dy;

            if (frameShape === 'circle' && distSq > maxRadiusSq) { setTransparent(); continue; }
            if (frameShape === 'square' && (Math.abs(dx) > squareLimit || Math.abs(dy) > squareLimit)) { setTransparent(); continue; }
            if (distSq < holeRadiusSq) { setTransparent(); continue; }
            if (sourceData[index+3] === 0) { setTransparent(); continue; }

            let r = sourceData[index];
            let g = sourceData[index + 1];
            let b = sourceData[index + 2];
            let luma = 0.299 * r + 0.587 * g + 0.114 * b;
            
            luma += brightness;
            luma = (luma - 128) * contrast + 128;
            if (luma < 0) luma = 0; if (luma > 255) luma = 255;
            
            let val = luma / 255;
            if (invert) val = 1.0 - val;

            let isForeground = false;
            
            if (mode === 'spiral') {
              const dist = Math.sqrt(distSq);
              const angle = Math.atan2(dy, dx) + radRotation;
              const normDist = dist / (maxDim / 2);
              const wave = Math.sin( (normDist * effectiveRings * PI2) + angle );
              const spacingPx = (maxDim / 2) / effectiveRings; 
              let threshold = (1 - val) * (lineThickness * 2);
              if (is3DMode) {
                  const minDuty = minFeaturePx / spacingPx;
                  if (threshold < minDuty) threshold = minDuty;
              } else {
                  const minConn = 0.05; 
                  if (threshold < minConn && lineThickness > 0.1) threshold = minConn;
              }
              if ((wave + 1) / 2 < threshold) isForeground = true;
            } else if (mode === 'lines') {
              const ry = dx * Math.sin(radRotation) + dy * Math.cos(radRotation);
              const normY = ry / (maxDim / 2);
              const wave = Math.sin( normY * effectiveRings * PI );
              const spacingPx = h / effectiveRings;
              let threshold = (1 - val) * (lineThickness * 2);
              if (is3DMode) {
                  const minDuty = minFeaturePx / spacingPx;
                  if (threshold < minDuty) threshold = minDuty;
              }
              if ((wave + 1) / 2 < threshold) isForeground = true;
            } else if (mode === 'dots') {
               const rx = dx * Math.cos(radRotation) - dy * Math.sin(radRotation);
               const ry = dx * Math.sin(radRotation) + dy * Math.cos(radRotation);
               const gridSize = maxDim / effectiveRings;
               if (gridSize > 0) {
                   const cellX = Math.floor(rx / gridSize);
                   const cellY = Math.floor(ry / gridSize);
                   const lx = rx - ((cellX + 0.5) * gridSize);
                   const ly = ry - ((cellY + 0.5) * gridSize);
                   let dome = 0, normDist = 0;

                   if (dotShape === 'circle') {
                        normDist = Math.sqrt(lx*lx + ly*ly) / (gridSize / 1.5);
                        if (normDist < 1) dome = Math.cos(normDist * (PI / 2));
                   } else if (dotShape === 'square') {
                        normDist = Math.max(Math.abs(lx), Math.abs(ly)) / (gridSize / 2.0); 
                        if (normDist < 1) dome = 1.0 - normDist;
                   } else if (dotShape === 'diamond') {
                        normDist = (Math.abs(lx) + Math.abs(ly)) / (gridSize / 1.5); 
                        if (normDist < 1) dome = 1.0 - normDist;
                   } else if (dotShape === 'triangle') {
                       const k = Math.sqrt(3);
                       normDist = Math.max(Math.abs(lx) * k/2 + ly/2, -ly) / (gridSize / 2.5);
                       if (normDist < 1) dome = 1.0 - normDist;
                   }
                   let cutoff = val / lineThickness;
                   if (is3DMode) {
                        const maxValForSafeSize = 1.0 - (minFeaturePx / gridSize); 
                        if (cutoff > maxValForSafeSize) cutoff = maxValForSafeSize;
                   }
                   if (dome > cutoff) isForeground = true;
               }
            }

            if (isForeground) {
                 outputData[index] = fgR; outputData[index+1] = fgG; outputData[index+2] = fgB; outputData[index+3] = 255;
            } else {
                 setTransparent();
            }
          }
        }

        const outputImageData = new ImageData(outputData, w, h);
        ctx.putImageData(outputImageData, 0, 0);
    } catch(e) {
        console.error(e);
        showToast("Rendering error. Try refreshing.", 'error');
    }
  };

  const processImage = useCallback(() => {
    if (!canvasRef.current || !sourceImageRef.current) return;
    const img = sourceImageRef.current;
    if (img.width === 0) return;

    // Use full width for 1:1 preview always (constrained by CSS max-width)
    const targetW = img.width;
    
    // Performance: If step is CROP, use lower res for fluid animation
    const safeW = step === 'crop' ? Math.min(800, targetW) : Math.min(4096, targetW);
    const safeH = safeW;

    const canvas = canvasRef.current;
    if (canvas.width !== safeW || canvas.height !== safeH) {
        canvas.width = safeW;
        canvas.height = safeH;
    }
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    renderFrame(ctx, safeW, safeH, false);
    setIsProcessing(false);
  }, [mode, modeSettings, scale, contrast, brightness, invert, fgColor, panX, panY, frameShape, centerHole, step, is3DMode, printWidth, minThickness, isDragging]);

  useEffect(() => {
    if (!imageSrc) return;
    setIsProcessing(true);
    let id;
    const timer = setTimeout(() => { id = requestAnimationFrame(processImage); }, 15);
    return () => { clearTimeout(timer); if(id) cancelAnimationFrame(id); };
  }, [processImage, imageSrc]);

  // --- SVG Export Logic ---
  const downloadSVG = () => {
    if (!sourceImageRef.current) return;
    setIsProcessing(true);
    showToast("Generating SVG...", 'success');

    try {
        const img = sourceImageRef.current;
        const nativeSize = Math.min(img.width, img.height);
        const w = nativeSize;
        const h = nativeSize;
        
        const offCanvas = document.createElement('canvas');
        offCanvas.width = w;
        offCanvas.height = h;
        const offCtx = offCanvas.getContext('2d');
        
        const imgAspect = img.width / img.height;
        let drawW, drawH;
        if (imgAspect > 1) { drawH = h * scale; drawW = drawH * imgAspect; } 
        else { drawW = w * scale; drawH = drawW / imgAspect; }
        const centerX = w / 2;
        const centerY = h / 2;
        const shiftX = ((panX - 50) / 100) * w * 2;
        const shiftY = ((panY - 50) / 100) * h * 2;
        const drawX = centerX - (drawW / 2) + shiftX;
        const drawY = centerY - (drawH / 2) + shiftY;

        offCtx.save();
        offCtx.drawImage(img, drawX, drawY, drawW, drawH);
        offCtx.restore();

        const imageData = offCtx.getImageData(0,0, w, h).data;
        
        const getLuma = (x, y) => {
            const ix = Math.floor(x);
            const iy = Math.floor(y);
            if (ix < 0 || ix >= w || iy < 0 || iy >= h) return 0;
            const idx = (iy * w + ix) * 4;
            if (imageData[idx+3] === 0) return 1.0; 
            
            let r = imageData[idx];
            let g = imageData[idx+1];
            let b = imageData[idx+2];
            let luma = 0.299 * r + 0.587 * g + 0.114 * b;
            luma += brightness;
            luma = (luma - 128) * contrast + 128;
            luma = Math.max(0, Math.min(255, luma));
            if (invert) luma = 255 - luma;
            return luma / 255;
        };

        const maxDim = w;
        const PI = Math.PI;
        const effectiveRings = Math.max(1, rings);
        const maxRadiusSq = (maxDim/2)**2;
        const holeRadiusSq = centerHole > 0 ? ((maxDim/2) * (centerHole/100))**2 : -1;
        const squareLimit = maxDim / 2;

        const svgElements = [];
        // No Background Rect

        const pxPerMm = w / printWidth;
        const minFeaturePx = is3DMode ? (minThickness * pxPerMm) : 0;

        if (mode === 'spiral') {
            const stepsPerRev = 180; 
            const totalSteps = effectiveRings * stepsPerRev;
            const spacing = (maxDim/2) / effectiveRings;
            
            const pointsOut = [];
            const pointsIn = [];
            
            for (let i = 0; i < totalSteps; i++) {
                const angle = (i / stepsPerRev) * Math.PI * 2;
                const t = i / totalSteps;
                const rBase = t * (maxDim/2);
                
                const px = centerX + Math.cos(angle) * rBase;
                const py = centerY + Math.sin(angle) * rBase;
                
                const distSq = (px-centerX)**2 + (py-centerY)**2;
                
                if (frameShape === 'circle') {
                    if (distSq > maxRadiusSq) continue;
                } else if (frameShape === 'square') {
                    if (Math.abs(px-centerX) > squareLimit || Math.abs(py-centerY) > squareLimit) continue;
                }
                
                if (distSq < holeRadiusSq) continue;

                const luma = getLuma(px, py);
                
                let width = (1 - luma) * spacing * lineThickness;
                
                if (is3DMode) {
                    if (width < minFeaturePx) width = minFeaturePx;
                } else {
                    const minWidth = 0.05 * spacing;
                    if (width < minWidth && lineThickness > 0.1) width = minWidth;
                }
                
                const halfW = width / 2;
                const rotRad = rotation * PI / 180;
                const renderAngle = angle + rotRad;
                const cos = Math.cos(renderAngle);
                const sin = Math.sin(renderAngle);
                
                pointsOut.push([centerX + cos * (rBase + halfW), centerY + sin * (rBase + halfW)]);
                pointsIn.push([centerX + cos * (rBase - halfW), centerY + sin * (rBase - halfW)]);
            }
            
            if (pointsOut.length > 0) {
                let path = `M ${pointsOut[0][0].toFixed(2)} ${pointsOut[0][1].toFixed(2)}`;
                for (let i = 1; i < pointsOut.length; i++) path += ` L ${pointsOut[i][0].toFixed(2)} ${pointsOut[i][1].toFixed(2)}`;
                for (let i = pointsIn.length - 1; i >= 0; i--) path += ` L ${pointsIn[i][0].toFixed(2)} ${pointsIn[i][1].toFixed(2)}`;
                path += " Z";
                svgElements.push(`<path d="${path}" fill="${fgColor}" stroke="none" />`);
            }
        } 
        else if (mode === 'lines') {
            const diag = Math.sqrt(w*w + h*h);
            const limit = diag / 2;
            const gridSz = h / effectiveRings; 
            const stepV = gridSz;
            const stepU = 2; 

            const rad = rotation * PI / 180;
            const cos = Math.cos(rad);
            const sin = Math.sin(rad);

            for (let v = -limit; v < limit; v += stepV) {
                const pointsTop = [];
                const pointsBot = [];
                let hasPoints = false;

                for (let u = -limit; u < limit; u += stepU) {
                    const sx = u * cos - v * sin;
                    const sy = u * sin + v * cos;
                    const ax = centerX + sx;
                    const ay = centerY + sy;
                    
                    if (ax < 0 || ax >= w || ay < 0 || ay >= h) continue;
                    
                    const distSq = sx*sx + sy*sy;
                    if (frameShape === 'circle' && distSq > maxRadiusSq) continue;
                    if (frameShape === 'square' && (Math.abs(sx) > squareLimit || Math.abs(sy) > squareLimit)) continue;
                    if (distSq < holeRadiusSq) continue;
                    
                    const luma = getLuma(ax, ay);
                    let width = (1 - luma) * gridSz * lineThickness;
                    
                    if (is3DMode) {
                        if (width < minFeaturePx) width = minFeaturePx;
                    }

                    const halfW = width / 2;
                    
                    if (width > 0.5) {
                        hasPoints = true;
                        const tx = u * cos - (v - halfW) * sin;
                        const ty = u * sin + (v - halfW) * cos;
                        const bx = u * cos - (v + halfW) * sin;
                        const by = u * sin + (v + halfW) * cos;
                        pointsTop.push([centerX + tx, centerY + ty]);
                        pointsBot.push([centerX + bx, centerY + by]);
                    } else {
                        if (hasPoints) {
                             if (pointsTop.length > 1) {
                                let path = `M ${pointsTop[0][0].toFixed(2)} ${pointsTop[0][1].toFixed(2)}`;
                                for (let i = 1; i < pointsTop.length; i++) path += ` L ${pointsTop[i][0].toFixed(2)} ${pointsTop[i][1].toFixed(2)}`;
                                for (let i = pointsBot.length - 1; i >= 0; i--) path += ` L ${pointsBot[i][0].toFixed(2)} ${pointsBot[i][1].toFixed(2)}`;
                                path += " Z";
                                svgElements.push(`<path d="${path}" fill="${fgColor}" stroke="none" />`);
                             }
                             pointsTop.length = 0; 
                             pointsBot.length = 0;
                             hasPoints = false;
                        }
                    }
                }
                if (hasPoints && pointsTop.length > 1) {
                    let path = `M ${pointsTop[0][0].toFixed(2)} ${pointsTop[0][1].toFixed(2)}`;
                    for (let i = 1; i < pointsTop.length; i++) path += ` L ${pointsTop[i][0].toFixed(2)} ${pointsTop[i][1].toFixed(2)}`;
                    for (let i = pointsBot.length - 1; i >= 0; i--) path += ` L ${pointsBot[i][0].toFixed(2)} ${pointsBot[i][1].toFixed(2)}`;
                    path += " Z";
                    svgElements.push(`<path d="${path}" fill="${fgColor}" stroke="none" />`);
                }
            }
        }
        else {
            // DOTS SVG
            const diag = Math.sqrt(w*w + h*h);
            const limit = diag / 2;
            const gridSz = (maxDim/2)*2 / effectiveRings; 
            const stepU = gridSz; 
            const stepV = gridSz;
            
            const rad = rotation * PI / 180;
            const cos = Math.cos(rad);
            const sin = Math.sin(rad);

            for (let v = -limit; v < limit; v += stepV) {
                for (let u = -limit; u < limit; u += stepU) {
                    const sx = u * cos - v * sin;
                    const sy = u * sin + v * cos;
                    const ax = centerX + sx;
                    const ay = centerY + sy;
                    
                    if (ax < 0 || ax >= w || ay < 0 || ay >= h) continue;
                    
                    const distSq = sx*sx + sy*sy;
                    if (frameShape === 'circle' && distSq > maxRadiusSq) continue;
                    if (frameShape === 'square' && (Math.abs(sx) > squareLimit || Math.abs(sy) > squareLimit)) continue;
                    if (distSq < holeRadiusSq) continue;
                    
                    const luma = getLuma(ax, ay);
                    const maxSz = gridSz; 
                    
                    let rawSize = Math.pow((1-luma), 0.8) * maxSz * (lineThickness * 1.8);
                    
                    if (is3DMode) {
                        if (rawSize < minFeaturePx) rawSize = minFeaturePx;
                    }

                    if (rawSize > 0.5) {
                        const r = rawSize / 2;
                        if (dotShape === 'circle') {
                            svgElements.push(`<circle cx="${ax.toFixed(2)}" cy="${ay.toFixed(2)}" r="${r.toFixed(2)}" fill="${fgColor}" />`);
                        } else if (dotShape === 'square') {
                            svgElements.push(`<rect x="${(ax-r).toFixed(2)}" y="${(ay-r).toFixed(2)}" width="${rawSize.toFixed(2)}" height="${rawSize.toFixed(2)}" fill="${fgColor}" transform="rotate(${rotation}, ${ax.toFixed(2)}, ${ay.toFixed(2)})" />`);
                        } else if (dotShape === 'diamond') {
                            svgElements.push(`<rect x="${(ax-r).toFixed(2)}" y="${(ay-r).toFixed(2)}" width="${rawSize.toFixed(2)}" height="${rawSize.toFixed(2)}" fill="${fgColor}" transform="rotate(${rotation + 45}, ${ax.toFixed(2)}, ${ay.toFixed(2)})" />`);
                        } else if (dotShape === 'triangle') {
                            const hTri = rawSize * 0.866;
                            const dyTop = -hTri * 2/3;
                            const dyBot = hTri * 1/3;
                            const dxL = -r;
                            const dxR = r;
                            const p1 = { x: 0 * cos - dyTop * sin, y: 0 * sin + dyTop * cos };
                            const p2 = { x: dxL * cos - dyBot * sin, y: dxL * sin + dyBot * cos };
                            const p3 = { x: dxR * cos - dyBot * sin, y: dxR * sin + dyBot * cos };
                            const pts = `${(ax+p1.x).toFixed(2)},${(ay+p1.y).toFixed(2)} ${(ax+p2.x).toFixed(2)},${(ay+p2.y).toFixed(2)} ${(ax+p3.x).toFixed(2)},${(ay+p3.y).toFixed(2)}`;
                            svgElements.push(`<polygon points="${pts}" fill="${fgColor}" />`);
                        }
                    }
                }
            }
        }

        const svgContent = svgElements.join('');
        const svgFile = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">${svgContent}</svg>`;
        
        const blob = new Blob([svgFile], {type: 'image/svg+xml'});
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `if-studio-${mode}.svg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

    } catch(e) {
        console.error("SVG Gen Error", e);
        showToast("Failed to generate SVG. Try reducing density.", 'error');
    }
    setIsProcessing(false);
  };
  
  const downloadPNG = () => {
    if (!sourceImageRef.current) return;
    setIsProcessing(true);
    showToast("Generating High-Res PNG...", 'success');
    
    setTimeout(() => {
        const img = sourceImageRef.current;
        const nativeSize = Math.min(img.width, img.height);
        const w = nativeSize;
        const h = nativeSize;

        const offCanvas = document.createElement('canvas');
        offCanvas.width = w;
        offCanvas.height = h;
        const ctx = offCanvas.getContext('2d');
        renderFrame(ctx, w, h, true);
        const link = document.createElement('a');
        link.download = `if-studio-${Date.now()}.png`;
        link.href = offCanvas.toDataURL('image/png', 1.0);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setIsProcessing(false);
    }, 50);
  };

  // --- UI RENDER ---
  const renderControls = (section) => {
      switch(section) {
          case 'pattern': return (
              <>
                <div className="mb-3 flex items-center gap-2">
                    <Layers size={14} className="text-gray-400" />
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Mode</span>
                </div>
                <div className="flex gap-2 mb-4">
                    <ModeButton active={mode === 'spiral'} onClick={() => setMode('spiral')} icon={Disc} label="Spiral" />
                    <ModeButton active={mode === 'lines'} onClick={() => setMode('lines')} icon={Layers} label="Lines" />
                    <ModeButton active={mode === 'dots'} onClick={() => setMode('dots')} icon={Grid} label="Dots" />
                </div>
                {mode === 'dots' && (
                    <div className="mb-4 p-3 bg-gray-50 rounded-xl border border-gray-200">
                        <span className="text-[10px] uppercase font-bold text-gray-400 mb-2 block tracking-wider">Shape</span>
                        <div className="flex gap-2">
                            <ShapeButton active={dotShape === 'circle'} onClick={() => updateSetting('dotShape', 'circle')} icon={Circle} label="Circle" />
                            <ShapeButton active={dotShape === 'square'} onClick={() => updateSetting('dotShape', 'square')} icon={Square} label="Square" />
                            <ShapeButton active={dotShape === 'diamond'} onClick={() => updateSetting('dotShape', 'diamond')} icon={Square} rotateIcon label="Diamond" />
                            <ShapeButton active={dotShape === 'triangle'} onClick={() => updateSetting('dotShape', 'triangle')} icon={Triangle} label="Triangle" />
                        </div>
                    </div>
                )}
                <div className="flex items-center justify-between mt-2 mb-4">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Settings</span>
                    <button onClick={resetPatternSettings} className="p-1.5 hover:bg-gray-100 rounded-md text-gray-400 hover:text-blue-500 transition-colors" title="Reset Pattern">
                         <RotateCcw size={14}/>
                    </button>
                </div>
                <Slider highlight label="Density" value={rings} min={10} max={200} step={1} onChange={(v) => updateSetting('rings', v)} icon={Circle} />
                <Slider highlight label="Thickness" value={lineThickness} min={0.1} max={2.0} step={0.05} onChange={(v) => updateSetting('thickness', v)} icon={Zap} />
                <Slider label="Rotation" value={rotation} min={0} max={180} step={1} onChange={(v) => updateSetting('rotation', v)} icon={RefreshCw} />
              </>
          );
          case 'tune': return (
              <>
                 <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Fine Tune</span>
                    <button onClick={resetView} className="p-1.5 hover:bg-gray-100 rounded-md text-gray-400 hover:text-blue-500 transition-colors" title="Reset View">
                         <RotateCcw size={14}/>
                    </button>
                 </div>
                 <div className="grid grid-cols-2 gap-3 mb-2">
                     <Slider label="Contrast" value={contrast} min={0.5} max={3.0} step={0.1} onChange={setContrast} />
                     <Slider label="Bright" value={brightness} min={-100} max={100} step={5} onChange={setBrightness} />
                 </div>
                 <Slider label="Center Hole" value={centerHole} min={0} max={80} step={1} onChange={setCenterHole} icon={LayoutTemplate} />
              </>
          );
          case 'color': return (
              <div className="space-y-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Color</span>
                    <button onClick={() => {setFgColor('#000000'); setInvert(false); showToast("Colors Reset");}} className="p-1.5 hover:bg-gray-100 rounded-md text-gray-400 hover:text-blue-500 transition-colors" title="Reset Colors">
                         <RotateCcw size={14}/>
                    </button>
                 </div>
                  <ColorPicker label="Ink Color" value={fgColor} onChange={setFgColor} />
                  <Toggle label="Invert Brightness" active={invert} onToggle={() => setInvert(!invert)} icon={Zap} />
              </div>
          );
          case 'download': return (
              <div className="space-y-4">
                 <div className="space-y-3">
                     <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Fabrication</span>
                     </div>
                     <Toggle 
                        label="3D Print Mode" 
                        description="Enforce minimum thickness"
                        active={is3DMode} 
                        onToggle={() => setIs3DMode(!is3DMode)} 
                        icon={Printer} 
                     />
                     {is3DMode && (
                         <div className="p-3 bg-blue-50 rounded-xl border border-blue-100 animate-in fade-in">
                             <div className="flex justify-between items-center mb-2">
                                <label className="text-xs font-semibold text-gray-600">Target Width</label>
                                <div className="flex items-center gap-2">
                                    <Slider label="" value={printWidth} min={50} max={500} step={10} onChange={setPrintWidth} />
                                    <input 
                                        type="number" 
                                        value={printWidth}
                                        onChange={(e) => setPrintWidth(Math.max(10, parseFloat(e.target.value) || 10))}
                                        className="w-14 p-1 text-right border border-gray-300 rounded text-xs"
                                    />
                                </div>
                             </div>
                             <Slider 
                                label="Min Thickness" 
                                value={minThickness} 
                                min={0.3} 
                                max={1.0} 
                                step={0.01} 
                                onChange={setMinThickness} 
                            />
                         </div>
                     )}
                 </div>
                 
                 <div className="pt-3 border-t border-gray-100">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-2">Export File</span>
                    <div className="grid grid-cols-2 gap-2">
                        <button onClick={downloadSVG} disabled={!imageSrc} className="flex items-center justify-center py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg font-bold text-xs border border-blue-200 shadow-sm disabled:opacity-50 transition-colors">
                             <Download size={14} className="mr-1.5" /> SVG
                        </button>
                        <button onClick={downloadPNG} disabled={!imageSrc} className="flex items-center justify-center py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg font-bold text-xs border border-blue-200 shadow-sm disabled:opacity-50 transition-colors">
                             <Download size={14} className="mr-1.5" /> PNG
                        </button>
                    </div>
                 </div>
              </div>
          );
          default: return null;
      }
  }

  return (
    <div className="flex h-screen w-full bg-gray-50 text-slate-800 font-sans overflow-hidden" style={{ touchAction: 'none' }}>
      <StatusToast toast={toast} onClose={() => setToast({ message: null, type: 'info' })} />
      <AboutModal isOpen={showAbout} onClose={() => setShowAbout(false)} />

      {/* MOBILE HEADER */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-12 bg-white border-b border-gray-200 flex items-center justify-between px-4 z-40">
           <div className="flex items-center gap-2 font-bold text-gray-800 text-sm"><Activity className="text-[#3B82F6]" size={16}/> IF Studio</div>
           <div className="flex items-center gap-2">
                {step === 'edit' && (
                    <label className="p-1.5 bg-gray-50 text-gray-600 rounded-lg cursor-pointer"><Plus size={18}/><input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} /></label>
                )}
                <button onClick={() => setShowAbout(true)} className="p-1.5 text-gray-400 hover:text-blue-500"><HelpCircle size={18}/></button>
           </div>
      </div>

      {/* DESKTOP SIDEBAR */}
      <div className={`hidden md:flex fixed inset-y-0 left-0 w-96 bg-white border-r border-gray-200 flex-col overflow-hidden shadow-xl z-40`}>
        <div className="p-6 border-b border-gray-100 bg-white sticky top-0 z-10 shrink-0 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#3B82F6] flex items-center justify-center shadow-lg"><Activity className="text-white" size={24} /></div>
                <div><h1 className="text-xl font-bold text-gray-900 tracking-tight">IF Studio</h1><p className="text-[10px] text-gray-400 font-mono tracking-wider uppercase">Pro Halftone Engine</p></div>
            </div>
            <button onClick={() => setShowAbout(true)} className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-blue-500 transition-colors"><HelpCircle size={20}/></button>
        </div>

        <div className="p-6 space-y-8 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 flex-1">
          {step === 'crop' ? (
              <div className="space-y-6 animate-in fade-in slide-in-from-left-4">
                  <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl text-center">
                      <Crop size={24} className="text-[#3B82F6] mx-auto mb-2" />
                      <h3 className="font-bold text-gray-800">Step 1: Crop</h3>
                      <p className="text-xs text-gray-500 mt-1">Choose shape & position image</p>
                  </div>
                  <section className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                     <div className="text-[10px] uppercase font-bold text-gray-400 mb-3 tracking-wider">Frame Shape</div>
                     <div className="flex gap-3">
                         <button onClick={() => setFrameShape('circle')} className={`flex-1 flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${frameShape === 'circle' ? 'bg-blue-50 border-blue-200 text-blue-600 ring-1 ring-blue-300' : 'bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100'}`}><Circle size={24} className="mb-2"/><span className="text-xs font-bold">Circle</span></button>
                         <button onClick={() => setFrameShape('square')} className={`flex-1 flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${frameShape === 'square' ? 'bg-blue-50 border-blue-200 text-blue-600 ring-1 ring-blue-300' : 'bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100'}`}><Square size={24} className="mb-2"/><span className="text-xs font-bold">Square</span></button>
                     </div>
                  </section>
                  <section className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                     <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Position</div>
                     <div className="space-y-4">
                         <Slider label="Zoom" value={scale} min={0.5} max={3.0} step={0.1} onChange={setScale} />
                         <Slider label="Pan X" value={panX} min={0} max={100} step={1} onChange={setPanX} icon={Move} />
                         <Slider label="Pan Y" value={panY} min={0} max={100} step={1} onChange={setPanY} icon={Move} />
                     </div>
                  </section>
                  <button onClick={() => setStep('edit')} className="w-full py-4 bg-[#3B82F6] hover:bg-[#2563EB] text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95">Apply Crop <ArrowRight size={18} /></button>
              </div>
          ) : (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
                  <div className="flex items-center justify-between">
                      <div className="text-xs font-bold text-emerald-600 flex items-center gap-2 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100"><Check size={12} /> Crop Applied</div>
                      <button onClick={() => setStep('crop')} className="text-xs text-gray-400 hover:text-blue-600 underline">Edit</button>
                  </div>
                  {renderControls('pattern')}
                  <section className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                     <div className="flex items-center gap-2 mb-6 text-emerald-600 text-xs font-bold uppercase tracking-wider"><Move size={14} /> Fine Tune</div>
                     {renderControls('tune')}
                  </section>
                  <section className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                     <div className="flex items-center gap-2 mb-6 text-purple-500 text-xs font-bold uppercase tracking-wider"><Palette size={14} /> Color</div>
                     {renderControls('color')}
                  </section>
                  <section className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                     <div className="flex items-center gap-2 mb-6 text-orange-500 text-xs font-bold uppercase tracking-wider"><Settings size={14} /> Fabrication</div>
                     {renderControls('download')}
                  </section>
              </div>
          )}
        </div>
        
        {step === 'edit' && (
            <div className="p-6 border-t border-gray-100 space-y-4 bg-white shrink-0">
                 <div className="flex gap-3">
                    <button onClick={downloadSVG} disabled={!imageSrc} className="flex-1 flex items-center justify-center py-4 bg-[#3B82F6] hover:bg-[#2563EB] text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-200 disabled:opacity-50"><Download size={18} className="mr-2" />SVG</button>
                    <button onClick={downloadPNG} disabled={!imageSrc} className="flex-1 flex items-center justify-center py-4 bg-white hover:bg-gray-50 text-gray-700 rounded-xl font-bold text-sm border border-gray-200 shadow-sm disabled:opacity-50"><Download size={18} className="mr-2" />PNG</button>
                </div>
                <label className="flex items-center justify-center w-full py-3 bg-gray-50 hover:bg-gray-100 text-gray-500 rounded-xl cursor-pointer transition-all border border-transparent hover:border-gray-200 group">
                    <Plus size={16} className="mr-2 group-hover:text-[#3B82F6]" />
                    <span className="font-bold text-xs">New Image</span>
                    <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                </label>
            </div>
        )}
      </div>

      {/* CANVAS AREA */}
      <div 
        className="flex-1 relative flex flex-col h-full overflow-hidden md:pl-96 pt-12 md:pt-0"
        ref={containerRef}
      >
        {/* Main Content */}
        <div 
            className="flex-1 w-full relative flex items-center justify-center overflow-hidden bg-gray-50"
            onMouseDown={handleStart} onMouseMove={handleMove} onMouseUp={handleEnd} onMouseLeave={handleEnd}
            onTouchStart={handleTouchStart} onTouchMove={handleMove} onTouchEnd={handleEnd}
            onDoubleClick={handleDoubleClick}
        >
            {/* Checkerboard for Transparency Visibility */}
            <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'conic-gradient(#ccc 90deg, white 90deg)', backgroundSize: '20px 20px' }} />

            {!imageSrc ? (
            <div className="relative z-10 text-center space-y-6 max-w-xs md:max-w-md p-8 border-2 border-dashed border-gray-300 rounded-3xl bg-white/90 backdrop-blur-xl shadow-sm mx-4">
                <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto ring-8 ring-blue-50/50 mb-4"><ImageIcon size={40} className="text-blue-500" /></div>
                <div><h2 className="text-2xl font-black text-gray-900 mb-2">IF Studio</h2><p className="text-gray-500 text-sm">Professional Halftone Engine</p></div>
                <label className="inline-flex items-center px-8 py-4 bg-[#3B82F6] hover:bg-[#2563EB] text-white rounded-2xl cursor-pointer shadow-xl shadow-blue-200 transition-transform hover:-translate-y-1"><Plus size={20} className="mr-2" /><span className="font-bold">Upload Photo</span><input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} /></label>
                <p className="text-[10px] text-gray-400 flex items-center justify-center gap-1 mt-4"><ShieldCheck size={12} /> 100% Private. Processed locally.</p>
            </div>
            ) : (
            <div className="relative shadow-2xl border border-gray-200 max-w-full max-h-full flex items-center justify-center bg-white/0">
                <canvas ref={canvasRef} className="max-w-full max-h-full object-contain" style={{ maxHeight: step==='crop' ? '60vh' : 'calc(100vh - 180px)', maxWidth: 'calc(100vw - 20px)' }} />
                
                {/* Mobile Crop UI - STICKY BOTTOM */}
                {step === 'crop' && (
                     <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white p-4 rounded-t-2xl shadow-[0_-4px_20px_rgba(0,0,0,0.1)] border-t border-gray-100 animate-in slide-in-from-bottom-full duration-300 z-50 pb-safe">
                         <div className="flex justify-between items-center mb-4">
                             <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Crop Shape</span>
                             <div className="flex gap-2">
                                 <button onClick={() => setFrameShape('circle')} className={`p-2.5 rounded-xl border ${frameShape === 'circle' ? 'bg-blue-50 border-blue-500 text-blue-600' : 'bg-gray-50 border-gray-200'}`}><Circle size={20}/></button>
                                 <button onClick={() => setFrameShape('square')} className={`p-2.5 rounded-xl border ${frameShape === 'square' ? 'bg-blue-50 border-blue-500 text-blue-600' : 'bg-gray-50 border-gray-200'}`}><Square size={20}/></button>
                             </div>
                         </div>
                         <div className="space-y-4 mb-5">
                             <Slider label="Zoom" value={scale} min={0.5} max={3.0} step={0.1} onChange={setScale} />
                         </div>
                         <button onClick={() => setStep('edit')} className="w-full py-3.5 bg-[#3B82F6] text-white rounded-xl font-bold shadow-lg shadow-blue-200 active:scale-95 transition-transform">Apply & Edit</button>
                     </div>
                )}

                {/* Loading Spinner */}
                {isProcessing && <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white/90 text-blue-600 px-6 py-3 rounded-full text-sm font-bold flex items-center shadow-xl animate-pulse border border-blue-100"><RefreshCw size={16} className="animate-spin mr-3" /> PROCESSING</div>}
                
                {/* Edit Overlay Controls */}
                {step === 'edit' && (
                     <>
                        <button 
                            className="absolute top-4 right-4 bg-white hover:bg-gray-50 text-gray-600 p-2 md:p-3 rounded-full border border-gray-200 shadow-lg transition-all active:scale-95 z-50 group"
                            onMouseDown={() => setCompareMode(true)}
                            onMouseUp={() => setCompareMode(false)}
                            onTouchStart={() => setCompareMode(true)}
                            onTouchEnd={() => setCompareMode(false)}
                        >
                            {compareMode ? <Eye size={18} className="md:w-5 md:h-5" /> : <EyeOff size={18} className="md:w-5 md:h-5" />}
                        </button>
                         <button 
                            className="absolute top-4 left-4 bg-white hover:bg-gray-50 text-gray-600 p-2 md:p-3 rounded-full border border-gray-200 shadow-lg transition-all active:scale-95 z-50 group"
                            onClick={() => setStep('crop')}
                        >
                            <Crop size={18} className="md:w-5 md:h-5" />
                        </button>
                     </>
                )}
            </div> 
            )}
        </div>

        {/* Mobile Bottom Navigation (Edit Mode Only) */}
        {step === 'edit' && (
            <div className="md:hidden bg-white border-t border-gray-200 shrink-0 z-50 pb-safe">
                {activeTab && (
                    <div className="border-b border-gray-100 p-3 bg-gray-50/95 backdrop-blur-xl max-h-[45vh] overflow-y-auto shadow-inner animate-in slide-in-from-bottom-10">
                        <div className="flex justify-between items-center mb-3">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{activeTab} controls</span>
                            <button onClick={() => setActiveTab(null)} className="p-1 text-gray-400 hover:text-gray-600"><X size={14}/></button>
                        </div>
                        {renderControls(activeTab)}
                    </div>
                )}
                <div className="flex justify-around items-center h-14 bg-white">
                    <button onClick={() => handleMobileTabClick('pattern')} className={`flex flex-col items-center gap-0.5 p-1 w-14 transition-colors ${activeTab === 'pattern' ? 'text-[#3B82F6]' : 'text-gray-400'}`}><Layers size={20}/><span className="text-[9px] font-medium">Pattern</span></button>
                    <button onClick={() => handleMobileTabClick('tune')} className={`flex flex-col items-center gap-0.5 p-1 w-14 transition-colors ${activeTab === 'tune' ? 'text-[#3B82F6]' : 'text-gray-400'}`}><Move size={20}/><span className="text-[9px] font-medium">Tune</span></button>
                    <button onClick={() => handleMobileTabClick('color')} className={`flex flex-col items-center gap-0.5 p-1 w-14 transition-colors ${activeTab === 'color' ? 'text-[#3B82F6]' : 'text-gray-400'}`}><Palette size={20}/><span className="text-[9px] font-medium">Color</span></button>
                    <button onClick={() => handleMobileTabClick('download')} className={`flex flex-col items-center gap-0.5 p-1 w-14 transition-colors ${activeTab === 'download' ? 'text-[#3B82F6]' : 'text-gray-400'}`}><Download size={20}/><span className="text-[9px] font-medium">Download</span></button>
                    <button onClick={() => setShowAbout(true)} className="flex flex-col items-center gap-0.5 p-1 w-14 text-gray-400 hover:text-blue-500"><HelpCircle size={20}/><span className="text-[9px] font-medium">About</span></button>
                </div>
            </div>
        )}

        {/* Ad Space */}
        <div className="w-full bg-gray-100 border-t border-gray-200 p-1 flex justify-center items-center shrink-0 h-[60px] md:h-[90px] relative z-20">
            <div className="w-full h-full max-w-[728px] bg-white rounded border border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-300">
                <span className="text-[10px] font-bold uppercase tracking-widest">Ad Space</span>
            </div>
        </div>
      </div>
      
      {/* SEO Footer */}
      <footer className="sr-only">
        <h2>IF Studio - Free Halftone Generator</h2>
        <p>IF Studio is a free, browser-based tool for makers to create spiral betty style art, halftone lines, and stipple dots. Optimized for vinyl cutters (Cricut, Silhouette), 3D printing, and laser engraving. Convert photos to single-line vectors (SVG) instantly. Features include variable width strokes, continuous spiral paths, and local privacy-focused processing.</p>
      </footer>
    </div>
  );
}


