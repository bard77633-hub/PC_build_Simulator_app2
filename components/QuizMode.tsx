import React, { useState, useEffect, useRef } from 'react';
import { generateQuizScenario } from '../services/geminiService';
import { Target, Wallet, Minus, Maximize2, Briefcase, Gamepad2, MonitorPlay, Send, AlertTriangle, PlayCircle, Edit3 } from 'lucide-react';
import { SimulationResult, PCBuild, PartCategory } from '../types';

interface QuizModeProps {
  onScenarioSet: (targetType: string) => void;
  onResetBuild: () => void;
  onSubmit: (feedback: string | null) => void;
  currentResult: SimulationResult;
  currentBuild: PCBuild;
  isBenchmarked: boolean;
}

export const QuizMode: React.FC<QuizModeProps> = ({ onScenarioSet, onResetBuild, onSubmit, currentResult, currentBuild, isBenchmarked }) => {
  const [view, setView] = useState<'SELECT' | 'ACTIVE'>('SELECT');
  const [scenario, setScenario] = useState<string>('');
  const [targetType, setTargetType] = useState<string>('');
  const [budget, setBudget] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  
  // Window State
  const [isMinimized, setIsMinimized] = useState(false);
  const [position, setPosition] = useState({ x: 20, y: 100 });
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<{ startX: number, startY: number, initialX: number, initialY: number } | null>(null);

  // Auto-reset submitted state if benchmark becomes invalid (i.e., user changed parts)
  useEffect(() => {
    if (submitted && !isBenchmarked) {
        setSubmitted(false);
        onSubmit(null);
    }
  }, [isBenchmarked, submitted, onSubmit]);

  const startMission = async (topic: string) => {
    setLoading(true);
    setView('ACTIVE');
    setSubmitted(false);
    onSubmit(null); // Clear previous feedback
    setIsMinimized(false);
    
    // Reset build for new mission
    onResetBuild();

    const data = await generateQuizScenario(topic);
    setScenario(data.scenario);
    setTargetType(data.targetType);
    setBudget(data.budget);
    onScenarioSet(data.targetType);
    setLoading(false);
  };

  const returnToSelect = () => {
    setView('SELECT');
    setSubmitted(false);
    onSubmit(null);
  }

  const handleEdit = () => {
      setSubmitted(false);
      onSubmit(null);
      setIsMinimized(false);
  }

  const handleSubmit = (e: React.MouseEvent) => {
    e.preventDefault();
    try {
        // 0. Check Benchmark Status
        if (!isBenchmarked) {
            alert("提出する前に、必ず「電源ON」ボタンを押して動作確認（ベンチマーク）を行ってください！\nシミュレーション結果を確認する必要があります。");
            return;
        }

        // 1. Check for Essential Parts
        const missingParts: string[] = [];
        if (!currentBuild[PartCategory.CPU]) missingParts.push("CPU");
        if (!currentBuild[PartCategory.RAM]) missingParts.push("メモリ");
        if (!currentBuild[PartCategory.STORAGE]) missingParts.push("ストレージ");
        if (!currentBuild[PartCategory.OS]) missingParts.push("OS");
        if (!currentBuild[PartCategory.DISPLAY]) missingParts.push("モニター");
        if (!currentBuild[PartCategory.INPUT]) missingParts.push("入力機器");
        if (!currentBuild[PartCategory.APPLICATIONS]) missingParts.push("アプリケーション");

        if (missingParts.length > 0) {
            alert(`提出できません！以下のパーツが不足しています:\n${missingParts.join(", ")}`);
            return;
        }

        // 2. Validate against Mission Requirements
        let feedback = "";
        
        const isOverBudget = currentResult.totalPrice > budget;
        const scores = currentResult.scores;
        const app = currentBuild[PartCategory.APPLICATIONS];
        const input = currentBuild[PartCategory.INPUT];
        const display = currentBuild[PartCategory.DISPLAY];
        const gpu = currentBuild[PartCategory.GPU];
        const cpu = currentBuild[PartCategory.CPU];
        const storage = currentBuild[PartCategory.STORAGE];
        const ram = currentBuild[PartCategory.RAM];

        // --- CRITICAL FLAWS CHECK (Immediate Failure) ---
        const flaws: string[] = [];

        // HDD Check: OS on HDD is unacceptable in modern context
        if (storage?.name.includes('HDD')) {
            flaws.push("HDDをOSの保存先に選んでいます。起動が遅すぎて実用的ではありません。OSはSSDに入れてください。");
        }

        // Low RAM Check (Absolute minimum)
        if (ram?.capacity && ram.capacity < 8) {
            flaws.push("メモリが8GB未満です。現代のOSとアプリを動かすには少なすぎます。最低でも8GBが必要です。");
        }

        // Wrong App Selection
        if (targetType === 'GAMING' && app?.id !== 'app-game') flaws.push("ゲーム用のPC依頼なのに、ゲームアプリが選ばれていません。");
        if (targetType === 'EDITING' && app?.id !== 'app-video') flaws.push("動画編集用のPC依頼なのに、動画編集ソフトが選ばれていません。");
        if (targetType === 'OFFICE' && app?.id !== 'app-office') flaws.push("事務用のPC依頼なのに、Officeソフトが選ばれていません。");

        // No GPU for Gaming
        if (targetType === 'GAMING' && (!gpu || gpu.name.includes('内蔵'))) {
            flaws.push("ゲーム用PCなのに、グラフィックボードがありません（または内蔵機能です）。これでは3Dゲームは動きません。");
        }

        // --- BOTTLENECK & QUALITY CHECK (Separates "Good" from "Great") ---
        // These do not fail the mission, but prevent "Great" evaluation.
        const warnings: string[] = [];

        // Gaming Checks
        if (targetType === 'GAMING') {
            if ((display?.refreshRate || 60) < 100) warnings.push("モニターが60Hzです。高性能なPCでも、映像の滑らかさが体験できません。ゲーミングモニターを選びましょう。");
            if ((input?.baseScore.gaming || 0) < 80) warnings.push("マウス・キーボードが事務用です。対戦ゲームで勝つにはゲーミングデバイスが推奨されます。");
            if ((ram?.capacity || 0) < 16) warnings.push("最新のゲームにはメモリ16GBが推奨されます。8GBでは裏でアプリを開くと重くなります。");
            if ((cpu?.baseScore.gaming || 0) < 60) warnings.push("CPUの性能が控えめです。ゲームによっては処理落ちする可能性があります。");
            
            // Anti-cheese: Warning if GPU is too weak for "Ideal" build expectation
            if ((gpu?.baseScore.gaming || 0) < 60) warnings.push("グラフィックボードの性能がやや低いです。予算内ならもっと良いものを選べます。");
        }

        // Editing Checks
        if (targetType === 'EDITING') {
            if ((ram?.capacity || 0) < 16) warnings.push("動画編集にはメモリ16GB以上が必須です。8GBではソフトが強制終了する可能性があります。");
            if (scores.videoEditing < 60) warnings.push("書き出し速度が遅くなりそうです。CPUの性能を上げましょう。");
        }

        // Office Checks
        if (targetType === 'OFFICE') {
            if (currentResult.totalPrice > budget + 10000) warnings.push("事務用にしては高価すぎます。もっと安いパーツで十分目的を達成できます。");
        }

        // Compatibility Check
        if (!currentResult.compatibility.valid) {
            flaws.push(...currentResult.compatibility.messages);
        }

        // --- GENERATE FEEDBACK ---

        if (isOverBudget) {
            feedback = `【依頼者からの返信: 😡 不満（予算オーバー）】\n「予算オーバーです！${(currentResult.totalPrice - budget).toLocaleString()}円も高いじゃないですか。お金がないと言ったはずです。作り直してください。」`;
        } else if (flaws.length > 0) {
            feedback = `【依頼者からの返信: 😱 クレーム（返品要求）】\n「これでは使い物になりません！\n\n${flaws.map(f => `・${f}`).join('\n')}\n\nすぐに構成を見直してください。」`;
        } else if (warnings.length > 0) {
            feedback = `【依頼者からの返信: 😐 満足（一応合格）】\n「希望の予算内で作っていただき、ありがとうございます。とりあえず動くので契約成立です。\nただ、プロとしてのアドバイスが欲しかったですね。\n\n${warnings.map(w => `・${w}`).join('\n')}`;
        } else {
            feedback = `【依頼者からの返信: 😍 大満足（完璧です！）】\n「素晴らしい！私が求めていた通りのPCです。\n予算も守られていますし、パーツのバランスも最高です。\n\n・用途に合った完璧なパーツ選定\n・将来性も見越したスペック\n\nプロに頼んで正解でした！」`;
        }

        setSubmitted(true);
        onSubmit(feedback);
        setIsMinimized(true); // Auto minimize to show result
    } catch (e) {
        console.error("Submit Error:", e);
        alert("提出処理中にエラーが発生しました。");
    }
  };

  // Dragging Logic
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialX: position.x,
      initialY: position.y
    };
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !dragRef.current) return;
      const dx = e.clientX - dragRef.current.startX;
      const dy = e.clientY - dragRef.current.startY;
      setPosition({
        x: dragRef.current.initialX + dx,
        y: dragRef.current.initialY + dy
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      dragRef.current = null;
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  const budgetProgress = Math.min((currentResult.totalPrice / budget) * 100, 100);
  const isOverBudget = currentResult.totalPrice > budget;

  return (
    <div 
      className={`fixed z-40 bg-white rounded-lg shadow-2xl border border-slate-300 overflow-hidden transition-all duration-200 ${isMinimized ? 'w-64' : 'w-80 md:w-96'}`}
      style={{ top: position.y, left: position.x }}
    >
      {/* Header Bar */}
      <div 
        className="bg-indigo-600 p-2 flex items-center justify-between cursor-move select-none"
        onMouseDown={handleMouseDown}
      >
        <div className="flex items-center gap-2 text-white">
          <Target size={18} />
          <h2 className="text-sm font-bold">依頼ミッション</h2>
        </div>
        <div className="flex items-center gap-1">
          <button 
            type="button"
            onClick={() => setIsMinimized(!isMinimized)}
            className="text-white/80 hover:text-white hover:bg-indigo-500 p-1 rounded"
          >
            {isMinimized ? <Maximize2 size={14} /> : <Minus size={14} />}
          </button>
        </div>
      </div>

      {/* Content */}
      {!isMinimized && (
        <div className="p-4 bg-gradient-to-b from-indigo-50 to-white max-h-[80vh] overflow-y-auto">
          
          {view === 'SELECT' ? (
              <div className="space-y-3">
                  <h3 className="text-sm font-bold text-slate-700 text-center mb-2">依頼を選んでください</h3>
                  
                  <button type="button" onClick={() => startMission('OFFICE')} className="w-full bg-white p-3 rounded-lg border border-slate-200 shadow-sm hover:border-indigo-300 hover:bg-indigo-50 transition-all text-left flex items-center gap-3">
                      <div className="bg-green-100 p-2 rounded-full text-green-600"><Briefcase size={20}/></div>
                      <div>
                          <div className="text-sm font-bold text-slate-800">事務・学習用PC</div>
                          <div className="text-[10px] text-slate-500">予算9万円前後。非常にシビアな選択が必要。</div>
                      </div>
                  </button>

                  <button type="button" onClick={() => startMission('GAMING')} className="w-full bg-white p-3 rounded-lg border border-slate-200 shadow-sm hover:border-indigo-300 hover:bg-indigo-50 transition-all text-left flex items-center gap-3">
                      <div className="bg-purple-100 p-2 rounded-full text-purple-600"><Gamepad2 size={20}/></div>
                      <div>
                          <div className="text-sm font-bold text-slate-800">ゲーミングPC</div>
                          <div className="text-[10px] text-slate-500">GPUと周辺機器重視。予算18万円前後。</div>
                      </div>
                  </button>

                  <button type="button" onClick={() => startMission('EDITING')} className="w-full bg-white p-3 rounded-lg border border-slate-200 shadow-sm hover:border-indigo-300 hover:bg-indigo-50 transition-all text-left flex items-center gap-3">
                      <div className="bg-orange-100 p-2 rounded-full text-orange-600"><MonitorPlay size={20}/></div>
                      <div>
                          <div className="text-sm font-bold text-slate-800">動画編集PC</div>
                          <div className="text-[10px] text-slate-500">メモリ・CPU重視。予算22万円前後。</div>
                      </div>
                  </button>
              </div>
          ) : (
            <>
                <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center gap-2 text-indigo-800 text-xs font-bold bg-indigo-100 px-2 py-1 rounded">
                        <span className="uppercase">{targetType} PC REQUEST</span>
                    </div>
                    <button 
                        type="button"
                        onClick={returnToSelect}
                        className="text-xs text-slate-500 hover:text-indigo-600 flex items-center gap-1 transition-colors underline"
                    >
                        依頼リストへ戻る
                    </button>
                </div>

                <div className="space-y-3">
                    {/* Scenario */}
                    <div className="bg-white p-3 rounded border border-indigo-100 shadow-sm min-h-[60px]">
                    {loading ? (
                        <span className="animate-pulse text-xs text-slate-500">受信中...</span>
                    ) : (
                        <p className="text-sm text-slate-700 leading-relaxed font-medium">
                        "{scenario}"
                        </p>
                    )}
                    </div>

                    {/* Budget */}
                    <div className="bg-slate-50 p-3 rounded border border-slate-200">
                        <div className="flex justify-between items-center mb-1">
                            <div className="flex items-center gap-1 text-slate-600 text-xs font-bold">
                                <Wallet size={14} />
                                <span>予算: ¥{budget.toLocaleString()}</span>
                            </div>
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${isOverBudget ? 'bg-red-500 text-white' : 'bg-green-500 text-white'}`}>
                                現在: ¥{currentResult.totalPrice.toLocaleString()}
                            </span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                            <div 
                                className={`h-full transition-all duration-500 ${isOverBudget ? 'bg-red-500' : 'bg-green-500'}`}
                                style={{ width: `${budgetProgress}%` }}
                            />
                        </div>
                        {isOverBudget && <p className="text-[10px] text-red-500 mt-1 text-right font-bold">予算オーバー！</p>}
                    </div>
                    
                    {/* Submit Area */}
                    <div className="relative pt-1">
                    {!submitted ? (
                         <div className="space-y-2">
                             <div className="text-[10px] text-slate-500 bg-slate-100 p-2 rounded flex gap-2 items-start">
                                 <AlertTriangle size={14} className="shrink-0 text-orange-500" />
                                 <span>
                                     {targetType === 'GAMING' && "ヒント: モニターや入力機器もゲーム用を選ばないと評価が下がります。内蔵GPUはNGです。"}
                                     {targetType === 'EDITING' && "ヒント: アプリケーションは「動画編集ソフト」を選び、それに耐えるメモリを。"}
                                     {targetType === 'OFFICE' && "ヒント: 予算が非常に厳しいです。OS起動用のSSDは必須ですが、それ以外は安く抑えましょう。"}
                                 </span>
                             </div>

                             {/* Benchmark Warning */}
                             {!isBenchmarked && (
                                <div className="text-[10px] text-red-600 bg-red-50 border border-red-200 p-2 rounded flex items-center gap-2 animate-pulse">
                                    <PlayCircle size={16} />
                                    <span>提出前に必ず「電源ON」で動作確認してください。</span>
                                </div>
                             )}

                             <button 
                                type="button"
                                onClick={handleSubmit}
                                className={`w-full font-bold py-2.5 rounded-lg shadow-md transition-all flex items-center justify-center gap-2 
                                  ${isBenchmarked 
                                    ? 'bg-indigo-600 hover:bg-indigo-700 text-white' 
                                    : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                                  }`}
                             >
                                 <Send size={16} /> 構成を提出する
                             </button>
                         </div>
                    ) : (
                        <div className="bg-slate-100 p-3 rounded text-center">
                            <p className="text-xs text-slate-600 font-bold mb-2">提出済み</p>
                            <p className="text-[10px] text-slate-500 mb-2">右下の「依頼者評価」を確認してください。</p>
                            
                            <div className="flex flex-col gap-2 mt-3">
                                <button 
                                    type="button"
                                    onClick={handleEdit}
                                    className="bg-white border border-indigo-300 text-indigo-600 text-xs px-4 py-2 rounded shadow-sm hover:bg-indigo-50 transition-colors w-full flex items-center justify-center gap-2"
                                >
                                    <Edit3 size={14} /> 修正して再提出する
                                </button>
                                
                                <button 
                                    type="button"
                                    onClick={returnToSelect}
                                    className="bg-slate-200 border border-transparent text-slate-600 text-xs px-4 py-2 rounded hover:bg-slate-300 transition-colors w-full"
                                >
                                    別の依頼を受ける
                                </button>
                            </div>
                        </div>
                    )}
                    </div>
                </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};