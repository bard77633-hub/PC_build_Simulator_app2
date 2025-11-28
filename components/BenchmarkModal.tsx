import React, { useEffect, useState, useRef } from 'react';
import { PartCategory, PCBuild, SimulationPhase } from '../types';
import { CheckCircle2, Cpu, HardDrive, Database, Monitor, X, Activity } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';

interface BenchmarkModalProps {
  build: PCBuild;
  phase: SimulationPhase;
  onClose: () => void;
  onPhaseChange: (phase: SimulationPhase) => void;
}

// Mock data point interface
interface SystemMetrics {
  time: number;
  cpu: number;
  ram: number;
  disk: number;
  gpu: number;
}

interface MetricCardProps {
  title: string;
  value: number;
  color: string;
  dataKey: string;
  icon: any;
  unit?: string;
  data: SystemMetrics[];
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, color, dataKey, icon: Icon, unit = "%", data }) => (
  <div className="bg-white rounded-lg border border-slate-200 p-3 shadow-sm flex flex-col h-32 relative overflow-hidden">
    <div className="flex justify-between items-start z-10">
      <div className="flex items-center gap-1.5 text-slate-500 font-bold text-xs uppercase tracking-wider">
        <Icon size={14} /> {title}
      </div>
      <div className={`text-xl font-bold font-mono`} style={{ color }}>
        {Math.round(value)}{unit}
      </div>
    </div>
    
    <div className="flex-1 -mx-3 -mb-3 mt-2 absolute bottom-0 left-0 right-0 h-20 opacity-80">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id={`color${dataKey}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.3}/>
              <stop offset="95%" stopColor={color} stopOpacity={0}/>
            </linearGradient>
          </defs>
          <Area 
              type="monotone" 
              dataKey={dataKey} 
              stroke={color} 
              strokeWidth={2}
              fillOpacity={1} 
              fill={`url(#color${dataKey})`} 
              isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  </div>
);

export const BenchmarkModal: React.FC<BenchmarkModalProps> = ({ build, phase, onClose, onPhaseChange }) => {
  const [metrics, setMetrics] = useState<SystemMetrics[]>([]);
  const [log, setLog] = useState<string[]>([]);
  const [fps, setFps] = useState(0);
  
  // Hardware references
  const cpu = build[PartCategory.CPU];
  const gpu = build[PartCategory.GPU];
  const ram = build[PartCategory.RAM];
  const storage = build[PartCategory.STORAGE];
  const app = build[PartCategory.APPLICATIONS];

  const scrollRef = useRef<HTMLDivElement>(null);

  const addLog = (msg: string) => {
    setLog(prev => [...prev, msg]);
    // Auto scroll
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  // Initialize charts
  useEffect(() => {
    // Fill initial data with zeros
    const initialData = Array(20).fill(0).map((_, i) => ({
      time: i,
      cpu: 0,
      ram: 0,
      disk: 0,
      gpu: 0
    }));
    setMetrics(initialData);
  }, []);

  // Main Simulation Loop
  useEffect(() => {
    let interval: number;
    let tickCount = 0;

    // Simulation Parameters
    const ramCapacity = ram?.capacity || 8;
    const isHDD = storage?.name.includes('HDD') || false;
    const isNVMe = storage?.name.includes('NVMe') || false;
    const cpuCores = cpu?.cores || 4;
    const gpuPower = gpu?.baseScore.gaming || 10;
    
    // Application Demand (Simulated)
    const appRamDemand = app?.id === 'app-video' ? 16 : (app?.id === 'app-game' ? 12 : 4);
    const appCpuDemand = app?.id === 'app-video' ? 80 : (app?.id === 'app-game' ? 60 : 10);
    const appGpuDemand = app?.id === 'app-game' ? 90 : (app?.id === 'app-video' ? 30 : 5);

    const updateMetrics = (newCpu: number, newRam: number, newDisk: number, newGpu: number) => {
      setMetrics(prev => {
        const newData = [...prev.slice(1), {
          time: tickCount,
          cpu: Math.min(100, Math.max(0, newCpu + (Math.random() * 5 - 2.5))),
          ram: Math.min(100, Math.max(0, newRam)),
          disk: Math.min(100, Math.max(0, newDisk + (Math.random() * 10 - 5))),
          gpu: Math.min(100, Math.max(0, newGpu + (Math.random() * 5 - 2.5)))
        }];
        return newData;
      });
      tickCount++;
    };

    const runSimulation = () => {
      // 1. BOOT PHASE
      if (phase === SimulationPhase.BOOTING) {
        if (tickCount === 0) addLog('システム起動シーケンス開始...');
        
        // Disk heavy, CPU low, RAM climbing slowly
        const diskLoad = isHDD ? 100 : (isNVMe ? 40 : 70);
        const bootSpeed = isHDD ? 0.5 : (isNVMe ? 5 : 2); // progress per tick
        
        const bootDuration = 100 / bootSpeed;

        if (tickCount < bootDuration) {
           updateMetrics(10, (tickCount / bootDuration) * 20, diskLoad, 0);
        } else {
           addLog('OS起動完了。');
           onPhaseChange(SimulationPhase.LOADING);
           tickCount = 0; // reset for next phase logic
        }
      }

      // 2. LOADING PHASE
      else if (phase === SimulationPhase.LOADING) {
        if (tickCount === 0) addLog(`アプリケーション読み込み開始: ${app?.name || 'Unknown'}`);

        // RAM filling up
        // If RAM demand > capacity, SWAP occurs (Disk high, Speed slow)
        const totalRamNeeded = 4 + appRamDemand; // OS (4) + App
        const ramUsagePercent = Math.min(100, (totalRamNeeded / ramCapacity) * 100);
        const isSwapping = totalRamNeeded > ramCapacity;

        let loadSpeed = 2; // base speed
        let diskLoad = 50;

        if (isSwapping) {
           loadSpeed = 0.5; // Very slow due to swap
           diskLoad = 100; // Disk trashing
           if (tickCount % 20 === 0) addLog('警告: メモリ不足！スワップ発生中 (速度低下)');
        } else {
           diskLoad = isHDD ? 80 : 30;
           loadSpeed = isHDD ? 1.5 : (isNVMe ? 10 : 5);
        }

        const loadDuration = 100 / loadSpeed;
        
        // Ramp up RAM usage
        const currentRam = Math.min(ramUsagePercent, (tickCount / loadDuration) * ramUsagePercent + 20);

        if (tickCount < loadDuration) {
            updateMetrics(30, currentRam, diskLoad, 5);
        } else {
            addLog('読み込み完了。処理開始。');
            onPhaseChange(SimulationPhase.RUNNING);
            tickCount = 0;
        }
      }

      // 3. RUNNING PHASE
      else if (phase === SimulationPhase.RUNNING) {
        if (tickCount === 0) addLog('プロセスタスク実行中...');
        
        // Calculate Loads based on Specs
        // CPU: If app needs more cores than available, load is 100%
        const cpuLoad = Math.min(100, (appCpuDemand / (cpuCores / 4)) * 1.2); 
        
        // RAM: Steady state
        const totalRamNeeded = 4 + appRamDemand;
        const ramLoad = Math.min(100, (totalRamNeeded / ramCapacity) * 100);
        
        // GPU:
        const gpuLoad = Math.min(100, (appGpuDemand / (gpuPower / 50)) * 100);

        // Disk: Low unless swapping
        const isSwapping = totalRamNeeded > ramCapacity;
        const diskLoad = isSwapping ? 80 : Math.random() * 5;

        // FPS Calculation (Fake)
        const bottleneck = Math.max(cpuLoad, gpuLoad, isSwapping ? 90 : 0);
        const currentFps = Math.max(5, Math.round(60 * (100 - bottleneck * 0.5) / 50 * (gpuPower / 50)));
        setFps(currentFps);

        updateMetrics(cpuLoad, ramLoad, diskLoad, gpuLoad);

        if (tickCount > 100) { // Run for a while
            addLog('タスク完了。');
            onPhaseChange(SimulationPhase.FINISHED);
        }
      }
      
      // 4. FINISHED
      else if (phase === SimulationPhase.FINISHED) {
         // idle stats
         updateMetrics(5, 20, 0, 0);
      }
    };

    interval = window.setInterval(runSimulation, 100);
    return () => clearInterval(interval);
  }, [phase, cpu, ram, storage, gpu, app, onPhaseChange]);

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-slate-100 rounded-xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh] border border-slate-300">
        
        {/* Header (Task Manager Style) */}
        <div className="bg-white border-b border-slate-200 p-3 flex justify-between items-center">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                <Activity size={20} />
             </div>
             <div>
               <h3 className="font-bold text-slate-800 text-sm">システム・パフォーマンス・モニター</h3>
               <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span className={`w-2 h-2 rounded-full ${phase === SimulationPhase.FINISHED ? 'bg-green-500' : 'bg-blue-500 animate-pulse'}`}></span>
                  <span>STATUS: {phase === SimulationPhase.IDLE ? 'STANDBY' : phase}</span>
               </div>
             </div>
          </div>
          
          {phase === SimulationPhase.FINISHED && (
             <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors">
               <X size={20} />
             </button>
          )}
        </div>

        {/* Main Dashboard Grid */}
        <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-3">
            <MetricCard 
                title="CPU" 
                value={metrics[metrics.length-1]?.cpu || 0} 
                color="#3b82f6" 
                dataKey="cpu" 
                icon={Cpu}
                data={metrics}
            />
            <MetricCard 
                title="メモリ" 
                value={metrics[metrics.length-1]?.ram || 0} 
                color="#8b5cf6" 
                dataKey="ram" 
                icon={Database}
                data={metrics}
            />
            <MetricCard 
                title="ディスク" 
                value={metrics[metrics.length-1]?.disk || 0} 
                color="#10b981" 
                dataKey="disk" 
                icon={HardDrive}
                data={metrics}
            />
            <MetricCard 
                title="GPU" 
                value={metrics[metrics.length-1]?.gpu || 0} 
                color="#f43f5e" 
                dataKey="gpu" 
                icon={Monitor}
                data={metrics}
            />
        </div>

        {/* Context View */}
        <div className="flex-1 bg-white mx-4 mb-4 rounded-lg border border-slate-200 p-4 flex gap-4 overflow-hidden">
            
            {/* Left: Visual Representation */}
            <div className="flex-1 bg-slate-900 rounded-lg relative overflow-hidden flex flex-col items-center justify-center text-slate-300 border border-slate-800">
                {/* Background Grid */}
                <div className="absolute inset-0 opacity-10" 
                     style={{ backgroundImage: 'linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
                </div>

                {phase === SimulationPhase.RUNNING ? (
                    <>
                        <div className="text-4xl font-bold font-mono text-white mb-2 z-10">{fps} <span className="text-sm text-slate-500">FPS</span></div>
                        <div className="flex gap-4 text-xs z-10">
                            <span className={metrics[metrics.length-1]?.cpu > 90 ? "text-red-400 font-bold" : "text-slate-400"}>
                                CPU Load: {Math.round(metrics[metrics.length-1]?.cpu)}%
                            </span>
                            <span className={metrics[metrics.length-1]?.gpu > 90 ? "text-red-400 font-bold" : "text-slate-400"}>
                                GPU Load: {Math.round(metrics[metrics.length-1]?.gpu)}%
                            </span>
                        </div>
                        {/* 3D Scene Simulation */}
                        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900 via-slate-900 to-black animate-pulse"></div>
                    </>
                ) : (
                    <div className="z-10 text-center p-4">
                        {phase === SimulationPhase.BOOTING && <HardDrive size={48} className="mx-auto mb-2 text-blue-500 animate-bounce" />}
                        {phase === SimulationPhase.LOADING && <Database size={48} className="mx-auto mb-2 text-purple-500 animate-bounce" />}
                        {phase === SimulationPhase.FINISHED && <CheckCircle2 size={48} className="mx-auto mb-2 text-green-500" />}
                        <p className="font-bold text-white">{
                            phase === SimulationPhase.BOOTING ? 'OS起動中...' :
                            phase === SimulationPhase.LOADING ? 'データ転送中...' :
                            '完了'
                        }</p>
                        <p className="text-xs mt-1 text-slate-400 max-w-[200px]">
                            {phase === SimulationPhase.BOOTING && (storage?.name.includes('SSD') ? 'SSDにより高速起動中' : 'HDDのため起動に時間がかかっています')}
                            {phase === SimulationPhase.LOADING && (ram?.capacity && ram.capacity < 16 ? 'メモリ容量に注意...' : 'メモリ容量は十分です')}
                        </p>
                    </div>
                )}
            </div>

            {/* Right: System Log */}
            <div className="w-1/3 bg-slate-50 rounded border border-slate-200 flex flex-col">
                <div className="bg-slate-100 px-3 py-1.5 border-b border-slate-200 text-xs font-bold text-slate-600">
                    System Log
                </div>
                <div 
                    ref={scrollRef}
                    className="flex-1 overflow-y-auto p-2 font-mono text-[10px] space-y-1 text-slate-600"
                >
                    {log.map((l, i) => (
                        <div key={i} className="border-b border-slate-100 pb-1 last:border-0">
                            <span className="text-slate-400 mr-1">[{String(i).padStart(2, '0')}]</span>
                            {l}
                        </div>
                    ))}
                    {phase !== SimulationPhase.FINISHED && <div className="animate-pulse">_</div>}
                </div>
            </div>
        </div>

        {phase === SimulationPhase.FINISHED && (
          <div className="p-4 bg-white border-t border-slate-200 flex justify-end">
             <button 
                onClick={onClose}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-8 rounded-lg shadow-sm transition-colors text-sm"
              >
                シミュレーション終了
              </button>
          </div>
        )}

      </div>
    </div>
  );
};