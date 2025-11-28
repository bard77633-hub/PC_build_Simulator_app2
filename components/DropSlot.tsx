import React from 'react';
import { Part, PartCategory } from '../types';
import { X, Cpu, Database, HardDrive, Monitor, Box, HelpCircle, Keyboard, MousePointer2, AppWindow } from 'lucide-react';

interface DropSlotProps {
  category: PartCategory;
  assignedPart: Part | null;
  onDrop: (e: React.DragEvent, category: PartCategory) => void;
  onRemove: (category: PartCategory) => void;
  onSelectCategory: (category: PartCategory) => void;
  isCompatible?: boolean;
  isActive?: boolean;
}

const getSlotIcon = (category: string) => {
  switch (category) {
    case 'CPU': return <Cpu size={28} />;
    case 'GPU': return <Monitor size={28} />;
    case 'RAM': return <Database size={28} />;
    case 'STORAGE': return <HardDrive size={28} />;
    case 'OS': return <Box size={28} />;
    case 'DISPLAY': return <Monitor size={28} />;
    case 'INPUT': return <div className="flex"><Keyboard size={20} /><MousePointer2 size={14} className="-ml-1 mt-3"/></div>;
    case 'APPLICATIONS': return <AppWindow size={28} />;
    default: return <Box size={28} />;
  }
};

const getSlotLabel = (category: string) => {
    switch (category) {
        case 'DISPLAY': return 'モニター';
        case 'INPUT': return '入力機器';
        case 'APPLICATIONS': return 'アプリ';
        default: return category;
    }
}

export const DropSlot: React.FC<DropSlotProps> = ({ 
  category, 
  assignedPart, 
  onDrop, 
  onRemove, 
  onSelectCategory,
  isCompatible = true,
  isActive = false
}) => {
  const [isOver, setIsOver] = React.useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsOver(true);
  };

  const handleDragLeave = () => {
    setIsOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsOver(false);
    onDrop(e, category);
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`relative h-32 rounded-xl border-2 transition-all duration-300 flex flex-col items-center justify-center p-2 group overflow-hidden
        ${isActive ? 'ring-4 ring-green-400 ring-opacity-50 border-green-500 scale-105 shadow-[0_0_20px_rgba(74,222,128,0.5)] z-10' : ''}
        ${assignedPart 
          ? (isCompatible ? 'bg-white border-blue-500 shadow-md' : 'bg-red-50 border-red-500') 
          : (isOver ? 'bg-blue-50 border-blue-400 border-dashed scale-[1.02]' : 'bg-slate-100/50 border-slate-300 border-dashed hover:border-slate-400')}
      `}
    >
      <div 
        className="absolute top-1.5 left-2 flex items-center gap-1 z-10 cursor-pointer hover:bg-slate-200/50 rounded px-1.5 py-0.5 transition-colors"
        onClick={(e) => { e.stopPropagation(); onSelectCategory(category); }}
        title={`${category}について学ぶ`}
      >
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{getSlotLabel(category)}</span>
        <HelpCircle size={10} className="text-slate-400" />
      </div>

      {assignedPart ? (
        <div 
          key={assignedPart.id} /* Key triggers React reconciliation animation */
          className="text-center w-full px-1 animate-in zoom-in-95 fade-in duration-300 fill-mode-both"
          onClick={() => onSelectCategory(category)}
        >
          <div className={`mb-1 inline-block p-1.5 rounded-full transition-transform duration-300 ${isActive ? 'bg-green-100 text-green-600 scale-110' : (isCompatible ? 'bg-blue-100 text-blue-600' : 'bg-red-100 text-red-600')}`}>
            {getSlotIcon(category)}
          </div>
          <p className="font-bold text-xs text-slate-800 line-clamp-1 leading-tight">{assignedPart.name}</p>
          <div className="flex justify-center gap-2 mt-0.5">
             <span className="text-[10px] text-slate-500">¥{assignedPart.price.toLocaleString()}</span>
          </div>
          
          <button 
            onClick={(e) => { e.stopPropagation(); onRemove(category); }}
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-sm hover:bg-red-600 transition-colors z-20 hover:scale-110 active:scale-95"
            title="削除"
          >
            <X size={12} />
          </button>
          
          {!isCompatible && (
            <div className="absolute bottom-1 left-0 right-0 text-[10px] text-red-600 font-bold bg-red-50 py-0.5 px-1 rounded mx-2 animate-pulse">
              バランス注意
            </div>
          )}
          
          {isActive && (
            <div className="absolute -bottom-4 left-0 right-0 text-center animate-bounce">
              <span className="bg-green-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold shadow-sm">
                稼働中
              </span>
            </div>
          )}
        </div>
      ) : (
        <div 
          className="text-slate-400 flex flex-col items-center cursor-pointer w-full h-full justify-center transition-opacity duration-200"
          onClick={() => onSelectCategory(category)}
        >
          {getSlotIcon(category)}
          <span className="text-xs mt-1 font-medium text-center leading-tight">
             {category === 'INPUT' ? 'Input' : category === 'APPLICATIONS' ? 'App' : category}<br/>
             <span className="text-[10px] opacity-75 group-hover:text-blue-400 transition-colors">Drag here</span>
          </span>
        </div>
      )}
    </div>
  );
};