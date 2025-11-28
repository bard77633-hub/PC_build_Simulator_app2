export enum PartCategory {
  CPU = 'CPU',
  GPU = 'GPU',
  RAM = 'RAM',
  STORAGE = 'STORAGE',
  OS = 'OS',
  DISPLAY = 'DISPLAY',
  INPUT = 'INPUT',
  APPLICATIONS = 'APPLICATIONS'
}

export interface Part {
  id: string;
  name: string;
  category: PartCategory;
  price: number;
  power: number; // Watts
  socket?: string; // For CPU compatibility
  capacity?: number; // GB (for RAM/Storage)
  vram?: number; // GB (for GPU)
  cores?: number; // For CPU
  refreshRate?: number; // Hz (For Display)
  resolution?: string; // e.g. "1920x1080" (For Display)
  baseScore: {
    gaming: number;
    videoEditing: number;
    office: number;
  };
  description: string;
}

export interface PCBuild {
  [PartCategory.CPU]: Part | null;
  [PartCategory.GPU]: Part | null;
  [PartCategory.RAM]: Part | null;
  [PartCategory.STORAGE]: Part | null;
  [PartCategory.OS]: Part | null;
  [PartCategory.DISPLAY]: Part | null;
  [PartCategory.INPUT]: Part | null;
  [PartCategory.APPLICATIONS]: Part | null;
}

export interface SimulationResult {
  totalPrice: number;
  totalPower: number;
  scores: {
    gaming: number;
    videoEditing: number;
    office: number;
  };
  compatibility: {
    valid: boolean;
    messages: string[];
  };
}

export interface CategoryDetail {
  title: string;
  role: string;
  description: string;
  importance: string;
}

export enum AppMode {
  BUILDER = 'BUILDER',
  QUIZ = 'QUIZ',
  COMPARISON = 'COMPARISON'
}

export enum SimulationPhase {
  IDLE = 'IDLE',
  BOOTING = 'BOOTING', // Storage -> RAM
  LOADING = 'LOADING', // RAM usage
  RUNNING = 'RUNNING', // CPU/GPU usage
  FINISHED = 'FINISHED'
}