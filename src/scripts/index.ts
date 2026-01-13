import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from "@google/generative-ai";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY!;
const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",
});

const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 8192,
  responseMimeType: "application/json",
};

const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
];

export const chatSession = model.startChat({
  generationConfig,
  safetySettings,
});

export const generateJobDetailsFromResume = async (resumeText: string) => {
  const prompt = `
    Analyze the following resume text and extract the candidate's likely Job Information.
    Return a STRICT JSON object (no markdown, no code blocks) with the following fields:
    
    {
      "position": "Job Title (e.g. Senior Frontend Engineer)",
      "description": "A brief professional summary based on the resume (2-3 sentences)",
      "experience": Number (Years of experience, strictly a number. If 0 or parsing fails, return 0),
      "techStack": "Comma separated string of key technologies found (e.g. React, Node.js, AWS)"
    }

    Resume Text:
    ${resumeText}
  `;

  // Create a fresh chat for this one-off task to differentiate from the persistent session if needed, 
  // or just use sendMessage on the existing one if statelessness is not required. 
  // Ideally, use model.generateContent for one-shot, but we'll reuse the config.
  const result = await model.generateContent({
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig,
    safetySettings
  });

  return result.response.text();
};
