import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Upload, Download, RefreshCw, Sliders, Image as ImageIcon, Zap, Layers, Circle, Grid, Activity, Move, Palette, Disc, MousePointer2, Hand, Settings, Menu, X, RotateCcw, Info, Square, Triangle, Eye, EyeOff, LayoutTemplate, Droplet, Check, ArrowRight, Crop, Lock, Maximize, AlertTriangle, ShieldCheck, Printer, Megaphone, ZoomIn, ZoomOut } from 'lucide-react';

/**
 * IF Studio - Advanced Halftone & Spiral Image Engine
 * v10.0 - UX Overhaul: Floating Toolbar, Keyboard Shortcuts & Touch Optimization.
 */

// --- Constants ---
const THEME_COLOR = '#3B82F6'; // Electric Blue

// --- Components ---

const Tooltip = ({ text }) => (
  <div className="group relative inline-block ml-2">
    <Info size={14} className="text-gray-400 hover:text-[#3B82F6] transition-colors cursor-help" />
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-48 p-3 bg-white border border-gray-200 text-xs text-gray-600 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 pointer-events-none text-center leading-relaxed">
      {text}
      <div className="absolute top-full left-1/2 -translate-x-1/2 border-6 border-transparent border-t-white" />
    </div>
  </div>
);

const Slider = ({ label, value, min, max, step, onChange, icon: Icon, highlight, formatValue, tooltip }) => (
  <div className="mb-5 group">
    <div className="flex justify-between items-center mb-2">
      <div className={`flex items-center gap-2 text-sm font-semibold ${highlight ? 'text-blue-600' : 'text-gray-600'}`}>
        {Icon && <Icon size={16} className={highlight ? "text-[#3B82F6]" : "text-gray-400"} />}
        {label}
        {tooltip && <Tooltip text={tooltip} />}
      </div>
      <span className="text-xs text-gray-500 font-mono bg-gray-100 px-2 py-1 rounded border border-gray-200">
        {formatValue ? formatValue(value) : (typeof value === 'number' ? value.toFixed(step < 1 ? 2 : 0) : value)}
      </span>
    </div>
    <div className="relative h-6 flex items-center">
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="absolute w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/50 z-10"
        style={{
            backgroundImage: `linear-gradient(${THEME_COLOR}, ${THEME_COLOR})`,
            backgroundSize: `${((value - min) * 100) / (max - min)}% 100%`,
            backgroundRepeat: 'no-repeat'
        }}
      />
      <style>{`
        input[type=range]::-webkit-slider-thumb {
            -webkit-appearance: none;
            height: 16px;
            width: 16px;
            border-radius: 50%;
            background: #ffffff;
            border: 2px solid #3B82F6;
            cursor: pointer;
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
            margin-top: 0px; 
        }
        input[type=range]::-moz-range-thumb {
            height: 16px;
            width: 16px;
            border: 2px solid #3B82F6;
            border-radius: 50%;
            background: #ffffff;
            cursor: pointer;
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        }
      `}</style>
    </div>
  </div>
);

const ModeButton = ({ active, onClick, icon: Icon, label }) => (
  <button
    onClick={onClick}
    className={`flex-1 flex flex-col items-center justify-center py-4 px-2 rounded-2xl transition-all border duration-200 ${
      active
        ? 'bg-[#3B82F6] border-[#3B82F6] text-white shadow-lg shadow-blue-500/30 transform scale-105'
        : 'bg-white border-gray-200 text-gray-500 hover:border-blue-300 hover:text-blue-500'
    }`}
  >
    <Icon size={24} className="mb-2" />
    <span className="text-xs font-bold tracking-wide">{label}</span>
  </button>
);

const ShapeButton = ({ active, onClick, icon: Icon, label, rotateIcon }) => (
    <button
      onClick={onClick}
      className={`flex-1 flex items-center justify-center p-3 rounded-xl transition-all border duration-200 ${
        active
          ? 'bg-[#3B82F6]/10 border-[#3B82F6] text-[#3B82F6]'
          : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
      }`}
      title={label}
    >
      <Icon size={18} className={rotateIcon ? "rotate-45" : ""} />
    </button>
  );

