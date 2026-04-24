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
  },

  // ── AI Curriculum Generator ─────────────────────────────
  async generateFullCurriculum(programName: string, programCode: string, totalSemesters: number, department: string) {
    const ai = getGenAI();
    if (!ai) throw new Error("AI Service Unavailable");

    const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
      You are a senior academic curriculum designer for a prestigious theological seminary.
      Generate a complete ${totalSemesters}-semester curriculum for the program "${programName}" (${programCode})
      in the ${department} department.
      
      For EACH semester, provide 4-6 courses with:
      - Course code (e.g. OT-101, NT-201)
      - Course name (concise, academic)
      - Credits (2, 3, or 4)
      - Type (core or elective)
      
      Respond STRICTLY in this JSON format (no markdown, no code fences):
      {"semesters":[{"semesterNumber":1,"courses":[{"code":"OT-101","name":"Old Testament Survey","credits":3,"type":"core"}]}]}
    `;

    try {
      const result = await model.generateContent(prompt);
      const text = result.response.text().trim();
      const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const parsed = JSON.parse(cleaned);
      if (!parsed.semesters || !Array.isArray(parsed.semesters)) {
        throw new Error("Invalid AI response format");
      }
      return parsed.semesters as { semesterNumber: number; courses: { code: string; name: string; credits: number; type: string }[] }[];
    } catch (error) {
      console.error("AI Curriculum Generation Error:", error);
      throw error;
    }
  },

  async suggestCourses(programName: string, department: string, existingCourses: string[]) {
    const ai = getGenAI();
    if (!ai) throw new Error("AI Service Unavailable");

    const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
      You are an academic advisor for a theological seminary.
      The program "${programName}" in ${department} already has these courses: ${existingCourses.join(', ')}.
      Suggest 5 additional courses that would complement this program.
      
      For each course provide: code, name, credits, type (core/elective), and a brief rationale.
      
      Respond STRICTLY in this JSON format (no markdown, no code fences):
      {"suggestions":[{"code":"TH-401","name":"Advanced Hermeneutics","credits":3,"type":"elective","rationale":"Builds on foundational exegesis skills"}]}
    `;

    try {
      const result = await model.generateContent(prompt);
      const text = result.response.text().trim();
      const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const parsed = JSON.parse(cleaned);
      return parsed.suggestions || [];
    } catch (error) {
      console.error("AI Course Suggestion Error:", error);
      throw error;
    }
  },

  async validatePrerequisites(courseName: string, courseCode: string, prerequisiteNames: string[]) {
    const ai = getGenAI();
    if (!ai) throw new Error("AI Service Unavailable");

    const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
      You are an academic curriculum validator.
      Course: "${courseName}" (${courseCode})
      Proposed prerequisites: ${prerequisiteNames.join(', ') || 'None'}
      
      Analyze if these prerequisites make academic sense. Check for:
      1. Logical progression (prerequisites should be foundational)
      2. No circular dependencies
      3. Appropriate difficulty level
      
      Respond STRICTLY in this JSON format (no markdown, no code fences):
      {"isValid":true,"issues":[],"suggestions":["Consider adding NT-101 as a prerequisite"]}
    `;

    try {
      const result = await model.generateContent(prompt);
      const text = result.response.text().trim();
      const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      return JSON.parse(cleaned) as { isValid: boolean; issues: string[]; suggestions: string[] };
    } catch (error) {
      console.error("AI Validation Error:", error);
      throw error;
    }
  }
};
