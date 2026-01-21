import { GoogleGenAI, Type } from "@google/genai";
import { BusinessIdea, UserPreferences } from "../types";

// Ensure process.env.API_KEY is properly defined in your environment
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function generateBusinessIdeas(prefs: UserPreferences): Promise<BusinessIdea[]> {
  const prompt = `You are a world-class startup consultant specializing in the Pakistan market. Generate exactly 2 (two) personalized, high-potential business ideas for:
  - Budget: ${prefs.budgetRange}
  - Skills: ${prefs.skills}
  - Interests: ${prefs.industryInterest}
  - Location: ${prefs.location}

  CRITICAL INSTRUCTION: All text content MUST be written in Roman Urdu.
  Provide deep strategic analysis including SWOT and revenue models.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            description: { type: Type.STRING },
            targetMarket: { type: Type.STRING },
            estimatedBudget: { type: Type.STRING },
            firstSteps: { type: Type.ARRAY, items: { type: Type.STRING } },
            resources: { type: Type.ARRAY, items: { type: Type.STRING } },
            swot: {
              type: Type.OBJECT,
              properties: {
                strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
                weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
                opportunities: { type: Type.ARRAY, items: { type: Type.STRING } },
                threats: { type: Type.ARRAY, items: { type: Type.STRING } },
              },
              required: ["strengths", "weaknesses", "opportunities", "threats"]
            },
            revenueStreams: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
          required: ["name", "description", "targetMarket", "estimatedBudget", "firstSteps", "resources", "swot", "revenueStreams"]
        }
      }
    }
  });

  try {
    const rawJson = response.text.trim();
    const parsed = JSON.parse(rawJson);
    return parsed.map((item: any) => ({
      ...item,
      id: Math.random().toString(36).substr(2, 9),
      generatedAt: new Date().toISOString()
    }));
  } catch (error) {
    console.error("Gemini response parsing error:", error, "Raw text:", response.text);
    throw new Error("Idea generate karne mein takneeki masla hua. Please dubara koshish karein.");
  }
}

export async function refineIdea(originalIdea: BusinessIdea, userQuestion: string): Promise<string> {
  const prompt = `User has a question about this business idea: "${originalIdea.name}".
  Original Description: ${originalIdea.description}
  User Question: ${userQuestion}
  
  Please provide a helpful, detailed response in Roman Urdu that helps the user implement this specific idea. Keep it professional and encouraging.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt
  });

  return response.text || "Maaf kijiye, main is waqt is sawal ka jawab nahi de sakta.";
}