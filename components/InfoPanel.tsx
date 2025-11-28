import React from 'react';
import { Part, PartCategory } from '../types';
import { CATEGORY_DETAILS } from '../constants';
import { BookOpen, Info, Zap, Tag, MonitorPlay } from 'lucide-react';

interface InfoPanelProps {
  selectedPart: Part | null;
  selectedCategory: PartCategory | null;
}

export const InfoPanel: React.FC<InfoPanelProps> = ({ selectedPart, selectedCategory }) => {
  if (selectedPart) {
    const categoryInfo = CATEGORY_DETAILS[selectedPart.category];

    return (
      <div className="bg-white rounded-xl shadow-sm border border-blue-200 overflow-hidden flex flex-col animate-in fade-in slide-in-from-bottom-2 duration-300">
        <div className="bg-blue-50 p-4 border-b border-blue-100">
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded font-bold">{selectedPart.category}</span>
            <span className="text-slate-500 text-xs">選択中のパーツ</span>
          </div>
          <h3 className="font-bold text-lg text-slate-900 leading-tight">{selectedPart.name}</h3>
        </div>
        
        <div className="p-5 space-y-4">
          
          {/* Added Educational Context Block */}
          {categoryInfo && (
            <div className="bg-gradient-to-br from-indigo-50 to-white p-3 rounded-lg border border-indigo-100 shadow-sm relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                  <BookOpen size={48} className="text-indigo-600" />
               </div>
               <div className="flex items-center gap-2 mb-2 relative z-10">
                  <div className="bg-indigo-100 p-1.5 rounded-full text-indigo-600">
                      <BookOpen size={14} />
                  </div>
                  <span className="text-xs font-bold text-indigo-700">{categoryInfo.title}とは？</span>
               </div>
               <p className="text-sm font-bold text-slate-800 mb-1 relative z-10">{categoryInfo.role}</p>
               <p className="text-xs text-slate-600 leading-relaxed relative z-10">{categoryInfo.description}</p>
            </div>
          )}

          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
              <Info size={14} /> 製品解説
            </h4>
            <p className="text-slate-700 text-sm leading-relaxed">
              {selectedPart.description}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
              <div className="text-slate-400 text-xs mb-1 flex items-center gap-1"><Tag size={12}/> 価格</div>
              <div className="font-bold text-slate-800">¥{selectedPart.price.toLocaleString()}</div>
            </div>
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
              <div className="text-slate-400 text-xs mb-1 flex items-center gap-1"><Zap size={12}/> 消費電力</div>
              <div className="font-bold text-slate-800">{selectedPart.power}W</div>
            </div>
            {selectedPart.cores && (
               <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
               <div className="text-slate-400 text-xs mb-1 flex items-center gap-1"><MonitorPlay size={12}/> コア数</div>
               <div className="font-bold text-slate-800">{selectedPart.cores} コア</div>
             </div>
            )}
             {selectedPart.capacity && (
               <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
               <div className="text-slate-400 text-xs mb-1 flex items-center gap-1"><Tag size={12}/> 容量</div>
               <div className="font-bold text-slate-800">{selectedPart.capacity} GB</div>
             </div>
            )}
            {selectedPart.refreshRate && (
               <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
               <div className="text-slate-400 text-xs mb-1 flex items-center gap-1"><MonitorPlay size={12}/> リフレッシュレート</div>
               <div className="font-bold text-slate-800">{selectedPart.refreshRate} Hz</div>
             </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (selectedCategory) {
    const details = CATEGORY_DETAILS[selectedCategory];
    return (
      <div className="bg-white rounded-xl shadow-sm border border-purple-200 overflow-hidden flex flex-col animate-in fade-in slide-in-from-bottom-2 duration-300">
        <div className="bg-purple-50 p-4 border-b border-purple-100">
          <div className="flex items-center gap-2 text-purple-700 mb-1">
             <BookOpen size={16} />
             <span className="text-xs font-bold uppercase">学習ガイド</span>
          </div>
          <h3 className="font-bold text-lg text-slate-900">{details.title}</h3>
        </div>
        
        <div className="p-5 space-y-5">
          <div>
            <h4 className="text-sm font-bold text-purple-700 mb-1">役割</h4>
            <p className="text-lg font-medium text-slate-800">{details.role}</p>
          </div>
          
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">詳しい説明</h4>
            <p className="text-slate-700 text-sm leading-relaxed">
              {details.description}
            </p>
          </div>

          <div className="bg-purple-50 p-3 rounded-lg border border-purple-100">
             <h4 className="text-xs font-bold text-purple-700 mb-1">ここがポイント！</h4>
             <p className="text-slate-600 text-xs leading-relaxed">
               {details.importance}
             </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 rounded-xl border border-slate-200 border-dashed min-h-[300px] flex flex-col items-center justify-center p-6 text-center text-slate-400">
      <BookOpen size={48} className="mb-4 opacity-20" />
      <p className="font-medium text-slate-500">学習ガイドパネル</p>
      <p className="text-sm mt-2 max-w-xs">
        パーツリストやマザーボードのスロットをクリックすると、ここに詳しい解説が表示されます。
      </p>
    </div>
  );
};