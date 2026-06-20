const matchResumeToJob = async (resumeText, jobDescription) => {
  try {
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'sk-your-openai-key-here') {
      const mockScore = Math.floor(Math.random() * 40) + 60;
      return {
        matchScore: mockScore,
        matchFeedback: `Your profile is a ${mockScore}% match for this position.`,
        missingSkills: ['Docker', 'AWS'],
        matchingSkills: ['React', 'Node.js', 'MongoDB'],
      };
    }

    const OpenAI = require('openai');
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const prompt = `
Compare this resume with the job description and respond ONLY with valid JSON.

Resume: ${resumeText.slice(0, 2000)}
Job Description: ${jobDescription.slice(0, 1000)}

Respond with exactly this JSON:
{
  "matchScore": <number 0-100>,
  "matchFeedback": "<2 sentence feedback>",
  "matchingSkills": ["skill1", "skill2"],
  "missingSkills": ["skill1", "skill2"]
}`;

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 500,
    });

    return JSON.parse(response.choices[0].message.content.trim());

  } catch (error) {
    console.error('Job Match Error:', error.message);
    return {
      matchScore: 65,
      matchFeedback: 'Good potential match for this position.',
      matchingSkills: [],
      missingSkills: [],
    };
  }
};

const generateCoverLetter = async (resumeText, jobTitle, company) => {
  try {
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'sk-your-openai-key-here') {
      return `Dear Hiring Manager at ${company},

I am writing to express my strong interest in the ${jobTitle} position at ${company}. With my background and experience, I am confident in my ability to contribute effectively to your team.

My skills in communication, problem-solving, and collaboration make me a strong candidate for this role. I am passionate about delivering high-quality work and continuously growing my expertise.

I would welcome the opportunity to discuss how my background aligns with your needs. Thank you for considering my application.

Sincerely,
[Your Name]`;
    }

    const OpenAI = require('openai');
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const prompt = `Write a professional 3 paragraph cover letter for a candidate applying to ${jobTitle} at ${company}.
Resume: ${resumeText.slice(0, 1500)}
No placeholders except [Your Name] at the end.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 600,
    });

    return response.choices[0].message.content.trim();

  } catch (error) {
    console.error('Cover Letter Error:', error.message);
    return 'Cover letter generation failed. Please try again.';
  }
};

module.exports = { matchResumeToJob, generateCoverLetter };