const ColorPicker = ({ label, value, onChange, disabled }) => (
    <div className={`flex items-center justify-between p-3 rounded-xl border border-gray-200 bg-gray-50 transition-colors ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-blue-300'}`}>
        <span className="text-sm font-medium text-gray-600">{label}</span>
        <div className="flex items-center gap-3">
            <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">{value}</span>
            <div className="relative w-8 h-8 rounded-full overflow-hidden border border-gray-300 shadow-sm ring-1 ring-white">
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
    className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all duration-200 text-left ${
      active
        ? 'bg-[#3B82F6]/10 border-[#3B82F6]/50 text-[#3B82F6]'
        : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
    }`}
  >
    <div className="flex items-center gap-3">
        {Icon && <Icon size={18} />}
        <div>
            <span className="text-sm font-semibold block">{label}</span>
            {description && <span className="text-[10px] opacity-70 font-normal block mt-0.5">{description}</span>}
        </div>
    </div>
    <div className={`w-11 h-6 rounded-full relative transition-colors duration-300 flex-shrink-0 ${active ? 'bg-[#3B82F6]' : 'bg-gray-300'}`}>
      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 shadow-sm ${active ? 'translate-x-6' : 'translate-x-1'}`} />
    </div>
  </button>
);

const StatusToast = ({ toast, onClose }) => {
    if (!toast || !toast.message) return null;
    const isError = toast.type === 'error';
    return (
        <div className={`absolute top-6 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-full shadow-2xl backdrop-blur flex items-center gap-3 animate-in slide-in-from-top-4 fade-in duration-300 max-w-sm w-full mx-4 ${isError ? 'bg-red-500 text-white' : 'bg-emerald-600 text-white'}`}>
            {isError ? <AlertTriangle size={18} /> : <Check size={18} />}
            <span className="text-sm font-medium flex-1">{toast.message}</span>
            <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-full transition-colors">
                <X size={16} />
            </button>
        </div>
    )
}

