const Job = require('../models/Job');
const Application = require('../models/Application');
const { upsertJobEmbedding, deleteJobEmbedding, semanticSearchJobs, syncAllJobs } = require('../services/pineconeService');

// @GET /api/jobs — Get all active jobs with optional semantic search
const getJobs = async (req, res) => {
  try {
    const { search, location, type, skill, semantic } = req.query;

    // ── Semantic search path ──────────────────────────────────────────────
    if (search && (semantic === 'true' || search.split(' ').length > 2)) {
      const matches = await semanticSearchJobs(search, 20);

      if (matches.length > 0) {
        const jobIds = matches.map(m => m.jobId);
        let jobs = await Job.find({ _id: { $in: jobIds }, isActive: true })
          .populate('employer', 'name company');

        // Apply additional filters on top of semantic results
        if (location) jobs = jobs.filter(j => j.location?.toLowerCase().includes(location.toLowerCase()));
        if (type)     jobs = jobs.filter(j => j.type === type);
        if (skill)    jobs = jobs.filter(j => j.skills?.includes(skill));

        // Sort by Pinecone relevance score
        const scoreMap = {};
        matches.forEach(m => { scoreMap[m.jobId] = m.score; });
        jobs.sort((a, b) => (scoreMap[b._id.toString()] || 0) - (scoreMap[a._id.toString()] || 0));

        return res.json(jobs);
      }
      // If Pinecone returns nothing, fall through to keyword search
    }

    // ── Keyword search fallback ───────────────────────────────────────────
    let filter = { isActive: true };
    if (search)   filter.title    = { $regex: search, $options: 'i' };
    if (location) filter.location = { $regex: location, $options: 'i' };
    if (type)     filter.type     = type;
    if (skill)    filter.skills   = { $in: [skill] };

    const jobs = await Job.find(filter)
      .populate('employer', 'name company')
      .sort({ createdAt: -1 });

    res.json(jobs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @POST /api/jobs — Employer creates a job
const createJob = async (req, res) => {
  try {
    const job = await Job.create({ ...req.body, employer: req.user._id });

    // Index in Pinecone (non-blocking)
    upsertJobEmbedding(job).catch(e => console.error('Pinecone upsert failed:', e.message));

    res.status(201).json(job);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @GET /api/jobs/my — Employer's own jobs
const getMyJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ employer: req.user._id }).sort({ createdAt: -1 });

    const jobsWithCount = await Promise.all(
      jobs.map(async (job) => {
        const applicantCount = await Application.countDocuments({ job: job._id });
        return { ...job.toObject(), applicantCount };
      })
    );

    res.json(jobsWithCount);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @GET /api/jobs/:id — Get single job
const getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate('employer', 'name company');
    if (!job) return res.status(404).json({ message: 'Job not found' });
    res.json(job);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @PUT /api/jobs/:id — Employer updates a job
const updateJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });

    if (job.employer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const updatedJob = await Job.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });

    // Re-index updated job in Pinecone
    upsertJobEmbedding(updatedJob).catch(e => console.error('Pinecone update failed:', e.message));

    res.json(updatedJob);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @DELETE /api/jobs/:id — Employer deletes a job
const deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });

    if (job.employer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await job.deleteOne();

    // Remove from Pinecone
    deleteJobEmbedding(job._id).catch(e => console.error('Pinecone delete failed:', e.message));

    res.json({ message: 'Job deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @GET /api/jobs/stats — Employer dashboard stats
const getEmployerStats = async (req, res) => {
  try {
    const totalJobs  = await Job.countDocuments({ employer: req.user._id });
    const activeJobs = await Job.countDocuments({ employer: req.user._id, isActive: true });

    const myJobs = await Job.find({ employer: req.user._id });
    const jobIds = myJobs.map(j => j._id);

    const totalApplications = await Application.countDocuments({ job: { $in: jobIds } });
    const shortlisted = await Application.countDocuments({ job: { $in: jobIds }, status: 'shortlisted' });
    const rejected    = await Application.countDocuments({ job: { $in: jobIds }, status: 'rejected' });

    res.json({ totalJobs, activeJobs, totalApplications, shortlisted, rejected });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @POST /api/jobs/sync-pinecone — Admin one-time sync of all jobs
const syncPinecone = async (req, res) => {
  try {
    const jobs = await Job.find({ isActive: true });
    syncAllJobs(jobs); // fire and forget
    res.json({ message: `Syncing ${jobs.length} jobs to Pinecone in background...` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getJobs, createJob, getMyJobs, getJobById, updateJob, deleteJob, getEmployerStats, syncPinecone };