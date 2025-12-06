import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Upload, Download, RefreshCw, Sliders, Image as ImageIcon, Zap, Layers, Circle, Grid, Activity, Move, Palette, Disc, MousePointer2, Hand, Settings, Menu, X, RotateCcw, Info, Square, Triangle, Eye, EyeOff, LayoutTemplate, Droplet, Check, ArrowRight, Crop, Maximize, AlertTriangle, ShieldCheck, Printer, Megaphone, Plus, ChevronUp, ChevronDown, Share2, HelpCircle, Sparkles, Wand2, Frame, Paintbrush, Waves } from 'lucide-react';

/**
 * IF Studio - Advanced Halftone & Spiral Image Engine By Insert Fabrication
 * v3.1 - Added Flow Field / Directional Hatching
 */

// --- Constants ---
const THEME_COLOR = '#3B82F6'; // Electric Blue
const DEFAULT_PATTERN_SETTINGS = {
    rings: 60,
    thickness: 0.5,
    rotation: 0,
    dotShape: 'circle'
};
const DEFAULT_MIN_THICKNESS = 0.32;

// CMYK Configuration
const CMYK_ANGLES = {
    c: 15,
    m: 75,
    y: 0,
    k: 45
};

const CMYK_COLORS = {
    c: '#00FFFF',
    m: '#FF00FF',
    y: '#FFFF00',
    k: '#000000'
};

// Curated Presets
const PRESETS = [
    { id: 'default', label: 'Default Spiral', icon: Disc, settings: { mode: 'spiral', colorMode: 'mono', rings: 60, thickness: 0.5, rotation: 0, contrast: 1.0, brightness: 0, borderWidth: 0 } },
    { id: 'flow-sketch', label: 'Contour Sketch', icon: Waves, settings: { mode: 'flow', colorMode: 'mono', rings: 80, thickness: 0.8, rotation: 0, contrast: 1.5, brightness: 10, borderWidth: 0 } },
    { id: 'cmyk-spiral', label: 'CMYK Spiral', icon: Palette, settings: { mode: 'spiral', colorMode: 'cmyk', rings: 50, thickness: 0.5, rotation: 0, contrast: 1.1, brightness: 5, borderWidth: 0 } },
    { id: 'stipple-fine', label: 'Fine Stipple', icon: Sparkles, settings: { mode: 'stipple', colorMode: 'mono', rings: 250, thickness: 0.4, rotation: 0, contrast: 1.1, brightness: 5, borderWidth: 0 } },
    { id: 'woodcut', label: 'Woodcut', icon: Layers, settings: { mode: 'lines', colorMode: 'mono', rings: 50, thickness: 0.6, rotation: 90, contrast: 1.4, brightness: -5, borderWidth: 1.5 } },
];

// Define fixed heights for UI elements on mobile
const MOBILE_HEADER_HEIGHT = 48; // h-12
const MOBILE_NAV_HEIGHT = 56;    // h-14 (edit mode) or h-16 (crop mode)
const MOBILE_DRAWER_HEIGHT = '40vh'; // max-h-[40vh]

// --- Helper: Pseudo-Random Number Generator ---
const seededRandom = (seed) => {
    let t = seed + 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
}

// --- Components ---

const Tooltip = ({ text }) => (
  <div className="group relative inline-block ml-2">
    <Info size={12} className="text-gray-400 hover:text-[#3B82F6] transition-colors cursor-help" />
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-40 p-2 bg-white border border-gray-200 text-[10px] text-gray-600 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-50 pointer-events-none text-center leading-relaxed">
      {text}
      <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-white" />
    </div>
  </div>
);

