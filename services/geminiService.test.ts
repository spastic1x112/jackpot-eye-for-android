import { describe, it, expect, vi } from 'vitest';
import { analyzeGameFrame } from './geminiService';

// Mock the GoogleGenAI class and generateContent method
vi.mock('@google/genai', () => {
  return {
    GoogleGenAI: class {
      models = {
        generateContent: vi.fn().mockResolvedValue({
          text: '' // Simulate empty response text
        })
      };
    },
    Type: {
      OBJECT: 'OBJECT',
      STRING: 'STRING',
      NUMBER: 'NUMBER',
      ARRAY: 'ARRAY'
    }
  };
});

describe('geminiService', () => {
  it('should return null when the API response text is empty', async () => {
    // Arrange
    const dummyBase64Image = 'dummy_base64_data';

    // Act
    const result = await analyzeGameFrame(dummyBase64Image);

    // Assert
    expect(result).toBeNull();
  });
});
