
import { Part, PartCategory, CategoryDetail } from './types';

export const CATEGORY_DETAILS: Record<PartCategory, CategoryDetail> = {
  [PartCategory.CPU]: {
    title: "CPU (Central Processing Unit)",
    role: "パソコンの「頭脳」・演算装置/制御装置",
    description: "プログラムの命令を読み取り、計算や制御を行う最も重要なパーツです。コア数が多いほど、同時に複数の作業（マルチタスク）が得意になります。",
    importance: "ゲームや動画編集などの重い処理において、全体の速度を決定づける要素です。"
  },
  [PartCategory.GPU]: {
    title: "GPU (Graphics Processing Unit)",
    role: "パソコンの「目・映像処理担当」",
    description: "画面への映像表示や、3Dグラフィックスの描画を専門に行うパーツです。最近ではAIの処理にも使われます。",
    importance: "3Dゲームや高度な動画編集をするなら、最もお金をかけるべきパーツです。事務作業だけなら高性能なものは不要です。"
  },
  [PartCategory.RAM]: {
    title: "メモリ (RAM)",
    role: "パソコンの「作業机」・記憶装置(主記憶)",
    description: "CPUが処理するデータやプログラムを一時的に広げておく場所です。電源を切るとデータは消えます。",
    importance: "机（メモリ）が広いほど、多くのアプリを同時に開いても動作が遅くなりません。今の標準は16GBです。"
  },
  [PartCategory.STORAGE]: {
    title: "ストレージ (SSD/HDD)",
    role: "パソコンの「本棚・倉庫」・記憶装置(補助記憶)",
    description: "作ったデータ、インストールしたアプリ、OSなどを長期的に保存しておく場所です。電源を切ってもデータは消えません。",
    importance: "SSDは非常に高速で、HDDは大容量で安価です。OSを入れる場所は必ずSSDにしましょう。"
  },
  [PartCategory.OS]: {
    title: "OS (Operating System)",
    role: "パソコンの「基本ソフト」",
    description: "ユーザー（あなた）とハードウェア（機械）の間を取り持ち、アプリを動かすための土台となるソフトです。",
    importance: "これがなければPCはただの箱です。Windowsが一般的ですが、用途によってLinuxなども選ばれます。"
  },
  [PartCategory.DISPLAY]: {
    title: "ディスプレイ (Monitor)",
    role: "パソコンの「顔」・出力装置",
    description: "コンピュータ内部で処理された結果を、人間が見える映像として表示する装置です。",
    importance: "高性能なGPUを持っていても、モニターの性能（リフレッシュレートや解像度）が低いと、美しい映像を体験できません。"
  },
  [PartCategory.INPUT]: {
    title: "入力デバイス (Keyboard/Mouse)",
    role: "パソコンへの「命令」・入力装置",
    description: "人間がコンピュータに指示を与えるための道具です。キーボード、マウス、コントローラーなどがあります。",
    importance: "直接手に触れる部分なので、作業効率やゲームの勝敗に直結します。"
  },
  [PartCategory.APPLICATIONS]: {
    title: "アプリケーション (Application Software)",
    role: "特定の目的を達成するためのソフト",
    description: "OSの上で動作し、文章作成、ゲーム、動画編集など、ユーザーがやりたいことを実現するための道具です。",
    importance: "使いたいアプリによって、必要なハードウェアスペックが決まります。「何をしたいか」がPC作りの出発点です。"
  }
};

