import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function chatWithClide(message: string, history: { role: 'user' | 'model', parts: { text: string }[] }[] = []) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        ...history,
        { role: 'user', parts: [{ text: message }] }
      ],
      config: {
        systemInstruction: "You are Clide, an intelligent AI assistant built into the Eacoss Life web browser. You are helpful, concise, and tech-savvy. You help users navigate the web, summarize content, and answer questions. Your tone is friendly but professional.",
      },
    });

    return response.text || "I'm sorry, I couldn't process that.";
  } catch (error) {
    console.error("Error chatting with Clide:", error);
    return "Something went wrong. Please try again.";
  }
}

export async function summarizeUrl(url: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Summarize the content of this URL: ${url}`,
      config: {
        tools: [{ urlContext: {} }]
      }
    });
    return response.text;
  } catch (error) {
    console.error("Error summarizing URL:", error);
    return "I couldn't summarize this page.";
  }
}
