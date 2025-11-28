
import React, { useEffect, useState } from 'react';
import { SimulationResult, PCBuild, AppMode } from '../types';
import { getAIPCAnalysis } from '../services/geminiService';
import { Bot, Loader2, RefreshCcw, CheckCircle2, AlertTriangle, MessageSquareQuote } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, LabelList } from 'recharts';

interface Props {
  result: SimulationResult;
  build: PCBuild;
  isBenchmarked: boolean;
  clientFeedback: string | null;
  mode?: AppMode;
}

export const SimulationResults: React.FC<Props> = ({ result, build, isBenchmarked, clientFeedback, mode }) => {
  const [aiFeedback, setAiFeedback] = useState<string>('');
  const [loadingAi, setLoadingAi] = useState(false);

  const getAnalysis = async () => {
    setLoadingAi(true);
    const feedback = await getAIPCAnalysis(build);
    setAiFeedback(feedback);
    setLoadingAi(false);
  };

  useEffect(() => {
    // Reset feedback when build changes significantly or component mounts
    setAiFeedback('');
  }, [result.totalPrice]); 

  const performanceData = [
    { name: 'Game', score: result.scores.gaming, fill: '#8b5cf6' },
    { name: 'Edit', score: result.scores.videoEditing, fill: '#f43f5e' },
    { name: 'Office', score: result.scores.office, fill: '#10b981' },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
        <h2 className="text-lg font-bold text-slate-800">シミュレーション結果</h2>
        <div className="text-right">
          <p className="text-[10px] text-slate-500">合計金額</p>
          <p className="text-xl font-bold text-blue-600">¥{result.totalPrice.toLocaleString()}</p>
        </div>
      </div>

      {/* Benchmark Verification Status */}
      <div className={`p-3 rounded-lg border flex items-center gap-3 transition-colors duration-500 ${isBenchmarked ? 'bg-green-50 border-green-200' : 'bg-slate-50 border-slate-200 border-dashed'}`}>
         <div className={`p-2 rounded-full ${isBenchmarked ? 'bg-green-100 text-green-600' : 'bg-slate-200 text-slate-400'}`}>
            {isBenchmarked ? <CheckCircle2 size={20} /> : <AlertTriangle size={20} />}
         </div>
         <div>
            <h4 className={`text-sm font-bold ${isBenchmarked ? 'text-green-800' : 'text-slate-500'}`}>
                {isBenchmarked ? '実働テスト完了 (Certified)' : '未テスト'}
            </h4>
            <p className="text-xs text-slate-500 leading-tight mt-0.5">
                {isBenchmarked 
                    ? '電源ONによる動作確認済み。スコアは信頼できます。' 
                    : '理論値のみの表示です。電源を入れてテストしてください。'}
            </p>
         </div>
      </div>

      {/* Client Feedback (Priority Display) */}
      {clientFeedback && (
         <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 animate-in slide-in-from-left duration-500">
             <div className="flex items-center gap-2 mb-2">
                 <MessageSquareQuote className="text-yellow-600" size={20} />
                 <h3 className="font-bold text-yellow-800 text-sm">依頼者からの評価</h3>
             </div>
             <p className="text-sm text-slate-800 leading-relaxed whitespace-pre-line font-medium">
                 {clientFeedback}
             </p>
         </div>
      )}

      {/* Compatibility Alerts */}
      {!result.compatibility.valid && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <h3 className="text-red-700 font-bold flex items-center gap-2 mb-1 text-sm">
            ⚠️ 互換性エラー
          </h3>
          <ul className="list-disc list-inside text-xs text-red-600 space-y-0.5">
            {result.compatibility.messages.map((msg, idx) => (
              <li key={idx}>{msg}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Performance Chart */}
        <div className="h-40">
          <h3 className="text-xs font-semibold text-slate-600 mb-1">性能スコア{isBenchmarked ? '(実測)' : '(予測)'}</h3>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={performanceData} layout="vertical" margin={{ left: 30, right: 30 }}>
              <XAxis type="number" domain={[0, 100]} hide />
              <YAxis dataKey="name" type="category" width={40} tick={{ fontSize: 10 }} />
              <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ fontSize: '12px', padding: '5px' }} />
              <Bar dataKey="score" radius={[0, 4, 4, 0]} barSize={20}>
                <LabelList dataKey="score" position="right" fontSize={11} fontWeight="bold" fill="#475569" />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Power Usage */}
        <div className="flex flex-col justify-center space-y-2">
           <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-semibold text-slate-600">消費電力</span>
                <span className="font-bold text-slate-800">{result.totalPower}W</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-3">
                <div 
                  className={`h-3 rounded-full transition-all duration-500 ${result.totalPower > 500 ? 'bg-orange-500' : 'bg-green-500'}`} 
                  style={{ width: `${Math.min((result.totalPower / 800) * 100, 100)}%` }}
                ></div>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">※推奨電源: {Math.ceil(result.totalPower * 1.5)}W 以上</p>
           </div>
        </div>
      </div>

      {/* AI Analysis Section */}
      {/* 
         In Quiz Mode: Hidden by default, shows placeholder if no feedback yet. 
         In Builder Mode: Always visible.
      */}
      {!clientFeedback && mode !== AppMode.QUIZ && (
        <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
            <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
                <Bot className="text-purple-600" size={16} />
                <h3 className="font-bold text-slate-800 text-sm">AI先生の評価</h3>
            </div>
            {!aiFeedback && (
                <button 
                onClick={getAnalysis}
                disabled={loadingAi}
                className="text-[10px] bg-purple-600 text-white px-2 py-1 rounded hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center gap-1"
                >
                {loadingAi ? <Loader2 className="animate-spin" size={10} /> : <RefreshCcw size={10} />}
                評価を聞く
                </button>
            )}
            </div>
            
            {loadingAi && (
            <div className="text-slate-500 text-xs animate-pulse">構成を分析中...</div>
            )}
            
            {aiFeedback && (
            <div className="text-slate-700 text-xs leading-relaxed whitespace-pre-line bg-white p-2 rounded border border-slate-200 max-h-32 overflow-y-auto">
                {aiFeedback}
            </div>
            )}
        </div>
      )}

      {/* Quiz Mode Status Placeholder */}
      {mode === AppMode.QUIZ && !clientFeedback && (
         <div className="bg-slate-50 border border-slate-200 border-dashed rounded-lg p-4 text-center">
             <p className="text-xs text-slate-500 font-medium">依頼の提出待ちです...</p>
         </div>
      )}
    </div>
  );
};
