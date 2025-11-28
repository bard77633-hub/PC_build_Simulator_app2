
import React, { useState, useMemo } from 'react';
import { HARDWARE_PARTS } from './constants';
import { Part, PartCategory, PCBuild, AppMode, SimulationPhase } from './types';
import { DraggablePart } from './components/DraggablePart';
import { DropSlot } from './components/DropSlot';
import { SimulationResults } from './components/SimulationResults';
import { InfoPanel } from './components/InfoPanel';
import { QuizMode } from './components/QuizMode';
import { BenchmarkModal } from './components/BenchmarkModal';
import { Info, Cpu, PenTool, RotateCcw, Power, Monitor } from 'lucide-react';

const INITIAL_BUILD: PCBuild = {
  [PartCategory.CPU]: null,
  [PartCategory.GPU]: null,
  [PartCategory.RAM]: null,
  [PartCategory.STORAGE]: null,
  [PartCategory.OS]: null,
  [PartCategory.DISPLAY]: null,
  [PartCategory.INPUT]: null,
  [PartCategory.APPLICATIONS]: null,
};

export default function App() {
  const [mode, setMode] = useState<AppMode>(AppMode.QUIZ);
  const [build, setBuild] = useState<PCBuild>(INITIAL_BUILD);
  const [activeCategory, setActiveCategory] = useState<PartCategory>(PartCategory.CPU);
  
  // Selection State for Info Panel
  const [focusedPart, setFocusedPart] = useState<Part | null>(null);
  const [focusedCategory, setFocusedCategory] = useState<PartCategory | null>(null);

  // Simulation State
  const [simPhase, setSimPhase] = useState<SimulationPhase>(SimulationPhase.IDLE);
  const [isBenchmarked, setIsBenchmarked] = useState(false);

  // For Quiz Mode
  const [quizTarget, setQuizTarget] = useState<string>('');
  const [clientFeedback, setClientFeedback] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent, part: Part) => {
    e.dataTransfer.setData('partId', part.id);
    e.dataTransfer.setData('category', part.category);
    // Also focus on drag start for convenience
    handleSelectPart(part);
  };

  const handleDrop = (e: React.DragEvent, targetCategory: PartCategory) => {
    const partId = e.dataTransfer.getData('partId');
    const category = e.dataTransfer.getData('category');

    if (category !== targetCategory) {
      return;
    }

    const part = HARDWARE_PARTS.find(p => p.id === partId);
    if (part) {
      setBuild(prev => ({ ...prev, [targetCategory]: part }));
      handleSelectPart(part);
      setIsBenchmarked(false); // Reset benchmark status on change
      setClientFeedback(null); // Clear feedback on modification
    }
  };

  const handleAddToBuild = (part: Part) => {
    setBuild(prev => ({ ...prev, [part.category]: part }));
    handleSelectPart(part);
    setIsBenchmarked(false); // Reset benchmark status on change
    setClientFeedback(null); // Clear feedback on modification
  };

  const handleRemovePart = (category: PartCategory) => {
    setBuild(prev => ({ ...prev, [category]: null }));
    setIsBenchmarked(false);
    setClientFeedback(null);
  };

  const resetBuild = () => {
    setBuild(INITIAL_BUILD);
    setIsBenchmarked(false);
    setClientFeedback(null);
  };

  const startSimulation = () => {
    // Basic validation before starting
    if (!build[PartCategory.CPU] || !build[PartCategory.RAM] || !build[PartCategory.STORAGE] || !build[PartCategory.OS]) {
      alert("シミュレーションを開始するには、最低限 CPU・メモリ・ストレージ・OS が必要です。");
      return;
    }
    setSimPhase(SimulationPhase.BOOTING);
    setIsBenchmarked(false);
  };

  const handlePhaseChange = (phase: SimulationPhase) => {
      setSimPhase(phase);
      if (phase === SimulationPhase.FINISHED) {
          setIsBenchmarked(true);
      }
  };

  // Info Selection Handlers
  const handleSelectPart = (part: Part) => {
    setFocusedPart(part);
    setFocusedCategory(null);
  };

  const handleSelectCategory = (category: PartCategory) => {
    // Logic: 
    // If clicked on workbench slot -> Show part if exists, else show category info.
    // This handler is used by DropSlot.
    const partInSlot = build[category];
    if (partInSlot) {
      setFocusedPart(partInSlot);
      setFocusedCategory(null);
    } else {
      setFocusedCategory(category);
      setFocusedPart(null);
    }
  };

  const handleFilterClick = (category: PartCategory) => {
      // When clicking the filter tab, we show the category info (Textbook mode)
      setActiveCategory(category);
      setFocusedCategory(category);
      setFocusedPart(null);
  }
  
  const handleQuizSubmit = (feedback: string | null) => {
      setClientFeedback(feedback);
  }

  // Logic: Simulation & Validation
  const simulationResult = useMemo(() => {
    let totalPrice = 0;
    let totalPower = 0;
    let scores = { gaming: 0, videoEditing: 0, office: 0 };
    let cpu = build[PartCategory.CPU];
    let gpu = build[PartCategory.GPU];
    let ram = build[PartCategory.RAM];
    let storage = build[PartCategory.STORAGE];
    let os = build[PartCategory.OS];
    let display = build[PartCategory.DISPLAY];
    let app = build[PartCategory.APPLICATIONS];

    const messages: string[] = [];
    
    // Summing up basic stats
    Object.values(build).forEach((item) => {
      const part = item as Part | null;
      if (part) {
        totalPrice += part.price;
        totalPower += part.power;
        scores.gaming += part.baseScore.gaming;
        scores.videoEditing += part.baseScore.videoEditing;
        scores.office += part.baseScore.office;
      }
    });

    // Normalize Scores (Educational simplification)
    const partCount = Object.values(build).filter(Boolean).length;
    if (partCount > 0) {
        // Adjust scores based on core component synergy
        const synergyFactor = (cpu && ram && storage) ? 1.0 : 0.5;
        scores.gaming = Math.min(100, Math.round(scores.gaming / 8 * 1.2 * synergyFactor)); 
        scores.videoEditing = Math.min(100, Math.round(scores.videoEditing / 8 * 1.2 * synergyFactor));
        scores.office = Math.min(100, Math.round(scores.office / 8 * synergyFactor));
    }

    // --- Validation Rules ---
    // 1. GPU Power Check
    if (gpu && gpu.category === PartCategory.GPU && gpu.name.includes('RTX') && totalPower < 300) {
       // Warning suppressed for simplicity
    }

    // 2. RAM Check
    if (ram && ram.capacity && ram.capacity < 8) {
      messages.push('メモリ容量が少なすぎます。最低8GBを推奨します。');
    }

    // 3. Missing Vital Components
    if (!cpu) { messages.push('CPUが未装着です。'); }
    if (!ram) { messages.push('メモリが未装着です。'); }
    if (!storage) { messages.push('ストレージが未装着です。'); }
    if (!os) { messages.push('OSが選択されていません。'); }

    // 4. Compatibility (Mock Logic)
    if (cpu && cpu.name.includes('F') && (!gpu || gpu.name.includes('Integrated'))) {
        messages.push('このCPUは映像出力機能がありません。グラフィックボードが必要です。');
    }

    // 5. Bottleneck Checks (Monitor vs GPU)
    if (gpu && display) {
        const isHighEndGpu = gpu.baseScore.gaming > 80;
        const isLowRefresh = display.refreshRate && display.refreshRate <= 60;
        
        if (isHighEndGpu && isLowRefresh) {
            messages.push('警告: 高性能なGPUと低Hzモニターの組み合わせです（ボトルネック）。');
        }

        const is4K = display.resolution === "3840x2160";
        const isWeakGpu = gpu.baseScore.gaming < 60;
        if (is4K && isWeakGpu) {
             messages.push('警告: 4KモニターですがGPU性能不足です。');
        }
    }

    // 6. Application Requirements
    if (app && app.id === 'app-game' && (!gpu || gpu.baseScore.gaming < 50)) {
        messages.push('このゲームを遊ぶには、より高性能なグラフィックボードが必要です。');
    }
    if (app && app.id === 'app-video' && (ram?.capacity || 0) < 16) {
        messages.push('動画編集には16GB以上のメモリが推奨されます。');
    }

    if (!display && (mode === AppMode.BUILDER)) {
        messages.push('注意: モニターがないと画面が映りません。');
    }

    return {
      totalPrice,
      totalPower,
      scores,
      compatibility: { valid: messages.length === 0, messages }
    };
  }, [build, mode]);

  // Determine active components for visualization
  const getActiveCategories = (): PartCategory[] => {
    switch (simPhase) {
      case SimulationPhase.BOOTING:
        return [PartCategory.STORAGE, PartCategory.RAM];
      case SimulationPhase.LOADING:
        return [PartCategory.RAM, PartCategory.CPU];
      case SimulationPhase.RUNNING:
        return [PartCategory.CPU, PartCategory.GPU, PartCategory.RAM, PartCategory.DISPLAY];
      default:
        return [];
    }
  };
  
  const activeCategories = getActiveCategories();

  // Helper to check individual slot validity (for red border)
  const isCompatible = (category: PartCategory) => {
      // Example: Check display compatibility
      if (category === PartCategory.DISPLAY && build[PartCategory.DISPLAY] && build[PartCategory.GPU]) {
          const display = build[PartCategory.DISPLAY];
          const gpu = build[PartCategory.GPU];
           // Simple visual cue logic for mismatch
          if (display?.resolution === "3840x2160" && (gpu?.baseScore.gaming || 0) < 60) return false;
      }
      return true;
  };

  const filteredParts = HARDWARE_PARTS.filter(p => p.category === activeCategory);

  return (
    <div className="min-h-screen flex flex-col font-sans text-slate-900 bg-slate-50 relative">
      {/* Simulation Overlay */}
      {simPhase !== SimulationPhase.IDLE && (
        <BenchmarkModal 
          build={build} 
          phase={simPhase} 
          onPhaseChange={handlePhaseChange} 
          onClose={() => handlePhaseChange(SimulationPhase.IDLE)} 
        />
      )}

      {/* Floating Quiz Window */}
      {mode === AppMode.QUIZ && (
        <QuizMode 
          onScenarioSet={setQuizTarget} 
          onResetBuild={resetBuild}
          onSubmit={handleQuizSubmit}
          currentResult={simulationResult} 
          currentBuild={build}
          isBenchmarked={isBenchmarked}
        />
      )}

      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-[1600px] mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cpu className="text-blue-600" size={28} />
            <h1 className="text-xl font-bold tracking-tight">PC Builder <span className="text-blue-600">Academy</span></h1>
          </div>
          
          <nav className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
            <button 
              onClick={() => setMode(AppMode.QUIZ)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${mode === AppMode.QUIZ ? 'bg-white text-purple-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              クイズモード
            </button>
            <button 
              onClick={() => setMode(AppMode.BUILDER)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${mode === AppMode.BUILDER ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              自由構築
            </button>
          </nav>
        </div>
      </header>

      <main className="flex-1 max-w-[1600px] mx-auto w-full p-4 lg:p-6 grid lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Parts Inventory (4/12 columns - Widened) */}
        <div className="lg:col-span-4 flex flex-col sticky top-24">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col overflow-hidden max-h-[calc(100vh-140px)]">
            <div className="p-3 border-b border-slate-100 bg-slate-50/50">
              <h2 className="font-bold text-slate-700 flex items-center gap-2 text-sm">
                <PenTool size={16} /> パーツリスト
              </h2>
            </div>
            
            {/* Wrapped category buttons */}
            <div className="flex flex-wrap gap-1.5 p-2 border-b border-slate-100">
              {Object.values(PartCategory).map(cat => (
                <button 
                  key={cat} 
                  onClick={() => handleFilterClick(cat)}
                  className={`flex-grow px-2 py-1 text-[10px] rounded border transition-colors text-center ${activeCategory === cat ? 'bg-blue-100 border-blue-200 text-blue-700 font-bold' : 'bg-slate-50 border-slate-100 text-slate-600 hover:bg-slate-100 hover:border-slate-200'}`}
                >
                  {cat === 'INPUT' ? '入力' : cat === 'DISPLAY' ? '画面' : cat === 'APPLICATIONS' ? 'アプリ' : cat}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto p-2 custom-scrollbar bg-slate-50 min-h-[400px]">
               <div className="flex flex-col gap-2">
                {filteredParts.map(part => {
                    // Check if this specific part is currently installed in the build
                    const isEquipped = build[part.category]?.id === part.id;
                    
                    return (
                        <DraggablePart 
                        key={part.id} 
                        part={part} 
                        onDragStart={handleDragStart}
                        onSelect={handleSelectPart}
                        onAddToBuild={handleAddToBuild}
                        isSelected={focusedPart?.id === part.id}
                        isEquipped={isEquipped}
                        />
                    );
                })}
               </div>
              {filteredParts.length === 0 && (
                 <div className="text-center text-slate-400 py-10 text-xs col-span-2">該当パーツなし</div>
              )}
            </div>
          </div>
        </div>

        {/* Middle Column: Workbench (4/12 columns - Adjusted) */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          
          {/* Internal Parts Section */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 relative overflow-hidden">
             <div className="absolute inset-0 pointer-events-none opacity-[0.03]">
                 <div className="w-full h-full border-2 border-slate-900 m-2 rounded-xl" />
                 <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-900" />
                 <div className="absolute top-0 left-1/2 w-0.5 h-full bg-slate-900" />
             </div>

             <div className="flex justify-between items-center mb-4 relative z-10">
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <Cpu className="text-slate-500" />
                  PC本体 (内部パーツ)
                </h2>
                
                <div className="flex gap-2">
                   <button 
                      onClick={startSimulation}
                      className={`text-xs border px-3 py-1.5 rounded shadow-sm font-bold flex items-center gap-2 transition-all hover:shadow-lg ${isBenchmarked ? 'bg-slate-100 text-slate-600 border-slate-300' : 'bg-slate-800 text-green-400 border-slate-700 hover:bg-slate-900 hover:shadow-green-500/20'}`}
                      title="電源を入れてテスト"
                   >
                    <Power size={14} /> {isBenchmarked ? '再テスト' : '電源ON'}
                   </button>
                   <button onClick={() => { if(window.confirm('リセットしますか？')) resetBuild(); }} className="text-xs text-slate-500 hover:text-red-500 flex items-center gap-1 transition-colors border border-transparent hover:border-red-100 px-2 rounded">
                    <RotateCcw size={14} /> リセット
                   </button>
                </div>
             </div>

             <div className="grid grid-cols-2 gap-3 relative z-10">
                <div className="col-span-1">
                  <DropSlot 
                    category={PartCategory.CPU} 
                    assignedPart={build[PartCategory.CPU]} 
                    onDrop={handleDrop} 
                    onRemove={handleRemovePart}
                    onSelectCategory={handleSelectCategory}
                    isCompatible={isCompatible(PartCategory.CPU)}
                    isActive={activeCategories.includes(PartCategory.CPU)}
                  />
                </div>
                <div className="col-span-1">
                   <DropSlot 
                    category={PartCategory.RAM} 
                    assignedPart={build[PartCategory.RAM]} 
                    onDrop={handleDrop} 
                    onRemove={handleRemovePart}
                    onSelectCategory={handleSelectCategory}
                    isCompatible={isCompatible(PartCategory.RAM)}
                    isActive={activeCategories.includes(PartCategory.RAM)}
                  />
                </div>
                <div className="col-span-1">
                   <DropSlot 
                    category={PartCategory.GPU} 
                    assignedPart={build[PartCategory.GPU]} 
                    onDrop={handleDrop} 
                    onRemove={handleRemovePart}
                    onSelectCategory={handleSelectCategory}
                    isCompatible={isCompatible(PartCategory.GPU)}
                    isActive={activeCategories.includes(PartCategory.GPU)}
                  />
                </div>
                <div className="col-span-1">
                   <DropSlot 
                    category={PartCategory.STORAGE} 
                    assignedPart={build[PartCategory.STORAGE]} 
                    onDrop={handleDrop} 
                    onRemove={handleRemovePart}
                    onSelectCategory={handleSelectCategory}
                    isCompatible={isCompatible(PartCategory.STORAGE)}
                    isActive={activeCategories.includes(PartCategory.STORAGE)}
                  />
                </div>
             </div>
          </div>

          {/* External / Software Section */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 relative">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-4">
                  <Monitor className="text-slate-500" />
                  周辺機器・OS・アプリ
              </h2>
              <div className="grid grid-cols-4 gap-3">
                 <div className="col-span-1">
                   <DropSlot 
                    category={PartCategory.DISPLAY} 
                    assignedPart={build[PartCategory.DISPLAY]} 
                    onDrop={handleDrop} 
                    onRemove={handleRemovePart}
                    onSelectCategory={handleSelectCategory}
                    isCompatible={isCompatible(PartCategory.DISPLAY)}
                    isActive={activeCategories.includes(PartCategory.DISPLAY)}
                  />
                 </div>
                 <div className="col-span-1">
                   <DropSlot 
                    category={PartCategory.INPUT} 
                    assignedPart={build[PartCategory.INPUT]} 
                    onDrop={handleDrop} 
                    onRemove={handleRemovePart}
                    onSelectCategory={handleSelectCategory}
                    isCompatible={isCompatible(PartCategory.INPUT)}
                    isActive={false} 
                  />
                 </div>
                 <div className="col-span-1">
                   <DropSlot 
                    category={PartCategory.OS} 
                    assignedPart={build[PartCategory.OS]} 
                    onDrop={handleDrop} 
                    onRemove={handleRemovePart}
                    onSelectCategory={handleSelectCategory}
                    isCompatible={isCompatible(PartCategory.OS)}
                    isActive={false}
                  />
                 </div>
                 <div className="col-span-1">
                   <DropSlot 
                    category={PartCategory.APPLICATIONS} 
                    assignedPart={build[PartCategory.APPLICATIONS]} 
                    onDrop={handleDrop} 
                    onRemove={handleRemovePart}
                    onSelectCategory={handleSelectCategory}
                    isCompatible={isCompatible(PartCategory.APPLICATIONS)}
                    isActive={false}
                  />
                 </div>
              </div>
          </div>
          
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 flex items-start gap-3">
            <Info className="text-blue-500 shrink-0 mt-0.5" size={16} />
            <p className="text-xs text-blue-800">
              <span className="font-bold">学習ポイント:</span> まずは「何をしたいか（アプリケーション）」を決め、それに必要なOSとハードウェアを選びましょう。
            </p>
          </div>
        </div>

        {/* Right Column: Info & Results (4/12 columns) */}
        <div className="lg:col-span-4 space-y-4 flex flex-col">
          <div className="w-full">
             <InfoPanel selectedPart={focusedPart} selectedCategory={focusedCategory} />
          </div>
          <div className="flex-shrink-0">
             <SimulationResults 
                result={simulationResult} 
                build={build} 
                isBenchmarked={isBenchmarked} 
                clientFeedback={clientFeedback}
                mode={mode}
            />
          </div>
        </div>

      </main>
    </div>
  );
}
