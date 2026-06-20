const { GoogleGenAI } = require('@google/genai');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const TEXT_MODEL = 'gemini-2.5-flash';       // fast + free-tier friendly
const EMBED_MODEL = 'gemini-embedding-001';  // current model (text-embedding-004 was shut down Jan 2026)

// Helper — strips markdown fences and parses JSON safely
const parseJSON = (raw) => {
  const clean = raw.replace(/```json|```/g, '').trim();
  return JSON.parse(clean);
};

// ─── 1. General resume analysis (used on upload) ───────────────────────────
const analyzeResume = async (resumeText) => {
  try {
    const prompt = `You are an expert HR recruiter and resume analyst.
Analyze the following resume and respond ONLY with a valid JSON object — no markdown, no extra text.

Resume:
${resumeText.slice(0, 3000)}

Respond with exactly this JSON:
{
  "score": <number 0-100>,
  "feedback": "<2-3 sentence overall assessment>",
  "skills": ["skill1", "skill2", ...],
  "strengths": ["strength1", "strength2", "strength3"],
  "weaknesses": ["weakness1", "weakness2"]
}`;

    const response = await ai.models.generateContent({
      model: TEXT_MODEL,
      contents: prompt,
      config: { temperature: 0.3, maxOutputTokens: 800 },
    });

    return parseJSON(response.text.trim());

  } catch (error) {
    console.error('❌ analyzeResume error:', error.message);
    return {
      score: 50,
      feedback: 'Resume uploaded successfully. AI analysis unavailable at the moment.',
      skills: [],
      strengths: [],
      weaknesses: [],
    };
  }
};

// ─── 2. Score resume AGAINST a specific job description ────────────────────
const scoreResumeAgainstJob = async (resumeText, jobTitle, jobDescription) => {
  try {
    const prompt = `You are a senior technical recruiter. Score how well this candidate's resume matches the job below.
Respond ONLY with a valid JSON object — no markdown, no extra text.

JOB TITLE: ${jobTitle}

JOB DESCRIPTION:
${(jobDescription || '').slice(0, 1500)}

CANDIDATE RESUME:
${resumeText.slice(0, 2000)}

Respond with exactly this JSON:
{
  "matchScore": <number 0-100>,
  "verdict": "<one of: Strong Match | Good Match | Partial Match | Weak Match>",
  "summary": "<2-3 sentence explanation of the match>",
  "matchedSkills": ["skill1", "skill2"],
  "missingSkills": ["skill1", "skill2"],
  "recommendation": "<one sentence hiring recommendation>"
}`;

    const response = await ai.models.generateContent({
      model: TEXT_MODEL,
      contents: prompt,
      config: { temperature: 0.2, maxOutputTokens: 600 },
    });

    return parseJSON(response.text.trim());

  } catch (error) {
    console.error('❌ scoreResumeAgainstJob error:', error.message);
    return {
      matchScore: 0,
      verdict: 'Unable to score',
      summary: 'AI scoring unavailable at the moment.',
      matchedSkills: [],
      missingSkills: [],
      recommendation: 'Please review manually.',
    };
  }
};

// ─── 3. Generate embedding for text (for Pinecone) — forced to 768 dims ───
const generateEmbedding = async (text) => {
  try {
    const response = await ai.models.embedContent({
      model: EMBED_MODEL,
      contents: [text.slice(0, 8000)],
      config: { outputDimensionality: 768 },
    });

    // Handle both possible response shapes defensively
    const values = response?.embeddings?.[0]?.values || response?.embedding?.values;

    if (!values || values.length === 0) {
      console.error('❌ generateEmbedding: empty values in response', JSON.stringify(response).slice(0, 300));
      return null;
    }

    return values;
  } catch (error) {
    console.error('❌ generateEmbedding error:', error.message);
    return null;
  }
};

// ─── 4. Generate a personalized cover letter ───────────────────────────────
const generateCoverLetter = async (resumeText, jobTitle, company, jobDescription) => {
  try {
    const prompt = `You are an expert career coach writing a compelling, personalized cover letter.
Use the candidate's actual resume content — real skills and experience — don't invent anything.
Keep it concise: 3-4 short paragraphs, professional but warm tone. No placeholders like [Your Name].
Respond ONLY with the cover letter text, no markdown, no JSON, no preamble.

JOB TITLE: ${jobTitle}
COMPANY: ${company}

JOB DESCRIPTION:
${(jobDescription || '').slice(0, 1200)}

CANDIDATE RESUME:
${resumeText.slice(0, 2000)}`;

    const response = await ai.models.generateContent({
      model: TEXT_MODEL,
      contents: prompt,
      config: { temperature: 0.6, maxOutputTokens: 700 },
    });

    return response.text.trim();

  } catch (error) {
    console.error('❌ generateCoverLetter error:', error.message);
    return 'Unable to generate a cover letter at the moment. Please try again shortly.';
  }
};

module.exports = {
  analyzeResume,
  scoreResumeAgainstJob,
  generateEmbedding,
  generateCoverLetter,
};