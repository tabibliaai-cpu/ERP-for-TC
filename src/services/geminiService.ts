import { GoogleGenerativeAI } from "@google/generative-ai";

let genAI: GoogleGenerativeAI | null = null;

const getGenAI = () => {
  if (!genAI) {
    const apiKey = (import.meta as any).env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("GEMINI_API_KEY is not defined. AI features will be disabled.");
      return null;
    }
    genAI = new GoogleGenerativeAI(apiKey);
  }
  return genAI;
};

export const geminiService = {
  async generateSubjectDescription(title: string, department: string) {
    const ai = getGenAI();
    if (!ai) throw new Error("AI Service Unavailable");

    const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
      You are an academic curriculum designer for a prestigious theological institution called Covenant Seminary.
      Generate a professional, high-fidelity academic description for a subject titled "${title}" 
      in the ${department} department.
      
      The description should:
      1. Be approximately 3-4 sentences long.
      2. Use terms like 'institutional framework', 'scholastic inquiry', 'foundational exegesis', or 'ecclesiastical history' where appropriate.
      3. Focus on academic rigor and institutional values.
      
      Output ONLY the description text.
    `;

    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text().trim();
    } catch (error) {
      console.error("AI Generation Error:", error);
      throw error;
    }
  },

  async generateSyllabusDraft(title: string, department: string) {
    const ai = getGenAI();
    if (!ai) throw new Error("AI Service Unavailable");

    const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
      You are an academic curriculum designer.
      Generate a professional, high-fidelity academic syllabus draft for a subject titled "${title}" 
      in the ${department} department.
      
      The syllabus should include:
      1. Course Objectives (3-4 bullet points)
      2. Course Structure (e.g. 14 weeks or modular outline)
      3. Assessment Methods
      4. Required Reading (suggest 2-3 standard texts)
      
      Maintain a formal, institutional, and academic tone. Output ONLY the syllabus text.
    `;

    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text().trim();
    } catch (error) {
      console.error("AI Generation Error:", error);
      throw error;
    }
  },

  async generateSyllabusOutline(title: string, code: string) {
    const ai = getGenAI();
    if (!ai) throw new Error("AI Service Unavailable");

    const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
      Generate a 4-week high-level syllabus outline for the subject "${title}" (${code}).
      For each week, provide a short title and a 1-sentence description of the core topic.
      Maintain a formal, institutional tone.
      
      Format:
      Week 1: [Title] - [Description]
      Week 2: [Title] - [Description]
      Week 3: [Title] - [Description]
      Week 4: [Title] - [Description]
    `;

    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text().trim();
    } catch (error) {
      console.error("AI Syllabus Error:", error);
      throw error;
    }
  }
};
