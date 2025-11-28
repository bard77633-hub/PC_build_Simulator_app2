import { GoogleGenAI } from "@google/genai";
import { PCBuild, Part, PartCategory } from '../types';

// Safe API Key retrieval that won't crash in browser
const getApiKey = () => {
  try {
    // @ts-ignore
    if (typeof process !== 'undefined' && process.env && process.env.API_KEY) {
      // @ts-ignore
      return process.env.API_KEY;
    }
  } catch (e) {
    // Ignore error
  }
  return undefined;
};

const apiKey = getApiKey();
// Only initialize AI if key exists to prevent immediate errors
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

// Mock Data for Offline Mode
const MOCK_SCENARIOS: Record<string, { scenario: string, targetType: string, budget: number }> = {
  "OFFICE": { 
    scenario: "大学のレポート作成とネットサーフィン用にPCが欲しいです。Officeソフトは必須。予算は少ないですが、起動が遅いのは嫌なのでSSDにしてください。", 
    targetType: "OFFICE", 
    budget: 90000 
  },
  "GAMING": { 
    scenario: "最新の3Dオープンワールドゲームを高画質で遊びたい！周辺機器もゲーミング仕様で頼む。予算は18万円以内で。", 
    targetType: "GAMING", 
    budget: 180000 
  },
  "EDITING": { 
    scenario: "YouTube用の4K動画編集を始めたい。プレビューがカクつかないようにメモリをたくさん積んでほしい。予算は22万円。", 
    targetType: "EDITING", 
    budget: 220000 
  }
};

export const getAIPCAnalysis = async (build: PCBuild): Promise<string> => {
  // If no AI instance, return mock analysis
  if (!ai) {
    return mockAnalysis(build);
  }

  const partsList = Object.entries(build)
    .map(([cat, part]) => `${cat}: ${part ? part.name : 'Missing'}`)
    .join('\n');

  const prompt = `
    You are a friendly and expert computer science teacher for a high school "Information I" class.
    Analyze the following PC configuration built by a student:
    
    ${partsList}
    
    Please provide a concise evaluation (max 150 words) covering:
    1. Overall balance of the system.
    2. Potential bottlenecks (e.g., strong CPU with weak GPU).
    3. Suitable use cases (Office, Gaming, Video Editing).
    
    Keep the tone encouraging and educational. Use Japanese.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || "解析できませんでした。";
  } catch (error) {
    console.warn("Gemini API Error (falling back to mock):", error);
    return mockAnalysis(build);
  }
};

export const generateQuizScenario = async (topic: string = "OFFICE"): Promise<{ scenario: string, targetType: string, budget: number }> => {
  // If no AI or if offline, return predetermined robust scenarios
  if (!ai) {
    // Add artificial delay to simulate loading
    await new Promise(resolve => setTimeout(resolve, 800));
    return MOCK_SCENARIOS[topic] || MOCK_SCENARIOS["OFFICE"];
  }

  let topicInstruction = "";
  if (topic === "OFFICE") topicInstruction = "Create a scenario for a low-budget Office/Study PC. The budget should be very tight (around 90,000 JPY).";
  if (topic === "GAMING") topicInstruction = "Create a scenario for a Gaming PC. The budget should be around 180,000 JPY.";
  if (topic === "EDITING") topicInstruction = "Create a scenario for a Video Editing/Creator PC. The budget should be around 220,000 JPY.";

  const prompt = `
    Create a short, realistic scenario for a high school student learning about PC building. 
    ${topicInstruction}
    The client has a specific need.
    
    Return a JSON object with:
    - "scenario": The description of the client's needs (Japanese).
    - "targetType": One of "GAMING", "EDITING", "OFFICE".
    - "budget": An integer representing the budget in JPY.

    Example format:
    {"scenario": "...", "targetType": "GAMING", "budget": 150000}
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });
    
    const text = response.text;
    if (!text) throw new Error("No response");
    return JSON.parse(text);
  } catch (error) {
    console.warn("Gemini API Error (falling back to mock):", error);
    return MOCK_SCENARIOS[topic] || MOCK_SCENARIOS["OFFICE"];
  }
};

// Fallback logic for when AI is unavailable
const mockAnalysis = (build: PCBuild): string => {
  const cpu = build[PartCategory.CPU];
  const gpu = build[PartCategory.GPU];
  const ram = build[PartCategory.RAM];
  
  let analysis = "【AI先生（オフラインモード）の評価】\n";
  
  if (!cpu || !ram) return "パーツが足りません。まずはCPUとメモリを選びましょう。";

  if (gpu && gpu.name.includes("RTX") && ram.capacity && ram.capacity >= 16) {
    analysis += "素晴らしい構成です！高性能なGPUと十分なメモリがあり、ゲームも動画編集も快適にこなせます。バランスが良いですね。";
  } else if (gpu && gpu.name.includes("RTX") && ram.capacity && ram.capacity < 16) {
    analysis += "惜しい！GPUは良いですが、メモリが少し足りません。最新のゲームをするなら16GB以上あると安心です。";
  } else if (!gpu || gpu.name.includes("内蔵")) {
    analysis += "事務作業や動画視聴には十分なスペックです。ただ、3Dゲームをするにはグラフィックボードが必要です。";
  } else {
    analysis += "バランスの取れた構成です。用途に合わせて周辺機器も選びましょう。";
  }
  
  return analysis;
};