export const HARDWARE_PARTS: Part[] = [
  // CPUs
  {
    id: 'cpu-entry',
    name: 'Intel Core i3-12100',
    category: PartCategory.CPU,
    price: 15000,
    power: 60,
    socket: 'LGA1700',
    cores: 4,
    baseScore: { gaming: 40, videoEditing: 20, office: 90 },
    description: '4つのコアを持つ入門用CPU。レポート作成や動画視聴なら十分快適に動作します。'
  },
  {
    id: 'cpu-mid',
    name: 'Intel Core i5-12600K',
    category: PartCategory.CPU,
    price: 35000,
    power: 125,
    socket: 'LGA1700',
    cores: 10,
    baseScore: { gaming: 75, videoEditing: 60, office: 100 },
    description: '性能と価格のバランスが良いミドルレンジモデル。多くのゲームを快適に動かせます。'
  },
  {
    id: 'cpu-high',
    name: 'Intel Core i9-12900K',
    category: PartCategory.CPU,
    price: 80000,
    power: 241,
    socket: 'LGA1700',
    cores: 16,
    baseScore: { gaming: 95, videoEditing: 95, office: 100 },
    description: '非常に高性能なCPU。プロの動画編集や、最高画質でのゲームプレイ向けです。'
  },
  {
    id: 'cpu-amd-mid',
    name: 'AMD Ryzen 5 7600X',
    category: PartCategory.CPU,
    price: 32000,
    power: 105,
    socket: 'AM5',
    cores: 6,
    baseScore: { gaming: 80, videoEditing: 65, office: 100 },
    description: 'ゲーム性能が高いAMD製のCPU。コストパフォーマンスに優れています。'
  },

  // GPUs
  {
    id: 'gpu-integrated',
    name: '内蔵グラフィックス (CPU内蔵)',
    category: PartCategory.GPU,
    price: 0,
    power: 0,
    vram: 0,
    baseScore: { gaming: 10, videoEditing: 5, office: 80 },
    description: 'CPUにおまけでついている機能。画面は映りますが、3Dゲームはカクカクして動きません。'
  },
  {
    id: 'gpu-entry',
    name: 'NVIDIA RTX 3050',
    category: PartCategory.GPU,
    price: 35000,
    power: 130,
    vram: 8,
    baseScore: { gaming: 50, videoEditing: 40, office: 90 },
    description: '入門用グラフィックボード。フルHD画質でのゲームプレイが可能です。'
  },
  {
    id: 'gpu-mid',
    name: 'NVIDIA RTX 4060',
    category: PartCategory.GPU,
    price: 50000,
    power: 115,
    vram: 8,
    baseScore: { gaming: 70, videoEditing: 60, office: 100 },
    description: '最新のミドルレンジGPU。多くのゲームを高画質で楽しめます。'
  },
  {
    id: 'gpu-high',
    name: 'NVIDIA RTX 4080',
    category: PartCategory.GPU,
    price: 180000,
    power: 320,
    vram: 16,
    baseScore: { gaming: 98, videoEditing: 95, office: 100 },
    description: '超高性能なグラフィックボード。4Kなどの高画質映像をなめらかに処理できます。'
  },

  // RAM
  {
    id: 'ram-8gb',
    name: '8GB DDR4 メモリ',
    category: PartCategory.RAM,
    price: 4000,
    power: 3,
    capacity: 8,
    baseScore: { gaming: 15, videoEditing: 5, office: 70 },
    description: '最低限の容量です。たくさんのアプリを同時に開くと動作が重くなることがあります。'
  },
  {
    id: 'ram-16gb',
    name: '16GB DDR4 メモリ',
    category: PartCategory.RAM,
    price: 8000,
    power: 5,
    capacity: 16,
    baseScore: { gaming: 80, videoEditing: 50, office: 100 },
    description: '現在の標準的な容量です。ゲームも事務作業も快適にこなせます。'
  },
  {
    id: 'ram-32gb',
    name: '32GB DDR4 メモリ',
    category: PartCategory.RAM,
    price: 15000,
    power: 6,
    capacity: 32,
    baseScore: { gaming: 95, videoEditing: 90, office: 100 },
    description: '大容量メモリ。動画編集や、重いゲームをしながら配信をする場合に推奨されます。'
  },

  // Storage
  {
    id: 'storage-hdd',
    name: '1TB HDD (ハードディスク)',
    category: PartCategory.STORAGE,
    price: 6000,
    power: 6,
    capacity: 1000,
    baseScore: { gaming: 10, videoEditing: 10, office: 30 },
    description: '安くて大容量ですが、読み書きが非常に遅いです。これをOS用にするのは推奨しません。'
  },
  {
    id: 'storage-ssd-sata',
    name: '500GB SATA SSD',
    category: PartCategory.STORAGE,
    price: 5000,
    power: 3,
    capacity: 500,
    baseScore: { gaming: 60, videoEditing: 50, office: 90 },
    description: '標準的なSSD。HDDより圧倒的に速く、PCの動作がサクサクになります。'
  },
  {
    id: 'storage-ssd-nvme',
    name: '1TB NVMe M.2 SSD',
    category: PartCategory.STORAGE,
    price: 10000,
    power: 4,
    capacity: 1000,
    baseScore: { gaming: 95, videoEditing: 95, office: 100 },
    description: 'マザーボードに直接挿す超高速SSD。ゲームのロード時間が非常に短くなります。'
  },

  // OS
  {
    id: 'os-windows',
    name: 'Windows 11 Home',
    category: PartCategory.OS,
    price: 15000,
    power: 0,
    baseScore: { gaming: 100, videoEditing: 100, office: 100 },
    description: '世界で最も使われているOS。ほとんどのゲームやソフトが対応しています。'
  },
  {
    id: 'os-linux',
    name: 'Ubuntu Linux (無料)',
    category: PartCategory.OS,
    price: 0,
    power: 0,
    baseScore: { gaming: 50, videoEditing: 70, office: 90 },
    description: '無料で使えるOS。プログラミング学習には最適ですが、動かないゲームも多いです。'
  },

  // Displays
  {
    id: 'display-basic',
    name: '24インチ 60Hz モニター',
    category: PartCategory.DISPLAY,
    price: 15000,
    power: 20,
    refreshRate: 60,
    resolution: "1920x1080",
    baseScore: { gaming: 30, videoEditing: 50, office: 100 },
    description: '一般的な事務用モニター。事務作業には十分ですが、ゲーム映像は残像感が残ります。'
  },
  {
    id: 'display-gaming',
    name: '24インチ 144Hz ゲーミング',
    category: PartCategory.DISPLAY,
    price: 25000,
    power: 30,
    refreshRate: 144,
    resolution: "1920x1080",
    baseScore: { gaming: 95, videoEditing: 60, office: 100 },
    description: 'ゲーム用モニター。1秒間に144回画面を書き換えるため、動きの速い映像が非常になめらかに見えます。'
  },
  {
    id: 'display-4k',
    name: '27インチ 4K クリエイター向け',
    category: PartCategory.DISPLAY,
    price: 50000,
    power: 40,
    refreshRate: 60,
    resolution: "3840x2160",
    baseScore: { gaming: 50, videoEditing: 100, office: 100 },
    description: '非常に高精細なモニター。写真や動画の編集に最適ですが、ゲームを4Kで動かすには高性能なGPUが必要です。'
  },

  // Input Devices
  {
    id: 'input-basic',
    name: '標準マウス・キーボード',
    category: PartCategory.INPUT,
    price: 2000,
    power: 1,
    baseScore: { gaming: 20, videoEditing: 40, office: 90 },
    description: 'PCに付属しているような一般的なセット。文章作成には十分ですが、ゲームなどの激しい操作には向きません。'
  },
  {
    id: 'input-gaming',
    name: 'ゲーミングマウス・メカニカルキーボード',
    category: PartCategory.INPUT,
    price: 15000,
    power: 3,
    baseScore: { gaming: 100, videoEditing: 90, office: 90 },
    description: '反応速度が速く、耐久性が高いセット。キーを押した感覚（打鍵感）が心地よく、プロゲーマーも愛用します。'
  },

  // Applications
  {
    id: 'app-office',
    name: 'Officeスイート (Word/Excel)',
    category: PartCategory.APPLICATIONS,
    price: 30000,
    power: 0,
    baseScore: { gaming: 0, videoEditing: 0, office: 100 },
    description: 'レポート作成や表計算に必須のソフト。これだけならハイスペックなPCは不要です。'
  },
  {
    id: 'app-video',
    name: 'プロ向け動画編集ソフト',
    category: PartCategory.APPLICATIONS,
    price: 40000,
    power: 0,
    baseScore: { gaming: 0, videoEditing: 100, office: 0 },
    description: '高機能な動画編集ソフト。快適に動かすには多くのメモリと高性能なCPU・GPUが必要です。'
  },
  {
    id: 'app-game',
    name: '最新3Dオープンワールドゲーム',
    category: PartCategory.APPLICATIONS,
    price: 8000,
    power: 0,
    baseScore: { gaming: 100, videoEditing: 0, office: 0 },
    description: '非常に美しいグラフィックのゲーム。GPUの性能が画質と快適さに直結します。'
  }
];
