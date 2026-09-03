import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
// Increase the payload size limit if base64 images are large
app.use(express.json({ limit: '50mb' }));

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

app.post('/api/analyze', async (req, res) => {
  const { base64Image } = req.body;
  if (!base64Image) {
    return res.status(400).json({ error: 'base64Image is required' });
  }

  // Read API key securely from environment
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("GEMINI_API_KEY is not set on server");
    return res.status(500).json({ error: 'Internal server error: API key missing' });
  }

  const ai = new GoogleGenAI({ apiKey });

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
    if (!text) {
        return res.status(500).json({ error: 'Failed to generate content' });
    }
    const result = JSON.parse(text.trim());
    return res.json(result);
  } catch (error) {
    console.error("Analysis Error:", error);
    const errorMessage = error?.message || "";

    // Pass errors down to the client so it can handle them as before
    if (errorMessage.includes('ProxyUnaryCall') || errorMessage.includes('xhr error') || errorMessage.includes('Rpc failed')) {
      return res.status(503).json({ error: "SERVER_COMMUNICATION_ERROR" });
    }

    if (errorMessage.includes('429') || error?.status === 429 || errorMessage.includes('quota')) {
      return res.status(429).json({ error: "QUOTA_EXCEEDED" });
    }

    return res.status(500).json({ error: "INTERNAL_SERVER_ERROR", message: errorMessage });
  }
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
