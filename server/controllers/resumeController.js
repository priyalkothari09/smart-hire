const Resume = require('../models/Resume');
const Job = require('../models/Job');
const { analyzeResume, scoreResumeAgainstJob } = require('../services/aiService');

// ─── PDF text extraction using pdf2json ────────────────────────────────────
const extractTextFromPDF = (filePath) => {
  return new Promise((resolve, reject) => {
    const PDFParser = require('pdf2json');
    const pdfParser = new PDFParser();

    pdfParser.on('pdfParser_dataReady', (pdfData) => {
      try {
        const text = pdfData.Pages.map(page =>
          page.Texts.map(t => decodeURIComponent(t.R.map(r => r.T).join(''))).join(' ')
        ).join('\n');
        resolve(text);
      } catch (e) {
        resolve('Resume text extracted');
      }
    });

    pdfParser.on('pdfParser_dataError', (err) => {
      reject(new Error(err.parserError));
    });

    pdfParser.loadPDF(filePath);
  });
};

// @POST /api/resume/upload — Candidate uploads resume
const uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a PDF file' });
    }

    console.log('📄 File received:', req.file.filename);

    const extractedText = await extractTextFromPDF(req.file.path);
    console.log('📝 Text extracted, length:', extractedText.length);

    console.log('🤖 Running AI analysis...');
    const aiResult = await analyzeResume(extractedText);
    console.log('✅ AI Score:', aiResult.score);

    // Replace existing resume
    await Resume.deleteOne({ candidate: req.user._id });

    const resume = await Resume.create({
      candidate: req.user._id,
      fileName: req.file.originalname,
      filePath: req.file.path,
      extractedText,
      aiScore: aiResult.score,
      aiFeedback: aiResult.feedback,
      aiSkills: aiResult.skills,
      aiStrengths: aiResult.strengths,
      aiWeaknesses: aiResult.weaknesses,
    });

    res.status(201).json({
      message: 'Resume uploaded and analyzed successfully',
      resume: {
        _id: resume._id,
        fileName: resume.fileName,
        aiScore: resume.aiScore,
        aiFeedback: resume.aiFeedback,
        aiSkills: resume.aiSkills,
        aiStrengths: resume.aiStrengths,
        aiWeaknesses: resume.aiWeaknesses,
        createdAt: resume.createdAt,
        updatedAt: resume.updatedAt,
      },
    });

  } catch (error) {
    console.error('❌ Resume Upload Error:', error.message);
    res.status(500).json({ message: error.message });
  }
};

// @GET /api/resume/my — Candidate gets their resume
const getMyResume = async (req, res) => {
  try {
    const resume = await Resume.findOne({ candidate: req.user._id });
    if (!resume) return res.status(404).json({ message: 'No resume found' });
    res.json(resume);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @POST /api/resume/score-job — Candidate checks match against a job
const scoreAgainstJob = async (req, res) => {
  try {
    const { jobId } = req.body;
    if (!jobId) return res.status(400).json({ message: 'jobId is required' });

    // Get candidate's resume
    const resume = await Resume.findOne({ candidate: req.user._id });
    if (!resume) return res.status(404).json({ message: 'Please upload your resume first' });

    // Get job details
    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ message: 'Job not found' });

    console.log(`🤖 Scoring resume against: ${job.title}`);
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
    console.error('❌ scoreAgainstJob error:', error.message);
    res.status(500).json({ message: error.message });
  }
};

// @GET /api/resume/score/:jobId/:candidateId — Employer scores an applicant
const scoreApplicantResume = async (req, res) => {
  try {
    const { jobId, candidateId } = req.params;

    // Get job — verify employer owns it
    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ message: 'Job not found' });

    if (job.employer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Get candidate's resume
    const resume = await Resume.findOne({ candidate: candidateId });
    if (!resume) return res.status(404).json({ message: 'Candidate has no resume uploaded' });

    console.log(`🤖 Employer scoring: ${resume.fileName} vs ${job.title}`);
    const result = await scoreResumeAgainstJob(
      resume.extractedText,
      job.title,
      job.description || `${job.title} at ${job.company}. Skills: ${(job.skills || []).join(', ')}`
    );

    res.json({
      candidateId,
      jobId: job._id,
      jobTitle: job.title,
      resumeFileName: resume.fileName,
      ...result,
    });

  } catch (error) {
    console.error('❌ scoreApplicantResume error:', error.message);
    res.status(500).json({ message: error.message });
  }
};

module.exports = { uploadResume, getMyResume, scoreAgainstJob, scoreApplicantResume };