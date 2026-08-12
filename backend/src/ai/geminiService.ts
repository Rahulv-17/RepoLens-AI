import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'mock_key');

export const generateRepoSummary = async (repoName: string, techStack: string[], filesCount: number): Promise<string> => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("API_KEY_MISSING");
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-3.6-flash' });
    
    const prompt = `You are an expert software architect. Briefly summarize a repository named ${repoName} built using ${techStack.join(', ')} with ${filesCount} files. Keep it under 3 sentences, sounding professional and insightful like a developer tool.`;
    
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error: any) {
    const errorMsg = error?.message || '';
    // Mask API key if present in error
    const safeError = errorMsg.replace(process.env.GEMINI_API_KEY || '', '[HIDDEN_API_KEY]');
    console.error("[generateRepoSummary] Gemini AI error:", safeError);
    
    if (errorMsg === "API_KEY_MISSING") return "Failed to generate AI summary: API Key is missing.";
    if (error?.status === 429 || safeError.includes('429')) return "Failed to generate AI summary: Rate limit exceeded.";
    if (error?.status === 401 || error?.status === 403 || safeError.includes('API key not valid')) return "Failed to generate AI summary: Invalid API Key.";
    if (error?.status === 400 && safeError.toLowerCase().includes('token')) return "Failed to generate AI summary: Context is too large (Oversized Context).";
    
    return `Failed to generate AI summary: Gemini API Error - ${safeError}`;
  }
};

export const chatWithRepo = async (question: string, contextContext: string): Promise<string> => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("API_KEY_MISSING");
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-3.6-flash' });
    
    const prompt = `You are RepoLens AI, an intelligent coding assistant. Answer the user's question about their codebase using the context provided.\n\nContext:\n${contextContext}\n\nQuestion: ${question}\n\nAnswer concisely and accurately:`;
    
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error: any) {
    const errorMsg = error?.message || '';
    const safeError = errorMsg.replace(process.env.GEMINI_API_KEY || '', '[HIDDEN_API_KEY]');
    console.error("[chatWithRepo] Gemini AI error:", safeError);
    
    if (errorMsg === "API_KEY_MISSING") throw new Error("API Key is missing. Please configure GEMINI_API_KEY.");
    if (error?.status === 429 || safeError.includes('429') || safeError.includes('quota')) throw new Error("AI service is currently rate limited or out of quota. Please try again later.");
    if (error?.status === 401 || error?.status === 403 || safeError.includes('API key not valid')) throw new Error("The configured Gemini API key is invalid.");
    if (error?.status === 400 && safeError.toLowerCase().includes('token')) throw new Error("Oversized context. Please narrow down your question or repository size.");
    
    throw new Error(`Gemini API Error: ${safeError}`);
  }
};
