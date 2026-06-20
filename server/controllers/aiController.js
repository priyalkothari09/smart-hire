const Resume = require('../models/Resume');
const Job = require('../models/Job');
const { scoreResumeAgainstJob, generateCoverLetter } = require('../services/aiService');
const { semanticSearchJobs } = require('../services/pineconeService');

// @POST /api/ai/match-job — Candidate sends { jobId } → gets match score
// (Standalone version, same behaviour as resumeController's scoreAgainstJob)
const matchJob = async (req, res) => {
  try {
    const { jobId } = req.body;
    if (!jobId) return res.status(400).json({ message: 'jobId is required' });

    const resume = await Resume.findOne({ candidate: req.user._id });
    if (!resume) return res.status(404).json({ message: 'Please upload your resume first' });

    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ message: 'Job not found' });

    console.log(`🎯 [AI] Matching resume against: ${job.title}`);
    const result = await scoreResumeAgainstJob(
      resume.extractedText,
      job.title,
      job.description || `${job.title} at ${job.company}. Skills: ${(job.skills || []).join(', ')}`
    );

    res.json({
      jobId: job._id,
      jobTitle: job.title,
      company: job.company,
      ...result,
    });

  } catch (error) {
    console.error('❌ matchJob error:', error.message);
    res.status(500).json({ message: error.message });
  }
};

// @POST /api/ai/cover-letter — Candidate sends { jobId } → gets a personalized cover letter
const getCoverLetter = async (req, res) => {
  try {
    const { jobId } = req.body;
    if (!jobId) return res.status(400).json({ message: 'jobId is required' });

    const resume = await Resume.findOne({ candidate: req.user._id });
    if (!resume) return res.status(404).json({ message: 'Please upload your resume first' });

    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ message: 'Job not found' });

    console.log(`✍️  [AI] Generating cover letter for: ${job.title} at ${job.company}`);
    const coverLetter = await generateCoverLetter(
      resume.extractedText,
      job.title,
      job.company,
      job.description || `${job.title} at ${job.company}. Skills: ${(job.skills || []).join(', ')}`
    );

    res.json({
      jobId: job._id,
      jobTitle: job.title,
      company: job.company,
      coverLetter,
    });

  } catch (error) {
    console.error('❌ getCoverLetter error:', error.message);
    res.status(500).json({ message: error.message });
  }
};

// @GET /api/ai/job-recommendations — Candidate gets jobs recommended via Pinecone
// based on the content of their uploaded resume
const getJobRecommendations = async (req, res) => {
  try {
    const resume = await Resume.findOne({ candidate: req.user._id });
    if (!resume) {
      return res.status(404).json({ message: 'Please upload your resume first to get recommendations' });
    }

    // Build a query from resume skills + a slice of extracted text
    const queryText = [
      (resume.aiSkills || []).join(', '),
      resume.extractedText?.slice(0, 1500) || '',
    ].filter(Boolean).join(' — ');

    console.log('🔮 [AI] Generating job recommendations from resume...');
    const matches = await semanticSearchJobs(queryText, 10);

    if (matches.length === 0) {
      return res.json({ recommendations: [] });
    }

    const jobIds = matches.map(m => m.jobId);
    const jobs = await Job.find({ _id: { $in: jobIds }, isActive: true })
      .populate('employer', 'name company');

    // Attach relevance score and sort by it
    const scoreMap = {};
    matches.forEach(m => { scoreMap[m.jobId] = m.score; });

    const recommendations = jobs
      .map(j => ({ ...j.toObject(), matchScore: Math.round((scoreMap[j._id.toString()] || 0) * 100) }))
      .sort((a, b) => b.matchScore - a.matchScore);

    res.json({ recommendations });

  } catch (error) {
    console.error('❌ getJobRecommendations error:', error.message);
    res.status(500).json({ message: error.message });
  }
};

module.exports = { matchJob, getCoverLetter, getJobRecommendations };