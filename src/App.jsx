import React, { useState, useRef, useEffect, useCallback, memo, useMemo } from 'react';
import { Upload, Download, RefreshCw, Sliders, Image as ImageIcon, Zap, Layers, Circle, Grid, Activity, Move, Palette, Disc, MousePointer2, Hand, Settings, Menu, X, RotateCcw, Info, Square, Triangle, Eye, EyeOff, LayoutTemplate, Droplet, Check, ArrowRight, Crop, Maximize, AlertTriangle, ShieldCheck, Printer, Megaphone, Plus, ChevronUp, ChevronDown, Share2, HelpCircle, Sparkles, Wand2, Frame, Paintbrush, Waves, Box, Ruler, Scaling, BoxSelect, Image as PhotoIcon, Dice5, Monitor, Smartphone, GripHorizontal } from 'lucide-react';

/**
 * IF Studio - Ultimate Version (v1.5)
 */

// --- Constants ---
const THEME_COLOR = '#3B82F6';
const MAX_IMPORT_RESOLUTION = 2048;
const DEFAULT_PATTERN_SETTINGS = { rings: 60, thickness: 0.5, rotation: 0, dotShape: 'circle' };
const DEFAULT_MIN_THICKNESS = 0.32;
const CMYK_ANGLES = { c: 15, m: 75, y: 0, k: 45 };
const CMYK_COLORS = { c: '#00FFFF', m: '#FF00FF', y: '#FFFF00', k: '#000000' };
const MOBILE_NAV_HEIGHT = 64;
const LOCAL_STORAGE_KEY = 'IFStudioV4_AppState';
const AUTOSAVE_DEBOUNCE_MS = 1000;
const HISTORY_DEBOUNCE_MS = 500; // New debounce for heavy interactive changes

// --- SEO Data ---
const SEO_TITLE = "IF Studio | Free Vector Art, Halftone & Lithophane Generator";
const SEO_DESCRIPTION = "Transform images into spiral art, single-line vectors, halftone dots, and 3D lithophanes. The ultimate free tool for laser cutting, CNC, and 3D printing enthusiasts.";
const SEO_KEYWORDS = "vector art generator, halftone pattern, spiral art maker, lithophane stl generator, laser cutter templates, cnc software, svg converter, stipple generator, 3d print tools, insert fabrication";
// You would ideally replace this with a permanent image URL for your site logo/preview
const SEO_OG_IMAGE = "https://example.com/ifstudio_preview.png"; 

// --- Centralized Initial State ---
const INITIAL_APP_STATE = {
    mode: 'spiral',
    modeSettings: {
        spiral: DEFAULT_PATTERN_SETTINGS,
        lines: DEFAULT_PATTERN_SETTINGS,
        dots: DEFAULT_PATTERN_SETTINGS,
        flow: { ...DEFAULT_PATTERN_SETTINGS, rings: 80, thickness: 0.8 },
        photo: DEFAULT_PATTERN_SETTINGS,
        litho: { resolution: 0.5, widthMm: 100, minDepth: 0.8, maxDepth: 3.0 }
    },
    frameShape: 'circle',
    scale: 1, panX: 50, panY: 50, centerHole: 0, borderWidth: 0,
    contrast: 1.0, brightness: 0, invert: false, fgColor: '#000000',
    colorMode: 'mono', activeLayers: { c: true, m: true, y: true, k: true },
    is3DMode: false, minThickness: DEFAULT_MIN_THICKNESS,
    cropAspectW: 16, cropAspectH: 9,
};


// --- Helper Components ---

const Tooltip = memo(({ text }) => (
    <div className="group relative inline-block ml-2">
        <Info size={12} className="text-gray-400 hover:text-[#3B82F6] transition-colors cursor-help" />
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-white border border-gray-200 text-[10px] text-gray-600 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-50 pointer-events-none text-center leading-relaxed">
            {text}<div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-white" />
        </div>
    </div>
));

const Slider = memo(({ label, value, min, max, step, onChange, icon: Icon, highlight, tooltip, onReset, resetValue, settingKey }) => (
    <div className="mb-3 md:mb-5 group">
        <div className="flex justify-between items-center mb-1">
            <label className={`flex items-center gap-1.5 text-xs md:text-sm font-semibold ${highlight ? 'text-blue-600' : 'text-gray-600'}`}>
                {Icon && <Icon size={14} className={`md:w-4 md:h-4 ${highlight ? "text-[#3B82F6]" : "text-gray-400"}`} />}
                {label}
                {tooltip && <Tooltip text={tooltip} />}
                {onReset && (
                    <button onClick={() => onReset(settingKey, resetValue)} className="p-0.5 ml-1 rounded-full text-gray-300 hover:text-blue-500 transition-colors duration-150 transform hover:rotate-180 disabled:opacity-0" disabled={value === resetValue} title="Reset">
                        <RotateCcw size={12} />
                    </button>
                )}
            </label>
            <input type="number" value={typeof value === 'number' ? (Number.isInteger(step) ? value : value.toFixed(2)) : value} onChange={(e) => { const val = parseFloat(e.target.value); if (!isNaN(val)) onChange(val); }} step={step} className="text-[10px] md:text-xs text-gray-500 font-mono bg-gray-50 px-1.5 py-0.5 rounded border border-gray-200 w-16 text-right focus:ring-1 focus:ring-blue-300 outline-none" />
        </div>
        <div className="relative h-5 md:h-6 flex items-center">
            <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(parseFloat(e.target.value))} className="absolute w-full h-1.5 md:h-2 bg-gray-200 rounded-full appearance-none cursor-pointer transition-all duration-100 focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/50 z-10" style={{ backgroundImage: `linear-gradient(${THEME_COLOR}, ${THEME_COLOR})`, backgroundSize: `${((value - min) * 100) / (max - min)}% 100%`, backgroundRepeat: 'no-repeat' }} />
            <style>{`input[type=range]::-webkit-slider-thumb { -webkit-appearance: none; height: 16px; width: 16px; border-radius: 50%; background: #ffffff; border: 3px solid #3B82F6; cursor: pointer; box-shadow: 0 1px 3px rgba(0,0,0,0.1); transition: all 0.1s ease-out; margin-top: 0px; } input[type=range]::-webkit-slider-thumb:active { transform: scale(1.1); }`}</style>
        </div>
    </div>
));

const ModeButton = memo(({ active, onClick, icon: Icon, label }) => (
    <button onClick={onClick} className={`flex-1 flex flex-col items-center justify-center py-2 px-1 md:py-3 md:px-2 rounded-xl transition-all duration-200 active:scale-95 hover:scale-[1.02] hover:shadow-md ${active ? 'bg-blue-50 border-blue-200 text-blue-600 shadow-lg ring-1 ring-blue-300' : 'bg-white border-gray-200 text-gray-500 hover:border-blue-300 hover:text-blue-500'}`}>
        <Icon size={20} className="mb-1 md:mb-1.5 md:w-6 md:h-6" />
        <span className="text-[10px] md:text-xs font-bold tracking-wide">{label}</span>
    </button>
));

const ShapeButton = memo(({ active, onClick, icon: Icon, label, rotateIcon }) => (
    <button onClick={onClick} title={label} className={`flex-1 flex items-center justify-center p-2 md:p-2.5 rounded-lg transition-all duration-200 active:scale-95 ${active ? 'bg-blue-50 border-blue-500 text-blue-600' : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'}`}>
        <Icon size={16} className={`md:w-[18px] md:h-[18px] ${rotateIcon ? "rotate-45" : ""}`} />
    </button>
));

const ColorPicker = memo(({ label, value, onChange, disabled }) => (
    <div className={`flex items-center justify-between p-2 md:p-3 rounded-xl border border-gray-200 bg-gray-50/50 transition-colors duration-150 ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-blue-300'}`}>
        <label className="text-xs md:text-sm font-medium text-gray-600">{label}</label>
        <div className="flex items-center gap-2 md:gap-3">
            <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">{value}</span>
            <div className="relative w-6 h-6 md:w-8 md:h-8 rounded-full overflow-hidden border border-gray-300 shadow-sm ring-1 ring-white cursor-pointer hover:scale-105 transition-transform duration-150">
                <input type="color" value={value} onChange={(e) => onChange(e.target.value)} disabled={disabled} className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] cursor-pointer p-0 border-0" />
            </div>
        </div>
    </div>
));

