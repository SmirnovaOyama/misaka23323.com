import { GoogleGenAI, Type } from "@google/genai";
import { Grid, HintResponse, Direction } from "../types";

const API_KEY = process.env.API_KEY || '';

const ai = new GoogleGenAI({ apiKey: API_KEY });

export const getBestMove = async (grid: Grid): Promise<HintResponse> => {
  if (!API_KEY) {
    throw new Error("API Key not configured");
  }

  const gridString = grid.map(row => row.join('\t')).join('\n');
  
  const prompt = `
    You are an expert 2048 game AI. 
    Here is the current board state (0 represents an empty cell):
    
    ${gridString}
    
    Analyze the board carefully. 
    Rules:
    1. Merge tiles with the same number to double them.
    2. Try to keep the highest number in a corner (usually bottom-right or bottom-left).
    3. Ensure the board doesn't get clogged up.
    
    Return the single BEST move direction (UP, DOWN, LEFT, RIGHT) and a very short reasoning string (max 10 words).
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            direction: {
              type: Type.STRING,
              enum: [Direction.UP, Direction.DOWN, Direction.LEFT, Direction.RIGHT],
              description: "The best move direction"
            },
            reasoning: {
              type: Type.STRING,
              description: "Short reasoning for the move"
            }
          },
          required: ["direction", "reasoning"],
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    const json = JSON.parse(text) as HintResponse;
    return json;
  } catch (error) {
    console.error("Gemini API Error:", error);
    // Fallback if API fails
    return {
      direction: Direction.DOWN,
      reasoning: "AI unavailable, try Down."
    };
  }
};
