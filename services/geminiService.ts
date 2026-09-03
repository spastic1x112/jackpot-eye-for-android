
import { AnalysisResult } from "../types.ts";

export async function analyzeGameFrame(base64Image: string): Promise<AnalysisResult | null> {
  try {
    const res = await fetch('/api/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ base64Image }),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      const errorStr = errorData.error || "";
      if (res.status === 429 || errorStr === 'QUOTA_EXCEEDED') {
        throw new Error("QUOTA_EXCEEDED");
      }
      if (res.status === 503 || errorStr === 'SERVER_COMMUNICATION_ERROR') {
        throw new Error("SERVER_COMMUNICATION_ERROR");
      }
      throw new Error(errorStr || `HTTP error! status: ${res.status}`);
    }

    const data = await res.json();
    return data as AnalysisResult;
  } catch (error: any) {
    console.error("Analysis Error:", error);
    throw error;
  }
}