const Toggle = memo(({ label, active, onToggle, icon: Icon, description }) => (
    <button onClick={onToggle} className={`w-full flex items-center justify-between p-2.5 md:p-3 rounded-xl border transition-all duration-200 text-left active:scale-[0.99] ${active ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
        <div className="flex items-center gap-2 md:gap-3">
            {Icon && <Icon size={16} className={`md:w-[18px] md:h-[18px] ${active ? "text-blue-600" : "text-gray-400"}`} />}
            <div><span className="text-xs md:text-sm font-semibold block">{label}</span>{description && <span className="text-[10px] opacity-70 font-normal block mt-0.5">{description}</span>}</div>
        </div>
        <div className={`w-8 h-4 md:w-10 md:h-5 rounded-full relative transition-colors duration-300 flex-shrink-0 ${active ? 'bg-[#3B82F6]' : 'bg-gray-300'}`}>
            <div className={`absolute top-0.5 md:top-1 w-3 h-3 md:w-3 md:h-3 bg-white rounded-full transition-transform duration-300 shadow-sm ${active ? 'translate-x-4 md:translate-x-6' : 'translate-x-0.5 md:translate-x-1'}`} />
        </div>
    </button>
));

const StatusToast = memo(({ toast, onClose }) => {
    if (!toast || !toast.message) return null;
    const isError = toast.type === 'error';
    return (
        <div className={`absolute top-16 md:top-6 left-1/2 -translate-x-1/2 z-[70] px-4 py-2 md:px-6 md:py-3 rounded-full shadow-xl bg-white border border-gray-100 flex items-center gap-2 md:gap-3 animate-in slide-in-from-top-4 fade-in duration-300 max-w-[90%] w-auto mx-auto ${isError ? 'text-red-600' : 'text-emerald-600'}`}>
            {isError ? <AlertTriangle size={16} /> : <Check size={16} />}
            <span className="text-xs md:text-sm font-medium whitespace-nowrap">{toast.message}</span>
            <button onClick={onClose} className="p-0.5 md:p-1 hover:bg-gray-100 rounded-full transition-colors"><X size={14} /></button>
        </div>
    )
});

const AboutModal = memo(({ isOpen, onClose }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 animate-in fade-in duration-200">
           <div className="bg-white rounded-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto shadow-2xl flex flex-col relative animate-in zoom-in-95 duration-200">
             <button onClick={onClose} className="absolute top-3 right-3 p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors text-gray-500" title="Close"><X size={18}/></button>
              
             <div className="p-6 md:p-8 space-y-5">
               {/* Header */}
               <div className="text-center space-y-2">
                   <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg shadow-blue-200"><Activity className="text-white" size={20}/></div>
                   <h2 className="text-xl md:text-2xl font-bold text-gray-900 leading-tight">IF Studio <span className="text-gray-400 text-base font-normal block mt-1">(Insert Fabrication)</span></h2>
                   <p className="text-sm text-gray-500 font-medium">Precision Vector Art Engine for Makers & Fabrication</p>
               </div>

               {/* Description */}
               <div className="space-y-3 text-xs md:text-sm text-gray-600 leading-relaxed border-t border-gray-100 pt-4">
                   <p>Built for makers, designers, and anyone who wants fast visual effects without complicated software. Generate spiral art, halftone patterns, and other experimental styles in just a few steps.</p>
                   <div className="p-3 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-semibold text-center border border-emerald-100">All downloads are free for both personal and commercial use.</div>
               </div>

               {/* What it offers */}
               <div className="space-y-2">
                   <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2"><Settings size={14} className="text-blue-500"/> What this platform offers</h3>
                   <ul className="text-xs text-gray-600 space-y-1.5 list-disc pl-4 marker:text-blue-300">
                       <li>Clean, high-quality outputs</li>
                       <li>Adjustable density, contrast, and styling controls</li>
                       <li>Ready-to-use files for laser cutting, CNC routing, vinyl work, print, and 3D printing</li>
                       <li>Works directly in your browser, no signup required</li>
                   </ul>
               </div>

               {/* Who it's for */}
               <div className="space-y-2">
                   <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2"><Hand size={14} className="text-purple-500"/> Who it’s for</h3>
                   <p className="text-xs text-gray-600 leading-relaxed">People who enjoy creating. Whether you're running a workshop, crafting at home, or experimenting with digital art, IF Studio keeps the process simple.</p>
               </div>

               {/* Footer / Contact */}
               <div className="pt-4 border-t border-gray-100 text-center space-y-1">
                   <p className="text-[10px] text-gray-400">Designed and maintained by IF Studio as an independent creative project.</p>
                   <p className="text-[10px] text-gray-400">Every feature is built with the goal of helping makers turn ideas into visuals quickly.</p>
                   <a href="mailto:insertfabrication@gmail.com" className="text-xs font-bold text-blue-600 hover:underline block mt-2">Contact: insertfabrication@gmail.com</a>
               </div>
             </div>
           </div>
        </div>
    )
});

const LoadModal = memo(({ isOpen, onClose, onDiscard }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/70 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl max-w-sm w-full p-6 md:p-8 shadow-2xl flex flex-col relative animate-in zoom-in-95 duration-200 text-center space-y-6">
                <AlertTriangle size={32} className="text-orange-500 mx-auto"/>
                <h2 className="text-xl font-bold text-gray-900">Unsaved Progress Found!</h2>
                <p className="text-sm text-gray-600">Would you like to load your previous work or start a new project?</p>
                
                <div className="flex gap-3">
                    <button onClick={onDiscard} className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl font-semibold transition-colors active:scale-95 text-sm">
                        Start New
                    </button>
                    <button onClick={onClose} className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-colors active:scale-95 text-sm">
                        Load Progress
                    </button>
                </div>
            </div>
        </div>
    );
});

const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) } : { r: 0, g: 0, b: 0 };
};

// --- History Management Hook ---
const useHistory = (initialState) => {
    const [state, setState] = useState(initialState);
    const history = useRef([initialState]);
    const historyIndex = useRef(0);
    const lastActionTime = useRef(0);
    const debounceDelay = HISTORY_DEBOUNCE_MS; 

    // Used to map the current state index to a meaningful action name for UX
    const historyActionNames = useRef(['Initial State']);

    const getCurrentState = useCallback((currentState) => {
        // Return only the state relevant for history/saving
        return {
            mode: currentState.mode,
            modeSettings: currentState.modeSettings,
            frameShape: currentState.frameShape,
            scale: currentState.scale,
            panX: currentState.panX,
            panY: currentState.panY,
            centerHole: currentState.centerHole,
            borderWidth: currentState.borderWidth,
            contrast: currentState.contrast,
            brightness: currentState.brightness,
            invert: currentState.invert,
            fgColor: currentState.fgColor,
            colorMode: currentState.colorMode,
            activeLayers: currentState.activeLayers,
            is3DMode: currentState.is3DMode,
            minThickness: currentState.minThickness,
            cropAspectW: currentState.cropAspectW,
            cropAspectH: currentState.cropAspectH,
        };
    }, []);

    const setStateAndRecord = useCallback((newStateOrFn, actionName = 'Change') => {
        setState(prev => {
            const newState = typeof newStateOrFn === 'function' ? newStateOrFn(prev) : newStateOrFn;
            const now = Date.now();
            const isInstantChange = now - lastActionTime.current < debounceDelay;
            lastActionTime.current = now;

            const currentState = getCurrentState(prev);
            const nextState = getCurrentState(newState);

            const areSettingsEqual = (s1, s2) => JSON.stringify(s1) === JSON.stringify(s2);

            if (historyIndex.current < history.current.length - 1) {
                // Trim redo history and action names
                history.current = history.current.slice(0, historyIndex.current + 1);
                historyActionNames.current = historyActionNames.current.slice(0, historyIndex.current + 1);
            }

            // Don't record if the new state is functionally identical to the current one
            if (areSettingsEqual(history.current[historyIndex.current], nextState)) {
                 return newState; // State update proceeds, but no history push
            }
            
            // Define keys that trigger debouncing/merging of history states
            const debounceKeys = ['modeSettings', 'contrast', 'brightness', 'fgColor', 'minThickness', 'centerHole', 'borderWidth'];
            const isDebounceableChange = debounceKeys.some(key => !areSettingsEqual(currentState[key], nextState[key]));

            if (isInstantChange && isDebounceableChange && historyIndex.current > 0) {
                 // Replace the last entry instead of pushing a new one, maintain original action name
                 history.current[historyIndex.current] = nextState;
            } else {
                 history.current.push(nextState);
                 historyActionNames.current.push(actionName);
                 historyIndex.current++;
            }
            
            return newState;
        });
    }, [getCurrentState]);

    const resetHistory = useCallback((initialState) => {
        history.current = [initialState];
        historyActionNames.current = ['Initial State'];
        historyIndex.current = 0;
        setState(initialState);
    }, []);

    const undo = useCallback(() => {
        if (historyIndex.current > 0) {
            historyIndex.current--;
            setState(history.current[historyIndex.current]);
        }
    }, []);

    const redo = useCallback(() => {
        if (historyIndex.current < history.current.length - 1) {
            historyIndex.current++;
            setState(history.current[historyIndex.current]);
        }
    }, []);

    const getUndoActionName = useCallback(() => {
        return historyIndex.current > 0 ? historyActionNames.current[historyIndex.current] : null;
    }, []);

    const getRedoActionName = useCallback(() => {
        return historyIndex.current < history.current.length - 1 ? historyActionNames.current[historyIndex.current + 1] : null;
    }, []);

    const canUndo = historyIndex.current > 0;
    const canRedo = historyIndex.current < history.current.length - 1;

    return { ...state, setState: setStateAndRecord, undo, redo, canUndo, canRedo, getCurrentState, resetHistory, getUndoActionName, getRedoActionName };
};

// --- Main Application ---
export default function App() {

    const [imageSrc, setImageSrc] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [toast, setToast] = useState({ message: null, type: 'info' });
    const [showAbout, setShowAbout] = useState(false);
    const [showLoadModal, setShowLoadModal] = useState(false); // New modal state
    const [isDragOver, setIsDragOver] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    
    // Mobile UI
    const [drawerHeight, setDrawerHeight] = useState(typeof window !== 'undefined' ? window.innerHeight * 0.4 : 300); 
    const isResizingDrawer = useRef(false);
    const drawerStartY = useRef(0);
    const drawerStartHeight = useRef(0);

    const [activeTab, setActiveTab] = useState('pattern'); 
    const [activeCropTab, setActiveCropTab] = useState(null); 
    const [step, setStep] = useState('upload'); 
        
    // History State
    const { 
        mode, setMode, 
        modeSettings, setModeSettings, 
        frameShape, setFrameShape, 
        scale, setScale, 
        panX, setPanX, 
        panY, setPanY, 
        centerHole, setCenterHole, 
        borderWidth, setBorderWidth, 
        contrast, setContrast, 
        brightness, setBrightness, 
        invert, setInvert, 
        fgColor, setFgColor, 
        colorMode, setColorMode, 
        activeLayers, setActiveLayers, 
        is3DMode, setIs3DMode, 
        minThickness, setMinThickness, 
        cropAspectW, setCropAspectW, 
        cropAspectH, setCropAspectH, 
        setState: setHistoryState,
        undo, redo, canUndo, canRedo, getUndoActionName, getRedoActionName,
        getCurrentState, // Exposed for saving
        resetHistory // Exposed for clearing state on new image
    } = useHistory(INITIAL_APP_STATE);

    const [compareMode, setCompareMode] = useState(false); 
    const [lithoPreview, setLithoPreview] = useState(false);
    const [editView, setEditView] = useState({ scale: 1, x: 0, y: 0 });
    const lastPinchDist = useRef(null); 
    
    const [liveCrop, setLiveCrop] = useState({ scale: 1, panX: 50, panY: 50, frameShape: 'circle' });

    const labelMap = {
        spiral: { density: "Rings", thickness: "Stroke Width", densityTooltip: "Number of continuous rings.", thicknessTooltip: "Controls thickness." },
        lines: { density: "Lines/mm", thickness: "Line Width", densityTooltip: "Number of parallel lines.", thicknessTooltip: "Controls thickness." },
        dots: { density: "Grid Density", thickness: "Dot Scale", densityTooltip: "Spacing of grid.", thicknessTooltip: "Max size of dots." },
        flow: { density: "Stroke Density", thickness: "Stroke Length", densityTooltip: "Spacing between strokes.", thicknessTooltip: "Length of flow lines." },
        photo: { density: "NA", thickness: "NA", densityTooltip: "Pass-through.", thicknessTooltip: "Pass-through." }
    };
    const currentLabels = labelMap[mode] || labelMap.spiral;

    const rings = modeSettings[mode]?.rings || 60;
    const lineThickness = modeSettings[mode]?.thickness || 0.5;
    const rotation = modeSettings[mode]?.rotation || 0;
    const dotShape = modeSettings[mode]?.dotShape || 'circle';

    // Refs
    const lastMousePos = useRef({ x: 0, y: 0 });
    const canvasRef = useRef(null);
    const sourceImageRef = useRef(null);
    const containerRef = useRef(null);
    const helperCanvasRef = useRef(null);
    const renderTimeoutRef = useRef(null);
    const saveTimeoutRef = useRef(null);
    const fileInputRef = useRef(null); // Ref for file input element

    // --- Auto-Save Logic ---
    const clearLocalStorage = useCallback(() => {
        try {
            localStorage.removeItem(LOCAL_STORAGE_KEY);
        } catch(error) {
            console.warn("Could not clear localStorage:", error);
        }
    }, []);

    const saveStateToLocalStorage = useCallback((stateToSave, image) => {
        try {
            const persistedState = {
                settings: stateToSave,
                imageData: image,
                timestamp: Date.now(),
            };
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(persistedState));
        } catch (error) {
            console.warn("Could not save to localStorage:", error);
        }
    }, []);

    const triggerSave = useCallback(() => {
        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
        }
        
        // Capture current state and imageSrc (which holds the base64 string)
        const settings = getCurrentState({
            mode, modeSettings, frameShape, scale, panX, panY, centerHole, borderWidth,
            contrast, brightness, invert, fgColor, colorMode, activeLayers, is3DMode,
            minThickness, cropAspectW, cropAspectH
        });

        saveTimeoutRef.current = setTimeout(() => {
            saveStateToLocalStorage(settings, imageSrc);
            console.log('Autosaved state to LocalStorage.');
        }, AUTOSAVE_DEBOUNCE_MS);
    }, [mode, modeSettings, frameShape, scale, panX, panY, centerHole, borderWidth, contrast, brightness, invert, fgColor, colorMode, activeLayers, is3DMode, minThickness, cropAspectW, cropAspectH, imageSrc, getCurrentState, saveStateToLocalStorage]);

    // Effect to trigger save whenever settings change
    useEffect(() => {
        if (!imageSrc && step === 'upload') return; 
        triggerSave();
        return () => clearTimeout(saveTimeoutRef.current);
    }, [mode, modeSettings, frameShape, scale, panX, panY, centerHole, borderWidth, contrast, brightness, invert, fgColor, colorMode, activeLayers, is3DMode, minThickness, cropAspectW, cropAspectH, imageSrc, step, triggerSave]);


    // --- Load State Logic ---
    useEffect(() => {
        try {
            const storedState = localStorage.getItem(LOCAL_STORAGE_KEY);
            if (storedState) {
                const parsed = JSON.parse(storedState);
                // Only show modal if the data isn't fresh (i.e., not a current session save)
                if (parsed.imageData && parsed.settings && (Date.now() - parsed.timestamp) > 5000) {
                    setShowLoadModal(true);
                }
            }
        } catch (error) {
            console.error("Error checking saved state:", error);
        }
    // This effect runs only once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); 

    const loadSavedState = useCallback(() => {
        setShowLoadModal(false);
        try {
            const storedState = localStorage.getItem(LOCAL_STORAGE_KEY);
            if (storedState) {
                const parsed = JSON.parse(storedState);
                if (parsed.settings) {
                    setHistoryState(parsed.settings, 'Load State');
                    if (parsed.imageData) {
                        const img = new Image();
                        img.onload = () => {
                            sourceImageRef.current = img;
                            setImageSrc(parsed.imageData);
                            setStep('edit'); 
                            showToast("Loaded saved progress!", 'info');
                        };
                        img.src = parsed.imageData;
                    }
                }
            }
        } catch (error) {
            console.error("Failed to load state:", error);
            showToast("Error loading saved state.", 'error');
        }
    }, [setHistoryState]);

    const discardSavedState = useCallback(() => {
        setShowLoadModal(false);
        clearLocalStorage();
        resetHistory(INITIAL_APP_STATE);
        // Reset image and step to force the "Upload" screen
        setImageSrc(null); 
        setStep('upload');
        showToast("Starting new project.", 'info');
    }, [clearLocalStorage, resetHistory]);
    // -------------------------

    // --- Keyboard Shortcuts ---
    useEffect(() => {
        const handleKeyDown = (e) => {
            const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
            const isCtrlCmd = isMac ? e.metaKey : e.ctrlKey;

            // Undo: Ctrl/Cmd + Z
            if (isCtrlCmd && e.key === 'z') {
                e.preventDefault();
                if (canUndo) undo();
            }
            
            // Redo: Ctrl/Cmd + Shift + Z or Ctrl/Cmd + Y
            if (isCtrlCmd && (e.key === 'y' || (e.shiftKey && e.key === 'Z'))) {
                e.preventDefault();
                if (canRedo) redo();
            }

            // Upload: Ctrl/Cmd + O
            if (isCtrlCmd && e.key === 'o') {
                e.preventDefault();
                fileInputRef.current?.click();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [canUndo, canRedo, undo, redo]);


    // --- SEO Implementation (Enhanced) ---
    useEffect(() => {
        // 1. Update Document Title
        document.title = SEO_TITLE;
        // 2. Helper to set meta tags
        const setMeta = (name, content, attribute = 'name') => {
            let element = document.querySelector(`meta[${attribute}="${name}"]`);
            if (!element) {
                element = document.createElement('meta');
                element.setAttribute(attribute, name);
                document.head.appendChild(element);
            }
            element.setAttribute('content', content);
        };
        // 3. Set Standard Meta Tags
        setMeta('description', SEO_DESCRIPTION);
        setMeta('keywords', SEO_KEYWORDS);
        // 4. Set Open Graph (Social Sharing) Meta Tags
        setMeta('og:title', SEO_TITLE, 'property');
        setMeta('og:description', SEO_DESCRIPTION, 'property');
        setMeta('og:type', "website", 'property');
        setMeta('og:url', window.location.href, 'property');
        setMeta('og:image', SEO_OG_IMAGE, 'property'); // New: Added OG Image
    }, []);
    // -------------------------------------

    const updateSetting = useCallback((key, value) => {
        setHistoryState(prev => {
            if (['widthMm', 'minDepth', 'maxDepth', 'resolution'].includes(key)) {
                return { ...prev, modeSettings: { ...prev.modeSettings, litho: { ...prev.modeSettings.litho, [key]: value } } };
            } else {
                return { ...prev, modeSettings: { ...prev.modeSettings, [mode]: { ...prev.modeSettings[mode], [key]: value } } };
            }
        }, 'Adjust ' + key.replace(/([A-Z])/g, ' $1').trim());
    }, [mode, setHistoryState]);

    const randomizeSettings = useCallback(() => {
        const rRings = 20 + Math.floor(Math.random() * 80);
        const rThick = 0.2 + Math.random() * 1.0;
        const rRot = Math.floor(Math.random() * 180);
        const modes = ['spiral', 'lines', 'dots', 'flow'];
        const rMode = modes[Math.floor(Math.random() * modes.length)];
        setHistoryState(prev => ({ 
            ...prev, 
            mode: rMode, 
            modeSettings: { ...prev.modeSettings, [rMode]: { ...prev.modeSettings[rMode], rings: rRings, thickness: rThick, rotation: rRot } } 
        }), 'Randomize Pattern');
        showToast("Randomized Settings!", 'success');
    }, [setHistoryState]);
        
    const showToast = (msg, type = 'info') => {
        setToast({ message: msg, type });
        if (type !== 'error') setTimeout(() => setToast({ message: null, type: 'info' }), 3000);
    };

    const handleShare = () => {
        const shareData = { 
            title: SEO_TITLE, 
            text: SEO_DESCRIPTION, 
            url: window.location.href 
        };
        if (navigator.share) navigator.share(shareData).catch((e) => console.log("Share failed:", e));
        else { navigator.clipboard.writeText(window.location.href); showToast("Link copied!", 'info'); }
    };

    const resetView = useCallback(() => {
        setHistoryState(prev => ({ 
            ...prev, 
            scale: 1, panX: 50, panY: 50, centerHole: 0, 
            cropAspectW: 16, cropAspectH: 9, frameShape: 'circle'
        }), 'Reset View');
        setLiveCrop({ scale: 1, panX: 50, panY: 50, frameShape: 'circle' });
        setEditView({ scale: 1, x: 0, y: 0 });
        showToast("View Reset");
    }, [setHistoryState]);

    const handleFitToScreen = useCallback(() => {
        setEditView({ scale: 1, x: 0, y: 0 });
        showToast("Fit to Screen");
    }, []);

    const resetPatternSettings = useCallback(() => {
        if (activeTab === 'litho') {
            setHistoryState(prev => ({ 
                ...prev, 
                modeSettings: { ...prev.modeSettings, litho: INITIAL_APP_STATE.modeSettings.litho }
            }), 'Reset Litho Settings');
            showToast("Litho Reset"); return;
        }
        setHistoryState(prev => ({
            ...prev,
            modeSettings: { ...prev.modeSettings, [mode]: INITIAL_APP_STATE.modeSettings[mode] }
        }), 'Reset Pattern Settings');
        showToast("Pattern Reset");
    }, [activeTab, mode, setHistoryState]);

    const handleSliderReset = useCallback((key, def) => {
        setHistoryState(prev => {
            if (key === 'minThickness') return { ...prev, minThickness: INITIAL_APP_STATE.minThickness };
            if (key === 'centerHole') return { ...prev, centerHole: INITIAL_APP_STATE.centerHole };
            if (key === 'contrast') return { ...prev, contrast: INITIAL_APP_STATE.contrast };
            if (key === 'brightness') return { ...prev, brightness: INITIAL_APP_STATE.brightness };
            if (key === 'borderWidth') return { ...prev, borderWidth: INITIAL_APP_STATE.borderWidth };
            
            if (key === 'rings' || key === 'thickness' || key === 'rotation' || key === 'dotShape') {
                updateSetting(key, def); return prev;
            }
            return prev;
        }, `Reset ${key}`);
        showToast(`${key} reset.`);
    }, [setHistoryState, updateSetting]);

    const handleModeChange = useCallback((newMode) => {
        if (mode === newMode) return;
        setIsProcessing(true);
        setTimeout(() => { 
            setHistoryState(prev => ({...prev, mode: newMode}), `Change Mode to ${newMode}`); 
            setTimeout(() => setIsProcessing(false), 500); 
        }, 50);
    }, [mode, setHistoryState]);
        
    const handleMobileTabClick = (tab) => { if (imageSrc) setActiveTab(prev => prev === tab ? null : tab); };
    const handleMobileCropTabClick = (tab) => setActiveCropTab(prev => prev === tab ? null : tab);

    const handleDoubleClick = () => {
        if (imageSrc && step === 'edit') {
            setLiveCrop({ scale, panX, panY, frameShape });
            setStep('crop'); setActiveCropTab('shape'); showToast("Editing Crop...");
        }
    };

    const handleImageUpload = useCallback((e) => { const file = e.target.files?.[0]; if (file) processFile(file); }, []);

    const processFile = (file) => {
        if (!file.type.startsWith('image/')) { showToast("Invalid file. JPG/PNG only.", 'error'); return; }
        
        // --- NEW LOGIC: Clear old state and reset app to defaults ---
        clearLocalStorage();
        resetHistory(INITIAL_APP_STATE);
        // -----------------------------------------------------------

        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                let width = img.width, height = img.height;
                let srcToUse = img.src;
                if (width > MAX_IMPORT_RESOLUTION || height > MAX_IMPORT_RESOLUTION) {
                    const scaleFactor = Math.min(MAX_IMPORT_RESOLUTION / width, MAX_IMPORT_RESOLUTION / height);
                    const w = Math.floor(width * scaleFactor), h = Math.floor(height * scaleFactor);
                    const tempCanvas = document.createElement('canvas');
                    tempCanvas.width = w; tempCanvas.height = h;
                    const ctx = tempCanvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, w, h);
                    srcToUse = tempCanvas.toDataURL('image/jpeg', 0.95);
                    const optimizedImg = new Image();
                    optimizedImg.onload = () => { sourceImageRef.current = optimizedImg; setImageSrc(srcToUse); finishUpload(); }
                    optimizedImg.src = srcToUse;
                } else {
                    sourceImageRef.current = img; setImageSrc(event.target.result); finishUpload();
                }
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    };

    const finishUpload = () => {
        setLiveCrop({ scale: 1, panX: 50, panY: 50, frameShape: 'circle' });
        setStep('crop'); setActiveCropTab('shape');
        if (window.innerWidth < 768) setActiveTab(null);
    };

    const handleDrawerDragStart = (e) => { isResizingDrawer.current = true; drawerStartY.current = e.touches[0].clientY; drawerStartHeight.current = drawerHeight; };
    const handleDrawerDragMove = (e) => {
        if (!isResizingDrawer.current) return;
        const deltaY = drawerStartY.current - e.touches[0].clientY; 
        setDrawerHeight(Math.min(window.innerHeight * 0.85, Math.max(150, drawerStartHeight.current + deltaY)));
    };
    const handleDrawerDragEnd = () => { isResizingDrawer.current = false; };

    const handleStart = (e) => {
        if (!imageSrc) return;
        if (e.touches && e.touches.length === 2) {
            setIsDragging(false);
            lastPinchDist.current = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
            return;
        }
        if (step !== 'crop' && step !== 'edit') { if(window.innerWidth < 768 && activeTab) setActiveTab(null); return; }
        setIsDragging(true);
        const pos = e.touches ? e.touches[0] : e;
        lastMousePos.current = { x: pos.clientX, y: pos.clientY };
    };

    const handleMove = (e) => {
        if (!imageSrc) return;
        if (e.touches && e.touches.length === 2 && step === 'edit') {
            const dist = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
            if (lastPinchDist.current) {
                const diff = dist - lastPinchDist.current;
                setEditView(prev => ({ ...prev, scale: Math.min(5, Math.max(0.5, prev.scale + diff * 0.005)) }));
            }
            lastPinchDist.current = dist;
            return; 
        }
        if (!isDragging) return;
        const pos = e.touches ? e.touches[0] : e;
        const deltaX = pos.clientX - lastMousePos.current.x;
        const deltaY = pos.clientY - lastMousePos.current.y;
        lastMousePos.current = { x: pos.clientX, y: pos.clientY };
        const sensitivity = e.touches ? 0.25 : 0.15;
        
        if (step === 'crop') {
            setLiveCrop(prev => ({ ...prev, panX: Math.min(100, Math.max(0, prev.panX + deltaX * sensitivity)), panY: Math.min(100, Math.max(0, prev.panY + deltaY * sensitivity)) }));
        } else if (step === 'edit') {
            setEditView(prev => ({ ...prev, x: prev.x + deltaX, y: prev.y + deltaY }));
        }
    };

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;
        const onWheel = (e) => {
            if (step === 'edit') { e.preventDefault(); const scaleDelta = e.deltaY * -0.001; setEditView(prev => ({ ...prev, scale: Math.min(5, Math.max(0.5, prev.scale + scaleDelta)) })); }
        };
        container.addEventListener('wheel', onWheel, { passive: false });
        return () => container.removeEventListener('wheel', onWheel);
    }, [step]);

    const handleEnd = () => { setIsDragging(false); lastPinchDist.current = null; };
    const onDragOver = (e) => { e.preventDefault(); setIsDragOver(true); };
    const onDragLeave = (e) => { e.preventDefault(); setIsDragOver(false); };
    const onDrop = (e) => { e.preventDefault(); setIsDragOver(false); if(e.dataTransfer.files[0]) processFile(e.dataTransfer.files[0]); };

    const renderFrame = useCallback((ctx, targetW, targetH, isExport = false) => {
        // This heavy function remains the same, relying on state values
        try {
            const img = sourceImageRef.current;
            if (!img) return;
            
            const currentScale = step === 'crop' ? liveCrop.scale : scale;
            const currentPanX = step === 'crop' ? liveCrop.panX : panX;
            const currentPanY = step === 'crop' ? liveCrop.panY : panY;
            const currentFrameShape = step === 'crop' ? liveCrop.frameShape : frameShape;
            const w = targetW, h = targetH;
            let currentAspect = 1.0;
            if (currentFrameShape === 'custom') currentAspect = cropAspectW / cropAspectH;
            else if (currentFrameShape === 'square') currentAspect = 1.0;

            const imgAspect = img.width / img.height;
            const containerAspect = w / h;
            let drawW, drawH;
            if (imgAspect > containerAspect) { drawW = w * currentScale; drawH = drawW / imgAspect; } 
            else { drawH = h * currentScale; drawW = drawH * imgAspect; }

            const shiftX = ((currentPanX - 50) / 100) * w * 2;
            const shiftY = ((currentPanY - 50) / 100) * h * 2;
            const centerX = w / 2, centerY = h / 2;
            const drawX = centerX - (drawW / 2) + shiftX;
            const drawY = centerY - (drawH / 2) + shiftY;

            if (!helperCanvasRef.current) helperCanvasRef.current = document.createElement('canvas');
            const tempCanvas = helperCanvasRef.current;
            if (tempCanvas.width !== w || tempCanvas.height !== h) { tempCanvas.width = w; tempCanvas.height = h; }
            const tCtx = tempCanvas.getContext('2d', { willReadFrequently: true });
            tCtx.save();
            tCtx.imageSmoothingEnabled = isExport ? true : !isDragging;
            tCtx.imageSmoothingQuality = isExport ? 'high' : 'medium';
            tCtx.clearRect(0, 0, w, h);
            tCtx.drawImage(img, drawX, drawY, drawW, drawH);
            tCtx.restore();

            const maxCropDim = Math.min(w, h);
            let cropW, cropH, cropX, cropY;
            if (currentFrameShape === 'circle' || currentFrameShape === 'square') {
                cropW = maxCropDim; cropH = maxCropDim;
                cropX = centerX - cropW / 2; cropY = centerY - cropH / 2;
            } else { 
                const baseDim = maxCropDim;
                if (currentAspect >= 1) { cropW = baseDim; cropH = baseDim / currentAspect; } 
                else { cropH = baseDim; cropW = baseDim * currentAspect; }
                cropX = centerX - cropW / 2; cropY = centerY - cropH / 2;
            }

            if (step === 'crop') {
                ctx.clearRect(0, 0, w, h);
                ctx.drawImage(tempCanvas, 0, 0);
                ctx.fillStyle = 'rgba(255, 255, 255, 0.85)'; ctx.beginPath(); ctx.rect(0, 0, w, h); 
                if (currentFrameShape === 'circle') ctx.arc(centerX, centerY, maxCropDim / 2, 0, Math.PI * 2, true);
                else ctx.rect(cropX, cropY, cropW, cropH);
                ctx.fill('evenodd'); 
                ctx.strokeStyle = THEME_COLOR; ctx.lineWidth = 2; ctx.beginPath();
                if (currentFrameShape === 'circle') ctx.arc(centerX, centerY, maxCropDim / 2 - 1, 0, Math.PI * 2);
                else ctx.rect(cropX + 1, cropY + 1, cropW - 2, cropH - 2);
                ctx.stroke();
                return; 
            }

            const outputCanvas = document.createElement('canvas');
            outputCanvas.width = w; outputCanvas.height = h;
            const oCtx = outputCanvas.getContext('2d', { willReadFrequently: true });

            // **MODIFICATION FOR TRANSPARENT EXPORT:** Do not fill the background for SVG/PNG export
            if (!isExport) {
                oCtx.fillStyle = '#FFFFFF'; oCtx.beginPath();
                if (currentFrameShape === 'circle') oCtx.arc(centerX, centerY, maxCropDim / 2, 0, Math.PI * 2);
                else oCtx.rect(cropX, cropY, cropW, cropH);
                oCtx.fill();
            } else {
                 // For export, the canvas starts clear (transparent black)
            }


            if (compareMode && !isExport) {
                oCtx.save(); oCtx.beginPath();
                if (currentFrameShape === 'circle') oCtx.arc(centerX, centerY, maxCropDim / 2, 0, Math.PI * 2);
                else oCtx.rect(cropX, cropY, cropW, cropH);
                oCtx.clip(); oCtx.drawImage(tempCanvas, 0, 0); oCtx.restore();
            } else {
                 const sourceData = tCtx.getImageData(0, 0, w, h).data;
                 const PI = Math.PI, PI2 = Math.PI * 2;
                 const effectiveRings = Math.max(1, rings || 60); 
                 const maxRadiusSq = (maxCropDim/2) ** 2;
                 const holeRadiusSq = (centerHole > 0) ? ((maxCropDim/2) * (centerHole/100))**2 : -1;
                 const pxPerMm = w / 200; 
                 const minFeaturePx = is3DMode ? (minThickness * pxPerMm) : 0;
                 const halfCropW = cropW / 2, halfCropH = cropH / 2;

                 let layersToRender = [];
                 if (mode === 'photo') layersToRender.push({ key: 'photo', color: hexToRgb(fgColor), angleOffset: 0 });
                 else if (colorMode === 'cmyk') {
                      if (activeLayers.c) layersToRender.push({ key: 'c', color: CMYK_COLORS.c, angleOffset: CMYK_ANGLES.c });
                      if (activeLayers.m) layersToRender.push({ key: 'm', color: CMYK_COLORS.m, angleOffset: CMYK_ANGLES.m });
                      if (activeLayers.y) layersToRender.push({ key: 'y', color: CMYK_COLORS.y, angleOffset: CMYK_ANGLES.y });
                      if (activeLayers.k) layersToRender.push({ key: 'k', color: CMYK_COLORS.k, angleOffset: CMYK_ANGLES.k });
                 } else layersToRender.push({ key: 'mono', color: hexToRgb(fgColor), angleOffset: 0 }); 

                 layersToRender.forEach((layer, i) => {
                      const isMono = layer.key === 'mono' || layer.key === 'photo'; 
                      const layerColor = isMono ? layer.color : hexToRgb(layer.color); 
                      const totalRotation = rotation + layer.angleOffset;
                      const radRotation = (totalRotation * PI) / 180;
                      const layerImgData = oCtx.createImageData(w, h);
                      const data = layerImgData.data;
                      
                      if (mode === 'flow') {
                          const gridSize = maxCropDim / effectiveRings; 
                          const strokeLen = gridSize * (lineThickness * 3.0);
                          const flowCanvas = document.createElement('canvas');
                          flowCanvas.width = w; flowCanvas.height = h;
                          const fCtx = flowCanvas.getContext('2d');
                          fCtx.strokeStyle = `rgba(${layerColor.r}, ${layerColor.g}, ${layerColor.b}, 1)`;
                          let lw = Math.max(1, gridSize * 0.2);
                          if (is3DMode && lw < minFeaturePx) lw = minFeaturePx;
                          fCtx.lineWidth = lw;
                          fCtx.beginPath();
                          for (let y = -maxCropDim/2; y < maxCropDim/2; y += gridSize) {
                              for (let x = -maxCropDim/2; x < maxCropDim/2; x += gridSize) {
                                       const cx = centerX + x, cy = centerY + y;
                                       const dx = cx - centerX, dy = cy - centerY, distSq = dx*dx + dy*dy;
                                       if (currentFrameShape === 'circle' && distSq > maxRadiusSq) continue;
                                       if (currentFrameShape !== 'circle' && (Math.abs(dx) > halfCropW || Math.abs(dy) > halfCropH)) continue;
                                       if (distSq < holeRadiusSq) continue;
                                       const ix = Math.floor(cx), iy = Math.floor(cy);
                                       if (ix < 1 || ix >= w-1 || iy < 1 || iy >= h-1) continue;
                                       const idx = (iy * w + ix) * 4;
                                       if (sourceData[idx+3] === 0) continue;
                                       const getL = (idx) => 0.299*(sourceData[idx]/255) + 0.587*(sourceData[idx+1]/255) + 0.114*(sourceData[idx+2]/255);
                                       const luma = getL(idx);
                                       const val = (luma - 0.5) * contrast + 0.5 + (brightness/255);
                                       if ((val > 0.95 && !invert) || (val < 0.05 && invert)) continue;
                                       const gx = getL(((iy)*w + (ix+1))*4) - getL(((iy)*w + (ix-1))*4);
                                       const gy = getL(((iy+1)*w + (ix))*4) - getL(((iy-1)*w + (ix))*4);
                                       const angle = Math.atan2(gy, gx) + Math.PI/2;
                                       const x1 = cx - Math.cos(angle)*strokeLen/2, y1 = cy - Math.sin(angle)*strokeLen/2;
                                       const x2 = cx + Math.cos(angle)*strokeLen/2, y2 = cy + Math.sin(angle)*strokeLen/2;
                                       fCtx.moveTo(x1, y1); fCtx.lineTo(x2, y2);
                                   }
                           }
                           fCtx.stroke();
                           oCtx.drawImage(flowCanvas, 0, 0);
                       } else {
                           for (let y = 0; y < h; y++) {
                               for (let x = 0; x < w; x++) {
                                       const index = (y * w + x) * 4;
                                       if (sourceData[index+3] === 0) { data[index+3] = 0; continue; }
                                       const dx = x - centerX, dy = y - centerY, distSq = dx*dx + dy*dy;
                                       if (currentFrameShape === 'circle' && distSq > maxRadiusSq) { data[index+3] = 0; continue; }
                                       if (currentFrameShape !== 'circle' && (Math.abs(dx) > halfCropW || Math.abs(dy) > halfCropH)) { data[index+3] = 0; continue; }
                                       if (distSq < holeRadiusSq) { data[index+3] = 0; continue; }
                                       
                                       let r = sourceData[index]/255, g = sourceData[index+1]/255, b = sourceData[index+2]/255;
                                       let val = 1.0;
                                       if (isMono) {
                                           let luma = 0.299 * (r*255) + 0.587 * (g*255) + 0.114 * (b*255);
                                           luma += brightness; luma = (luma - 128) * contrast + 128;
                                           if (luma < 0) luma = 0; if (luma > 255) luma = 255;
                                           val = luma / 255;
                                           if (invert) val = 1.0 - val;
                                           if (mode === 'photo') { data[index] = val*255; data[index+1] = val*255; data[index+2] = val*255; data[index+3] = 255; continue; }
                                       } else {
                                            r = Math.min(1, Math.max(0, ((r-0.5)*contrast+0.5)+(brightness/255)));
                                            g = Math.min(1, Math.max(0, ((g-0.5)*contrast+0.5)+(brightness/255)));
                                            b = Math.min(1, Math.max(0, ((b-0.5)*contrast+0.5)+(brightness/255)));
                                            let k = 1 - Math.max(r, g, b);
                                            if (layer.key === 'c') val = 1 - ((1 - r - k) / (1 - k) || 0);
                                            if (layer.key === 'm') val = 1 - ((1 - g - k) / (1 - k) || 0);
                                            if (layer.key === 'y') val = 1 - ((1 - b - k) / (1 - k) || 0);
                                            if (layer.key === 'k') val = 1 - k;
                                       }
                                       let isForeground = false;
                                       if (mode === 'spiral') {
                                            const dist = Math.sqrt(distSq);
                                            const angle = Math.atan2(dy, dx) + radRotation;
                                            const normDist = dist / (maxCropDim / 2);
                                            const wave = Math.sin( (normDist * effectiveRings * PI2) + angle );
                                            const spacingPx = (maxCropDim / 2) / effectiveRings; 
                                            let threshold = (1 - val) * (lineThickness * 2);
                                            if (is3DMode) {
                                                 const minDuty = minFeaturePx / spacingPx; if (threshold < minDuty) threshold = minDuty;
                                            } else if (threshold < 0.05 && lineThickness > 0.1) threshold = 0.05;
                                            if ((wave + 1) / 2 < threshold) isForeground = true;
                                       } else if (mode === 'lines') {
                                            const ry = dx * Math.sin(radRotation) + dy * Math.cos(radRotation);
                                            const normY = ry / (maxCropDim / 2); 
                                            const wave = Math.sin( normY * effectiveRings * PI );
                                            const spacingPx = maxCropDim / effectiveRings;
                                            let threshold = (1 - val) * (lineThickness * 2);
                                            if (is3DMode) { const minDuty = minFeaturePx / spacingPx; if (threshold < minDuty) threshold = minDuty; }
                                            if ((wave + 1) / 2 < threshold) isForeground = true;
                                       } else if (mode === 'dots') {
                                            const rx = dx * Math.cos(radRotation) - dy * Math.sin(radRotation);
                                            const ry = dx * Math.sin(radRotation) + dy * Math.cos(radRotation);
                                            const gridSize = maxCropDim / effectiveRings; 
                                            if (gridSize > 0) {
                                                 const cellX = Math.floor(rx / gridSize), cellY = Math.floor(ry / gridSize);
                                                 const lx = rx - ((cellX + 0.5) * gridSize), ly = ry - ((cellY + 0.5) * gridSize);
                                                 let dome = 0, normDist = 0;
                                                 if (dotShape === 'circle') { normDist = Math.sqrt(lx*lx + ly*ly) / (gridSize / 1.5); if (normDist < 1) dome = Math.cos(normDist * (PI / 2)); }
                                                 else if (dotShape === 'square') { normDist = Math.max(Math.abs(lx), Math.abs(ly)) / (gridSize / 2.0); if (normDist < 1) dome = 1.0 - normDist; }
                                                 else if (dotShape === 'diamond') { normDist = (Math.abs(lx) + Math.abs(ly)) / (gridSize / 1.5); if (normDist < 1) dome = 1.0 - normDist; }
                                                 else if (dotShape === 'triangle') { const k = Math.sqrt(3); normDist = Math.max(Math.abs(lx) * k/2 + ly/2, -ly) / (gridSize / 2.5); if (normDist < 1) dome = 1.0 - normDist; }
                                                 let cutoff = val / lineThickness;
                                                 if (is3DMode) { const maxValForSafeSize = 1.0 - (minFeaturePx / gridSize); if (cutoff > maxValForSafeSize) cutoff = maxValForSafeSize; }
                                                 if (dome > cutoff) isForeground = true;
                                            }
                                       }
                                       if (isForeground) { data[index] = layerColor.r; data[index+1] = layerColor.g; data[index+2] = layerColor.b; data[index+3] = 255; } 
                                       else if (isExport) { data[index+3] = 0; } // Ensure transparency for background when exporting
                               }
                           }
                           const layerCanvas = document.createElement('canvas');
                           layerCanvas.width = w; layerCanvas.height = h;
                           layerCanvas.getContext('2d').putImageData(layerImgData, 0, 0);
                           if (colorMode === 'mono' || i === 0) oCtx.globalCompositeOperation = 'source-over'; else oCtx.globalCompositeOperation = 'multiply'; 
                           oCtx.drawImage(layerCanvas, 0, 0);
                           oCtx.globalCompositeOperation = 'source-over';
                       }
                 });
                 
                 if (borderWidth > 0) {
                      const borderPx = (borderWidth * maxCropDim) / 200; oCtx.lineWidth = borderPx; oCtx.strokeStyle = colorMode === 'cmyk' ? '#000000' : fgColor; oCtx.beginPath();
                      if (currentFrameShape === 'circle') oCtx.arc(centerX, centerY, maxCropDim / 2 - borderPx/2, 0, Math.PI * 2); else oCtx.rect(cropX + borderPx/2, cropY + borderPx/2, cropW - borderPx, cropH - borderPx); oCtx.stroke();
                 }

                 if (lithoPreview) {
                      const pMin = modeSettings.litho.minDepth, pMax = modeSettings.litho.maxDepth, depthRange = pMax - pMin;
                      const rawData = oCtx.getImageData(0, 0, w, h).data, litData = oCtx.createImageData(w, h), lData = litData.data;
                      for (let y = 0; y < h; y++) {
                           for (let x = 0; x < w; x++) {
                               const i = (y*w + x) * 4;
                               // Strictly mask for preview too
                               const dx = x - centerX, dy = y - centerY, distSq = dx*dx + dy*dy;
                               const isMasked = (currentFrameShape === 'circle' && distSq > maxRadiusSq) || (currentFrameShape !== 'circle' && (Math.abs(dx) > halfCropW || Math.abs(dy) > halfCropH));
                               
                               if (isMasked || rawData[i+3] < 10) { lData[i] = 240; lData[i+1] = 240; lData[i+2] = 240; lData[i+3] = 255; continue; }
                               const getZ = (idx) => pMin + ((1.0 - (rawData[idx] + rawData[idx+1] + rawData[idx+2])/3/255) * depthRange);
                               const zCenter = getZ(i), zLeft = x>0 ? getZ((y*w + x-1)*4) : pMin, zTop = y>0 ? getZ(((y-1)*w + x)*4) : pMin;
                               let intensity = Math.max(0, Math.min(255, 128 + ((zCenter-zLeft)+(zCenter-zTop))*20));
                               lData[i] = intensity; lData[i+1] = intensity*0.95; lData[i+2] = intensity*0.9; lData[i+3] = 255;
                           }
                      }
                      oCtx.putImageData(litData, 0, 0);
                 }
            } 
            ctx.clearRect(0, 0, w, h);
            if (isExport) ctx.drawImage(outputCanvas, 0, 0);
            else { ctx.save(); ctx.translate(w/2, h/2); ctx.scale(editView.scale, editView.scale); ctx.translate(editView.x, editView.y); ctx.translate(-w/2, -h/2); ctx.drawImage(outputCanvas, 0, 0); ctx.restore(); }
        } catch(e) { console.error(e); showToast("Rendering error.", 'error'); }
    }, [step, scale, panX, panY, frameShape, liveCrop, cropAspectW, cropAspectH, mode, modeSettings, contrast, brightness, invert, colorMode, activeLayers, fgColor, borderWidth, centerHole, is3DMode, minThickness, lithoPreview, compareMode, editView, isDragging, rings, lineThickness, rotation, dotShape]);

    useEffect(() => {
        if (!imageSrc || !canvasRef.current) return;
        // Set interactive to true if dragging, or if the view is modified beyond 1:1 scale
        const isInteractive = step === 'crop' || isDragging || editView.scale !== 1.0;
        const delay = isInteractive ? 0 : 30; // Render instantly if interacting
        if (renderTimeoutRef.current) clearTimeout(renderTimeoutRef.current);
        renderTimeoutRef.current = setTimeout(() => {
            const canvas = canvasRef.current;
            if (!canvas || !canvas.parentElement) return;
            const rect = canvas.parentElement.getBoundingClientRect(), dpr = Math.min(window.devicePixelRatio || 1, 1.5);
            const targetWidth = Math.floor(rect.width * dpr), targetHeight = Math.floor(rect.height * dpr);
            if (canvas.width !== targetWidth || canvas.height !== targetHeight) { canvas.width = targetWidth; canvas.height = targetHeight; }
            renderFrame(canvas.getContext('2d', { willReadFrequently: true }), canvas.width, canvas.height);
        }, delay); 
        return () => clearTimeout(renderTimeoutRef.current);
    }, [renderFrame, imageSrc, step, isDragging, editView]);
    
    // --- Export Logic using Web Worker ---
    const worker = useMemo(() => {
        // Basic Worker Script for SVG/STL calculation
        const workerScript = `
            const hexToRgb = (hex) => {
                const result = /^#?([a-f\\d]{2})([a-f\\d]{2})([a-f\\d]{2})$/i.exec(hex);
                return result ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) } : { r: 0, g: 0, b: 0 };
            };
            
            self.onmessage = (e) => {
                const { type, data, config } = e.data;
                const { w, h, centerHole, frameShape, cropAspectW, cropAspectH, mode, rings, rotation, lineThickness, dotShape, contrast, brightness, invert, colorMode, activeLayers, fgColor, is3DMode, minThickness, modeSettings } = config;
                
                const imageData = new ImageData(new Uint8ClampedArray(data), w, h);
                const sourceData = imageData.data;
                const centerX = w / 2, centerY = h / 2;
                const maxCropDim = Math.min(w, h);
                const PI = Math.PI, PI2 = Math.PI * 2;
                const effectiveRings = Math.max(1, rings || 60);
                const holeRadiusSq = (centerHole > 0) ? ((maxCropDim / 2) * (centerHole / 100)) ** 2 : -1;
                const maxRadiusSq = (maxCropDim / 2) ** 2;
                let cropW, cropH; let currentAspect = frameShape === 'custom' ? cropAspectW / cropAspectH : 1.0;
                if (frameShape === 'circle' || frameShape === 'square') { cropW = maxCropDim; cropH = maxCropDim; } 
                else { if (currentAspect >= 1) { cropW = maxCropDim; cropH = maxCropDim / currentAspect; } else { cropH = maxCropDim; cropW = maxCropDim * currentAspect; } }
                const halfCropW = cropW / 2, halfCropH = cropH / 2;
                const CMYK_COLORS = { c: '#00FFFF', m: '#FF00FF', y: '#FFFF00', k: '#000000' };
                const CMYK_ANGLES = { c: 15, m: 75, y: 0, k: 45 };


                const getVal = (x, y, rot, key) => {
                    const ix = Math.floor(x), iy = Math.floor(y); if (ix < 0 || ix >= w || iy < 0 || iy >= h) return 1;
                    const idx = (iy * w + ix) * 4; if (sourceData[idx + 3] === 0) return 1;
                    const dx = ix - centerX, dy = iy - centerY, dSq = dx * dx + dy * dy;
                    if (frameShape === 'circle' && dSq > maxRadiusSq) return 1;
                    if (frameShape !== 'circle' && (Math.abs(dx) > halfCropW || Math.abs(dy) > halfCropH)) return 1;
                    if (dSq < holeRadiusSq) return 1;
                    let r = sourceData[idx] / 255, g = sourceData[idx + 1] / 255, b = sourceData[idx + 2] / 255, val = 1;
                    
                    // Image Adjustment
                    r = Math.min(1, Math.max(0, ((r-0.5)*contrast+0.5)+(brightness/255)));
                    g = Math.min(1, Math.max(0, ((g-0.5)*contrast+0.5)+(brightness/255)));
                    b = Math.min(1, Math.max(0, ((b-0.5)*contrast+0.5)+(brightness/255)));

                    if (colorMode === 'mono') { 
                        let l = 0.299 * r + 0.587 * g + 0.114 * b;
                        val = Math.min(1, Math.max(0, l)); 
                        if (invert) val = 1 - val; 
                    } else { 
                        let k = 1 - Math.max(r, g, b); 
                        if (key === 'c') val = 1 - ((1 - r - k) / (1 - k) || 0); 
                        if (key === 'm') val = 1 - ((1 - g - k) / (1 - k) || 0); 
                        if (key === 'y') val = 1 - ((1 - b - k) / (1 - k) || 0); 
                        if (key === 'k') val = 1 - k; 
                        // CMYK images are typically inverted (darker = more ink = lower value)
                        val = 1 - val; 
                    }
                    return val;
                };

                if (type === 'svg') {
                    let svgBody = "";
                    let layersToExport = [];
                    if (colorMode === 'cmyk') {
                        if(activeLayers.c) layersToExport.push({key:'c',name:'Cyan',color:CMYK_COLORS.c,angle:CMYK_ANGLES.c});
                        if(activeLayers.m) layersToExport.push({key:'m',name:'Magenta',color:CMYK_COLORS.m,angle:CMYK_ANGLES.m});
                        if(activeLayers.y) layersToExport.push({key:'y',name:'Yellow',color:CMYK_COLORS.y,angle:CMYK_ANGLES.y});
                        if(activeLayers.k) layersToExport.push({key:'k',name:'Key',color:CMYK_COLORS.k,angle:CMYK_ANGLES.k});
                    } else layersToExport.push({key:'mono',name:'Layer_1',color:fgColor,angle:0});

                    layersToExport.forEach(layer => {
                        let paths = []; const totalRot = rotation + layer.angle, radRot = totalRot * PI / 180;
                        
                        // Simplified function to add geometric dots/lines/spirals... (Large block removed for brevity)
                        // The core logic is to use the grayscale value (val) to control size or thickness.
                        if (mode === 'spiral') {
                             // SVG Spiral Path Generation Logic (similar to renderFrame, but generating SVG path strings)
                             const spacing = (maxCropDim/2)/effectiveRings, maxTheta = effectiveRings*2*PI, steps = Math.min(20000, effectiveRings*120), stepSize = maxTheta/steps;
                             let inner=[], outer=[], drawing=false;
                             for (let t=0; t<maxTheta; t+=stepSize) {
                                 const r = (t/maxTheta)*(maxCropDim/2), a = t+radRot, cx = centerX+r*Math.cos(a), cy = centerY+r*Math.sin(a);
                                 const val = getVal(cx,cy,totalRot,layer.key), wFactor = Math.max(0,val*lineThickness); // Invert val for darkness = thickness
                                 if (wFactor*spacing > 0.5) {
                                     if (!drawing) drawing=true;
                                     inner.push({x:centerX+(r-wFactor*spacing/2)*Math.cos(a), y:centerY+(r-wFactor*spacing/2)*Math.sin(a)});
                                     outer.push({x:centerX+(r+wFactor*spacing/2)*Math.cos(a), y:centerY+(r+wFactor*spacing/2)*Math.sin(a)});
                                 } else if (drawing) {
                                     if(inner.length>2) { let d=\`M \${inner[0].x.toFixed(2)} \${inner[0].y.toFixed(2)}\`; for(let i=1;i<inner.length;i++) d+=\` L \${inner[i].x.toFixed(2)} \${inner[i].y.toFixed(2)}\`; d+=\` L \${outer[outer.length-1].x.toFixed(2)} \${outer[outer.length-1].y.toFixed(2)}\`; for(let i=outer.length-2;i>=0;i--) d+=\` L \${outer[i].x.toFixed(2)} \${outer[i].y.toFixed(2)}\`; d+=' Z'; paths.push(\`<path d="\${d}" />\`); }
                                     inner=[]; outer=[]; drawing=false;
                                 }
                             }
                             if(inner.length>2) { let d=\`M \${inner[0].x.toFixed(2)} \${inner[0].y.toFixed(2)}\`; for(let i=1;i<inner.length;i++) d+=\` L \${inner[i].x.toFixed(2)} \${inner[i].y.toFixed(2)}\`; d+=\` L \${outer[outer.length-1].x.toFixed(2)} \${outer[outer.length-1].y.toFixed(2)}\`; for(let i=outer.length-2;i>=0;i--) d+=\` L \${outer[i].x.toFixed(2)} \${outer[i].y.toFixed(2)}\`; d+=' Z'; paths.push(\`<path d="\${d}" />\`); }
                        } else if (mode === 'dots') {
                             const gridSize = maxCropDim/effectiveRings;
                             for (let y = -maxCropDim/2; y < maxCropDim/2; y += gridSize) {
                                 for (let x = -maxCropDim/2; x < maxCropDim/2; x += gridSize) {
                                     const rx = x * Math.cos(radRot) - y * Math.sin(radRot), ry = x * Math.sin(radRot) + y * Math.cos(radRot);
                                     const cx = centerX+rx, cy = centerY+ry;
                                     const val = getVal(cx, cy, totalRot, layer.key), size = gridSize * val * lineThickness; // Invert val for darkness = size
                                     if (size > 0.5) {
                                         if (dotShape === 'circle') paths.push(\`<circle cx="\${cx.toFixed(2)}" cy="\${cy.toFixed(2)}" r="\${(size/1.5).toFixed(2)}" />\`);
                                         else if (dotShape === 'square') paths.push(\`<rect x="\${(cx-size/2).toFixed(2)}" y="\${(cy-size/2).toFixed(2)}" width="\${size.toFixed(2)}" height="\${size.toFixed(2)}" />\`);
                                         else if (dotShape === 'diamond') paths.push(\`<rect x="\${(cx-size/2).toFixed(2)}" y="\${(cy-size/2).toFixed(2)}" width="\${size.toFixed(2)}" height="\${size.toFixed(2)}" transform="rotate(45 \${cx} \${cy})" />\`);
                                         else if (dotShape === 'triangle') { const hT = size*0.866, rT = hT*0.66; paths.push(\`<polygon points="\${cx},\${cy-rT} \${cx-size/2},\${cy+(hT-rT)} \${cx+size/2},\${cy+(hT-rT)}" />\`); }
                                     }
                                 }
                             }
                        } else { // Lines, Flow
                             // For simplicity and speed in this worker, other modes (lines, flow) can fall back to a raster-based black/white threshold if true vector tracing isn't implemented.
                             // But for true vector output, you would implement line/path tracing here. We'll use the placeholder:
                             paths.push(\`<text x="\${centerX/2}" y="\${centerY}" font-size="20" fill="red">Vector trace not fully implemented in worker for this mode.</text>\`);
                        }

                        svgBody += \`<g id="\${layer.name}" fill="\${layer.color}" stroke="\${layer.color}" stroke-linecap="round" stroke-linejoin="round">\n\${paths.join('\\n')}\n</g>\n\`;
                    });

                    // Set stroke="none" and fill="none" on the main SVG element to ensure a transparent background.
                    const svgContent = \`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 \${w} \${h}" width="\${w}mm" height="\${h}mm" style="background:none; fill:none; stroke:none;">\${svgBody}</svg>\`;
                    self.postMessage({ type: 'svgResult', result: svgContent });
                } 
                
                else if (type === 'stl') {
                     // STL Generation Logic (same as before, but encapsulated in the worker)
                     const pMin = modeSettings.litho.minDepth, pMax = modeSettings.litho.maxDepth, widthMm = modeSettings.litho.widthMm;
                     const pxSize = widthMm / w;
                     const baseDepth = pMin, maxDepth = pMax;
                     const halfW = w/2, halfH = h/2;

                     let validQuads = 0;
                     for(let y=0; y<h-1; y++) {
                         for(let x=0; x<w-1; x++) {
                             if(frameShape === 'circle') {
                                 const dx = x - halfW, dy = y - halfH;
                                 if ((dx*dx + dy*dy) > (Math.min(halfW, halfH))**2) continue;
                             }
                             validQuads++;
                         }
                     }

                     const bufferSize = 84 + (50 * validQuads * 2);
                     const buffer = new ArrayBuffer(bufferSize), view = new DataView(buffer);
                     view.setUint32(80, validQuads * 2, true);
                     let offset = 84; 

                     const getHeight = (x, y) => { 
                         const idx = (y * w + x) * 4; 
                         if (sourceData[idx+3] < 10) return 0; // Transparent areas are 0 depth
                         // Calculate grayscale from color data (assumes rasterized output is grayscale)
                         const val = (sourceData[idx] + sourceData[idx+1] + sourceData[idx+2]) / 3 / 255;
                         // Darker value (0) -> Max depth (pMax). Lighter value (1) -> Min depth (pMin)
                         return baseDepth + ((1 - val) * (maxDepth - baseDepth));
                     };

                     for (let y = 0; y < h - 1; y++) {
                         for (let x = 0; x < w - 1; x++) {
                              if(frameShape === 'circle') {
                                  const dx = x - halfW, dy = y - halfH;
                                  if ((dx*dx + dy*dy) > (Math.min(halfW, halfH))**2) continue;
                              }

                              const x0 = x*pxSize, y0 = y*pxSize, x1 = (x+1)*pxSize, y1 = (y+1)*pxSize;
                              const z00 = getHeight(x, y), z10 = getHeight(x+1, y), z01 = getHeight(x, y+1), z11 = getHeight(x+1, y+1);
                              
                              // Triangle 1 (00-10-01)
                              view.setFloat32(offset, 0, true); view.setFloat32(offset+4, 0, true); view.setFloat32(offset+8, 1, true); // Normal
                              view.setFloat32(offset+12, x0, true); view.setFloat32(offset+16, y0, true); view.setFloat32(offset+20, z00, true);
                              view.setFloat32(offset+24, x1, true); view.setFloat32(offset+28, y0, true); view.setFloat32(offset+32, z10, true);
                              view.setFloat32(offset+36, x0, true); view.setFloat32(offset+40, y1, true); view.setFloat32(offset+44, z01, true);
                              view.setUint16(offset+48, 0, true); offset += 50;

                              // Triangle 2 (10-11-01)
                              view.setFloat32(offset, 0, true); view.setFloat32(offset+4, 0, true); view.setFloat32(offset+8, 1, true); // Normal
                              view.setFloat32(offset+12, x1, true); view.setFloat32(offset+16, y0, true); view.setFloat32(offset+20, z10, true);
                              view.setFloat32(offset+24, x1, true); view.setFloat32(offset+28, y1, true); view.setFloat32(offset+32, z11, true);
                              view.setFloat32(offset+36, x0, true); view.setFloat32(offset+40, y1, true); view.setFloat32(offset+44, z01, true);
                              view.setUint16(offset+48, 0, true); offset += 50;
                         }
                     }
                     self.postMessage({ type: 'stlResult', result: buffer }, [buffer]);
                }
            };
        `;

        if (typeof window !== 'undefined') {
            const blob = new Blob([workerScript], { type: 'application/javascript' });
            const url = URL.createObjectURL(blob);
            const newWorker = new Worker(url);
            return newWorker;
        }
        return null;
    }, []);

    const downloadSVG = useCallback(() => { 
        if (!sourceImageRef.current || !canvasRef.current || !worker) return;
        setIsProcessing(true); showToast("Calculating Vectors...", 'info');

        const refCanvas = canvasRef.current;
        // 1. Render the current visual state to a temporary canvas *without* view pan/zoom
        const tempCanvas = document.createElement('canvas');
        // Use a reasonable, high-resolution base for vector tracing
        const w = 2048, h = 2048; // Max resolution for consistency with source image scaling logic
        tempCanvas.width = w; tempCanvas.height = h;
        renderFrame(tempCanvas.getContext('2d'), w, h, true);
        
        // 2. Get the raw image data to send to the worker
        const imgData = tempCanvas.getContext('2d').getImageData(0, 0, w, h).data.buffer;

        worker.onmessage = (e) => {
            setIsProcessing(false);
            if (e.data.type === 'svgResult') {
                const svgContent = e.data.result;
                const blob = new Blob([svgContent], {type: 'image/svg+xml'});
                const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = `if-studio-${Date.now()}.svg`; link.click(); 
                setTimeout(() => URL.revokeObjectURL(url), 1000);
                showToast("SVG Generated!", 'success');
            } else {
                showToast("SVG Gen Error", 'error');
            }
        };

        worker.postMessage({ 
            type: 'svg', 
            data: imgData, 
            config: { w, h, centerHole, frameShape, cropAspectW, cropAspectH, mode, rings, rotation, lineThickness, dotShape, contrast, brightness, invert, colorMode, activeLayers, fgColor, is3DMode, minThickness, modeSettings }
        }, [imgData]); 

    }, [mode, rings, rotation, frameShape, cropAspectW, cropAspectH, centerHole, colorMode, activeLayers, fgColor, borderWidth, dotShape, lineThickness, brightness, contrast, invert, renderFrame, worker, modeSettings, is3DMode]);

    const downloadSTL = useCallback(() => {
        if (!sourceImageRef.current || !canvasRef.current || !worker) return;
        setIsProcessing(true); showToast('Generating STL...', 'info');

        const refCanvas = canvasRef.current;
        // 1. Render the current visual state (which for litho should be grayscale output)
        const tempCanvas = document.createElement('canvas');
        // Use the litho resolution setting to determine export resolution
        const maxRes = 1000 * modeSettings.litho.resolution;
        const scaleFactor = Math.min(1, maxRes / Math.max(sourceImageRef.current.width, sourceImageRef.current.height));
        const w = Math.floor(sourceImageRef.current.width * scaleFactor);
        const h = Math.floor(sourceImageRef.current.height * scaleFactor);
        tempCanvas.width = w; tempCanvas.height = h;
        renderFrame(tempCanvas.getContext('2d'), w, h, true);

        const imgData = tempCanvas.getContext('2d').getImageData(0, 0, w, h).data.buffer;

        worker.onmessage = (e) => {
            setIsProcessing(false);
            if (e.data.type === 'stlResult') {
                const blob = new Blob([e.data.result], { type: 'application/octet-stream' });
                const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = `if-studio-litho-${Date.now()}.stl`; link.click(); 
                setTimeout(() => URL.revokeObjectURL(url), 1000); 
                showToast("STL Generated!", 'success');
            } else {
                showToast("Failed to generate STL.", 'error');
            }
        };

        worker.postMessage({ 
            type: 'stl', 
            data: imgData, 
            config: { w, h, centerHole, frameShape, cropAspectW, cropAspectH, mode, rings, rotation, lineThickness, dotShape, contrast, brightness, invert, colorMode, activeLayers, fgColor, is3DMode, minThickness, modeSettings }
        }, [imgData]); 

    }, [frameShape, cropAspectW, cropAspectH, modeSettings.litho, renderFrame, worker, centerHole, mode, rings, rotation, lineThickness, dotShape, contrast, brightness, invert, colorMode, activeLayers, fgColor, is3DMode, minThickness, modeSettings]);

    const downloadPNG = useCallback((exportScale = 1) => {
        if (!sourceImageRef.current) return;
        setIsProcessing(true);
        setTimeout(() => {
            try {
                const img = sourceImageRef.current;
                const w = img.width * exportScale;
                const h = img.height * exportScale;
                const exportCanvas = document.createElement('canvas');
                exportCanvas.width = w; exportCanvas.height = h;
                // **Modification here:** The renderFrame call with isExport=true already handles the transparency
                renderFrame(exportCanvas.getContext('2d'), w, h, true);
                const link = document.createElement('a');
                link.download = `if-studio-${Date.now()}.png`;
                // exportCanvas.toDataURL('image/png') preserves the canvas's transparency (which renderFrame ensures)
                link.href = exportCanvas.toDataURL('image/png');
                link.click();
                showToast("PNG Exported!", 'success');
            } catch(e) { showToast("Export failed.", 'error'); } 
            finally { setIsProcessing(false); }
        }, 100);
    }, [renderFrame]);
        
    const applyCropAndGoToEdit = useCallback(() => {
        // Apply Live Crop settings to Final State
        setHistoryState(prev => ({
            ...prev,
            scale: liveCrop.scale, 
            panX: liveCrop.panX, 
            panY: liveCrop.panY, 
            frameShape: liveCrop.frameShape
        }), 'Apply Crop');
        
        // Switch Mode
        setStep('edit'); 
        setActiveCropTab(null); 
        setActiveTab('pattern');
        showToast("Crop Applied!");
    }, [liveCrop, setHistoryState]);
    
    // Custom setters to leverage setHistoryState
    const setInvertAndRecord = (val) => setHistoryState(prev => ({...prev, invert: val}), 'Toggle Invert');
    const setFgColorAndRecord = (val) => setHistoryState(prev => ({...prev, fgColor: val}), 'Change Foreground Color');
    const setColorModeAndRecord = (val) => setHistoryState(prev => ({...prev, colorMode: val}), 'Change Color Mode');
    const setActiveLayersAndRecord = (fn) => setHistoryState(fn, 'Toggle CMYK Layer');
    const setIs3DModeAndRecord = (val) => setHistoryState(prev => ({...prev, is3DMode: val}), 'Toggle 3D Mode');
    const setMinThicknessAndRecord = (val) => setHistoryState(prev => ({...prev, minThickness: val}), 'Change Min Thickness');
    const setContrastAndRecord = (val) => setHistoryState(prev => ({...prev, contrast: val}), 'Change Contrast');
    const setBrightnessAndRecord = (val) => setHistoryState(prev => ({...prev, brightness: val}), 'Change Brightness');
    const setCenterHoleAndRecord = (val) => setHistoryState(prev => ({...prev, centerHole: val}), 'Change Center Hole');
    const setBorderWidthAndRecord = (val) => setHistoryState(prev => ({...prev, borderWidth: val}), 'Change Border Width');
    const updateDotShapeAndRecord = (shape) => updateSetting('dotShape', shape);


    const renderControls = (section) => {
        switch(section) {
            case 'pattern': return (
                <>
                    <div className="flex gap-2 mb-4 overflow-x-auto pb-1 scrollbar-hide">
                        <ModeButton active={mode === 'spiral'} onClick={() => handleModeChange('spiral')} icon={Disc} label="Spiral" />
                        <ModeButton active={mode === 'lines'} onClick={() => handleModeChange('lines')} icon={Layers} label="Lines" />
                        <ModeButton active={mode === 'dots'} onClick={() => handleModeChange('dots')} icon={Grid} label="Dots" />
                        <ModeButton active={mode === 'flow'} onClick={() => handleModeChange('flow')} icon={Waves} label="Flow" />
                        <ModeButton active={mode === 'photo'} onClick={() => handleModeChange('photo')} icon={PhotoIcon} label="Photo" />
                    </div>
                    {mode === 'dots' && (
                        <div className="mb-4 p-3 bg-gray-50 rounded-xl border border-gray-200">
                            <div className="flex gap-2">
                                     <ShapeButton active={dotShape === 'circle'} onClick={() => updateDotShapeAndRecord('circle')} icon={Circle} label="Circle" />
                                     <ShapeButton active={dotShape === 'square'} onClick={() => updateDotShapeAndRecord('square')} icon={Square} label="Square" />
                                     <ShapeButton active={dotShape === 'diamond'} onClick={() => updateDotShapeAndRecord('diamond')} icon={Square} rotateIcon label="Diamond" />
                                     <ShapeButton active={dotShape === 'triangle'} onClick={() => updateDotShapeAndRecord('triangle')} icon={Triangle} label="Triangle" />
                            </div>
                        </div>
                    )}
                    <div className="flex items-center justify-between mt-2 mb-4">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Pattern Parameters</span>
                        <button onClick={resetPatternSettings} className="p-1.5 hover:bg-gray-100 rounded-md text-gray-400 hover:text-blue-500 transition-colors"><RotateCcw size={14}/></button>
                    </div>
                    {mode !== 'photo' && (
                        <>
                        <Slider highlight label={currentLabels.density} value={rings} min={10} max={200} step={1} onChange={(v) => updateSetting('rings', v)} icon={Circle} tooltip={currentLabels.densityTooltip} onReset={handleSliderReset} resetValue={DEFAULT_PATTERN_SETTINGS.rings} settingKey="rings" />
                        <Slider highlight label={currentLabels.thickness} value={lineThickness} min={0.1} max={2.0} step={0.05} onChange={(v) => updateSetting('thickness', v)} icon={Zap} tooltip={currentLabels.thicknessTooltip} onReset={handleSliderReset} resetValue={DEFAULT_PATTERN_SETTINGS.thickness} settingKey="thickness" />
                        {mode !== 'flow' && <Slider label="Rotation" value={rotation} min={0} max={180} step={1} onChange={(v) => updateSetting('rotation', v)} icon={RefreshCw} tooltip="Rotate the pattern angle." onReset={handleSliderReset} resetValue={DEFAULT_PATTERN_SETTINGS.rotation} settingKey="rotation" />}
                        </>
                    )}
                </>
            );
            case 'tune': return (
                <>
                    <div className="grid grid-cols-2 gap-3">
                        <Slider label="Contrast" value={contrast} min={0.5} max={3.0} step={0.1} onChange={setContrastAndRecord} tooltip="Adjust image contrast before processing." onReset={handleSliderReset} resetValue={1.0} settingKey="contrast"/>
                        <Slider label="Bright" value={brightness} min={-100} max={100} step={5} onChange={setBrightnessAndRecord} tooltip="Adjust image brightness before processing." onReset={handleSliderReset} resetValue={0} settingKey="brightness"/>
                    </div>
                    <Slider label="Center Hole" value={centerHole} min={0} max={80} step={1} onChange={setCenterHoleAndRecord} icon={LayoutTemplate} tooltip="Create a hole in the center (0-80%)." onReset={handleSliderReset} resetValue={0} settingKey="centerHole" />
                    <Slider label="Border" value={borderWidth} min={0} max={10} step={0.1} onChange={setBorderWidthAndRecord} icon={Frame} tooltip="Add a solid border around the pattern." onReset={handleSliderReset} resetValue={0} settingKey="borderWidth" />
                </>
            );
            case 'color': return (
                <>
                    {!lithoPreview && mode !== 'photo' && (
                        <div className="flex p-1 bg-gray-100 rounded-lg mb-4">
                            <button onClick={() => setColorModeAndRecord('mono')} className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${colorMode === 'mono' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-400'}`}>Mono</button>
                            <button onClick={() => setColorModeAndRecord('cmyk')} className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${colorMode === 'cmyk' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400'}`}>CMYK</button>
                        </div>
                    )}
                    {(colorMode === 'mono' || mode === 'photo') ? (
                        <>
                            {!lithoPreview && <ColorPicker label="Ink Color" value={fgColor} onChange={setFgColorAndRecord} />}
                            <Toggle label="Invert" active={invert} onToggle={() => setInvertAndRecord(!invert)} icon={Zap} description="Invert darks and lights." />
                        </>
                    ) : (
                             <div className="grid grid-cols-4 gap-2 mb-4">
                                 {['c','m','y','k'].map(k => (
                                     <button key={k} onClick={() => setActiveLayersAndRecord(p => ({...p, activeLayers: {...p.activeLayers, [k]: !p.activeLayers[k]}}))} className={`flex flex-col items-center justify-center p-2 rounded-xl border-2 ${activeLayers[k] ? 'bg-white border-current' : 'bg-gray-50 border-gray-100 opacity-50'}`} style={{ color: activeLayers[k] ? (k==='k'?'#000':CMYK_COLORS[k]) : '#9ca3af', borderColor: activeLayers[k] ? (k==='y' ? '#EAB308' : (k==='k'?'#000':CMYK_COLORS[k])) : '' }}>
                                         <span className="text-xs font-bold uppercase">{k}</span>
                                     </button>
                                 ))}
                             </div>
                    )}
                </>
            );
            case 'litho': return (
                <>
                    <Toggle label="Enable 3D Preview" description="Simulate Lithophane." active={lithoPreview} onToggle={() => setLithoPreview(!lithoPreview)} icon={BoxSelect} />
                    <div className="mt-4">
                        <Slider label="Physical Width (mm)" value={modeSettings.litho.widthMm} min={20} max={300} step={1} onChange={(v) => updateSetting('widthMm', v)} icon={Ruler} tooltip="Width of the final 3D print in mm." onReset={handleSliderReset} resetValue={INITIAL_APP_STATE.modeSettings.litho.widthMm} settingKey="widthMm"/>
                        <div className="grid grid-cols-2 gap-3">
                            <Slider label="Min Depth" value={modeSettings.litho.minDepth} min={0.2} max={2.0} step={0.1} onChange={(v) => updateSetting('minDepth', v)} tooltip="Thinnest part (lightest area)." onReset={handleSliderReset} resetValue={INITIAL_APP_STATE.modeSettings.litho.minDepth} settingKey="minDepth"/>
                            <Slider label="Max Depth" value={modeSettings.litho.maxDepth} min={1.0} max={6.0} step={0.1} onChange={(v) => updateSetting('maxDepth', v)} tooltip="Thickest part (darkest area)." onReset={handleSliderReset} resetValue={INITIAL_APP_STATE.modeSettings.litho.maxDepth} settingKey="maxDepth"/>
                        </div>
                        <Slider label="Voxel Resolution" value={modeSettings.litho.resolution} min={0.1} max={1.0} step={0.1} onChange={(v) => updateSetting('resolution', v)} icon={Scaling} tooltip="Higher = better detail but larger file." onReset={handleSliderReset} resetValue={INITIAL_APP_STATE.modeSettings.litho.resolution} settingKey="resolution"/>
                    </div>
                </>
            );
            case 'download': return (
                <div className="space-y-4">
                    {mode !== 'photo' && (
                        <Toggle label="3D Print Mode" description="Enforce minimum thickness." active={is3DMode} onToggle={() => setIs3DModeAndRecord(!is3DMode)} icon={Printer} />
                    )}
                    {is3DMode && <Slider label="Min Thickness (mm)" value={minThickness} min={0.32} max={1.0} step={0.01} onChange={setMinThicknessAndRecord} tooltip="Minimum feature size for your printer." onReset={handleSliderReset} resetValue={INITIAL_APP_STATE.minThickness} settingKey="minThickness" />}
                    <div className="grid grid-cols-2 gap-2">
                        <button onClick={() => downloadSVG()} disabled={!imageSrc} className="flex flex-col items-center justify-center py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg font-bold text-xs border border-blue-200 shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"><Layers size={14} className="mb-0.5" /> SVG (Vector)</button>
                        <button onClick={() => downloadPNG(1)} disabled={!imageSrc} className="flex flex-col items-center justify-center py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg font-bold text-xs border border-blue-200 shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"><ImageIcon size={14} className="mb-0.5" /> PNG (Raster)</button>
                        {lithoPreview && <button onClick={() => downloadSTL()} disabled={!imageSrc} className="col-span-2 flex flex-row gap-2 items-center justify-center py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-lg font-bold text-xs border border-gray-200 shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"><Box size={14} /> STL (Lithophane)</button>}
                    </div>
                </div>
            );
            default: return null;
        }
    };

    const isMobileDrawerOpen = window.innerWidth < 768 && (activeTab || activeCropTab);
    const canvasStyle = window.innerWidth < 768 ? { paddingBottom: isMobileDrawerOpen ? `${drawerHeight + MOBILE_NAV_HEIGHT}px` : `${MOBILE_NAV_HEIGHT}px` } : {};
    const undoTooltip = canUndo ? `Undo: ${getUndoActionName()}` : 'Nothing to undo';
    const redoTooltip = canRedo ? `Redo: ${getRedoActionName()}` : 'Nothing to redo';

    return (
        <div className="flex h-[100dvh] w-full bg-gray-50 text-slate-800 font-sans overflow-hidden" style={{ touchAction: 'none' }} onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}>
            <StatusToast toast={toast} onClose={() => setToast({ message: null, type: 'info' })} />
            <AboutModal isOpen={showAbout} onClose={() => setShowAbout(false)} />
            <LoadModal isOpen={showLoadModal} onClose={loadSavedState} onDiscard={discardSavedState}/>
            
            {/* Mobile Header */}
            <div className="md:hidden fixed top-0 left-0 right-0 h-12 bg-white border-b border-gray-200 flex items-center justify-between px-4 z-40">
                <div className="flex items-center gap-2 font-bold text-gray-800 text-sm"><Activity className="text-[#3B82F6]" size={16}/> IF Studio</div>
                <div className="flex items-center gap-1">
                    {/* Mobile Undo/Redo */}
                    <button onClick={undo} disabled={!canUndo} className={`p-1.5 bg-gray-50 rounded-lg transition-colors ${canUndo ? 'text-gray-600 hover:bg-gray-100' : 'text-gray-300 cursor-not-allowed'}`} title={undoTooltip}><RotateCcw size={18} className="rotate-180"/></button>
                    <button onClick={redo} disabled={!canRedo} className={`p-1.5 bg-gray-50 rounded-lg transition-colors ${canRedo ? 'text-gray-600 hover:bg-gray-100' : 'text-gray-300 cursor-not-allowed'}`} title={redoTooltip}><RotateCcw size={18} /></button>
                    {/* End Mobile Undo/Redo */}
                    <button onClick={handleShare} className="p-1.5 bg-gray-50 text-gray-600 rounded-lg" title="Share"><Share2 size={18}/></button>
                    <button onClick={() => setShowAbout(true)} className="p-1.5 bg-gray-50 text-gray-600 rounded-lg" title="About"><HelpCircle size={18}/></button>
                    <label className="p-1.5 bg-gray-50 text-gray-600 rounded-lg cursor-pointer" title="New Image (Ctrl+O)">
                        <Plus size={18}/>
                        <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} ref={fileInputRef} />
                    </label>
                </div>
            </div>

            {/* Desktop Sidebar */}
            <div className={`hidden md:flex fixed inset-y-0 left-0 w-96 bg-gray-50 border-r border-gray-200 flex-col overflow-hidden shadow-xl z-40`}>
                <div className="p-6 border-b border-gray-100 bg-white sticky top-0 z-10 shrink-0 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#3B82F6] flex items-center justify-center shadow-lg"><Activity className="text-white" size={24} /></div>
                        <div><h1 className="text-xl font-bold text-gray-900 tracking-tight">IF Studio</h1><p className="text-[10px] text-gray-400 font-mono tracking-wider uppercase">Precision Vector Art</p></div>
                    </div>
                    <div className="flex items-center gap-1">
                        {/* Desktop Undo/Redo */}
                        <button onClick={undo} disabled={!canUndo} className={`p-2 hover:bg-gray-100 rounded-lg transition-colors ${canUndo ? 'text-gray-600 hover:text-blue-500' : 'text-gray-300 cursor-not-allowed'}`} title={`${undoTooltip} (Ctrl+Z)`}><RotateCcw size={20} className="rotate-180"/></button>
                        <button onClick={redo} disabled={!canRedo} className={`p-2 hover:bg-gray-100 rounded-lg transition-colors ${canRedo ? 'text-gray-600 hover:text-blue-500' : 'text-gray-300 cursor-not-allowed'}`} title={`${redoTooltip} (Ctrl+Y)`}><RotateCcw size={20} /></button>
                        {/* End Desktop Undo/Redo */}
                    </div>
                    <button onClick={handleShare} className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-blue-500 transition-colors" title="Share"><Share2 size={20}/></button>
                    <button onClick={() => setShowAbout(true)} className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-blue-500 transition-colors" title="About"><HelpCircle size={20}/></button>
                </div>
                <div className="p-6 space-y-8 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 flex-1">
                    {step === 'crop' ? (
                        <div className="space-y-6 animate-in fade-in slide-in-from-left-4">
                            <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl text-center"><Crop size={24} className="text-[#3B82F6] mx-auto mb-2" /><h3 className="font-bold text-gray-800">Crop</h3></div>
                            <section className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                                <div className="flex gap-3">
                                    <button onClick={() => setLiveCrop(prev => ({...prev, frameShape: 'circle'}))} className={`flex-1 flex flex-col items-center justify-center p-3 rounded-xl border ${liveCrop.frameShape === 'circle' ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-gray-50 border-gray-200'}`}><Circle size={24} className="mb-2"/><span className="text-xs font-bold">Circle</span></button>
                                    <button onClick={() => setLiveCrop(prev => ({...prev, frameShape: 'square'}))} className={`flex-1 flex flex-col items-center justify-center p-3 rounded-xl border ${liveCrop.frameShape === 'square' ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-gray-50 border-gray-200'}`}><Square size={24} className="mb-2"/><span className="text-xs font-bold">Square</span></button>
                                </div>
                                <Slider label="Zoom" value={liveCrop.scale} min={0.5} max={3.0} step={0.1} onChange={(v) => setLiveCrop(prev => ({...prev, scale: v}))} />
                            </section>
                            <button onClick={applyCropAndGoToEdit} className="w-full py-4 bg-[#3B82F6] hover:bg-[#2563EB] text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95">Apply Crop <ArrowRight size={18} /></button>
                        </div>
                    ) : (
                        <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
                            <div className="flex items-center justify-between p-1">
                                <div className="text-xs font-bold text-emerald-600 flex items-center gap-2"><Check size={12} className='text-emerald-500' /> Crop</div>
                                <button onClick={handleDoubleClick} className="text-xs text-gray-400 hover:text-blue-600 underline">Edit Crop</button>
                            </div>
                            {renderControls('pattern')}
                            <section className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm"><div className="flex items-center gap-2 mb-6 text-emerald-600 text-xs font-bold uppercase tracking-wider"><Move size={14} /> Fine Tune</div>{renderControls('tune')}</section>
                            <section className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm"><div className="flex items-center gap-2 mb-6 text-purple-500 text-xs font-bold uppercase tracking-wider"><Palette size={14} /> Color</div>{renderControls('color')}</section>
                            <section className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm"><div className="flex items-center gap-2 mb-6 text-orange-500 text-xs font-bold uppercase tracking-wider"><Settings size={14} /> Export Settings</div>{renderControls('litho')}{renderControls('download')}</section>
                        </div>
                    )}
                </div>
                {step === 'edit' && (
                    <div className="p-6 border-t border-gray-100 space-y-4 bg-white shrink-0">
                        <label className="flex items-center justify-center w-full py-3 bg-gray-50 hover:bg-gray-100 text-gray-500 rounded-xl cursor-pointer transition-all border border-transparent hover:border-gray-200 group">
                            <Plus size={16} className="mr-2 group-hover:text-[#3B82F6]" /><span className="font-bold text-xs">New Image (Ctrl+O)</span>
                            <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} ref={fileInputRef} />
                        </label>
                    </div>
                )}
            </div>

            {/* Canvas Area */}
            <div className={`flex-1 relative flex flex-col overflow-hidden md:pl-96 pt-12 md:pt-0`} ref={containerRef} style={imageSrc ? canvasStyle : {}}>
                <div className="flex-1 w-full relative flex items-center justify-center overflow-hidden bg-gray-50 p-2 md:p-8 min-h-0"
                    onMouseDown={handleStart} onMouseMove={handleMove} onMouseUp={handleEnd} onMouseLeave={handleEnd}
                    onTouchStart={handleStart} onTouchMove={handleMove} onTouchEnd={handleEnd}
                    onDoubleClick={handleDoubleClick}
                >
                    <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'conic-gradient(#ccc 90deg, white 90deg)', backgroundSize: '20px 20px' }} />
                    {!imageSrc ? (
                            <div className="relative z-10 text-center space-y-6 max-w-xs md:max-w-md p-8 border-2 border-dashed border-gray-300 rounded-3xl bg-white shadow-sm mx-4">
                                <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto ring-8 ring-blue-50/50 mb-4"><ImageIcon size={40} className="text-blue-500" /></div>
                                <div><h2 className="2xl font-black text-gray-900 mb-2">IF Studio</h2><p className="text-gray-500 text-sm">Professional Halftone Engine</p></div>
                                <label className="inline-flex items-center px-8 py-4 bg-[#3B82F6] hover:bg-[#2563EB] text-white rounded-2xl cursor-pointer shadow-xl shadow-blue-200 transition-transform hover:-translate-y-1"><Plus size={20} className="mr-2" /><span className="font-bold">Upload Photo (Ctrl+O)</span><input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} ref={fileInputRef}/></label>
                            </div>
                    ) : (
                        <div className="absolute top-[5px] left-[5px] right-[5px] bottom-[5px] shadow-2xl border border-gray-200 bg-white/0 group">
                            <canvas ref={canvasRef} className="w-full h-full object-contain" />
                            {isProcessing && <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white/95 text-blue-600 px-6 py-3 rounded-full text-sm font-bold flex items-center shadow-xl animate-pulse border border-blue-100"><RefreshCw size={16} className="animate-spin mr-3" /> PROCESSING</div>}
                            
                            {/* --- CANVAS OVERLAY BUTTONS (ALWAYS VISIBLE) --- */}
                            {step === 'edit' && (
                                <div className="block transition-opacity duration-200">
                                    {/* Top Left: Edit Crop */}
                                    <button onClick={handleDoubleClick} className="absolute top-4 left-4 p-3 bg-white/90 backdrop-blur-sm text-gray-600 rounded-full shadow-lg border border-gray-200 hover:text-blue-600 transition-colors z-50 active:scale-95" title="Edit Crop">
                                        <Crop size={20} />
                                    </button>
                                    
                                    {/* Top Right: Compare */}
                                    <button 
                                        onMouseDown={() => setCompareMode(true)} onMouseUp={() => setCompareMode(false)}
                                        onMouseLeave={() => setCompareMode(false)}
                                        onTouchStart={() => setCompareMode(true)} onTouchEnd={() => setCompareMode(false)}
                                        className="absolute top-4 right-4 p-3 bg-white/90 backdrop-blur-sm text-gray-600 rounded-full shadow-lg border border-gray-200 hover:text-blue-600 transition-colors z-50 active:scale-95" title="Hold to Compare">
                                        {compareMode ? <Eye size={20} /> : <EyeOff size={20} />}
                                    </button>
                                    
                                    {/* Bottom Right: Fit to Screen (View Reset Only) */}
                                    <button onClick={handleFitToScreen} className="absolute bottom-4 right-4 p-3 bg-white/90 backdrop-blur-sm text-gray-600 rounded-full shadow-lg border border-gray-200 hover:text-blue-600 transition-colors z-50 active:scale-95" title="Fit View">
                                        <Maximize size={20} />
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
            
            {/* Mobile Nav (Always Visible, Disabled State if !imageSrc) */}
            {step !== 'crop' && (
                <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shrink-0 z-50 pb-safe">
                    {imageSrc && activeTab && (
                        <div className="border-b border-gray-100 bg-gray-50/95 overflow-y-auto shadow-inner flex flex-col" style={{height: `${drawerHeight}px`, maxHeight: '85vh', minHeight: '20vh'}}>
                            <div className="w-full flex justify-center py-3 cursor-ns-resize touch-none hover:bg-gray-100 transition-colors shrink-0" onTouchStart={handleDrawerDragStart} onTouchMove={handleDrawerDragMove} onTouchEnd={handleDrawerDragEnd}>
                                <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
                            </div>
                            <div className="px-3 pb-3 flex-1 overflow-y-auto">
                                <div className="flex justify-between items-center mb-3"><span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{activeTab} controls</span></div>
                                {renderControls(activeTab)}
                            </div>
                        </div>
                    )}
                    <div className="flex justify-around items-center h-16 bg-white">
                        <button onClick={() => handleMobileTabClick('pattern')} disabled={!imageSrc} className={`flex flex-col items-center gap-0.5 p-1 w-14 transition-colors ${activeTab === 'pattern' && imageSrc ? 'text-blue-600' : 'text-gray-400'} ${!imageSrc ? 'opacity-40 cursor-not-allowed' : ''}`}><Layers size={24}/><span className="text-[10px]">Pattern</span></button>
                        <button onClick={() => handleMobileTabClick('tune')} disabled={!imageSrc} className={`flex flex-col items-center gap-0.5 p-1 w-14 transition-colors ${activeTab === 'tune' && imageSrc ? 'text-blue-600' : 'text-gray-400'} ${!imageSrc ? 'opacity-40 cursor-not-allowed' : ''}`}><Move size={24}/><span className="text-[10px]">Tune</span></button>
                        <button onClick={() => handleMobileTabClick('color')} disabled={!imageSrc} className={`flex flex-col items-center gap-0.5 p-1 w-14 transition-colors ${activeTab === 'color' && imageSrc ? 'text-blue-600' : 'text-gray-400'} ${!imageSrc ? 'opacity-40 cursor-not-allowed' : ''}`}><Palette size={24}/><span className="text-[10px]">Color</span></button>
                        <button onClick={() => handleMobileTabClick('litho')} disabled={!imageSrc} className={`flex flex-col items-center gap-0.5 p-1 w-14 transition-colors ${activeTab === 'litho' && imageSrc ? 'text-blue-600' : 'text-gray-400'} ${!imageSrc ? 'opacity-40 cursor-not-allowed' : ''}`}><Box size={24}/><span className="text-[10px]">3D</span></button>
                        <button onClick={() => handleMobileTabClick('download')} disabled={!imageSrc} className={`flex flex-col items-center gap-0.5 p-1 w-14 transition-colors ${activeTab === 'download' && imageSrc ? 'text-blue-600' : 'text-gray-400'} ${!imageSrc ? 'opacity-40 cursor-not-allowed' : ''}`}><Download size={24}/><span className="text-[10px]">Save</span></button>
                    </div>
                </div>
            )}
            
            {/* Mobile Crop Bottom */}
            {step === 'crop' && (
                <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shrink-0 z-50 pb-safe">
                    {activeCropTab && (
                             <div className="border-b border-gray-100 p-3 bg-gray-50/95 backdrop-blur-xl max-h-[40vh] overflow-y-auto shadow-inner animate-in slide-in-from-bottom-10">
                                 {activeCropTab === 'shape' && (
                                     <div className="space-y-4">
                                         <div className="text-[10px] uppercase font-bold text-gray-400 mb-3 tracking-wider">Frame Shape</div>
                                         <div className="flex gap-3">
                                             <button onClick={() => setLiveCrop(prev => ({...prev, frameShape: 'circle'}))} className={`flex-1 flex flex-col items-center justify-center p-3 rounded-xl border ${liveCrop.frameShape === 'circle' ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-gray-50 border-gray-200'}`}><Circle size={24} className="mb-2"/><span className="text-xs font-bold">Circle</span></button>
                                             <button onClick={() => setLiveCrop(prev => ({...prev, frameShape: 'square'}))} className={`flex-1 flex flex-col items-center justify-center p-3 rounded-xl border ${liveCrop.frameShape === 'square' ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-gray-50 border-gray-200'}`}><Square size={24} className="mb-2"/><span className="text-xs font-bold">Square</span></button>
                                         </div>
                                         <Slider label="Zoom" value={liveCrop.scale} min={0.5} max={3.0} step={0.1} onChange={(v) => setLiveCrop(prev => ({...prev, scale: v}))} />
                                     </div>
                                 )}
                             </div>
                    )}
                    <div className="flex justify-between items-center h-16 p-3 bg-white">
                        <div className='flex gap-2'>
                            <button onClick={() => handleMobileCropTabClick('shape')} className={`flex flex-col items-center justify-center gap-0.5 p-1 w-16 transition-colors rounded-xl hover:bg-gray-50 ${activeCropTab === 'shape' ? 'text-[#3B82F6]' : 'text-gray-400'}`}><LayoutTemplate size={20}/><span className="text-[9px] font-medium">Shape</span></button>
                        </div>
                        <div className='flex gap-2'>
                            <button onClick={resetView} className="flex flex-col items-center justify-center gap-0.5 p-1 w-16 transition-colors text-gray-400 hover:text-blue-500 rounded-xl hover:bg-gray-50"><RotateCcw size={20}/><span className="text-[9px] font-medium">Reset</span></button>
                            <button onClick={applyCropAndGoToEdit} className="w-24 py-2 bg-[#3B82F6] hover:bg-[#2563EB] text-white rounded-xl font-bold flex items-center justify-center gap-1 shadow-md transition-all active:scale-95 text-xs">Apply <Check size={16} /></button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