const Slider = ({ label, value, min, max, step, onChange, icon: Icon, highlight, formatValue, tooltip, onReset, resetValue, settingKey }) => (
  <div className="mb-3 md:mb-5 group">
    <div className="flex justify-between items-center mb-1">
      <div className={`flex items-center gap-1.5 text-xs md:text-sm font-semibold ${highlight ? 'text-blue-600' : 'text-gray-600'}`}>
        {Icon && <Icon size={14} className={`md:w-4 md:h-4 ${highlight ? "text-[#3B82F6]" : "text-gray-400"}`} />}
        {label}
        {tooltip && <Tooltip text={tooltip} />}
        {onReset && (
            <button
                onClick={() => onReset(settingKey, resetValue)}
                className="p-0.5 ml-1 rounded-full text-gray-300 hover:text-blue-500 transition-colors duration-150 transform hover:rotate-180 disabled:opacity-0"
                disabled={value === resetValue}
                title="Reset to Default"
            >
                <RotateCcw size={12} />
            </button>
        )}
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
        className="absolute w-full h-1.5 md:h-2 bg-gray-200 rounded-full appearance-none cursor-pointer transition-all duration-100 focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/50 z-10"
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
            border: 3px solid #3B82F6;
            cursor: pointer;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            transition: all 0.1s ease-out;
            margin-top: 0px; 
        }
        input[type=range]::-webkit-slider-thumb:active {
            transform: scale(1.1);
        }
        input[type=range]::-moz-range-thumb {
            height: 16px;
            width: 16px;
            border: 3px solid #3B82F6;
            border-radius: 50%;
            background: #ffffff;
            cursor: pointer;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            transition: all 0.1s ease-out;
        }
        @media (min-width: 768px) {
            input[type=range]::-webkit-slider-thumb { height: 18px; width: 18px; box-shadow: 0 2px 5px rgba(0,0,0,0.15); border-width: 2px; }
            input[type=range]::-moz-range-thumb { height: 18px; width: 18px; box-shadow: 0 2px 5px rgba(0,0,0,0.15); border-width: 2px; }
        }
      `}</style>
    </div>
  </div>
);

const ModeButton = ({ active, onClick, icon: Icon, label }) => (
  <button
    onClick={onClick}
    className={`flex-1 flex flex-col items-center justify-center py-2 px-1 md:py-3 md:px-2 rounded-xl transition-all duration-200 active:scale-95 hover:scale-[1.02] hover:shadow-md ${
      active
        ? 'bg-blue-50 border-blue-200 text-blue-600 shadow-lg ring-1 ring-blue-300'
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
      className={`flex-1 flex items-center justify-center p-2 md:p-2.5 rounded-lg transition-all duration-200 active:scale-95 ${
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
    <div className={`flex items-center justify-between p-2 md:p-3 rounded-xl border border-gray-200 bg-gray-50/50 transition-colors duration-150 ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-blue-300'}`}>
      <span className="text-xs md:text-sm font-medium text-gray-600">{label}</span>
      <div className="flex items-center gap-2 md:gap-3">
          <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">{value}</span>
          <div className="relative w-6 h-6 md:w-8 md:h-8 rounded-full overflow-hidden border border-gray-300 shadow-sm ring-1 ring-white cursor-pointer hover:scale-105 transition-transform duration-150">
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
                    <h2 className="text-xl md:text-2xl font-bold text-gray-900">IF Studio - Precision Vector Art Engine for Makers & Fabrication <span className="text-gray-400 text-base md:text-lg font-normal block md:inline">(Insert Fabrication)</span></h2>
                    <p className="text-xs md:text-sm text-gray-500 max-w-xs mx-auto">Precision Vector Art Engine for Makers & Fabrication</p>
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
                          <p className="font-bold text-blue-600">Contact: insertfabrication@gmail.com</p>
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
  const [isDragOver, setIsDragOver] = useState(false); // New state for drag visual
    
  // Mobile Navigation State
  const [activeTab, setActiveTab] = useState('pattern'); 
  const [activeCropTab, setActiveCropTab] = useState(null); // 'shape' or 'position'

  // Workflow State
  const [step, setStep] = useState('upload'); 
    
  // App Config (Final Values used for pattern generation)
  const [mode, setMode] = useState('spiral'); 
  // frameShape now tracks the CROP TYPE: 'circle', 'square', 'custom'
  const [frameShape, setFrameShape] = useState('circle'); 
  const [compareMode, setCompareMode] = useState(false); 
    
  // Pattern Mode Settings
  const [modeSettings, setModeSettings] = useState({
      spiral: DEFAULT_PATTERN_SETTINGS,
      lines:  DEFAULT_PATTERN_SETTINGS,
      dots:   DEFAULT_PATTERN_SETTINGS,
      stipple: { ...DEFAULT_PATTERN_SETTINGS, rings: 150 }, // Default higher density for stipple
      flow: { ...DEFAULT_PATTERN_SETTINGS, rings: 80, thickness: 0.8 } // Default flow settings
  });

  // NEW: Color Engine State
  const [colorMode, setColorMode] = useState('mono'); // 'mono' or 'cmyk'
  const [activeLayers, setActiveLayers] = useState({ c: true, m: true, y: true, k: true });

  // Dynamic label map for UX clarity
  const labelMap = {
    spiral: { 
        density: "Rings", 
        thickness: "Stroke Width", 
        densityTooltip: "Number of continuous rings (controls spatial frequency). Higher = denser pattern.",
        thicknessTooltip: "Controls the thickness/duty cycle of the line. Higher = darker output."
    },
    lines: { 
        density: "Lines/mm", 
        thickness: "Line Width", 
        densityTooltip: "Number of parallel lines (controls spatial frequency). Higher = denser pattern.",
        thicknessTooltip: "Controls the thickness/duty cycle of the line. Higher = darker output."
    },
    dots: { 
        density: "Grid Density", 
        thickness: "Dot Scale", 
        densityTooltip: "Controls the spacing of the dot grid. Higher = smaller spacing.",
        thicknessTooltip: "Controls the maximum size (scale) of the dots in the lightest areas."
    },
    stipple: {
        density: "Point Count",
        thickness: "Point Size",
        densityTooltip: "Controls the total number of attempts to place random dots. Max ~400k points.",
        thicknessTooltip: "Controls the relative size of the individual stipple dots."
    },
    flow: {
        density: "Stroke Density",
        thickness: "Stroke Length",
        densityTooltip: "Controls the spacing between the contour strokes.",
        thicknessTooltip: "Controls the length of the flow lines relative to the grid."
    }
  };
  const currentLabels = labelMap[mode] || labelMap.spiral;


  // Getters for Pattern Settings
  const rings = modeSettings[mode].rings;
  const lineThickness = modeSettings[mode].thickness;
  const rotation = modeSettings[mode].rotation;
  const dotShape = modeSettings[mode].dotShape;

  const updateSetting = (key, value) => {
      setModeSettings(prev => ({
          ...prev,
          [mode]: { ...prev[mode], [key]: value }
      }));
  };
    
  // 3D Print Settings
  const [is3DMode, setIs3DMode] = useState(false);
  const [minThickness, setMinThickness] = useState(DEFAULT_MIN_THICKNESS); // Default 0.32mm
    
  // Physics (Layout - FINAL Values)
  const [scale, setScale] = useState(1); 
  const [panX, setPanX] = useState(50); 
  const [panY, setPanY] = useState(50); 
  const [centerHole, setCenterHole] = useState(0); 
  
  // Border/Ring Thickness State (0-10)
  const [borderWidth, setBorderWidth] = useState(0);
    
  // Live Crop State (Used only during step='crop' for responsive feedback)
  const [liveCrop, setLiveCrop] = useState({ scale: 1, panX: 50, panY: 50, frameShape: 'circle' });
    
  // Custom Aspect Ratio States
  const [cropAspectW, setCropAspectW] = useState(16); // Default 16:9 for Custom
  const [cropAspectH, setCropAspectH] = useState(9); // Default 16:9 for Custom

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

  // Function to handle sharing (for desktop button)
  const handleShare = () => {
    // FIX: Simplified title property for native sharing.
    const shareData = {
        title: 'IF Studio: Vector Art Generator', 
        text: 'Convert your photos into vector art, spiral, halftone, and dot patterns for fabrication and design—free and in your browser!',
        url: window.location.href,
    };

    if (navigator.share) {
        navigator.share(shareData).catch((error) => console.log('Error sharing', error));
    } else {
        // Fallback for desktop browsers
        const tempInput = document.createElement('input');
        tempInput.value = window.location.href;
        document.body.appendChild(tempInput);
        tempInput.select();
        document.execCommand('copy');
        document.body.removeChild(tempInput);
        showToast("Link copied to clipboard!", 'info');
    }
  };

  const resetView = () => {
      // Reset Final States
      setScale(1); setPanX(50); setPanY(50); setCenterHole(0);
      // Reset Live Crop States
      setLiveCrop({ scale: 1, panX: 50, panY: 50, frameShape: 'circle' });
      // Reset Custom Aspect Ratio Inputs
      setCropAspectW(16); setCropAspectH(9);
      setFrameShape('circle'); // Reset final frame shape
      showToast("View Reset");
  };

  const resetPatternSettings = () => {
      updateSetting('rings', DEFAULT_PATTERN_SETTINGS.rings);
      updateSetting('thickness', DEFAULT_PATTERN_SETTINGS.thickness);
      updateSetting('rotation', DEFAULT_PATTERN_SETTINGS.rotation);
      if (mode === 'dots') updateSetting('dotShape', DEFAULT_PATTERN_SETTINGS.dotShape);
      showToast("Pattern Reset");
  };

  // Individual reset handler for sliders
  const handleSliderReset = (settingKey, defaultValue) => {
    if (['rings', 'thickness', 'rotation'].includes(settingKey)) {
        updateSetting(settingKey, defaultValue);
        showToast(`${settingKey} reset to default.`);
    } else if (settingKey === 'minThickness') {
        setMinThickness(DEFAULT_MIN_THICKNESS);
        showToast(`Min Thickness reset to ${DEFAULT_MIN_THICKNESS}mm.`);
    } else if (settingKey === 'centerHole') {
        setCenterHole(0);
        showToast(`Center Hole reset.`);
    } else if (settingKey === 'contrast') {
        setContrast(1.0);
        showToast(`Contrast reset.`);
    } else if (settingKey === 'brightness') {
        setBrightness(0);
        showToast(`Brightness reset.`);
    } else if (settingKey === 'borderWidth') {
        setBorderWidth(0);
        showToast(`Border reset.`);
    }
  };

  // --- NEW: Presets Handler ---
  const applyPreset = (preset) => {
      const s = preset.settings;
      if (!s) return;
      
      // Update Main Mode
      if (s.mode) setMode(s.mode);
      
      // Update Mode Specific Settings
      setModeSettings(prev => ({
          ...prev,
          [s.mode || mode]: { 
              rings: s.rings ?? prev[s.mode || mode].rings, 
              thickness: s.thickness ?? prev[s.mode || mode].thickness,
              rotation: s.rotation ?? prev[s.mode || mode].rotation,
              dotShape: s.dotShape ?? prev[s.mode || mode].dotShape
          }
      }));

      // Update Global Image Settings
      if (s.contrast !== undefined) setContrast(s.contrast);
      if (s.brightness !== undefined) setBrightness(s.brightness);
      if (s.borderWidth !== undefined) setBorderWidth(s.borderWidth);
      if (s.colorMode !== undefined) setColorMode(s.colorMode);
      
      // Update 3D Settings if present
      if (s.is3DMode !== undefined) setIs3DMode(s.is3DMode);
      if (s.minThickness !== undefined) setMinThickness(s.minThickness);

      showToast(`Applied preset: ${preset.label}`);
  };
    
  // --- UPDATED: Guarded Click Handler ---
  const handleMobileTabClick = (tab) => {
      if (!imageSrc) {
          // No functionality until image is uploaded
          return;
      }
      
      if (activeTab === tab) {
          setActiveTab(null); 
      } else {
          setActiveTab(tab);
      }
  };
    
  const handleMobileCropTabClick = (tab) => {
    setActiveCropTab(prev => prev === tab ? null : tab);
  };


  const handleCanvasClick = () => {
      // Closes mobile menu only if not in crop mode (where drag/pan is active)
      if (step === 'crop') return;
      if (window.innerWidth < 768) {
          setActiveTab(null); 
      }
  };

  const handleDoubleClick = () => {
      if (imageSrc && step === 'edit') {
          // Sync current FINAL state to LIVE state before entering crop mode
          setLiveCrop({ scale, panX, panY, frameShape });
          setStep('crop');
          setActiveCropTab('shape'); // Automatically open a tab to start cropping
          showToast("Editing Crop...");
      }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processFile(file);
  };

  // --- NEW: Centralized File Processor for Drag & Drop ---
  const processFile = (file) => {
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
        setLiveCrop({ scale: 1, panX: 50, panY: 50, frameShape: 'circle' }); // Initialize live crop
        setStep('crop'); 
        setActiveCropTab('shape'); // Automatically open crop controls
        if (window.innerWidth < 768) setActiveTab(null);
      };
      img.onerror = () => showToast("Failed to process image.", 'error');
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  // --- Drag Handling (Updates Live Crop State) ---
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
    
    setLiveCrop(prev => ({
        ...prev,
        panX: Math.min(100, Math.max(0, prev.panX + deltaX * sensitivity)),
        panY: Math.min(100, Math.max(0, prev.panY + deltaY * sensitivity))
    }));
  };

  const handleEnd = () => setIsDragging(false);

  const handleTouchStart = (e) => {
      if (!imageSrc) return;
      handleStart(e);
  };

  // --- NEW: Global Drag & Drop Handlers ---
  const onDragOver = (e) => {
      e.preventDefault();
      setIsDragOver(true);
  };
  
  const onDragLeave = (e) => {
      e.preventDefault();
      setIsDragOver(false);
  };
  
  const onDrop = (e) => {
      e.preventDefault();
      setIsDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) processFile(file);
  };

  // --- Render Core ---
  const renderFrame = (ctx, targetW, targetH, isExport = false) => {
    try {
        const img = sourceImageRef.current;
        if (!img) return;
        
        // --- Determine Current Frame Properties ---
        const currentScale = step === 'crop' ? liveCrop.scale : scale;
        const currentPanX = step === 'crop' ? liveCrop.panX : panX;
        const currentPanY = step === 'crop' ? liveCrop.panY : panY;
        const currentFrameShape = step === 'crop' ? liveCrop.frameShape : frameShape;

        // Determine aspect ratio
        let currentAspect = 1.0;
        if (currentFrameShape === 'custom') {
            currentAspect = cropAspectW / cropAspectH;
        } else if (currentFrameShape === 'square') {
            currentAspect = 1.0;
        }

        const nativeSize = Math.min(img.width, img.height);
        const w = targetW;
        const h = targetH;
        
        ctx.clearRect(0, 0, w, h);

        if (!helperCanvasRef.current) helperCanvasRef.current = document.createElement('canvas');
        const tempCanvas = helperCanvasRef.current;
        if (tempCanvas.width !== w || tempCanvas.height !== h) { tempCanvas.width = w; tempCanvas.height = h; }
        const tCtx = tempCanvas.getContext('2d');
        
        const imgAspect = img.width / img.height;
        let drawW, drawH;
        if (imgAspect > 1) { drawH = h * currentScale; drawW = drawH * imgAspect; } 
        else { drawW = w * currentScale; drawH = drawW / imgAspect; }

        const shiftX = ((currentPanX - 50) / 100) * w * 2;
        const shiftY = ((currentPanY - 50) / 100) * h * 2;
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

        // --- Crop Visualization / Masking ---
        const maxCropDim = Math.min(w, h);
        let cropW, cropH, cropX, cropY;

        if (currentFrameShape === 'circle' || currentFrameShape === 'square') {
            cropW = maxCropDim;
            cropH = maxCropDim;
            cropX = centerX - cropW / 2;
            cropY = centerY - cropH / 2;
        } else { // 'custom'
            const baseDim = maxCropDim;
            if (currentAspect >= 1) { // Landscape crop (W > H)
                cropW = baseDim;
                cropH = baseDim / currentAspect;
            } else { // Portrait crop (H > W)
                cropH = baseDim;
                cropW = baseDim * currentAspect;
            }
            cropX = centerX - cropW / 2;
            cropY = centerY - cropH / 2;
        }

        if (step === 'crop') {
            ctx.drawImage(tempCanvas, 0, 0);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.85)'; 
            ctx.beginPath();
            ctx.rect(0, 0, w, h); 
            
            if (currentFrameShape === 'circle') {
                ctx.arc(centerX, centerY, maxCropDim / 2, 0, Math.PI * 2, true);
            } else { // 'square' or 'custom'
                ctx.rect(cropX, cropY, cropW, cropH);
            }
            
            ctx.fill('evenodd'); 
            
            // Draw crop border
            ctx.strokeStyle = THEME_COLOR;
            ctx.lineWidth = 2;
            ctx.beginPath();
            if (currentFrameShape === 'circle') {
                ctx.arc(centerX, centerY, maxCropDim / 2 - 1, 0, Math.PI * 2);
            } else {
                ctx.rect(cropX + 1, cropY + 1, cropW - 2, cropH - 2);
            }
            ctx.stroke();
            return; 
        }

        // --- Pattern Generation Masking (Edit Mode / Export) ---
        
        // 1. Draw Image Data onto Pattern Context
        const sourceData = tCtx.getImageData(0, 0, w, h).data;
        const outputData = new Uint8ClampedArray(w * h * 4);

        const PI = Math.PI;
        const PI2 = Math.PI * 2;
        const effectiveRings = Math.max(1, rings); 
        
        const halfCropW = cropW / 2;
        const halfCropH = cropH / 2;
        const maxRadiusSq = (maxCropDim/2) * (maxCropDim/2);
        const holeRadiusSq = (centerHole > 0) ? ((maxCropDim/2) * (centerHole/100))**2 : -1;
        const pxPerMm = w / 200; // Default 200mm width if input hidden
        const minFeaturePx = is3DMode ? (minThickness * pxPerMm) : 0;

        // Define layers to process
        let layersToRender = [];
        if (colorMode === 'cmyk') {
            if (activeLayers.c) layersToRender.push({ key: 'c', color: CMYK_COLORS.c, angleOffset: CMYK_ANGLES.c });
            if (activeLayers.m) layersToRender.push({ key: 'm', color: CMYK_COLORS.m, angleOffset: CMYK_ANGLES.m });
            if (activeLayers.y) layersToRender.push({ key: 'y', color: CMYK_COLORS.y, angleOffset: CMYK_ANGLES.y });
            if (activeLayers.k) layersToRender.push({ key: 'k', color: CMYK_COLORS.k, angleOffset: CMYK_ANGLES.k });
        } else {
            layersToRender.push({ key: 'mono', color: hexToRgb(fgColor), angleOffset: 0 }); // Mono acts as "K" but mapped to luminance
        }

        ctx.clearRect(0, 0, w, h);
        
        // We iterate layers. For each layer, we compute the pattern.
        
        layersToRender.forEach(layer => {
            const isMono = layer.key === 'mono';
            const layerColor = isMono ? layer.color : hexToRgb(layer.color); // RGB object
            const totalRotation = rotation + layer.angleOffset;
            const radRotation = (totalRotation * PI) / 180;

            // Create a temp buffer for this layer
            const layerImgData = ctx.createImageData(w, h);
            const data = layerImgData.data;

            // -- Stipple Optimization for Layers --
            if (mode === 'stipple') {
                const totalPoints = effectiveRings * 800; 
                const baseScale = maxCropDim / 1000; 
                const dotRadius = Math.max(0.5, lineThickness * 1.5 * baseScale); 
                
                ctx.globalCompositeOperation = 'multiply';
                ctx.fillStyle = `rgba(${layerColor.r}, ${layerColor.g}, ${layerColor.b}, 1)`;
                
                for (let i = 0; i < totalPoints; i++) {
                    const r1 = seededRandom(i + (isMono ? 0 : layer.key.charCodeAt(0) * 1000));
                    const r2 = seededRandom(i + 1000000 + (isMono ? 0 : layer.key.charCodeAt(0) * 1000));
                    
                    let px, py;
                    if (frameShape === 'circle') {
                        px = centerX - maxCropDim/2 + r1 * maxCropDim;
                        py = centerY - maxCropDim/2 + r2 * maxCropDim;
                    } else {
                        px = cropX + r1 * cropW;
                        py = cropY + r2 * cropH;
                    }
                    
                    const dx = px - centerX; const dy = py - centerY; const distSq = dx*dx + dy*dy;
                    if (frameShape === 'circle' && distSq > maxRadiusSq) continue;
                    if (frameShape !== 'circle' && (Math.abs(dx) > halfCropW || Math.abs(dy) > halfCropH)) continue;
                    if (distSq < holeRadiusSq) continue;

                    const ix = Math.floor(px); const iy = Math.floor(py);
                    if (ix < 0 || ix >= w || iy < 0 || iy >= h) continue;
                    const idx = (iy * w + ix) * 4;
                    if (sourceData[idx+3] === 0) continue;

                    // Get Value based on Layer
                    let val = 1.0;
                    let r = sourceData[idx]/255, g = sourceData[idx+1]/255, b = sourceData[idx+2]/255;
                    
                    if (isMono) {
                        let luma = 0.299 * (r*255) + 0.587 * (g*255) + 0.114 * (b*255);
                        luma += brightness;
                        luma = (luma - 128) * contrast + 128;
                        if (luma < 0) luma = 0; if (luma > 255) luma = 255;
                        val = luma / 255;
                        if (invert) val = 1.0 - val;
                    } else {
                        r = ((r - 0.5) * contrast + 0.5) + (brightness/255);
                        g = ((g - 0.5) * contrast + 0.5) + (brightness/255);
                        b = ((b - 0.5) * contrast + 0.5) + (brightness/255);
                        r = Math.max(0, Math.min(1, r));
                        g = Math.max(0, Math.min(1, g));
                        b = Math.max(0, Math.min(1, b));

                        let k = 1 - Math.max(r, g, b);
                        let c = (1 - r - k) / (1 - k) || 0;
                        let m = (1 - g - k) / (1 - k) || 0;
                        let y = (1 - b - k) / (1 - k) || 0;
                        
                        if (layer.key === 'c') val = 1 - c;
                        if (layer.key === 'm') val = 1 - m;
                        if (layer.key === 'y') val = 1 - y;
                        if (layer.key === 'k') val = 1 - k;
                    }

                    const r3 = seededRandom(i + 2000000);
                    if (r3 > val) { // Keep dot
                        ctx.beginPath();
                        ctx.arc(px, py, dotRadius, 0, Math.PI*2);
                        ctx.fill();
                    }
                }
                ctx.globalCompositeOperation = 'source-over';
                return; 
            }

            // -- Flow Field (Contour) Logic --
            if (mode === 'flow') {
                const gridSize = maxCropDim / effectiveRings; 
                const strokeLen = gridSize * (lineThickness * 3.0); // Length scaler
                
                ctx.globalCompositeOperation = 'multiply';
                ctx.strokeStyle = `rgba(${layerColor.r}, ${layerColor.g}, ${layerColor.b}, 1)`;
                ctx.lineWidth = Math.max(1, gridSize * 0.2); // Base thickness
                
                // Iterate Grid
                for (let y = -maxCropDim/2; y < maxCropDim/2; y += gridSize) {
                    for (let x = -maxCropDim/2; x < maxCropDim/2; x += gridSize) {
                        const cx = centerX + x;
                        const cy = centerY + y;
                        
                        // Bounds Check
                        const dx = cx - centerX; const dy = cy - centerY; const distSq = dx*dx + dy*dy;
                        if (currentFrameShape === 'circle' && distSq > maxRadiusSq) continue;
                        if (currentFrameShape !== 'circle' && (Math.abs(dx) > halfCropW || Math.abs(dy) > halfCropH)) continue;
                        if (distSq < holeRadiusSq) continue;

                        const ix = Math.floor(cx); const iy = Math.floor(cy);
                        if (ix < 1 || ix >= w-1 || iy < 1 || iy >= h-1) continue;
                        const idx = (iy * w + ix) * 4;
                        if (sourceData[idx+3] === 0) continue;

                        // Calculate Sobel-ish Gradient Angle
                        // Sample neighbors
                        const getLumaAt = (ox, oy) => {
                            const i = ((iy+oy)*w + (ix+ox))*4;
                            let r = sourceData[i]/255, g = sourceData[i+1]/255, b = sourceData[i+2]/255;
                            return 0.299*r + 0.587*g + 0.114*b;
                        };
                        
                        const gx = getLumaAt(1, 0) - getLumaAt(-1, 0);
                        const gy = getLumaAt(0, 1) - getLumaAt(0, -1);
                        
                        // Angle perpendicular to gradient (contours)
                        const angle = Math.atan2(gy, gx) + Math.PI/2;
                        
                        // Brightness for length modulation? Or just presence?
                        // Let's use brightness to modulate thickness/opacity simulation or just draw everything like a field
                        // Usually flow fields draw everywhere but maybe skip very bright areas
                        const luma = getLumaAt(0,0);
                        const val = (luma - 0.5) * contrast + 0.5 + (brightness/255);
                        
                        // Threshold check
                        if (val > 0.95 && !invert) continue; // Skip white
                        if (val < 0.05 && invert) continue; // Skip black if inverted
                        
                        const len = strokeLen;
                        
                        const x1 = cx - Math.cos(angle) * len/2;
                        const y1 = cy - Math.sin(angle) * len/2;
                        const x2 = cx + Math.cos(angle) * len/2;
                        const y2 = cy + Math.sin(angle) * len/2;
                        
                        ctx.beginPath();
                        ctx.moveTo(x1, y1);
                        ctx.lineTo(x2, y2);
                        ctx.stroke();
                    }
                }
                ctx.globalCompositeOperation = 'source-over';
                return;
            }

            // -- Standard Modes Loop (Spiral, Lines, Dots) --
            // Only run this if NOT stipple AND NOT flow
            if (mode !== 'stipple' && mode !== 'flow') {
                for (let y = 0; y < h; y++) {
                    for (let x = 0; x < w; x++) {
                        const index = (y * w + x) * 4;
                        const setTransparent = () => { data[index+3] = 0; };

                        const dx = x - centerX; const dy = y - centerY; const distSq = dx*dx + dy*dy;

                        // Bounds
                        if (currentFrameShape === 'circle' && distSq > maxRadiusSq) { setTransparent(); continue; }
                        if (currentFrameShape !== 'circle' && (Math.abs(dx) > halfCropW || Math.abs(dy) > halfCropH)) { setTransparent(); continue; }
                        if (distSq < holeRadiusSq) { setTransparent(); continue; }
                        if (sourceData[index+3] === 0) { setTransparent(); continue; }

                        // Value Extraction
                        let val = 1.0;
                        let r = sourceData[index]/255, g = sourceData[index+1]/255, b = sourceData[index+2]/255;

                        if (isMono) {
                            let luma = 0.299 * (r*255) + 0.587 * (g*255) + 0.114 * (b*255);
                            luma += brightness;
                            luma = (luma - 128) * contrast + 128;
                            if (luma < 0) luma = 0; if (luma > 255) luma = 255;
                            val = luma / 255;
                            if (invert) val = 1.0 - val;
                        } else {
                            // CMYK Conversion with Contrast/Bright
                            r = ((r - 0.5) * contrast + 0.5) + (brightness/255);
                            g = ((g - 0.5) * contrast + 0.5) + (brightness/255);
                            b = ((b - 0.5) * contrast + 0.5) + (brightness/255);
                            r = Math.max(0, Math.min(1, r)); g = Math.max(0, Math.min(1, g)); b = Math.max(0, Math.min(1, b));

                            let k = 1 - Math.max(r, g, b);
                            let c = (1 - r - k) / (1 - k) || 0;
                            let m = (1 - g - k) / (1 - k) || 0;
                            let y = (1 - b - k) / (1 - k) || 0;
                            
                            if (layer.key === 'c') val = 1 - c;
                            if (layer.key === 'm') val = 1 - m;
                            if (layer.key === 'y') val = 1 - y;
                            if (layer.key === 'k') val = 1 - k;
                        }

                        let isForeground = false;

                        // Pattern Logic
                        if (mode === 'spiral') {
                            const dist = Math.sqrt(distSq);
                            const angle = Math.atan2(dy, dx) + radRotation;
                            const normDist = dist / (maxCropDim / 2);
                            const wave = Math.sin( (normDist * effectiveRings * PI2) + angle );
                            const spacingPx = (maxCropDim / 2) / effectiveRings; 
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
                            const normY = ry / (maxCropDim / 2); 
                            const wave = Math.sin( normY * effectiveRings * PI );
                            const spacingPx = maxCropDim / effectiveRings;
                            let threshold = (1 - val) * (lineThickness * 2);
                            if (is3DMode) {
                                const minDuty = minFeaturePx / spacingPx;
                                if (threshold < minDuty) threshold = minDuty;
                            }
                            if ((wave + 1) / 2 < threshold) isForeground = true;
                        } else if (mode === 'dots') {
                            const rx = dx * Math.cos(radRotation) - dy * Math.sin(radRotation);
                            const ry = dx * Math.sin(radRotation) + dy * Math.cos(radRotation);
                            const gridSize = maxCropDim / effectiveRings; 
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
                            data[index] = layerColor.r; data[index+1] = layerColor.g; data[index+2] = layerColor.b; data[index+3] = 255;
                        } else {
                            setTransparent();
                        }
                    }
                }
                
                // Composite this layer onto main canvas
                const layerCanvas = document.createElement('canvas');
                layerCanvas.width = w; layerCanvas.height = h;
                layerCanvas.getContext('2d').putImageData(layerImgData, 0, 0);
                
                ctx.globalCompositeOperation = 'multiply'; // Mix colors
                ctx.drawImage(layerCanvas, 0, 0);
                ctx.globalCompositeOperation = 'source-over';
            }
        }); // End Layer Loop
        
        // --- DRAW BORDER (On Top) ---
        if (borderWidth > 0) {
            const borderPx = (borderWidth * maxCropDim) / 200; 
            ctx.lineWidth = borderPx;
            // Border is always main theme color or black? In CMYK mode, border usually Black (K).
            ctx.strokeStyle = colorMode === 'cmyk' ? '#000000' : fgColor;
            ctx.beginPath();
            if (currentFrameShape === 'circle') {
                ctx.arc(centerX, centerY, maxCropDim / 2 - borderPx/2, 0, Math.PI * 2);
            } else {
                ctx.rect(cropX + borderPx/2, cropY + borderPx/2, cropW - borderPx, cropH - borderPx);
            }
            ctx.stroke();
        }

    } catch(e) {
        console.error(e);
        showToast("Rendering error. Try refreshing.", 'error');
    }
  };

  const processImage = useCallback(() => {
    if (!canvasRef.current || !sourceImageRef.current) return;
    const img = sourceImageRef.current;
    if (img.width === 0) return;

    // Determine which set of parameters to use
    const useLiveCrop = step === 'crop';
    
    // FIX: Use native size (min dimension) for aspect ratio calculation
    const targetW = Math.min(img.width, img.height);
    
    // Performance: Cap preview resolution at 800px to prevent bottlenecks on large images.
    // The pattern math scales relatively, so the visual density remains consistent with the high-res export.
    const safeW = Math.min(800, targetW); 
    const safeH = safeW;

    const canvas = canvasRef.current;
    if (canvas.width !== safeW || canvas.height !== safeH) {
        canvas.width = safeW;
        canvas.height = safeH;
    }
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    
    // Pass compareMode to renderFrame if needed, but for now we short-circuit the
    // rendering when compareMode is active to just show the original image layer.
    // NOTE: For true comparison, a background image render would be required.
    if (compareMode) {
        // Simple canvas clear and draw original image (using FINAL crop settings for reference)
        const currentScale = scale;
        const currentPanX = panX;
        const currentPanY = panY;

        const imgAspect = img.width / img.height;
        let drawW, drawH;
        if (imgAspect > 1) { drawH = safeH * currentScale; drawW = drawH * imgAspect; } 
        else { drawW = safeW * currentScale; drawH = drawW / imgAspect; }

        const shiftX = ((currentPanX - 50) / 100) * safeW * 2;
        const shiftY = ((currentPanY - 50) / 100) * safeH * 2;
        const centerX = safeW / 2;
        const centerY = safeH / 2;
        const drawX = centerX - (drawW / 2) + shiftX;
        const drawY = centerY - (drawH / 2) + shiftY;
        
        ctx.clearRect(0, 0, safeW, safeH);
        
        // --- CLIP MASK LOGIC ---
        ctx.save();
        ctx.beginPath();
        
        const maxCropDim = Math.min(safeW, safeH);
        let cropW, cropH;
        let finalAspect = 1.0;
        if (frameShape === 'custom') { finalAspect = cropAspectW / cropAspectH; }

        if (frameShape === 'circle' || frameShape === 'square') {
            cropW = maxCropDim;
            cropH = maxCropDim;
        } else { // 'custom'
            const baseDim = maxCropDim;
            if (finalAspect >= 1) { 
                cropW = baseDim;
                cropH = baseDim / finalAspect;
            } else { 
                cropH = baseDim;
                cropW = baseDim * finalAspect;
            }
        }
        const cropX = centerX - cropW / 2;
        const cropY = centerY - cropH / 2;
        
        // 1. Apply Outer Clip
        if (frameShape === 'circle') {
            ctx.arc(centerX, centerY, maxCropDim / 2, 0, Math.PI * 2);
        } else {
            ctx.rect(cropX, cropY, cropW, cropH);
        }
        ctx.clip();
        
        // 2. Draw Image
        ctx.drawImage(img, drawX, drawY, drawW, drawH);
        
        // 3. Cut out Center Hole if needed (to match render)
        if (centerHole > 0) {
            ctx.globalCompositeOperation = 'destination-out';
            ctx.beginPath();
            const holeRadius = (maxCropDim/2) * (centerHole/100);
            ctx.arc(centerX, centerY, holeRadius, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalCompositeOperation = 'source-over';
        }

        ctx.restore();
        
        // Show boundary of the cropped area
        ctx.strokeStyle = '#FF0000'; // Red border for comparison mode
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        if (frameShape === 'circle') {
            ctx.arc(centerX, centerY, maxCropDim / 2, 0, Math.PI * 2);
        } else {
            ctx.rect(cropX, cropY, cropW, cropH);
        }
        ctx.stroke();
        ctx.setLineDash([]); // Reset line dash
        
    } else {
        renderFrame(ctx, safeW, safeH, false);
    }
    setIsProcessing(false);
  }, [mode, modeSettings, scale, contrast, brightness, invert, fgColor, panX, panY, frameShape, centerHole, step, is3DMode, minThickness, isDragging, compareMode, liveCrop.scale, liveCrop.panX, liveCrop.panY, liveCrop.frameShape, cropAspectW, cropAspectH, borderWidth, colorMode, activeLayers]); // Added colorMode, activeLayers

  // SUGGESTION 1: Add Canvas Resize Listener for Stability
  useEffect(() => {
    // This handler will be called when the window size changes
    const handleResize = () => {
        // We call processImage which correctly reads the current image and canvas ref
        // dimensions and redraws the content within the new boundaries.
        processImage();
    };

    window.addEventListener('resize', handleResize);
    // Cleanup the event listener when the component unmounts
    return () => window.removeEventListener('resize', handleResize);
  }, [processImage]);

  useEffect(() => {
    if (!imageSrc) return;
    setIsProcessing(true);
    let id;
    // Debounce rendering slightly for performance during dragging/sliding
    const timer = setTimeout(() => { id = requestAnimationFrame(processImage); }, 15); 
    return () => { clearTimeout(timer); if(id) cancelAnimationFrame(id); };
  }, [processImage, imageSrc]);

  // --- SVG Export Logic ---
  const downloadSVG = () => { 
    if (!sourceImageRef.current || !canvasRef.current) return;
    setIsProcessing(true);
    showToast(`Calculating Vectors...`, 'info');

    setTimeout(() => {
        try {
            // We use the pixel data from the canvas because it's already cropped, filtered, and processed
            // This ensures WYSIWYG results.
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            const w = canvas.width;
            const h = canvas.height;
            const imgData = ctx.getImageData(0, 0, w, h).data;

            // Geometry Config
            const PI = Math.PI;
            const centerX = w / 2;
            const centerY = h / 2;
            const effectiveRings = Math.max(1, rings); 
            // Rotation is now handled per layer!
            
            // Re-calculate crop bounds to ensure vectors don't spill
            let cropW, cropH;
            let finalAspect = 1.0;
            if (frameShape === 'custom') finalAspect = cropAspectW / cropAspectH;

            // Base max size is the square canvas
            const maxCropDim = Math.min(w, h);
            
            if (frameShape === 'circle' || frameShape === 'square') {
                cropW = maxCropDim;
                cropH = maxCropDim;
            } else { // 'custom'
                if (finalAspect >= 1) { cropW = maxCropDim; cropH = maxCropDim / finalAspect; }
                else { cropH = maxCropDim; cropW = maxCropDim * finalAspect; }
            }
            const halfCropW = cropW / 2;
            const halfCropH = cropH / 2;
            const maxRadiusSq = (maxCropDim/2) * (maxCropDim/2);
            const holeRadiusSq = (centerHole > 0) ? ((maxCropDim/2) * (centerHole/100))**2 : -1;

            let svgBody = "";

            // Get Continuous Tone Data from Helper Canvas
            const tempCtx = helperCanvasRef.current.getContext('2d');
            const sourceData = tempCtx.getImageData(0, 0, w, h).data;

            // Define Layers to Export
            let layersToExport = [];
            if (colorMode === 'cmyk') {
                if (activeLayers.c) layersToExport.push({ key: 'c', name: 'Cyan', color: CMYK_COLORS.c, angleOffset: CMYK_ANGLES.c });
                if (activeLayers.m) layersToExport.push({ key: 'm', name: 'Magenta', color: CMYK_COLORS.m, angleOffset: CMYK_ANGLES.m });
                if (activeLayers.y) layersToExport.push({ key: 'y', name: 'Yellow', color: CMYK_COLORS.y, angleOffset: CMYK_ANGLES.y });
                if (activeLayers.k) layersToExport.push({ key: 'k', name: 'Key', color: CMYK_COLORS.k, angleOffset: CMYK_ANGLES.k });
            } else {
                layersToExport.push({ key: 'mono', name: 'Layer_1', color: fgColor, angleOffset: 0 });
            }

            layersToExport.forEach(layer => {
                let layerPaths = [];
                const totalRotation = rotation + layer.angleOffset;
                const radRotation = (totalRotation * PI) / 180;
                
                // Helper to get value specific to this layer
                const getSourceVal = (x, y) => {
                    const ix = Math.floor(x); const iy = Math.floor(y);
                    if (ix < 0 || ix >= w || iy < 0 || iy >= h) return 1;
                    const dx = ix - centerX; const dy = iy - centerY; const distSq = dx*dx + dy*dy;
                    if (frameShape === 'circle' && distSq > maxRadiusSq) return 1;
                    if (frameShape !== 'circle' && (Math.abs(dx) > halfCropW || Math.abs(dy) > halfCropH)) return 1;
                    if (distSq < holeRadiusSq) return 1;
                    
                    const idx = (iy * w + ix) * 4;
                    if (sourceData[idx+3] === 0) return 1;

                    let r = sourceData[idx]/255; let g = sourceData[idx+1]/255; let b = sourceData[idx+2]/255;
                    let val = 1.0;

                    if (colorMode === 'mono') {
                        let luma = 0.299 * (r*255) + 0.587 * (g*255) + 0.114 * (b*255);
                        luma += brightness;
                        luma = (luma - 128) * contrast + 128;
                        if (luma < 0) luma = 0; if (luma > 255) luma = 255;
                        val = luma / 255;
                        if (invert) val = 1.0 - val;
                    } else {
                        // CMYK
                        r = ((r - 0.5) * contrast + 0.5) + (brightness/255);
                        g = ((g - 0.5) * contrast + 0.5) + (brightness/255);
                        b = ((b - 0.5) * contrast + 0.5) + (brightness/255);
                        r = Math.max(0, Math.min(1, r)); g = Math.max(0, Math.min(1, g)); b = Math.max(0, Math.min(1, b));

                        let k = 1 - Math.max(r, g, b);
                        let c = (1 - r - k) / (1 - k) || 0;
                        let m = (1 - g - k) / (1 - k) || 0;
                        let y = (1 - b - k) / (1 - k) || 0;
                        
                        if (layer.key === 'c') val = 1 - c;
                        if (layer.key === 'm') val = 1 - m;
                        if (layer.key === 'y') val = 1 - y;
                        if (layer.key === 'k') val = 1 - k;
                    }
                    return val;
                };

                // --- Generation Logic (Per Layer) ---
                if (mode === 'flow') {
                    const gridSize = maxCropDim / effectiveRings; 
                    const strokeLen = gridSize * (lineThickness * 3.0);
                    
                    // Iterate Grid
                    for (let y = -maxCropDim/2; y < maxCropDim/2; y += gridSize) {
                        for (let x = -maxCropDim/2; x < maxCropDim/2; x += gridSize) {
                            const cx = centerX + x; const cy = centerY + y;
                            
                            // Bounds Check
                            const dx = cx - centerX; const dy = cy - centerY; const distSq = dx*dx + dy*dy;
                            if (frameShape === 'circle' && distSq > maxRadiusSq) continue;
                            if (frameShape !== 'circle' && (Math.abs(dx) > halfCropW || Math.abs(dy) > halfCropH)) continue;
                            if (distSq < holeRadiusSq) continue;

                            const ix = Math.floor(cx); const iy = Math.floor(cy);
                            if (ix < 1 || ix >= w-1 || iy < 1 || iy >= h-1) continue;
                            const idx = (iy * w + ix) * 4;
                            if (sourceData[idx+3] === 0) continue;

                            // Calculate Sobel-ish Gradient Angle
                            const getLumaAt = (ox, oy) => {
                                const i = ((iy+oy)*w + (ix+ox))*4;
                                let r = sourceData[i]/255, g = sourceData[i+1]/255, b = sourceData[i+2]/255;
                                return 0.299*r + 0.587*g + 0.114*b;
                            };
                            
                            const gx = getLumaAt(1, 0) - getLumaAt(-1, 0);
                            const gy = getLumaAt(0, 1) - getLumaAt(0, -1);
                            
                            // Angle perpendicular to gradient (contours)
                            const angle = Math.atan2(gy, gx) + Math.PI/2;
                            
                            // Brightness check for filtering
                            const val = getSourceVal(cx, cy); // 0 (dark) to 1 (light)
                            if (val > 0.95) continue; // Skip white areas
                            
                            const len = strokeLen;
                            const x1 = cx - Math.cos(angle) * len/2;
                            const y1 = cy - Math.sin(angle) * len/2;
                            const x2 = cx + Math.cos(angle) * len/2;
                            const y2 = cy + Math.sin(angle) * len/2;
                            
                            layerPaths.push(`<line x1="${x1.toFixed(2)}" y1="${y1.toFixed(2)}" x2="${x2.toFixed(2)}" y2="${y2.toFixed(2)}" stroke-width="${Math.max(0.5, gridSize*0.2).toFixed(2)}" stroke-linecap="round" />`);
                        }
                    }
                } else if (mode === 'stipple') {
                    // ... existing stipple logic ...
                    const totalPoints = effectiveRings * 800;
                    const baseScale = maxCropDim / 1000; 
                    const dotRadius = Math.max(0.5, lineThickness * 1.5 * baseScale); 
                    
                    for (let i = 0; i < totalPoints; i++) {
                        const seedOffset = layer.key === 'mono' ? 0 : layer.key.charCodeAt(0) * 1000;
                        const r1 = seededRandom(i + seedOffset);
                        const r2 = seededRandom(i + 1000000 + seedOffset);
                        
                        let px, py;
                        if (frameShape === 'circle') {
                            px = centerX - maxCropDim/2 + r1 * maxCropDim;
                            py = centerY - maxCropDim/2 + r2 * maxCropDim;
                        } else {
                            px = (centerX - cropW/2) + r1 * cropW;
                            py = (centerY - cropH/2) + r2 * cropH;
                        }
                        
                        const val = getSourceVal(px, py); // 0 (dark) to 1 (light)
                        if (val === 1) continue;
                        
                        const r3 = seededRandom(i + 2000000);
                        if (r3 > val) { // Keep dot
                            layerPaths.push(`<circle cx="${px.toFixed(2)}" cy="${py.toFixed(2)}" r="${dotRadius.toFixed(2)}" />`);
                        }
                    }

                } else if (mode === 'dots') {
                    // ... existing dots logic ...
                    const gridSize = maxCropDim / effectiveRings; 
                    for (let y = -maxCropDim/2; y < maxCropDim/2; y += gridSize) {
                        for (let x = -maxCropDim/2; x < maxCropDim/2; x += gridSize) {
                            const rx = x * Math.cos(radRotation) - y * Math.sin(radRotation);
                            const ry = x * Math.sin(radRotation) + y * Math.cos(radRotation);
                            const cx = centerX + rx; const cy = centerY + ry;
                            const val = getSourceVal(cx, cy); 
                            const thickness = (1 - val) * lineThickness; 
                            if (thickness > 0.05) { 
                                const size = gridSize * thickness; 
                                if (dotShape === 'circle') {
                                    layerPaths.push(`<circle cx="${cx.toFixed(2)}" cy="${cy.toFixed(2)}" r="${(size/1.5).toFixed(2)}" />`);
                                } else if (dotShape === 'square') {
                                    layerPaths.push(`<rect x="${(cx - size/2).toFixed(2)}" y="${(cy - size/2).toFixed(2)}" width="${size.toFixed(2)}" height="${size.toFixed(2)}" />`);
                                } else if (dotShape === 'diamond') {
                                    layerPaths.push(`<rect x="${(cx - size/2).toFixed(2)}" y="${(cy - size/2).toFixed(2)}" width="${size.toFixed(2)}" height="${size.toFixed(2)}" transform="rotate(45 ${cx} ${cy})" />`);
                                } else if (dotShape === 'triangle') {
                                    const hTri = size * (Math.sqrt(3)/2); const rTri = hTri * (2/3); 
                                    const p1 = `${cx},${cy - rTri}`; const p2 = `${cx - size/2},${cy + (hTri - rTri)}`; const p3 = `${cx + size/2},${cy + (hTri - rTri)}`;
                                    layerPaths.push(`<polygon points="${p1} ${p2} ${p3}" />`);
                                }
                            }
                        }
                    }

                } else if (mode === 'spiral') {
                    // ... existing spiral logic ...
                    const spacingPx = (maxCropDim / 2) / effectiveRings;
                    const maxTheta = effectiveRings * 2 * PI;
                    const steps = Math.min(20000, effectiveRings * 120); 
                    const stepSize = maxTheta / steps;
                    let innerPoints = []; let outerPoints = []; let isDrawing = false;
                    
                    for (let theta = 0; theta < maxTheta; theta += stepSize) {
                        const normDist = theta / maxTheta; const r = normDist * (maxCropDim / 2);
                        const angle = theta + radRotation;
                        const cx = centerX + r * Math.cos(angle); const cy = centerY + r * Math.sin(angle);
                        const val = getSourceVal(cx, cy);
                        let wFactor = (1 - val) * lineThickness; if (wFactor < 0) wFactor = 0;
                        if (is3DMode && wFactor > 0) { const minDuty = (minThickness * (w/200)) / spacingPx; if (wFactor < minDuty) wFactor = minDuty; }
                        const actualWidth = wFactor * spacingPx;

                        if (actualWidth > 0.5) { 
                            if (!isDrawing) isDrawing = true; 
                            const rInner = r - actualWidth/2; const rOuter = r + actualWidth/2;
                            innerPoints.push({ x: centerX + rInner * Math.cos(angle), y: centerY + rInner * Math.sin(angle) });
                            outerPoints.push({ x: centerX + rOuter * Math.cos(angle), y: centerY + rOuter * Math.sin(angle) });
                        } else {
                            if (isDrawing) {
                                if (innerPoints.length > 2) {
                                    let d = `M ${innerPoints[0].x.toFixed(2)} ${innerPoints[0].y.toFixed(2)} `;
                                    for(let i=1; i<innerPoints.length; i++) d += `L ${innerPoints[i].x.toFixed(2)} ${innerPoints[i].y.toFixed(2)} `;
                                    d += `L ${outerPoints[outerPoints.length-1].x.toFixed(2)} ${outerPoints[outerPoints.length-1].y.toFixed(2)} `;
                                    for(let i=outerPoints.length-2; i>=0; i--) d += `L ${outerPoints[i].x.toFixed(2)} ${outerPoints[i].y.toFixed(2)} `;
                                    d += "Z";
                                    layerPaths.push(`<path d="${d}" stroke="none" />`);
                                }
                                innerPoints = []; outerPoints = []; isDrawing = false;
                            }
                        }
                    }
                    if (innerPoints.length > 2) {
                        let d = `M ${innerPoints[0].x.toFixed(2)} ${innerPoints[0].y.toFixed(2)} `;
                        for(let i=1; i<innerPoints.length; i++) d += `L ${innerPoints[i].x.toFixed(2)} ${innerPoints[i].y.toFixed(2)} `;
                        d += `L ${outerPoints[outerPoints.length-1].x.toFixed(2)} ${outerPoints[outerPoints.length-1].y.toFixed(2)} `;
                        for(let i=outerPoints.length-2; i>=0; i--) d += `L ${outerPoints[i].x.toFixed(2)} ${outerPoints[i].y.toFixed(2)} `;
                        d += "Z";
                        layerPaths.push(`<path d="${d}" stroke="none" />`);
                    }

                } else if (mode === 'lines') {
                    // ... existing lines logic ...
                    const spacingPx = maxCropDim / effectiveRings;
                    for (let ly = -maxCropDim/2; ly < maxCropDim/2; ly += spacingPx) {
                        let innerPoints = []; let outerPoints = []; let isDrawing = false;
                        const stepPx = 2; 
                        for (let lx = -maxCropDim/2; lx < maxCropDim/2; lx += stepPx) {
                            const gx = centerX + (lx * Math.cos(radRotation) - ly * Math.sin(radRotation));
                            const gy = centerY + (lx * Math.sin(radRotation) + ly * Math.cos(radRotation));
                            const val = getSourceVal(gx, gy);
                            let wFactor = (1 - val) * lineThickness; if (wFactor < 0) wFactor = 0;
                            if (is3DMode && wFactor > 0) { const minDuty = (minThickness * (w/200)) / spacingPx; if (wFactor < minDuty) wFactor = minDuty; }
                            const actualWidth = wFactor * spacingPx;
                            
                            if (actualWidth > 0.5) {
                                if (!isDrawing) isDrawing = true;
                                const nx = -Math.sin(radRotation) * (actualWidth/2);
                                const ny = Math.cos(radRotation) * (actualWidth/2);
                                innerPoints.push({ x: gx + nx, y: gy + ny });
                                outerPoints.push({ x: gx - nx, y: gy - ny });
                            } else {
                                if (isDrawing) {
                                    if (innerPoints.length > 2) {
                                        let d = `M ${innerPoints[0].x.toFixed(2)} ${innerPoints[0].y.toFixed(2)} `;
                                        for(let i=1; i<innerPoints.length; i++) d += `L ${innerPoints[i].x.toFixed(2)} ${innerPoints[i].y.toFixed(2)} `;
                                        d += `L ${outerPoints[outerPoints.length-1].x.toFixed(2)} ${outerPoints[outerPoints.length-1].y.toFixed(2)} `;
                                        for(let i=outerPoints.length-2; i>=0; i--) d += `L ${outerPoints[i].x.toFixed(2)} ${outerPoints[i].y.toFixed(2)} `;
                                        d += "Z";
                                        layerPaths.push(`<path d="${d}" stroke="none" />`);
                                    }
                                    innerPoints = []; outerPoints = []; isDrawing = false;
                                }
                            }
                        }
                        if (innerPoints.length > 2) {
                            let d = `M ${innerPoints[0].x.toFixed(2)} ${innerPoints[0].y.toFixed(2)} `;
                            for(let i=1; i<innerPoints.length; i++) d += `L ${innerPoints[i].x.toFixed(2)} ${innerPoints[i].y.toFixed(2)} `;
                            d += `L ${outerPoints[outerPoints.length-1].x.toFixed(2)} ${outerPoints[outerPoints.length-1].y.toFixed(2)} `;
                            for(let i=outerPoints.length-2; i>=0; i--) d += `L ${outerPoints[i].x.toFixed(2)} ${outerPoints[i].y.toFixed(2)} `;
                            d += "Z";
                            layerPaths.push(`<path d="${d}" stroke="none" />`);
                        }
                    }
                }

                // Add Layer Group to SVG Body
                svgBody += `<g id="${layer.name}" fill="${layer.color}" stroke="none">\n${layerPaths.join('\n')}\n</g>\n`;
            }); // End Layer Loop

            // --- ADD BORDER/RING TO SVG (Top Level) ---
            if (borderWidth > 0) {
                const borderPx = (borderWidth * maxCropDim) / 200;
                const cropX = (frameShape === 'circle') ? centerX : (centerX - cropW / 2);
                const cropY = (frameShape === 'circle') ? centerY : (centerY - cropH / 2);
                const strokeColor = colorMode === 'cmyk' ? '#000000' : fgColor;
                
                svgBody += `<g id="Border">\n`;
                if (frameShape === 'circle') {
                    svgBody += `<circle cx="${centerX.toFixed(2)}" cy="${centerY.toFixed(2)}" r="${(maxCropDim/2 - borderPx/2).toFixed(2)}" stroke="${strokeColor}" stroke-width="${borderPx.toFixed(2)}" fill="none" />`;
                } else {
                    svgBody += `<rect x="${(cropX + borderPx/2).toFixed(2)}" y="${(cropY + borderPx/2).toFixed(2)}" width="${(cropW - borderPx).toFixed(2)}" height="${(cropH - borderPx).toFixed(2)}" stroke="${strokeColor}" stroke-width="${borderPx.toFixed(2)}" fill="none" />`;
                }
                svgBody += `\n</g>`;
            }

            const svgFile = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}mm" height="${h}mm">${svgBody}</svg>`;
            
            const blob = new Blob([svgFile], {type: 'image/svg+xml'});
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `if-studio-${mode}-${Date.now()}.svg`;
            link.click();
            URL.revokeObjectURL(url);
            showToast("SVG Generated Successfully!", 'success');

        } catch(e) {
            console.error("SVG Gen Error", e);
            showToast("Failed to generate SVG. Try reducing density.", 'error');
        } finally {
            setIsProcessing(false);
        }
    }, 100); // Short delay to allow UI to update state to "Processing"
  };
    
  const downloadPNG = (multiplier) => { // Multiplier argument is now 1 (Native) or 2 (Double)
    const exportMultiplier = multiplier || 1; 
    if (!sourceImageRef.current) return;
    setIsProcessing(true);
    showToast(`Generating PNG...`, 'success');
    
    // Use a small delay to ensure the UI updates before the heavy canvas operation
    setTimeout(() => {
        try {
            const img = sourceImageRef.current;
            const nativeSize = Math.min(img.width, img.height);
            
            let finalAspect = 1.0;
            if (frameShape === 'custom') {
                finalAspect = cropAspectW / cropAspectH;
            } else if (frameShape === 'square') {
                finalAspect = 1.0;
            }

            const maxNativeDim = nativeSize * exportMultiplier;
            let w, h;

            if (frameShape === 'custom' || frameShape === 'square') {
                if (finalAspect >= 1) {
                    w = maxNativeDim;
                    h = maxNativeDim / finalAspect;
                } else {
                    h = maxNativeDim;
                    w = maxNativeDim * finalAspect;
                }
            } else { // Circle, defaults to square native size
                w = maxNativeDim;
                h = maxNativeDim;
            }

            const offCanvas = document.createElement('canvas');
            offCanvas.width = maxNativeDim; // The drawing context size remains square
            offCanvas.height = maxNativeDim;
            const ctx = offCanvas.getContext('2d');
            
            // Pass the multiplied square size to renderFrame
            renderFrame(ctx, maxNativeDim, maxNativeDim, true);
            
            // Create a final canvas cropped to the final rectangular shape for PNG
            const finalCanvas = document.createElement('canvas');
            finalCanvas.width = w;
            finalCanvas.height = h;
            const finalCtx = finalCanvas.getContext('2d');
            
            // Calculate crop source position from the center of the square drawing area
            const sourceX = (maxNativeDim - w) / 2;
            const sourceY = (maxNativeDim - h) / 2;

            finalCtx.drawImage(
                offCanvas, 
                sourceX, sourceY, w, h, // Source rectangle
                0, 0, w, h                // Destination rectangle
            );
            
            // Trigger download
            const link = document.createElement('a');
            link.download = `if-studio-${Date.now()}.png`;
            link.href = finalCanvas.toDataURL('image/png');
            link.click();

        } catch(e) {
            console.error("PNG Gen Error", e);
            showToast("Failed to generate PNG. Check console for details.", 'error');
        } finally {
             setIsProcessing(false);
        }
    }, 50);
  };
    
  // --- Cropping Action ---
  const applyCropAndGoToEdit = () => {
    // 1. Apply LIVE crop settings to FINAL states
    setScale(liveCrop.scale);
    setPanX(liveCrop.panX);
    setPanY(liveCrop.panY);
    setFrameShape(liveCrop.frameShape);
    
    // 2. Switch mode
    setStep('edit');
    setActiveCropTab(null);
    showToast("Crop Applied!");
  };


  // --- UI RENDER ---
  const renderControls = (section) => {
      switch(section) {
          case 'pattern': return (
              <>
                <div className="mb-3 flex items-center gap-2">
                    <Layers size={14} className="text-gray-400" />
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Pattern Mode</span>
                </div>
                <div className="flex gap-2 mb-4">
                    <ModeButton active={mode === 'spiral'} onClick={() => setMode('spiral')} icon={Disc} label="Spiral" />
                    <ModeButton active={mode === 'lines'} onClick={() => setMode('lines')} icon={Layers} label="Lines" />
                    <ModeButton active={mode === 'dots'} onClick={() => setMode('dots')} icon={Grid} label="Dots" />
                    <ModeButton active={mode === 'stipple'} onClick={() => setMode('stipple')} icon={Sparkles} label="Stipple" />
                    <ModeButton active={mode === 'flow'} onClick={() => setMode('flow')} icon={Waves} label="Flow" />
                </div>

                {/* NEW: Quick Presets Section */}
                <div className="mb-4">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Quick Presets</span>
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-200">
                        {PRESETS.map(preset => {
                            const PIcon = preset.icon;
                            return (
                                <button 
                                    key={preset.id}
                                    onClick={() => applyPreset(preset)}
                                    className="flex items-center gap-1.5 px-3 py-2 bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-blue-200 rounded-lg text-xs whitespace-nowrap transition-colors text-gray-600 hover:text-blue-600"
                                >
                                    <PIcon size={12} />
                                    <span className="font-medium">{preset.label}</span>
                                </button>
                            )
                        })}
                    </div>
                </div>

                {/* CONSOLIDATED PATTERN SETTINGS SECTION */}
                <section className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                    {mode === 'dots' && (
                        <div className="mb-4 p-3 bg-gray-50 rounded-xl border border-gray-200">
                            <span className="text-[10px] uppercase font-bold text-gray-400 mb-2 block tracking-wider">Dot Shape</span>
                            <div className="flex gap-2">
                                <ShapeButton active={dotShape === 'circle'} onClick={() => updateSetting('dotShape', 'circle')} icon={Circle} label="Circle" />
                                <ShapeButton active={dotShape === 'square'} onClick={() => updateSetting('dotShape', 'square')} icon={Square} label="Square" />
                                <ShapeButton active={dotShape === 'diamond'} onClick={() => updateSetting('dotShape', 'diamond')} icon={Square} rotateIcon label="Diamond" />
                                <ShapeButton active={dotShape === 'triangle'} onClick={() => updateSetting('dotShape', 'triangle')} icon={Triangle} label="Triangle" />
                            </div>
                        </div>
                    )}
                    <div className="flex items-center justify-between mt-2 mb-4">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Pattern Parameters</span>
                        <button onClick={resetPatternSettings} className="p-1.5 hover:bg-gray-100 rounded-md text-gray-400 hover:text-blue-500 transition-colors" title="Reset Pattern">
                                <RotateCcw size={14}/>
                        </button>
                    </div>
                    <Slider 
                        highlight 
                        label={currentLabels.density} 
                        value={rings} 
                        // INCREASED RANGE: Up to 500 for Stipple (400k points), 200 for others
                        min={10} max={mode === 'stipple' ? 500 : 200} step={1} 
                        onChange={(v) => updateSetting('rings', v)} 
                        icon={Circle}
                        tooltip={currentLabels.densityTooltip} 
                        onReset={handleSliderReset}
                        resetValue={mode === 'stipple' ? 150 : DEFAULT_PATTERN_SETTINGS.rings}
                        settingKey="rings"
                    />
                    <Slider 
                        highlight 
                        label={currentLabels.thickness} 
                        value={lineThickness} 
                        min={0.1} max={2.0} step={0.05} 
                        onChange={(v) => updateSetting('thickness', v)} 
                        icon={Zap}
                        tooltip={currentLabels.thicknessTooltip} 
                        onReset={handleSliderReset}
                        resetValue={DEFAULT_PATTERN_SETTINGS.thickness}
                        settingKey="thickness"
                    />
                    {mode !== 'stipple' && mode !== 'flow' && (
                        <Slider 
                            label="Rotation" 
                            value={rotation} 
                            min={0} max={180} step={1} 
                            onChange={(v) => updateSetting('rotation', v)} 
                            icon={RefreshCw} 
                            onReset={handleSliderReset}
                            resetValue={DEFAULT_PATTERN_SETTINGS.rotation}
                            settingKey="rotation"
                        />
                    )}
                </section>
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
                    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                           <Slider 
                                label="Contrast" 
                                value={contrast} 
                                min={0.5} max={3.0} step={0.1} 
                                onChange={setContrast} 
                                onReset={handleSliderReset}
                                resetValue={1.0}
                                settingKey="contrast"
                           />
                           <Slider 
                                label="Bright" 
                                value={brightness} 
                                min={-100} max={100} step={5} 
                                onChange={setBrightness} 
                                onReset={handleSliderReset}
                                resetValue={0}
                                settingKey="brightness"
                           />
                        </div>
                        <Slider 
                              label="Center Hole (Relative)" 
                              tooltip="Removes the pattern from the central area (0 = no hole, 80 = large hole)."
                              value={centerHole} 
                              min={0} 
                              max={80} 
                              step={1} 
                              onChange={setCenterHole} 
                              icon={LayoutTemplate} 
                              onReset={handleSliderReset}
                              resetValue={0}
                              settingKey="centerHole"
                          />
                          <Slider 
                              label="Border Thickness" 
                              tooltip="Add a solid ring/border around the edge of the pattern."
                              value={borderWidth} 
                              min={0} 
                              max={10} 
                              step={0.1} 
                              onChange={setBorderWidth} 
                              icon={Frame} 
                              onReset={handleSliderReset}
                              resetValue={0}
                              settingKey="borderWidth"
                          />
                    </div>
              </>
          );
          case 'color': return (
              <div className="space-y-3">
                  <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Color & Layers</span>
                        <button onClick={() => {setFgColor('#000000'); setInvert(false); setColorMode('mono'); showToast("Colors Reset");}} className="p-1.5 hover:bg-gray-100 rounded-md text-gray-400 hover:text-blue-500 transition-colors" title="Reset Colors">
                                    <RotateCcw size={14}/>
                        </button>
                  </div>
                  
                  {/* COLOR MODE SELECTOR */}
                  <div className="flex p-1 bg-gray-100 rounded-lg mb-4">
                      <button onClick={() => setColorMode('mono')} className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${colorMode === 'mono' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>Monochrome</button>
                      <button onClick={() => setColorMode('cmyk')} className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${colorMode === 'cmyk' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>CMYK Layers</button>
                  </div>

                  <section className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                      {colorMode === 'mono' ? (
                          <>
                            <ColorPicker label="Ink Color" value={fgColor} onChange={setFgColor} />
                            <Toggle label="Invert Brightness" active={invert} onToggle={() => setInvert(!invert)} icon={Zap} />
                          </>
                      ) : (
                          <div className="space-y-4">
                              <div className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Active Ink Layers</div>
                              <div className="grid grid-cols-4 gap-2">
                                  {['c','m','y','k'].map(k => (
                                      <button 
                                        key={k}
                                        onClick={() => setActiveLayers(p => ({...p, [k]: !p[k]}))}
                                        className={`flex flex-col items-center justify-center p-2 rounded-xl border-2 transition-all ${activeLayers[k] ? 'bg-white border-current' : 'bg-gray-50 border-gray-100 opacity-50'}`}
                                        style={{ color: activeLayers[k] ? (k==='k'?'#000':CMYK_COLORS[k]) : '#9ca3af', borderColor: activeLayers[k] ? (k==='y' ? '#EAB308' : (k==='k'?'#000':CMYK_COLORS[k])) : '' }}
                                      >
                                          <div className="w-4 h-4 rounded-full mb-1" style={{backgroundColor: k==='k'?'#000':CMYK_COLORS[k]}}/>
                                          <span className="text-xs font-bold uppercase">{k}</span>
                                      </button>
                                  ))}
                              </div>
                              <div className="p-3 bg-blue-50 text-blue-800 text-[10px] rounded-lg">
                                  <p><strong>Note:</strong> CMYK mode generates 4 overlapping patterns rotated at standard angles (15°, 75°, 0°, 45°) to mix colors. Exporting SVG will create grouped layers for easy plotting.</p>
                              </div>
                              <Toggle label="Invert Brightness" active={invert} onToggle={() => setInvert(!invert)} icon={Zap} />
                          </div>
                      )}
                  </section>
              </div>
          );
          case 'download': return (
              <div className="space-y-4">
                      <section className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                      
                      {/* 3D MODE / MIN THICKNESS CONTROLS */}
                      <Toggle 
                          label="3D Print Mode" 
                          description="Enforce minimum line thickness for printer compatibility."
                          active={is3DMode} 
                          onToggle={() => setIs3DMode(!is3DMode)} 
                          icon={Printer} 
                      />
                      {is3DMode && (
                              <div className="p-3 bg-blue-50 rounded-xl border border-blue-100 animate-in fade-in">
                                  <Slider 
                                      label="Min Thickness (mm)" 
                                      value={minThickness} 
                                      min={0.3} 
                                      max={1.0} 
                                      step={0.01} 
                                      onChange={setMinThickness} 
                                      onReset={handleSliderReset}
                                      resetValue={DEFAULT_MIN_THICKNESS}
                                      settingKey="minThickness"
                                  />
                              </div>
                      )}
                      
                      {/* DOWNLOAD BUTTONS */}
                      <div className="pt-4 border-t border-gray-100">
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-2">Download Files (Native Resolution)</span>
                          <div className="grid grid-cols-2 gap-2">
                              {/* Final Export Buttons (1x Native Resolution) */}
                              <button onClick={() => downloadSVG()} disabled={!imageSrc} className="flex flex-col items-center justify-center py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg font-bold text-xs border border-blue-200 shadow-sm disabled:opacity-50 transition-colors">
                                   <Layers size={14} className="mb-0.5" /> SVG (Vector)
                              </button>
                              <button onClick={() => downloadPNG(1)} disabled={!imageSrc} className="flex flex-col items-center justify-center py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg font-bold text-xs border border-blue-200 shadow-sm disabled:opacity-50 transition-colors">
                                   <ImageIcon size={14} className="mb-0.5" /> PNG (Raster)
                              </button>
                          </div>
                      </div>
                      </section>
              </div>
          );
          default: return null;
      }
  }
    
  // --- UI RENDER (Mobile Crop Controls Drawer Content) ---
  const renderMobileCropControls = (tab) => {
    switch (tab) {
        case 'shape':
            return (
                <div className="space-y-4">
                    <div className="text-[10px] uppercase font-bold text-gray-400 mb-3 tracking-wider">Frame Shape</div>
                    <div className="flex gap-3">
                        {/* Circle */}
                        <button onClick={() => setLiveCrop(prev => ({...prev, frameShape: 'circle'}))} className={`flex-1 flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${liveCrop.frameShape === 'circle' ? 'bg-blue-50 border-blue-200 text-blue-600 ring-1 ring-blue-300' : 'bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100'}`}><Circle size={24} className="mb-2"/><span className="text-xs font-bold">Circle</span></button>
                        {/* Square */}
                        <button onClick={() => setLiveCrop(prev => ({...prev, frameShape: 'square'}))} className={`flex-1 flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${liveCrop.frameShape === 'square' ? 'bg-blue-50 border-blue-200 text-blue-600 ring-1 ring-blue-300' : 'bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100'}`}><Square size={24} className="mb-2"/><span className="text-xs font-bold">Square</span></button>
                        {/* Custom */}
                        <button onClick={() => setLiveCrop(prev => ({...prev, frameShape: 'custom'}))} className={`flex-1 flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${liveCrop.frameShape === 'custom' ? 'bg-blue-50 border-blue-200 text-blue-600 ring-1 ring-blue-300' : 'bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100'}`}><LayoutTemplate size={24} className="mb-2"/><span className="text-xs font-bold">Custom</span></button>
                    </div>
                    {liveCrop.frameShape === 'custom' && (
                        <div className="mt-4 p-3 bg-gray-50 rounded-xl border border-gray-200 animate-in fade-in space-y-3">
                            <span className="text-[10px] uppercase font-bold text-gray-400 block tracking-wider">Aspect Ratio (W:H)</span>
                            <div className="flex gap-2">
                                <input 
                                    type="number" 
                                    value={cropAspectW} 
                                    onChange={(e) => setCropAspectW(Math.max(1, parseInt(e.target.value) || 1))}
                                    min="1"
                                    className="w-1/2 p-2 text-sm text-center font-mono border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-500 transition-all"
                                    aria-label="Custom Aspect Ratio Width"
                                />
                                <input 
                                    type="number" 
                                    value={cropAspectH} 
                                    onChange={(e) => setCropAspectH(Math.max(1, parseInt(e.target.value) || 1))}
                                    min="1"
                                    className="w-1/2 p-2 text-sm text-center font-mono border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-500 transition-all"
                                    aria-label="Custom Aspect Ratio Height"
                                />
                            </div>
                        </div>
                    )}
                </div>
            );
        case 'position':
            return (
                <div className="space-y-4">
                    <Slider label="Zoom" value={liveCrop.scale} min={0.5} max={3.0} step={0.1} onChange={(v) => setLiveCrop(prev => ({...prev, scale: v}))} />
                    <Slider label="Pan X" value={liveCrop.panX} min={0} max={100} step={1} onChange={(v) => setLiveCrop(prev => ({...prev, panX: v}))} icon={Move} />
                    <Slider label="Pan Y" value={liveCrop.panY} min={0} max={100} step={1} onChange={(v) => setLiveCrop(prev => ({...prev, panY: v}))} icon={Move} />
                </div>
            );
        default: return null;
    }
}
    
  // --- UI RENDER (Crop Input Section - Desktop Only) ---
  const renderCropControls = () => (
      <div className="space-y-6 animate-in fade-in slide-in-from-left-4">
          <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl text-center">
              <Crop size={24} className="text-[#3B82F6] mx-auto mb-2" />
              <h3 className="font-bold text-gray-800">Step 1: Crop</h3>
              <p className="text-xs text-gray-500 mt-1">Choose frame & position image</p>
          </div>
          <section className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
              {renderMobileCropControls('shape')}
          </section>
          <section className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
              <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Position</div>
              {renderMobileCropControls('position')}
          </section>
          <button onClick={applyCropAndGoToEdit} className="w-full py-4 bg-[#3B82F6] hover:bg-[#2563EB] text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95">Apply Crop <ArrowRight size={18} /></button>
      </div>
  );
    
  // Dynamic height calculation for the canvas area on mobile
  const isMobileDrawerOpen = window.innerWidth < 768 && (activeTab || activeCropTab);
    
  // Calculate the required negative margin/padding for the canvas content to respect the mobile header and footer areas.
  const canvasStyle = window.innerWidth < 768 ? {
      // Top space: Mobile Header (48px)
      // Bottom space: Fixed Nav (56px/64px) + Drawer (max 40vh) if open
      
      // We set the top padding of the flex container to the header height (pt-12 = 48px)
      // We set the bottom padding of the flex container dynamically.
      paddingBottom: isMobileDrawerOpen ? `calc(${MOBILE_DRAWER_HEIGHT} + ${MOBILE_NAV_HEIGHT + 1}px)` : `${MOBILE_NAV_HEIGHT}px`,
      minHeight: '100%',
      // The canvas itself will take up the remaining space dynamically
  } : {};


  return (
    <div className="flex h-screen w-full bg-gray-50 text-slate-800 font-sans overflow-hidden" style={{ touchAction: 'none' }} onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}>

      <StatusToast toast={toast} onClose={() => setToast({ message: null, type: 'info' })} />
      <AboutModal isOpen={showAbout} onClose={() => setShowAbout(false)} />

      {/* Drag & Drop Visual Overlay */}
      {isDragOver && (
          <div className="fixed inset-0 z-[100] bg-blue-600/90 backdrop-blur-sm flex flex-col items-center justify-center animate-in fade-in duration-200 pointer-events-none">
              <Upload size={64} className="text-white mb-4 animate-bounce" />
              <h2 className="text-3xl font-bold text-white tracking-tight">Drop Image Here</h2>
              <p className="text-blue-100 mt-2">Release to upload instantly</p>
          </div>
      )}

      {/* MOBILE HEADER - ALWAYS VISIBLE (Fixed Top) */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-12 bg-white border-b border-gray-200 flex items-center justify-between px-4 z-40">
           <div className="flex items-center gap-2 font-bold text-gray-800 text-sm"><Activity className="text-[#3B82F6]" size={16}/> IF Studio</div>
           {/* UTILITY ICONS - ALWAYS VISIBLE */}
           <div className="flex items-center gap-1">
                <button onClick={handleShare} className="p-1.5 bg-gray-50 text-gray-600 rounded-lg" title="Share App">
                    <Share2 size={18}/> {/* SHARE ICON */}
                </button>
                 <button onClick={() => setShowAbout(true)} className="p-1.5 bg-gray-50 text-gray-600 rounded-lg" title="About">
                    <HelpCircle size={18}/> {/* ABOUT ICON */}
                </button>
                <label className="p-1.5 bg-gray-50 text-gray-600 rounded-lg cursor-pointer" title="Upload New Image">
                    <Plus size={18}/> {/* NEW IMAGE BUTTON */}
                    <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                </label>
            </div>
      </div>

      {/* DESKTOP SIDEBAR */}
      <div className={`hidden md:flex fixed inset-y-0 left-0 w-96 bg-gray-50 border-r border-gray-200 flex-col overflow-hidden shadow-xl z-40`}>
        <div className="p-6 border-b border-gray-100 bg-white sticky top-0 z-10 shrink-0 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#3B82F6] flex items-center justify-center shadow-lg"><Activity className="text-white" size={24} /></div>
                <div><h1 className="text-xl font-bold text-gray-900 tracking-tight">IF Studio</h1><p className="text-[10px] text-gray-400 font-mono tracking-wider uppercase">Precision Vector Art Engine for Makers & Fabrication</p></div>
            </div>
            <button onClick={handleShare} className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-blue-500 transition-colors" title="Share App"><Share2 size={20}/></button>
            <button onClick={() => setShowAbout(true)} className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-blue-500 transition-colors"><HelpCircle size={20}/></button>
        </div>

        <div className="p-6 space-y-8 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 flex-1">
          {step === 'crop' ? (
              renderCropControls() // Use new render function
          ) : (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
                  <div className="flex items-center justify-between p-1">
                      <div className="text-xs font-bold text-emerald-600 flex items-center gap-2"><Check size={12} className='text-emerald-500' /> Crop</div>
                      <button onClick={handleDoubleClick} className="text-xs text-gray-400 hover:text-blue-600 underline">Edit Crop</button>
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
                      <div className="flex items-center gap-2 mb-6 text-orange-500 text-xs font-bold uppercase tracking-wider"><Settings size={14} /> Export Settings</div>
                      {renderControls('download')}
                  </section>
              </div>
          )}
        </div>
        
        {step === 'edit' && (
             <div className="p-6 border-t border-gray-100 space-y-4 bg-white shrink-0">
                 <label className="flex items-center justify-center w-full py-3 bg-gray-50 hover:bg-gray-100 text-gray-500 rounded-xl cursor-pointer transition-all border border-transparent hover:border-gray-200 group">
                     <Plus size={16} className="mr-2 group-hover:text-[#3B82F6]" />
                     <span className="font-bold text-xs">New Image</span>
                     <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                 </label>
             </div>
        )}
      </div>

      {/* CANVAS AREA - Dynamic Padding applied here to prevent overlap */}
      <div 
        className={`flex-1 relative flex flex-col overflow-hidden md:pl-96 pt-12 md:pt-0`}
        ref={containerRef}
        style={canvasStyle}
      >
        {/* Main Content */}
        <div 
            className="flex-1 w-full relative flex items-center justify-center overflow-hidden bg-gray-50 p-4 md:p-8 min-h-0" /* Added min-h-0 */
            onMouseDown={handleStart} onMouseMove={handleMove} onMouseUp={handleEnd} onMouseLeave={handleEnd}
            onTouchStart={handleTouchStart} onTouchMove={handleMove} onTouchEnd={handleEnd}
            onDoubleClick={handleDoubleClick}
        >
            {/* Checkerboard for Transparency Visibility */}
            <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'conic-gradient(#ccc 90deg, white 90deg)', backgroundSize: '20px 20px' }} />

            {/* UPLOAD IMAGE SCREEN CONTENT */}
            {!imageSrc ? (
            <div className="relative z-10 text-center space-y-6 max-w-xs md:max-w-md p-8 border-2 border-dashed border-gray-300 rounded-3xl bg-white/90 backdrop-blur-xl shadow-sm mx-4">
                <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto ring-8 ring-blue-50/50 mb-4"><ImageIcon size={40} className="text-blue-500" /></div>
                <div><h2 className="2xl font-black text-gray-900 mb-2">IF Studio</h2><p className="text-gray-500 text-sm">Professional Halftone Engine</p></div>
                <label className="inline-flex items-center px-8 py-4 bg-[#3B82F6] hover:bg-[#2563EB] text-white rounded-2xl cursor-pointer shadow-xl shadow-blue-200 transition-transform hover:-translate-y-1"><Plus size={20} className="mr-2" /><span className="font-bold">Upload Photo</span><input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} /></label>
                <p className="text-[10px] text-gray-400 flex items-center justify-center gap-1 mt-4"><ShieldCheck size={12} /> 100% Private. Processed locally.</p>
            </div>
            ) : (
            <div className="absolute top-[5px] left-[5px] right-[5px] bottom-[5px] shadow-2xl border border-gray-200 bg-white/0">
                <canvas 
                    ref={canvasRef} 
                    // Canvas must fill the new absolute container entirely. object-contain keeps the aspect ratio of the drawing within the physical canvas element's bounds.
                    className="w-full h-full object-contain" 
                />
                
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
                             onClick={handleDoubleClick} // Uses handleDoubleClick to sync state before switching
                            >
                              <Crop size={18} className="md:w-5 md:h-5" />
                          </button>
                    </>
                )}
            </div> 
            )}
        </div>

      {/* Mobile Bottom Navigation (Edit/Upload Modes) - FIXED BOTTOM */}
      {step !== 'crop' && (
          <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shrink-0 z-50 pb-safe">
              {/* Drawer Content - ONLY SHOW IF imageSrc AND activeTab (in edit mode) */}
              {imageSrc && activeTab && step === 'edit' && (
                  <div className="border-b border-gray-100 p-3 bg-gray-50/95 backdrop-blur-xl max-h-[40vh] overflow-y-auto shadow-inner animate-in slide-in-from-bottom-10">
                      <div className="flex justify-between items-center mb-3">
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{activeTab} controls</span>
                          <button onClick={() => setActiveTab(null)} className="p-1 text-gray-400 hover:text-gray-600"><X size={14}/></button>
                      </div>
                      {renderControls(activeTab)}
                  </div>
              )}
              {/* Fixed Navigation Bar (Visible always if step != crop. Disabled if no imageSrc) */}
              <div className={`flex justify-around items-center h-14 bg-white ${!imageSrc ? 'opacity-50 pointer-events-none' : ''}`}>
                  <button onClick={() => handleMobileTabClick('pattern')} className={`flex flex-col items-center gap-0.5 p-1 w-14 transition-colors ${activeTab === 'pattern' && imageSrc ? 'text-[#3B82F6]' : 'text-gray-400'}`}><Layers size={20}/><span className="text-[9px] font-medium">Pattern</span></button>
                  <button onClick={() => handleMobileTabClick('tune')} className={`flex flex-col items-center gap-0.5 p-1 w-14 transition-colors ${activeTab === 'tune' && imageSrc ? 'text-[#3B82F6]' : 'text-gray-400'}`}><Move size={20}/><span className="text-[9px] font-medium">Tune</span></button>
                  <button onClick={() => handleMobileTabClick('color')} className={`flex flex-col items-center gap-0.5 p-1 w-14 transition-colors ${activeTab === 'color' && imageSrc ? 'text-[#3B82F6]' : 'text-gray-400'}`}><Palette size={20}/><span className="text-[9px] font-medium">Color</span></button>
                  <button onClick={() => handleMobileTabClick('download')} className={`flex flex-col items-center gap-0.5 p-1 w-14 transition-colors ${activeTab === 'download' && imageSrc ? 'text-[#3B82F6]' : 'text-gray-400'}`}><Download size={20}/><span className="text-[9px] font-medium">Download</span></button>
              </div>
          </div>
      )}
          
      {/* Mobile Bottom Navigation (Crop Mode Only) - FIXED BOTTOM */}
      {step === 'crop' && (
           <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shrink-0 z-50 pb-safe">
              {activeCropTab && (
                  <div className="border-b border-gray-100 p-3 bg-gray-50/95 backdrop-blur-xl max-h-[40vh] overflow-y-auto shadow-inner animate-in slide-in-from-bottom-10">
                        <div className="flex justify-between items-center mb-3">
                             <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{activeCropTab} controls</span>
                             {/* Removed close icon (X) as requested */}
                        </div>
                        {renderMobileCropControls(activeCropTab)}
                  </div>
              )}
              <div className="flex justify-between items-center h-16 p-3 bg-white">
                  <div className='flex gap-2'>
                    <button onClick={() => handleMobileCropTabClick('shape')} className={`flex flex-col items-center justify-center gap-0.5 p-1 w-16 transition-colors rounded-xl hover:bg-gray-50 ${activeCropTab === 'shape' ? 'text-[#3B82F6]' : 'text-gray-400'}`}><LayoutTemplate size={20}/><span className="text-[9px] font-medium">Shape</span></button>
                    <button onClick={() => handleMobileCropTabClick('position')} className={`flex flex-col items-center justify-center gap-0.5 p-1 w-16 transition-colors rounded-xl hover:bg-gray-50 ${activeCropTab === 'position' ? 'text-[#3B82F6]' : 'text-gray-400'}`}><Move size={20}/><span className="text-[9px] font-medium">Position</span></button>
                  </div>
                  
                  <div className='flex gap-2'>
                    <button onClick={resetView} className="flex flex-col items-center justify-center gap-0.5 p-1 w-16 transition-colors text-gray-400 hover:text-blue-500 rounded-xl hover:bg-gray-50"><RotateCcw size={20}/><span className="text-[9px] font-medium">Reset</span></button>
                    <button onClick={applyCropAndGoToEdit} className="w-24 py-2 bg-[#3B82F6] hover:bg-[#2563EB] text-white rounded-xl font-bold flex items-center justify-center gap-1 shadow-md transition-all active:scale-95 text-xs">Apply <Check size={16} /></button>
                  </div>
              </div>
           </div>
      )}
      </div>
      
      {/* SEO Footer */}
      <footer className="sr-only">
        <h2>IF Studio: Vector Art Generator | Halftone, Spiral & Dot Patterns</h2>
        <p>Convert photos to custom vector art (SVG, PNG) for laser cutters, vinyl cutters, and 3D printing. Generate precise halftone, spiral, and stipple dot patterns, free and in your browser. Excellent tool for CNC art software and digital fabrication projects.</p>
      </footer>
    </div>
  );
}
