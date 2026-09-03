
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult } from "../types.ts";

const ANALYSIS_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    strategy: {
      type: Type.STRING,
      description: "Brief strategy based on reels.",
    },
    betAmount: {
      type: Type.STRING,
      description: "Amount (e.g., '1.00').",
    },
    confidence: {
      type: Type.NUMBER,
      description: "Confidence 0-1.",
    },
    detectedSymbols: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Reel symbols.",
    },
    volatility: {
      type: Type.STRING,
      description: "Low, Medium, High.",
    },
    recommendation: {
      type: Type.STRING,
      description: "One short tip.",
    }
  },
  required: ["strategy", "betAmount", "confidence", "detectedSymbols", "volatility", "recommendation"],
};

export async function analyzeGameFrame(base64Image: string): Promise<AnalysisResult | null> {
  // Always create a fresh instance for robustness against internal state issues
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        {
          parts: [
            { text: "Slot reels: identify symbols, strategy, bet, confidence, volatility. Short JSON only." },
            {
              inlineData: {
                mimeType: "image/jpeg",
                data: base64Image
              }
            }
          ]
        }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: ANALYSIS_SCHEMA,
      }
    });

    const text = response.text;
    if (!text) return null;
    return JSON.parse(text.trim()) as AnalysisResult;
  } catch (error: any) {
    const errorMessage = error?.message || "";
    
    // Handle specific RPC/Proxy errors that can happen in browser environments
    if (errorMessage.includes('ProxyUnaryCall') || errorMessage.includes('xhr error') || errorMessage.includes('Rpc failed')) {
      throw new Error("SERVER_COMMUNICATION_ERROR");
    }

    if (errorMessage.includes('429') || error?.status === 429 || errorMessage.includes('quota')) {
      throw new Error("QUOTA_EXCEEDED");
    }
    
    console.error("Analysis Error:", error);
    throw error;
  }
}
