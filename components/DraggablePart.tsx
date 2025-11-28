import React, { useState, useEffect } from 'react';
import { Part, PartCategory } from '../types';
import { GripVertical, Cpu, Database, HardDrive, Monitor, Box, Keyboard, Plus, AppWindow, Check, Wrench } from 'lucide-react';

interface DraggablePartProps {
  part: Part;
  onDragStart: (e: React.DragEvent, part: Part) => void;
  onSelect: (part: Part) => void;
  onAddToBuild: (part: Part) => void;
  isSelected: boolean;
  isEquipped?: boolean;
}

const getIcon = (category: string) => {
  switch (category) {
    case 'CPU': return <Cpu size={16} />;
    case 'GPU': return <Monitor size={16} />; 
    case 'RAM': return <Database size={16} />;
    case 'STORAGE': return <HardDrive size={16} />;
    case 'OS': return <Box size={16} />;
    case 'DISPLAY': return <Monitor size={16} />; 
    case 'INPUT': return <Keyboard size={16} />;
    case 'APPLICATIONS': return <AppWindow size={16} />;
    default: return <Box size={16} />;
  }
};

export const DraggablePart: React.FC<DraggablePartProps> = ({ part, onDragStart, onSelect, onAddToBuild, isSelected, isEquipped }) => {
  const [isAdded, setIsAdded] = useState(false);

  useEffect(() => {
    if (isAdded) {
      const timer = setTimeout(() => setIsAdded(false), 500);
      return () => clearTimeout(timer);
    }
  }, [isAdded]);

  const handleClick = () => {
    onSelect(part);
  };

  const handleAdd = (e?: React.MouseEvent) => {
    if(e) e.stopPropagation();
    onAddToBuild(part);
    setIsAdded(true);
  };

  // Style Logic
  const getContainerClass = () => {
    if (isAdded) return 'ring-2 ring-green-500 bg-green-50 border-green-400 z-10';
    if (isSelected) return 'ring-2 ring-blue-500 bg-blue-50 border-blue-400 z-10';
    if (isEquipped) return 'border-indigo-400 bg-indigo-50/50 shadow-sm';
    return 'hover:shadow-md hover:border-blue-400 active:scale-[0.98] border-slate-200 bg-white';
  };

  const getIconContainerClass = () => {
    if (isAdded) return 'bg-green-100 text-green-600';
    if (isSelected) return 'bg-blue-100 text-blue-600';
    if (isEquipped) return 'bg-indigo-100 text-indigo-600';
    return 'bg-slate-50 text-slate-600';
  };

  const getTitleClass = () => {
    if (isAdded) return 'text-green-800';
    if (isSelected) return 'text-blue-800';
    if (isEquipped) return 'text-indigo-900 font-bold';
    return 'text-slate-800';
  };

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, part)}
      onClick={handleClick}
      onDoubleClick={handleAdd}
      className={`p-2 rounded border transition-all duration-200 ease-out flex items-center gap-2 group relative select-none ${getContainerClass()}`}
    >
      <div className={`transition-colors duration-200 cursor-grab active:cursor-grabbing ${isEquipped ? 'text-indigo-400' : 'text-slate-300'}`}>
          {isAdded ? <Check size={14} className="text-green-500" /> : <GripVertical size={14} />}
      </div>
      
      <div className={`p-1.5 rounded transition-colors duration-200 shrink-0 ${getIconContainerClass()}`}>
        {getIcon(part.category)}
      </div>
      
      <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <h4 className={`font-semibold text-xs truncate transition-colors ${getTitleClass()}`}>{part.name}</h4>
            {part.category === PartCategory.DISPLAY && part.refreshRate && (
                <span className="text-[9px] bg-green-100 text-green-700 px-1 rounded font-bold whitespace-nowrap">{part.refreshRate}Hz</span>
            )}
            {isEquipped && (
                <span className="text-[9px] bg-indigo-600 text-white px-1.5 py-0.5 rounded font-bold whitespace-nowrap flex items-center gap-0.5">
                    <Wrench size={8} /> 装着中
                </span>
            )}
          </div>
          <p className="text-[10px] text-slate-500 truncate">{part.description.substring(0, 20)}...</p>
      </div>
      
      <div className="text-right shrink-0 min-w-[70px]">
        <span className="text-xs font-bold text-slate-700">¥{part.price.toLocaleString()}</span>
      </div>

      <button 
          onClick={handleAdd}
          className={`lg:hidden ml-2 p-1.5 rounded transition-colors ${isAdded ? 'bg-green-500 text-white' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'}`}
      >
          {isAdded ? <Check size={14} /> : <Plus size={14} />}
      </button>
    </div>
  );
};