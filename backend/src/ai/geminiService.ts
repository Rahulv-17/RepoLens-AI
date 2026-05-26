import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'mock_key');

export const generateRepoSummary = async (repoName: string, techStack: string[], filesCount: number): Promise<string> => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return `Mock summary for ${repoName}: A modular ${techStack.join(', ')} application with ${filesCount} files. Ensure to add GEMINI_API_KEY to see real AI summaries.`;
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });
    
    const prompt = `You are an expert software architect. Briefly summarize a repository named ${repoName} built using ${techStack.join(', ')} with ${filesCount} files. Keep it under 3 sentences, sounding professional and insightful like a developer tool.`;
    
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error("Gemini AI error:", error);
    return "Failed to generate AI summary.";
  }
};

export const chatWithRepo = async (question: string, contextContext: string): Promise<string> => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return "I'm sorry, AI chat is unavailable because GEMINI_API_KEY is not configured.";
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });
    
    const prompt = `You are RepoLens AI, an intelligent coding assistant. Answer the user's question about their codebase using the context provided.\n\nContext:\n${contextContext}\n\nQuestion: ${question}\n\nAnswer concisely and accurately:`;
    
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error("Gemini AI error:", error);
    return "Error communicating with AI.";
  }
};