const QuickActionButton = ({ onClick, icon: Icon, title, active }) => (
    <button
        onClick={onClick}
        className={`p-3 rounded-full shadow-lg transition-all active:scale-90 flex items-center justify-center
            ${active 
                ? 'bg-[#3B82F6] text-white ring-2 ring-blue-200' 
                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-100'
            }`}
        title={title}
    >
        <Icon size={20} />
    </button>
);

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
  
  // Workflow State
  const [step, setStep] = useState('upload'); 
  
  // App Config
  const [mode, setMode] = useState('spiral'); 
  const [dotShape, setDotShape] = useState('circle'); 
  const [frameShape, setFrameShape] = useState('circle'); 
  const [compareMode, setCompareMode] = useState(false); 
  const [transparentBg, setTransparentBg] = useState(false); 
  
  // 3D Print Settings
  const [is3DMode, setIs3DMode] = useState(false);
  const [printWidth, setPrintWidth] = useState(200); // mm
  const [minThickness, setMinThickness] = useState(0.32); // mm
  
  // Physics
  const [rings, setRings] = useState(60); 
  const [scale, setScale] = useState(1); 
  const [rotation, setRotation] = useState(0); 
  const [panX, setPanX] = useState(50); 
  const [panY, setPanY] = useState(50); 
  const [centerHole, setCenterHole] = useState(0); 
  
  // Image Prep
  const [contrast, setContrast] = useState(1.0);
  const [brightness, setBrightness] = useState(0);
  const [lineThickness, setLineThickness] = useState(0.5); 
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

  // --- Actions ---
  useEffect(() => {
      if (window.innerWidth < 768) setSidebarOpen(false);
  }, []);

  // KEYBOARD SHORTCUTS
  useEffect(() => {
    const handleKeyDown = (e) => {
        // Don't trigger if typing in input
        if (e.target.tagName === 'INPUT') return;

        switch(e.key) {
            case 'ArrowUp': setPanY(p => Math.max(0, p - 5)); break;
            case 'ArrowDown': setPanY(p => Math.min(100, p + 5)); break;
            case 'ArrowLeft': setPanX(p => Math.max(0, p - 5)); break;
            case 'ArrowRight': setPanX(p => Math.min(100, p + 5)); break;
            case '+': case '=': setScale(s => Math.min(3.0, s + 0.1)); break;
            case '-': setScale(s => Math.max(0.5, s - 0.1)); break;
            case 'r': case 'R': resetView(); break;
            case 'c': case 'C': setCompareMode(prev => !prev); break;
            case 'Enter': if(step==='crop') setStep('edit'); break;
        }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [step]);

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
      setRings(60);
      setLineThickness(0.5);
      setRotation(0);
      if (mode === 'dots') setDotShape('circle');
      showToast("Pattern Settings Reset");
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setToast({ message: null, type: 'info' });
    
    if (!file.type.startsWith('image/')) {
        showToast("Invalid file type. Please upload a PNG or JPG image.", 'error');
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
        if (window.innerWidth < 768) setSidebarOpen(false); 
      };
      img.onerror = () => showToast("Failed to process image data.", 'error');
      img.src = event.target.result;
    };
    reader.onerror = () => showToast("Error reading file from disk.", 'error');
    reader.readAsDataURL(file);
  };

  // --- Drag Handling ---
  const handleStart = (e) => {
    if (!imageSrc) return;
    if (step !== 'crop') return; 
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
        
        // Output is always square based on crop
        const nativeSize = Math.min(img.width, img.height);
        const w = isExport ? nativeSize : Math.max(1, targetW);
        const h = w; 
        
        const fg = hexToRgb(fgColor);
        
        // 1. CLEAR Background (Always Transparent for export logic, shows white via CSS in preview)
        ctx.clearRect(0, 0, w, h);

        // 2. Prepare Source
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = w;
        tempCanvas.height = h;
        const tCtx = tempCanvas.getContext('2d');
        
        const imgAspect = img.width / img.height;
        let drawW, drawH;
        
        if (imgAspect > 1) {
            drawH = h * scale;
            drawW = drawH * imgAspect;
        } else {
            drawW = w * scale;
            drawH = drawW / imgAspect;
        }

        const shiftX = ((panX - 50) / 100) * w * 2;
        const shiftY = ((panY - 50) / 100) * h * 2;
        const centerX = w / 2;
        const centerY = h / 2;
        const drawX = centerX - (drawW / 2) + shiftX;
        const drawY = centerY - (drawH / 2) + shiftY;

        tCtx.save();
        tCtx.imageSmoothingEnabled = isExport;
        tCtx.imageSmoothingQuality = isExport ? 'high' : 'low';
        
        tCtx.drawImage(img, drawX, drawY, drawW, drawH);
        tCtx.restore();

        // ** CROP STEP RENDER **
        if (step === 'crop') {
            ctx.drawImage(tempCanvas, 0, 0);
            
            // Draw White Overlay
            ctx.fillStyle = 'rgba(255, 255, 255, 0.85)'; 
            ctx.beginPath();
            ctx.rect(0, 0, w, h); 
            
            if (frameShape === 'circle') {
                ctx.arc(centerX, centerY, w/2, 0, Math.PI * 2, true);
            } else {
                ctx.rect(centerX - w/2, centerY - h/2, w, h); 
            }
            ctx.fill('evenodd'); 
            
            ctx.strokeStyle = THEME_COLOR;
            ctx.lineWidth = 2;
            ctx.beginPath();
            if (frameShape === 'circle') {
                ctx.arc(centerX, centerY, w/2 - 1, 0, Math.PI * 2);
            } else {
                ctx.rect(1, 1, w-2, h-2);
            }
            ctx.stroke();
            return; 
        }

        // ** EDIT STEP RENDER **
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

        // 3D Print Calculation
        const pxPerMm = w / printWidth;
        const minFeaturePx = is3DMode ? (minThickness * pxPerMm) : 0;

        // 5. Halftone Loop
        for (let y = 0; y < h; y++) {
          for (let x = 0; x < w; x++) {
            const index = (y * w + x) * 4;
            
            // Set Transparent Pixel
            const setTransparent = () => {
                outputData[index] = 0; outputData[index+1] = 0; outputData[index+2] = 0; outputData[index+3] = 0;
            };

            const dx = x - centerX;
            const dy = y - centerY;
            const distSq = dx*dx + dy*dy;

            // Masking
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
            
            // Pattern Math
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
    const targetH = img.width; // Forced square
    
    // Cap for browser safety
    const safeW = Math.min(4096, targetW);
    const safeH = safeW;

    const canvas = canvasRef.current;
    if (canvas.width !== safeW || canvas.height !== safeH) {
        canvas.width = safeW;
        canvas.height = safeH;
    }
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    renderFrame(ctx, safeW, safeH, false);
    setIsProcessing(false);
  }, [mode, rings, scale, contrast, brightness, lineThickness, invert, rotation, fgColor, panX, panY, frameShape, dotShape, compareMode, centerHole, step, is3DMode, printWidth, minThickness]);

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
        // No background rect added - purely transparent by default

        // 3D Print Calc for SVG
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
                
                // 3D SAFETY SVG
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
                    
                    // 3D SAFETY LINES
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
            // DOTS SVG (Simplified)
            // Note: SVG dots are just circles. We enforce radius >= minFeaturePx/2
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
                    
                    // 3D SAFETY DOTS
                    // Calculate raw size then clamp
                    let rawSize = Math.pow((1-luma), 0.8) * maxSz * (lineThickness * 1.8);
                    
                    if (is3DMode) {
                        if (rawSize < minFeaturePx) rawSize = minFeaturePx;
                    }

                    // Check if should draw (basic threshold of visibility, but 3D mode forces it visible?)
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

  return (
    <div className="flex h-screen w-full bg-gray-50 text-slate-800 font-sans overflow-hidden" style={{ touchAction: 'none' }}>
      <StatusToast toast={toast} onClose={() => setToast({ message: null, type: 'info' })} />

      {/* MOBILE TOGGLE */}
      <div className="md:hidden fixed top-4 right-4 z-50">
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-3 bg-[#3B82F6] rounded-full text-white shadow-xl hover:bg-[#2563EB]">
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* SIDEBAR */}
      <div className={`fixed md:relative inset-y-0 left-0 w-80 md:w-96 bg-white border-r border-gray-200 transform transition-transform duration-300 z-40 flex flex-col overflow-hidden shadow-2xl md:shadow-none ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`} style={{ touchAction: 'auto' }}>
        <div className="p-6 border-b border-gray-100 bg-white sticky top-0 z-10 shrink-0 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#3B82F6] flex items-center justify-center shadow-lg"><Activity className="text-white" size={20} /></div>
                <div><h1 className="text-xl font-bold text-gray-900 tracking-tight">IF Studio</h1><p className="text-[10px] text-gray-400 font-mono tracking-wider uppercase">Pro Halftone Engine</p></div>
            </div>
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
                     <div className="text-[10px] uppercase font-bold text-gray-400 mb-3 tracking-wider">Select Frame Shape</div>
                     <div className="flex gap-3">
                         <button onClick={() => setFrameShape('circle')} className={`flex-1 flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${frameShape === 'circle' ? 'bg-blue-50 border-blue-200 text-blue-600 ring-1 ring-blue-300' : 'bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100'}`}><Circle size={24} className="mb-2"/><span className="text-xs font-bold">Circle</span></button>
                         <button onClick={() => setFrameShape('square')} className={`flex-1 flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${frameShape === 'square' ? 'bg-blue-50 border-blue-200 text-blue-600 ring-1 ring-blue-300' : 'bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100'}`}><Square size={24} className="mb-2"/><span className="text-xs font-bold">Square</span></button>
                     </div>
                  </section>

                  <section className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                     <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Image Position</div>
                     <div className="space-y-4">
                         <Slider label="Zoom" value={scale} min={0.5} max={3.0} step={0.1} onChange={setScale} />
                         <Slider label="Pan X" value={panX} min={0} max={100} step={1} onChange={setPanX} icon={Move} />
                         <Slider label="Pan Y" value={panY} min={0} max={100} step={1} onChange={setPanY} icon={Move} />
                     </div>
                  </section>

                  <button 
                    onClick={() => setStep('edit')} 
                    className="w-full py-4 bg-[#3B82F6] hover:bg-[#2563EB] text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95"
                  >
                      Apply Crop <ArrowRight size={18} />
                  </button>
              </div>
          ) : (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
                  <div className="flex items-center justify-between">
                      <div className="text-xs font-bold text-emerald-600 flex items-center gap-2 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100"><Check size={12} /> Crop Applied</div>
                      <button onClick={() => setStep('crop')} className="text-xs text-gray-400 hover:text-blue-600 underline">Edit Crop</button>
                  </div>

                  <section>
                    <div className="flex items-center justify-between mb-4"><h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2"><Layers size={14}/> Pattern Mode</h3></div>
                    <div className="flex gap-3">
                      <ModeButton active={mode === 'spiral'} onClick={() => setMode('spiral')} icon={Disc} label="Spiral" />
                      <ModeButton active={mode === 'lines'} onClick={() => setMode('lines')} icon={Layers} label="Lines" />
                      <ModeButton active={mode === 'dots'} onClick={() => setMode('dots')} icon={Grid} label="Dots" />
                    </div>
                    {mode === 'dots' && (
                        <div className="mt-4 p-4 bg-gray-50 rounded-2xl border border-gray-200">
                            <span className="text-[10px] uppercase font-bold text-gray-400 mb-3 block tracking-wider">Dot Shape</span>
                            <div className="flex gap-2">
                                <ShapeButton active={dotShape === 'circle'} onClick={() => setDotShape('circle')} icon={Circle} label="Circle" />
                                <ShapeButton active={dotShape === 'square'} onClick={() => setDotShape('square')} icon={Square} label="Square" />
                                <ShapeButton active={dotShape === 'diamond'} onClick={() => setDotShape('diamond')} icon={Square} rotateIcon label="Diamond" />
                                <ShapeButton active={dotShape === 'triangle'} onClick={() => setDotShape('triangle')} icon={Triangle} label="Triangle" />
                            </div>
                        </div>
                    )}
                  </section>
                  
                  <section className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                     <div className="flex items-center justify-between gap-2 mb-6 text-[#3B82F6] text-xs font-bold uppercase tracking-wider">
                         <div className="flex items-center gap-2"><Sliders size={14} /> Pattern Physics</div>
                         <button onClick={resetPatternSettings} className="p-1.5 hover:bg-blue-50 rounded-md text-blue-400 transition-colors" title="Reset Pattern Defaults">
                            <RotateCcw size={14} />
                         </button>
                     </div>
                     
                     <Slider highlight label="Density" value={rings} min={10} max={200} step={1} onChange={setRings} icon={Circle} />
                     <Slider highlight label="Thickness" value={lineThickness} min={0.1} max={2.0} step={0.05} onChange={setLineThickness} icon={Zap} />
                     <Slider label="Rotation" value={rotation} min={0} max={180} step={1} onChange={setRotation} icon={RefreshCw} />
                  </section>

                  <section className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                     <div className="flex items-center justify-between gap-2 mb-6 text-emerald-600 text-xs font-bold uppercase tracking-wider">
                        <div className="flex items-center gap-2"><Move size={14} /> Fine Tune</div>
                     </div>
                     <div className="grid grid-cols-2 gap-4 mb-4">
                         <Slider label="Contrast" value={contrast} min={0.5} max={3.0} step={0.1} onChange={setContrast} />
                         <Slider label="Bright" value={brightness} min={-100} max={100} step={5} onChange={setBrightness} />
                     </div>
                     <Slider label="Center Hole" value={centerHole} min={0} max={80} step={1} onChange={setCenterHole} icon={LayoutTemplate} tooltip="Creates an empty space in the middle (e.g., for clock faces)." />
                  </section>

                   <section className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                     <div className="flex items-center gap-2 mb-6 text-purple-500 text-xs font-bold uppercase tracking-wider"><Palette size={14} /> Color Palette</div>
                     <div className="grid grid-cols-1 gap-3">
                         <ColorPicker label="Ink (Foreground)" value={fgColor} onChange={setFgColor} />
                         <div className="mt-2"><Toggle label="Invert Brightness" active={invert} onToggle={() => setInvert(!invert)} icon={Zap} /></div>
                     </div>
                  </section>

                  <section className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                     <div className="flex items-center gap-2 mb-6 text-orange-500 text-xs font-bold uppercase tracking-wider"><Settings size={14} /> Fabrication</div>
                     <Toggle 
                        label="3D Print Mode" 
                        description="Enforce minimum thickness"
                        active={is3DMode} 
                        onToggle={() => setIs3DMode(!is3DMode)} 
                        icon={Printer} 
                     />
                     {is3DMode && (
                         <div className="mt-4 animate-in slide-in-from-top-2 space-y-4">
                             <div>
                                <div className="flex justify-between items-center mb-1">
                                    <label className="text-xs font-semibold text-gray-600">Target Print Width (mm)</label>
                                    <span className="text-xs font-mono text-gray-400">{printWidth}mm</span>
                                </div>
                                <input 
                                    type="number" 
                                    value={printWidth}
                                    onChange={(e) => setPrintWidth(Math.max(10, parseFloat(e.target.value) || 10))}
                                    className="w-full p-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:border-blue-300 outline-none"
                                />
                             </div>
                             
                             <Slider 
                                label="Min Thickness (mm)" 
                                value={minThickness} 
                                min={0.3} 
                                max={1.0} 
                                step={0.01} 
                                onChange={setMinThickness} 
                                tooltip="The smallest line width your printer can produce (usually nozzle size)."
                            />
                             
                             <p className="text-[10px] text-gray-400 leading-relaxed border-t border-gray-100 pt-2">
                                 Engine enforces {minThickness}mm features for a {printWidth}mm wide print.
                             </p>
                         </div>
                     )}
                  </section>
              </div>
          )}
        </div>

        {step === 'edit' && (
            <div className="p-6 border-t border-gray-100 space-y-4 bg-white shrink-0">
                 <label className="flex items-center justify-center w-full py-4 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-xl cursor-pointer transition-all border border-gray-200 group shadow-sm">
                    <Upload size={18} className="mr-3 group-hover:scale-110 transition-transform text-[#3B82F6]" />
                    <span className="font-bold text-sm tracking-wide">Upload Photo</span>
                    <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                </label>
                
                {/* Floating Toolbar - Desktop & Mobile */}
                <div className="absolute bottom-32 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-md p-2 rounded-2xl shadow-2xl border border-gray-100 flex items-center gap-2 transition-all hover:scale-105 z-50">
                     <QuickActionButton onClick={() => setScale(s => Math.max(0.5, s - 0.1))} icon={ZoomOut} title="Zoom Out" />
                     <QuickActionButton onClick={() => setScale(s => Math.min(3.0, s + 0.1))} icon={ZoomIn} title="Zoom In" />
                     <div className="w-px h-6 bg-gray-200 mx-1"></div>
                     <QuickActionButton onClick={resetView} icon={RotateCcw} title="Reset View" />
                     <QuickActionButton onClick={() => setCompareMode(!compareMode)} icon={compareMode ? Eye : EyeOff} title="Compare" active={compareMode} />
                     <div className="w-px h-6 bg-gray-200 mx-1"></div>
                     <QuickActionButton onClick={downloadPNG} icon={Download} title="Quick Download" />
                </div>

                <div className="flex gap-3">
                    <button onClick={downloadSVG} disabled={!imageSrc} className="flex-1 flex items-center justify-center py-4 bg-[#3B82F6] hover:bg-[#2563EB] text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-200 disabled:opacity-50"><Download size={18} className="mr-2" />SVG</button>
                    <button onClick={downloadPNG} disabled={!imageSrc} className="flex-1 flex items-center justify-center py-4 bg-white hover:bg-gray-50 text-gray-700 rounded-xl font-bold text-sm border border-gray-200 shadow-sm disabled:opacity-50"><Download size={18} className="mr-2" />PNG</button>
                </div>
            </div>
        )}
      </div>

      {/* CANVAS AREA */}
      <div 
        className="flex-1 bg-white relative flex flex-col items-center justify-center overflow-hidden p-0"
        ref={containerRef}
      >
        {/* Canvas Wrapper - handles layout */}
        <div 
            className="flex-1 w-full relative flex items-center justify-center overflow-hidden p-4 md:p-10 select-none"
            onMouseDown={handleStart} onMouseMove={handleMove} onMouseUp={handleEnd} onMouseLeave={handleEnd}
            onTouchStart={handleTouchStart} onTouchMove={handleMove} onTouchEnd={handleEnd}
        >
            {/* Background Grid - Subtle Light */}
            <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#ccc 1px, transparent 1px)', backgroundSize: '20px 20px' }} />

            {!imageSrc ? (
            <div className="relative z-10 text-center space-y-8 max-w-md p-10 border border-dashed border-gray-300 rounded-3xl bg-white/50 backdrop-blur-xl mx-6">
                <div className="w-28 h-28 bg-blue-50 rounded-full flex items-center justify-center mx-auto ring-8 ring-blue-50/50 mb-8"><ImageIcon size={56} className="text-blue-200" /></div>
                <div><h2 className="text-4xl font-black text-gray-900 mb-3">IF Studio</h2><p className="text-gray-500 text-lg">Professional Halftone Engine</p></div>
                
                <label className="inline-flex items-center px-10 py-5 bg-[#3B82F6] hover:bg-[#2563EB] text-white rounded-2xl cursor-pointer shadow-xl shadow-blue-200 transition-transform hover:-translate-y-1"><Upload size={24} className="mr-3" /><span className="font-bold text-lg">Upload Photo</span><input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} /></label>
                <p className="text-xs text-gray-400 flex items-center justify-center gap-1"><ShieldCheck size={12} /> 100% Private. Images are processed locally on your device.</p>
            </div>
            ) : (
            <div className="relative shadow-2xl border border-gray-200 max-w-full max-h-full flex items-center justify-center bg-white">
                {/* Canvas */}
                <canvas ref={canvasRef} className="max-w-full max-h-full object-contain" style={{ maxHeight: 'calc(100vh - 180px)', maxWidth: 'calc(100vw - 40px)' }} />
                
                {/* Crop Step Overlay UI */}
                {step === 'crop' && (
                    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 px-6 py-3 bg-white/90 backdrop-blur-md rounded-full text-sm font-semibold text-gray-600 flex items-center gap-3 border border-gray-200 shadow-xl whitespace-nowrap animate-in fade-in slide-in-from-bottom-4">
                        {isDragging ? <Move size={16} className="text-[#3B82F6]" /> : <Hand size={16} />} 
                        {isDragging ? "Panning..." : "Drag image to fit frame"}
                    </div>
                )}

                {/* Edit Step Overlay UI */}
                {step === 'edit' && (
                    <>
                        {/* Lock Icon */}
                        <div className="absolute top-4 left-4 bg-white/50 text-gray-400 p-2 rounded-full border border-gray-100" title="Image Position Locked"><Lock size={16} /></div>
                    </>
                )}

                {/* Loading Spinner */}
                {isProcessing && <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white/90 text-blue-600 px-6 py-3 rounded-full text-sm font-bold flex items-center shadow-xl animate-pulse border border-blue-100"><RefreshCw size={16} className="animate-spin mr-3" /> PROCESSING</div>}
            </div> 
            )}
        </div>

        {/* Advertisement Space */}
        <div className="w-full bg-gray-50 border-t border-gray-200 p-2 flex justify-center items-center shrink-0 h-[90px] relative z-20">
            <div className="w-[728px] h-full max-w-full bg-gray-100 rounded border border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400">
                <span className="text-[10px] font-bold uppercase tracking-widest mb-1">Advertisement Space</span>
                <span className="text-[10px] font-mono">728 x 90 Leaderboard</span>
            </div>
        </div>
      </div>
    </div>
  );
}
