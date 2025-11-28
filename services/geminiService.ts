import { GoogleGenAI } from "@google/genai";
import { PCBuild, Part, PartCategory } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getAIPCAnalysis = async (build: PCBuild): Promise<string> => {
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
    console.error("Gemini Error:", error);
    return "AIサービスに接続できませんでした。APIキーを確認してください。";
  }
};

export const generateQuizScenario = async (topic?: string): Promise<{ scenario: string, targetType: string, budget: number }> => {
  let topicInstruction = "";
  if (topic === "OFFICE") topicInstruction = "Create a scenario for a low-budget Office/Study PC. The budget should be very tight (around 90,000 JPY), forcing the student to choose entry-level parts, generic peripherals, and potentially free OS if available, or make sacrifices.";
  if (topic === "GAMING") topicInstruction = "Create a scenario for a Gaming PC. The budget should be around 180,000 JPY. This requires balancing a good GPU with other parts.";
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
    // Fallback if AI fails - Strict/Realistic pricing
    // Office: App(30k) + Win(15k) + Monitor(15k) + Input(2k) = 62k fixed. 
    // Remaining 28k for CPU(15k)+RAM(4k)+SSD(5k)+MB/Case. Very tight.
    if (topic === "GAMING") return { scenario: "最新の3Dオープンワールドゲームを高画質で遊びたい！周辺機器もゲーミング仕様で頼む。予算は厳守で。", targetType: "GAMING", budget: 180000 };
    if (topic === "EDITING") return { scenario: "YouTube用の4K動画編集を始めたい。書き出し速度を重視してください。予算内で最高のスペックを。", targetType: "EDITING", budget: 220000 };
    return { 
      scenario: "大学のレポート作成とネットサーフィン用にPCが欲しい。Officeソフトは必須。できるだけ安く済ませたい。", 
      targetType: "OFFICE",
      budget: 90000 
    };
  }
};